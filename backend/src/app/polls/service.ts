import { PollModel, PollResponseModel } from "./model.js";

export async function buildAnalytics(pollId: string) {
  const poll = await PollModel.findById(pollId).lean();
  if (!poll) {
    throw new Error("Poll not found");
  }

  const responses = await PollResponseModel.find({ poll: pollId }).lean();
  const questionSummaries = poll.questions.map((question) => {
    const options = question.options.map((option) => ({
      id: option._id.toString(),
      label: option.label,
      count: 0,
      percent: 0,
    }));

    const answered = responses.reduce((count, response) => {
      const answer = response.answers.find((item) => item.questionId.toString() === question._id.toString());
      if (!answer) {
        return count;
      }

      const option = options.find((item) => item.id === answer.optionId.toString());
      if (option) {
        option.count += 1;
      }

      return count + 1;
    }, 0);

    return {
      id: question._id.toString(),
      text: question.text,
      required: question.required,
      answered,
      skipped: responses.length - answered,
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
