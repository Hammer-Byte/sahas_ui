import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReadableDate } from "../../utils";
import { TEXT_NORMAL, TEXT_SMALL } from "../../style";
import { RUPEE } from "../../constants";
import IconButton from "../common/IconButton";
import DialogEditExamSeries from "./DialogEditExamSeries";

export default function Series({ id, title, course_title, course_id, fees, start_at, end_at, active, updated_at, setExamSeries }) {
    const navigate = useNavigate();

    const [dialogEditExamSeries, setDialogEditExamSeries] = useState({
        visible: false,
    });

    const closeDialogEditExamSeries = useCallback(() => {
        setDialogEditExamSeries((prev) => ({ ...prev, visible: false }));
    }, []);

    return (
        <div className="border-1 border-gray-300 border-round py-2 px-3 flex flex-column gap-2">
            <div className="flex align-items-center justify-content-between gap-2">
                <span className={`${TEXT_NORMAL} font-semibold`}>
                    {id}. {title}
                </span>
                <Tag
                    severity={active ? "success" : "danger"}
                    value={active ? "Active" : "Inactive"}
                    pt={{
                        value: { className: TEXT_SMALL },
                    }}
                />
            </div>
            <span className={`${TEXT_SMALL} text-color-secondary`}>
                <i className="pi pi-book mr-1"></i>
                {course_title}
            </span>
            <span className={`${TEXT_SMALL} text-color-secondary`}>
                <i className="pi pi-wallet mr-1"></i>
                {fees}
                {RUPEE}
            </span>
            <span className={`${TEXT_SMALL} text-color-secondary`}>
                <i className="pi pi-calendar mr-1"></i>
                {getReadableDate({ date: start_at })} - {getReadableDate({ date: end_at })}
            </span>
            <span className={`${TEXT_SMALL} text-color-secondary`}>
                <i className="pi pi-clock mr-1"></i>
                Updated {getReadableDate({ date: updated_at })}
            </span>

            <div className="flex align-items-center justify-content-end gap-2 mt-1">
                <Button
                    label="Manage Series"
                    icon="pi pi-list"
                    severity="secondary"
                    size="small"
                    outlined
                    onClick={() => navigate(`/manage-exam-series/${id}/exams`)}
                    pt={{
                        label: { className: TEXT_SMALL },
                    }}
                />
                <IconButton
                    icon="pi-pencil"
                    color="text-orange-500"
                    onClick={() =>
                        setDialogEditExamSeries((prev) => ({
                            ...prev,
                            visible: true,
                            closeDialog: closeDialogEditExamSeries,
                            setExamSeries,
                            id,
                            title,
                            course_id,
                            fees,
                            start_at,
                            end_at,
                            active,
                        }))
                    }
                />
            </div>

            {dialogEditExamSeries?.visible && <DialogEditExamSeries {...dialogEditExamSeries} />}
        </div>
    );
}
