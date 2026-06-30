import { useSelector } from "react-redux";
import { getReadableDate } from "../../utils";
import { TEXT_SMALL } from "../../style";

export default function ExamReminder({ className = "" }) {
    const upcomingExam = useSelector((state) => state.stateUser?.upcoming_exam);

    if (!upcomingExam?.subject_title) {
        return null;
    }

    return (
        <div
            className={`bg-red-500 text-white text-center p-2 fadein animation-duration-1000 animation-iteration-infinite ${className}`}
        >
            <span className={`${TEXT_SMALL} font-semibold`}>
                Your exam for {upcomingExam.subject_title} is scheduled for{" "}
                {getReadableDate({ date: upcomingExam.exam_series_start_at })}.
            </span>
        </div>
    );
}
