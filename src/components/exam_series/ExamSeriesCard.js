import { useMemo } from "react";
import { Tag } from "primereact/tag";
import { getReadableDate } from "../../utils";
import { TEXT_NORMAL, TEXT_SMALL } from "../../style";
import { getExamSeriesStatus } from "./examSeriesStatus";

export default function ExamSeriesCard({ id, title, course_title, start_at, end_at, fees }) {
    const status = useMemo(() => getExamSeriesStatus({ start_at, end_at }), [start_at, end_at]);

    return (
        <div className="border-1 border-gray-300 border-round py-2 px-3 flex flex-column gap-2">
            <div className="flex align-items-center justify-content-between gap-2">
                <span className={`${TEXT_NORMAL} font-semibold`}>{title || `Exam Series #${id}`}</span>
                <Tag value={status.label} severity={status.severity} pt={{ value: { className: TEXT_SMALL } }} />
            </div>
            {course_title && (
                <span className={`${TEXT_SMALL} text-color-secondary`}>
                    <i className="pi pi-book mr-1"></i>
                    {course_title}
                </span>
            )}
            <span className={`${TEXT_SMALL} text-color-secondary`}>
                <i className="pi pi-calendar mr-1"></i>
                {getReadableDate({ date: start_at })} - {getReadableDate({ date: end_at })}
            </span>
            {fees != null && (
                <span className={`${TEXT_SMALL} text-color-secondary`}>
                    <i className="pi pi-wallet mr-1"></i>
                    Fees: {fees}
                </span>
            )}
        </div>
    );
}
