import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Tag } from "primereact/tag";
import { getReadableDate } from "../../utils";
import { TEXT_NORMAL, TEXT_SMALL } from "../../style";
import { getExamStatus } from "./examSeriesStatus";

export default function ExamCard({ id, subject_title, start_at, end_at, enrolled = false }) {
    const navigate = useNavigate();
    const status = useMemo(() => getExamStatus({ start_at, end_at }), [start_at, end_at]);
    const isLocked = !enrolled;

    return (
        <div
            role={enrolled ? "button" : undefined}
            tabIndex={enrolled ? 0 : undefined}
            className={`border-1 border-round py-2 px-3 flex flex-column gap-2 ${
                isLocked
                    ? "border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed pointer-events-none"
                    : "border-gray-300 cursor-pointer hover:surface-hover"
            }`}
            onClick={() => enrolled && navigate(`/exams/${id}`)}
            onKeyDown={(e) => {
                if (enrolled && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    navigate(`/exams/${id}`);
                }
            }}
        >
            <div className="flex align-items-center justify-content-between gap-2">
                <span className={`${TEXT_NORMAL} font-semibold flex align-items-center gap-2`}>
                    {isLocked && <i className="pi pi-lock text-color-secondary" aria-hidden />}
                    {subject_title || `Exam #${id}`}
                </span>
                <div className="flex align-items-center gap-2">
                    {isLocked && (
                        <Tag value="Locked" severity="secondary" icon="pi pi-lock" pt={{ value: { className: TEXT_SMALL } }} />
                    )}
                    <Tag value={status.label} severity={status.severity} pt={{ value: { className: TEXT_SMALL } }} />
                </div>
            </div>
            <span className={`${TEXT_SMALL} text-color-secondary`}>
                <i className="pi pi-calendar mr-1"></i>
                {getReadableDate({ date: start_at })} - {getReadableDate({ date: end_at })}
            </span>
            {isLocked && (
                <span className={`${TEXT_SMALL} text-color-secondary`}>Enroll in this exam series to unlock</span>
            )}
        </div>
    );
}
