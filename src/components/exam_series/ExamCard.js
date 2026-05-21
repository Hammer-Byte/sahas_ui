import { useMemo } from "react";
import { Tag } from "primereact/tag";
import { getReadableDate } from "../../utils";
import { TEXT_NORMAL, TEXT_SMALL } from "../../style";
import { getExamStatus } from "./examSeriesStatus";

export default function ExamCard({ id, subject_title, start_at, end_at }) {
    const status = useMemo(() => getExamStatus({ start_at, end_at }), [start_at, end_at]);

    return (
        <div className="border-1 border-gray-300 border-round py-2 px-3 flex flex-column gap-2 cursor-default">
            <div className="flex align-items-center justify-content-between gap-2">
                <span className={`${TEXT_NORMAL} font-semibold`}>{subject_title || `Exam #${id}`}</span>
                <Tag value={status.label} severity={status.severity} pt={{ value: { className: TEXT_SMALL } }} />
            </div>
            <span className={`${TEXT_SMALL} text-color-secondary`}>
                <i className="pi pi-calendar mr-1"></i>
                {getReadableDate({ date: start_at })} - {getReadableDate({ date: end_at })}
            </span>
        </div>
    );
}
