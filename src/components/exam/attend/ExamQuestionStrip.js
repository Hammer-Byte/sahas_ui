import { TEXT_BADGE } from "../../../style";

export default function ExamQuestionStrip({ questions, currentIndex, answers, onSelectQuestion }) {
    return (
        <div className="overflow-x-auto white-space-nowrap px-2 py-2 border-bottom-1 border-gray-200">
            <div className="flex gap-2">
                {questions.map((question, index) => {
                    const isAnswered = !!answers?.[question.id];
                    const isCurrent = index === currentIndex;

                    return (
                        <button
                            key={question.id}
                            type="button"
                            className={`flex-shrink-0 w-2rem h-2rem border-round border-1 font-bold ${TEXT_BADGE} ${
                                isAnswered ? "bg-green-500 border-green-700 text-white" : "bg-blue-500 border-blue-700 text-white"
                            } ${isCurrent ? "ring-2 ring-orange-500 ring-offset-1" : ""}`}
                            onClick={() => onSelectQuestion(index)}
                        >
                            {index + 1}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
