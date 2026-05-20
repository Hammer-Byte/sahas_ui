import { useCallback, useMemo, useState } from "react";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { Dialog } from "primereact/dialog";
import TabHeader from "../common/TabHeader";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { getReadableDate, getWriteableDate } from "../../utils";
import { TEXT_SMALL, TEXT_TITLE } from "../../style";

export default function DialogEditExam({
    visible,
    closeDialog,
    setExamSeries,
    subjects = [],
    examSeriesStartAt,
    examSeriesEndAt,
    ...props
}) {
    const { requestAPI, showToast } = useAppContext();

    const [exam, setExamForm] = useState({
        ...props,
        start_at: props?.start_at ? new Date(props.start_at) : null,
        end_at: props?.end_at ? new Date(props.end_at) : null,
    });
    const [loading, setLoading] = useState();

    const seriesStart = useMemo(() => (examSeriesStartAt ? new Date(examSeriesStartAt) : null), [examSeriesStartAt]);
    const seriesEnd = useMemo(() => (examSeriesEndAt ? new Date(examSeriesEndAt) : null), [examSeriesEndAt]);

    const seriesRangeHighlight = useMemo(() => {
        if (!seriesStart || !seriesEnd) return null;
        return `Must be between ${getReadableDate({ date: seriesStart })} and ${getReadableDate({ date: seriesEnd })}`;
    }, [seriesStart, seriesEnd]);

    const isExamScheduleValid = useCallback(() => {
        if (!exam?.subject_id) {
            showToast({ severity: "warn", summary: "Subject", detail: "Please select a subject", life: 2000 });
            return false;
        }

        if (!exam?.start_at || !exam?.end_at) {
            showToast({ severity: "warn", summary: "Schedule", detail: "Please select start and end", life: 2000 });
            return false;
        }

        const start = exam.start_at.getTime();
        const end = exam.end_at.getTime();

        if (start >= end) {
            showToast({ severity: "warn", summary: "Schedule", detail: "Exam end must be after start", life: 2000 });
            return false;
        }

        if (seriesStart && (start < seriesStart.getTime() || end < seriesStart.getTime())) {
            showToast({
                severity: "warn",
                summary: "Schedule",
                detail: "Exam schedule cannot start before exam series start",
                life: 2500,
            });
            return false;
        }

        if (seriesEnd && (start > seriesEnd.getTime() || end > seriesEnd.getTime())) {
            showToast({
                severity: "warn",
                summary: "Schedule",
                detail: "Exam schedule cannot end after exam series end",
                life: 2500,
            });
            return false;
        }

        return true;
    }, [exam, seriesEnd, seriesStart, showToast]);

    const editExam = useCallback(() => {
        if (!isExamScheduleValid()) return;

        requestAPI({
            requestPath: "exam-series/exams",
            requestMethod: "PATCH",
            requestPostBody: {
                id: exam?.id,
                subject_id: exam?.subject_id,
                start_at: getWriteableDate({ date: exam?.start_at }),
                end_at: getWriteableDate({ date: exam?.end_at }),
            },
            setLoading: setLoading,
            onRequestFailure: () => showToast({ severity: "error", summary: "Failed", detail: "Failed To Update Exam !", life: 2000 }),
            onResponseReceieved: ({ error, ...updatedExam }, responseCode) => {
                if (updatedExam && responseCode === 200) {
                    showToast({ severity: "success", summary: "Updated", detail: "Exam Updated", life: 1000 });
                    setExamSeries((prev) => ({
                        ...prev,
                        exams: prev?.exams?.map((item) => (item?.id === props?.id ? updatedExam : item)),
                    }));
                    closeDialog();
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: error || "Failed To Update Exam !", life: 2000 });
                }
            },
        });
    }, [closeDialog, exam, isExamScheduleValid, props?.id, requestAPI, setExamSeries, showToast]);

    return (
        <Dialog
            header="Edit Exam"
            visible={visible}
            className="w-11"
            onHide={closeDialog}
            pt={{
                headertitle: { className: TEXT_TITLE },
                content: { className: "overflow-scroll" },
            }}
        >
            <TabHeader
                className="pt-3"
                title="Edit Exam"
                highlights={["Update subject and schedule", seriesRangeHighlight].filter(Boolean)}
            />

            <FloatLabel className="mt-5">
                <Dropdown
                    value={subjects?.find(({ subject_id }) => subject_id === exam?.subject_id)}
                    onChange={(e) => setExamForm((prev) => ({ ...prev, subject_id: e.value?.subject_id }))}
                    options={subjects}
                    optionLabel="title"
                    className="w-full"
                    disabled={loading}
                    pt={{
                        label: { className: TEXT_SMALL },
                        item: { className: TEXT_SMALL },
                    }}
                />
                <label htmlFor="subject_id" className={TEXT_SMALL}>
                    Subject
                </label>
            </FloatLabel>

            <FloatLabel className="mt-5">
                <Calendar
                    dateFormat="dd/mm/yy"
                    inputId="start_at"
                    className="w-full"
                    value={exam?.start_at}
                    onChange={(e) => setExamForm((prev) => ({ ...prev, start_at: e.value }))}
                    disabled={loading || !seriesStart || !seriesEnd}
                    minDate={seriesStart}
                    maxDate={exam?.end_at && seriesEnd ? (exam.end_at < seriesEnd ? exam.end_at : seriesEnd) : seriesEnd}
                    showTime
                    hourFormat="24"
                    showIcon
                />
                <label htmlFor="start_at" className={TEXT_SMALL}>
                    Start
                </label>
            </FloatLabel>

            <FloatLabel className="mt-5">
                <Calendar
                    dateFormat="dd/mm/yy"
                    inputId="end_at"
                    className="w-full"
                    value={exam?.end_at}
                    onChange={(e) => setExamForm((prev) => ({ ...prev, end_at: e.value }))}
                    disabled={loading || !seriesStart || !seriesEnd}
                    minDate={exam?.start_at && seriesStart ? (exam.start_at > seriesStart ? exam.start_at : seriesStart) : seriesStart}
                    maxDate={seriesEnd}
                    showTime
                    hourFormat="24"
                    showIcon
                />
                <label htmlFor="end_at" className={TEXT_SMALL}>
                    End
                </label>
            </FloatLabel>

            <Button className="mt-3" label="Update Exam" severity="warning" loading={loading} onClick={editExam} />
        </Dialog>
    );
}
