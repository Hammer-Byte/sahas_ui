import Timer from "../../common/Timer";
import { TEXT_SMALL } from "../../../style";

export default function ExamAttendHeader({ exam, secondsUntilEnd, onTimeUp }) {
    return (
        <div className="flex flex-column align-items-center gap-2 py-2 px-3 border-bottom-1 border-gray-200">
            <span className={`${TEXT_SMALL} text-center font-semibold text-primary`}>{exam?.subject_title || "Exam"}</span>
            <Timer totalSeconds={secondsUntilEnd} tagValue="Time remaining" onTimeUp={onTimeUp} />
        </div>
    );
}
