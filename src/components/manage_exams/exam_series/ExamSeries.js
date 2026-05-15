import Detail from "../../common/Detail";
import { getReadableDate } from "../../../utils";
import { TEXT_SMALL } from "../../../style";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

export default function ExamSeries({ courseName, exams = [], note }) {
    const dateBody = (row) => getReadableDate({ date: row.scheduledAt });
    const durationBody = (row) =>
        row.durationMinutes !== undefined && row.durationMinutes !== null ? `${row.durationMinutes} min` : "—";

    return (
        <div className="flex flex-column">
            <div className="flex flex-wrap align-items-stretch justify-content-around p-3 border-bottom-1 border-300 gap-3">
                <Detail icon="pi pi-book" title="Course" value={courseName} />
                <Detail icon="pi pi-list" title="Exams in series" value={`${exams?.length ?? 0}`} />
                {note ? <Detail icon="pi pi-info-circle" title="Note" value={note} /> : null}
            </div>

            <div className="p-3">
                <p className={`${TEXT_SMALL} font-bold text-color-secondary m-0 mb-2`}>Scheduled exams</p>
                {exams?.length ? (
                    <DataTable value={exams} size="small" stripedRows pt={{ thead: { className: TEXT_SMALL } }}>
                        <Column field="title" header="Exam" style={{ minWidth: "12rem" }} />
                        <Column header="Date & time" body={dateBody} style={{ minWidth: "10rem" }} />
                        <Column header="Duration" body={durationBody} style={{ width: "8rem" }} />
                    </DataTable>
                ) : (
                    <span className={`${TEXT_SMALL} text-color-secondary`}>No exams added to this series yet.</span>
                )}
            </div>
        </div>
    );
}
