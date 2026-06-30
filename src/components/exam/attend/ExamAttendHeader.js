import Timer from "../../common/Timer";
import { TEXT_SMALL } from "../../../style";

export default function ExamAttendHeader({ exam, secondsUntilEnd, onTimeUp }) {
    return (
        <div className="flex flex-column align-items-end gap-2">
            <span className={`${TEXT_SMALL} font-semibold text-primary`}>{exam?.subject_title || "Exam"}</span>
            <Timer totalSeconds={secondsUntilEnd} tagValue="Time remaining" onTimeUp={onTimeUp} />
        </div>
    );
}
