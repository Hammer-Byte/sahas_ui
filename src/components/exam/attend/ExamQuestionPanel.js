import { Divider } from "primereact/divider";
import RadioButtonInput from "../../common/RadioButtonInput";
import { getChoicesFromQuestion } from "./examAttendUtils";
import { TEXT_NORMAL } from "../../../style";

export default function ExamQuestionPanel({ question, questionNumber, selectedAnswer, onSelectAnswer, disabled = false }) {
    if (!question) return null;

    const choices = getChoicesFromQuestion(question);

    return (
        <div className="flex flex-column flex-1 min-h-0 overflow-y-auto px-3 py-2 fadeinleft animation-duration-500" key={question.id}>
            <span className={`${TEXT_NORMAL} font-semibold text-orange-800`}>
                {questionNumber}. {question.question}
            </span>

            {!!question.media_url && (
                <img
                    className="w-full max-w-20rem align-self-center border-round border-1 border-gray-300 object-contain"
                    src={question.media_url}
                    alt="Question"
                />
            )}

            <Divider />
            <div className="flex flex-column gap-2">
                {choices.map((choice) => (
                    <RadioButtonInput
                        key={choice}
                        name={`exam-question-${question.id}`}
                        label={choice}
                        value={selectedAnswer}
                        onChange={(e) => onSelectAnswer(e.value)}
                        disabled={disabled}
                    />
                ))}
            </div>
        </div>
    );
}
