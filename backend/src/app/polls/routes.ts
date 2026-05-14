import { Router } from "express";
import { createHash } from "node:crypto";
import mongoose from "mongoose";
import z from "zod";
import { optionalAuth, requireAuth } from "../auth/middleware.js";
import { checkCooldown, rateLimit, resetCooldown } from "../rateLimit.js";
import { PollModel, PollResponseModel } from "./model.js";
import { emitPollAnalytics } from "./realtime.js";
import { buildAnalytics } from "./service.js";

const optionSchema = z.object({ label: z.string().trim().min(1).max(120) });

const createPollSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(500).optional().default(""),
  responseMode: z.enum(["anonymous", "authenticated"]).default("anonymous"),
  expiresAt: z.coerce.date().refine((date) => date.getTime() > Date.now(), "Expiry must be in the future"),
  questions: z
    .array(
      z.object({
        text: z.string().trim().min(3).max(240),
        required: z.boolean().default(true),
        options: z.array(optionSchema).min(2).max(8),
      }),
    )
    .min(1)
    .max(20),
});

const submitResponseSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      optionId: z.string(),
    }),
  ),
});

const anonymousDeviceSchema = z.string().trim().min(16).max(160);
const responseRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: "Too many response attempts. Please wait a minute and try again.",
  keyPrefix: "poll-response",
});

function hashDeviceId(deviceId: string) {
  return createHash("sha256").update(deviceId).digest("hex");
}

function publicPoll(poll: any) {
  return {
    id: poll._id.toString(),
    title: poll.title,
    description: poll.description,
    responseMode: poll.responseMode,
    expiresAt: poll.expiresAt,
    isExpired: poll.expiresAt.getTime() <= Date.now(),
    isPublished: poll.isPublished,
    questions: poll.questions.map((question: any) => ({
      id: question._id.toString(),
      text: question.text,
      required: question.required,
      options: question.options.map((option: any) => ({
        id: option._id.toString(),
        label: option.label,
      })),
    })),
  };
}

