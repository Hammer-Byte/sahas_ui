export function getCorrectChoiceOptions(examQuestion) {
    return ["choice_one", "choice_two", "choice_three", "choice_four"]
        .map((field) => examQuestion?.[field]?.trim?.() || examQuestion?.[field])
        .filter(Boolean)
        .map((choice) => ({ label: choice, value: choice }));
}

export function resolveCorrectChoice({ correct_choice, choice_one, choice_two, choice_three, choice_four }) {
    const choices = [choice_one, choice_two, choice_three, choice_four];
    const choiceIndex = Number(correct_choice);

    if ([1, 2, 3, 4].includes(choiceIndex) && choices[choiceIndex - 1]) {
        return choices[choiceIndex - 1];
    }

    return correct_choice || "";
}
