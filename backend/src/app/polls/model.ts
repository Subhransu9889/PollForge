import mongoose, { Schema, type InferSchemaType } from "mongoose";

const optionSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
  },
  { _id: true },
);

const questionSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    type: { type: String, enum: ["choice", "text"], default: "choice" },
    required: { type: Boolean, default: true },
    allowMultiple: { type: Boolean, default: false },
    options: {
      type: [optionSchema],
      validate: {
        validator: function (this: { type?: string }, options: unknown[]) {
          return this.type === "text" || options.length >= 2;
        },
        message: "Choice questions need at least two options",
      },
    },
  },
  { _id: true },
);

const pollSchema = new Schema(
  {
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    responseMode: { type: String, enum: ["anonymous", "authenticated"], default: "anonymous" },
    thankYouTitle: { type: String, default: "✨ Thank you for testing PollForge!", trim: true },
    thankYouMessage: {
      type: String,
      default: "Your feedback helps us improve the experience and build better features for everyone.",
      trim: true,
    },
    expiresAt: { type: Date, required: true, index: true },
    isPublished: { type: Boolean, default: false },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (questions: unknown[]) => questions.length >= 1,
        message: "A poll needs at least one question",
      },
    },
  },
  { timestamps: true },
);

const answerSchema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, required: true },
    optionId: { type: Schema.Types.ObjectId, default: null },
    text: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const responseSchema = new Schema(
  {
    poll: { type: Schema.Types.ObjectId, ref: "Poll", required: true, index: true },
    respondent: { type: Schema.Types.ObjectId, ref: "User", default: null },
    anonymousDeviceId: { type: String, default: null, trim: true },
    answers: { type: [answerSchema], default: [] },
  },
  { timestamps: true },
);

responseSchema.index({ poll: 1, respondent: 1 });
responseSchema.index(
  { poll: 1, anonymousDeviceId: 1 },
  { unique: true, partialFilterExpression: { anonymousDeviceId: { $type: "string" } } },
);

export type PollDocument = InferSchemaType<typeof pollSchema> & { _id: mongoose.Types.ObjectId };

export const PollModel = mongoose.model("Poll", pollSchema);
export const PollResponseModel = mongoose.model("PollResponse", responseSchema);