export function createPollRouter() {
  const router = Router();

  router.get("/mine", requireAuth, async (req, res) => {
    const polls = await PollModel.find({ creator: req.user!.id }).sort({ createdAt: -1 }).lean();
    const withCounts = await Promise.all(
      polls.map(async (poll) => ({
        ...publicPoll(poll),
        totalResponses: await PollResponseModel.countDocuments({ poll: poll._id }),
      })),
    );

    res.json({ success: true, polls: withCounts });
  });

  router.post("/", requireAuth, async (req, res) => {
    const validation = createPollSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: "Invalid poll", errors: validation.error.issues });
    }

    const poll = await PollModel.create({ ...validation.data, creator: req.user!.id });
    return res.status(201).json({ success: true, poll: publicPoll(poll) });
  });

  router.get("/:id", optionalAuth, async (req, res) => {
    const pollId = String(req.params.id);
    const poll = await PollModel.findById(pollId).lean();
    if (!poll) {
      return res.status(404).json({ success: false, message: "Poll not found" });
    }

    const analytics = poll.isPublished ? await buildAnalytics(pollId) : undefined;
    return res.json({ success: true, poll: publicPoll(poll), analytics });
  });

  router.get("/:id/analytics", requireAuth, async (req, res) => {
    const pollId = String(req.params.id);
    const poll = await PollModel.findOne({ _id: pollId, creator: req.user!.id });
    if (!poll) {
      return res.status(404).json({ success: false, message: "Poll not found" });
    }

    return res.json({ success: true, analytics: await buildAnalytics(pollId) });
  });

  router.post("/:id/responses", responseRateLimit, optionalAuth, async (req, res) => {
    const pollId = String(req.params.id);
    const validation = submitResponseSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: "Invalid response", errors: validation.error.issues });
    }

    const poll = await PollModel.findById(pollId);
    if (!poll) {
      return res.status(404).json({ success: false, message: "Poll not found" });
    }

    if (poll.isPublished || poll.expiresAt.getTime() <= Date.now()) {
      return res.status(403).json({ success: false, message: "This poll is no longer accepting responses" });
    }

    if (poll.responseMode === "authenticated" && !req.user) {
      return res.status(401).json({ success: false, message: "Please sign in to answer this poll" });
    }

    const respondentId =
      poll.responseMode === "authenticated" && req.user ? new mongoose.Types.ObjectId(req.user.id) : null;
    const anonymousDeviceValidation =
      poll.responseMode === "anonymous" ? anonymousDeviceSchema.safeParse(req.get("x-pollforge-device-id")) : null;

    if (poll.responseMode === "anonymous" && !anonymousDeviceValidation?.success) {
      return res.status(400).json({
        success: false,
        message: "Could not verify this device. Please refresh the page and try again.",
      });
    }

    const anonymousDeviceId =
      poll.responseMode === "anonymous" && anonymousDeviceValidation?.success
        ? hashDeviceId(anonymousDeviceValidation.data)
        : null;
    const cooldownKey = respondentId
      ? `response:${poll._id.toString()}:user:${respondentId.toString()}`
      : `response:${poll._id.toString()}:device:${anonymousDeviceId}`;

    const existingResponse = await PollResponseModel.findOne(
      respondentId
        ? { poll: poll._id, respondent: respondentId }
        : { poll: poll._id, anonymousDeviceId },
    ).lean();

    if (existingResponse) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted a response to this poll from this device.",
      });
    }

    const questionIds = new Set(poll.questions.map((question) => question._id.toString()));
    const answersByQuestion = new Map(validation.data.answers.map((answer) => [answer.questionId, answer.optionId]));
    const missingRequired = poll.questions.find(
      (question) => question.required && !answersByQuestion.has(question._id.toString()),
    );

    if (missingRequired) {
      return res.status(400).json({ success: false, message: `Required question missing: ${missingRequired.text}` });
    }

    for (const [questionId, optionId] of answersByQuestion) {
      if (!questionIds.has(questionId)) {
        return res.status(400).json({ success: false, message: "Answer contains an unknown question" });
      }

      const question = poll.questions.find((item) => item._id.toString() === questionId);
      const isKnownOption = question?.options.some((option) => option._id.toString() === optionId);
      if (!isKnownOption) {
        return res.status(400).json({ success: false, message: "Answer contains an unknown option" });
      }
    }

    const answers = [...answersByQuestion.entries()].map(([questionId, optionId]) => ({
      questionId: new mongoose.Types.ObjectId(questionId),
      optionId: new mongoose.Types.ObjectId(optionId),
    }));
    const cooldown = checkCooldown(cooldownKey, 30 * 1000);

    if (!cooldown.allowed) {
      res.setHeader("Retry-After", String(cooldown.retryAfterSeconds));
      return res.status(429).json({
        success: false,
        message: `Please wait ${cooldown.retryAfterSeconds} seconds before submitting another response.`,
      });
    }

    try {
      await PollResponseModel.create({
        poll: poll._id,
        respondent: respondentId,
        anonymousDeviceId,
        answers,
      });
    } catch (error: any) {
      if (error?.code === 11000) {
        resetCooldown(cooldownKey);
        return res.status(409).json({
          success: false,
          message: "You have already submitted a response to this poll from this device.",
        });
      }

      resetCooldown(cooldownKey);
      throw error;
    }

    await emitPollAnalytics(pollId);
    return res.status(201).json({ success: true, message: "Response submitted" });
  });

  router.post("/:id/publish", requireAuth, async (req, res) => {
    const pollId = String(req.params.id);
    const poll = await PollModel.findOneAndUpdate(
      { _id: pollId, creator: req.user!.id },
      { isPublished: true },
      { new: true },
    );

    if (!poll) {
      return res.status(404).json({ success: false, message: "Poll not found" });
    }

    await emitPollAnalytics(pollId);
    return res.json({ success: true, poll: publicPoll(poll), analytics: await buildAnalytics(pollId) });
  });

  return router;
}
