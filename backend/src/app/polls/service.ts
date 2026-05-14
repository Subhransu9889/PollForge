import { PollModel, PollResponseModel } from "./model.js";

export async function buildAnalytics(pollId: string) {
  const poll = await PollModel.findById(pollId).lean();
  if (!poll) {
    throw new Error("Poll not found");
  }

  const responses = await PollResponseModel.find({ poll: pollId }).lean();
  const questionSummaries = poll.questions.map((question) => {
    const textResponses: string[] = [];
    const options = question.options.map((option) => ({
      id: option._id.toString(),
      label: option.label,
      count: 0,
      percent: 0,
    }));

    const answered = responses.reduce((count, response) => {
      const answers = response.answers.filter((item) => item.questionId.toString() === question._id.toString());
      if (answers.length === 0) {
        return count;
      }

      if ((question as any).type === "text") {
        const answer = answers[0]!;
        const text = answer.text?.trim();
        if (text) {
          textResponses.push(text);
        }

        return count + 1;
      }

      for (const answer of answers) {
        const option = answer.optionId ? options.find((item) => item.id === answer.optionId?.toString()) : undefined;
        if (option) {
          option.count += 1;
        }
      }

      return count + 1;
    }, 0);

    return {
      id: question._id.toString(),
      text: question.text,
      type: (question as any).type ?? "choice",
      allowMultiple: (question as any).allowMultiple ?? false,
      required: question.required,
      answered,
      skipped: responses.length - answered,
      textResponses,
      options: options.map((option) => ({
        ...option,
        percent: answered === 0 ? 0 : Math.round((option.count / answered) * 100),
      })),
    };
  });

  const authenticatedResponses = responses.filter((response) => response.respondent).length;

  return {
    pollId: poll._id.toString(),
    title: poll.title,
    totalResponses: responses.length,
    responseMode: poll.responseMode,
    expiresAt: poll.expiresAt,
    isExpired: poll.expiresAt.getTime() <= Date.now(),
    isPublished: poll.isPublished,
    participation: {
      authenticatedResponses,
      anonymousResponses: responses.length - authenticatedResponses,
      completionRate:
        responses.length === 0
          ? 0
          : Math.round(
              (responses.filter((response) => response.answers.length === poll.questions.length).length /
                responses.length) *
                100,
            ),
    },
    questions: questionSummaries,
  };
}
