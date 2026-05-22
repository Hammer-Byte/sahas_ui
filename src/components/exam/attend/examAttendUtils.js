export function getChoicesFromQuestion({ choice_one, choice_two, choice_three, choice_four }) {
    return [choice_one, choice_two, choice_three, choice_four].filter(Boolean);
}

export function getSecondsUntilExamEnd({ end_at }) {
    if (!end_at) return 0;
    return Math.max(0, Math.floor((new Date(end_at).getTime() - Date.now()) / 1000));
}

export function buildAnswersMap(submissions = []) {
    return submissions.reduce((answers, { question_id, submitted_answer }) => {
        if (question_id != null && submitted_answer) {
            answers[question_id] = submitted_answer;
        }
        return answers;
    }, {});
}

export function buildSubmissionPayload(answers = {}) {
    return Object.entries(answers).map(([questionId, submittedAnswer]) => ({
        question_id: Number(questionId),
        submitted_answer: submittedAnswer,
    }));
}
