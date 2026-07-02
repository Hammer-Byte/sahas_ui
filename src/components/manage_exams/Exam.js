import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { getReadableDate } from "../../utils";
import { ICON_SIZE, TEXT_NORMAL, TEXT_SMALL } from "../../style";
import IconButton from "../common/IconButton";
import ProgressiveControl from "../common/ProgressiveControl";
import ConfirmationWrapper from "../common/ConfirmationWrapper";
import DialogEditExam from "./DialogEditExam";

export default function Exam({
    id,
    exam_series_id,
    subject_id,
    subject_title,
    start_at,
    end_at,
    positive_marks,
    negative_marks,
    updated_at,
    setExamSeries,
    subjects,
    examSeriesStartAt,
    examSeriesEndAt,
}) {
    const navigate = useNavigate();
    const { requestAPI, showToast } = useAppContext();

    const [loading, setLoading] = useState();
    const [dialogEditExam, setDialogEditExam] = useState({
        visible: false,
    });

    const closeDialogEditExam = useCallback(() => {
        setDialogEditExam((prev) => ({ ...prev, visible: false }));
    }, []);

    const deleteExam = useCallback(() => {
        requestAPI({
            requestPath: `exam-series/exams/${id}`,
            requestMethod: "DELETE",
            parseResponseBody: false,
            setLoading,
            onRequestFailure: () => showToast({ severity: "error", summary: "Failed", detail: "Failed To Delete Exam !", life: 2000 }),
            onResponseReceieved: (_, responseCode) => {
                if (responseCode === 204) {
                    showToast({ severity: "success", summary: "Deleted", detail: "Exam Deleted", life: 1000 });
                    setExamSeries((prev) => ({
                        ...prev,
                        exams: prev?.exams?.filter((item) => item?.id !== id),
                    }));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Delete Exam !", life: 2000 });
                }
            },
        });
    }, [id, requestAPI, setExamSeries, showToast]);

    return (
        <div className="border-1 border-gray-300 border-round py-2 px-3 flex flex-column gap-2">
            <div className="flex align-items-center justify-content-between gap-2">
                <span className={`${TEXT_NORMAL} font-semibold`}>
                    {id}. {subject_title}
                </span>
                <ProgressiveControl
                    loading={loading}
                    control={
                        <div className="flex gap-2">
                            <IconButton
                                icon="pi-pencil"
                                color="text-orange-500"
                                className={ICON_SIZE}
                                onClick={() =>
                                    setDialogEditExam((prev) => ({
                                        ...prev,
                                        visible: true,
                                        closeDialog: closeDialogEditExam,
                                        setExamSeries,
                                        subjects,
                                        examSeriesStartAt,
                                        examSeriesEndAt,
                                        id,
                                        subject_id,
                                        start_at,
                                        end_at,
                                        positive_marks,
                                        negative_marks,
                                    }))
                                }
                            />
                                <ConfirmationWrapper action={deleteExam}>
                                    <IconButton color="text-red-500" icon="pi pi-trash" rounded className={ICON_SIZE} />
                                </ConfirmationWrapper>
                        </div>
                    }
                />
            </div>
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
                    label="Manage Questions"
                    icon="pi pi-list"
                    severity="secondary"
                    size="small"
                    outlined
                    onClick={() => navigate(`/manage-exam-series/exams/${id}/questions`)}
                    pt={{
                        label: { className: TEXT_SMALL },
                    }}
                />
            </div>

            {dialogEditExam?.visible && <DialogEditExam {...dialogEditExam} />}
        </div>
    );
}
