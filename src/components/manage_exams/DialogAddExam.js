import { useCallback, useMemo, useState } from "react";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { Dialog } from "primereact/dialog";
import TabHeader from "../common/TabHeader";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { getReadableDate, getWriteableDate } from "../../utils";
import { TEXT_SMALL, TEXT_TITLE } from "../../style";

export default function DialogAddExam({
    visible,
    closeDialog,
    examSeriesId,
    subjects = [],
    examSeriesStartAt,
    examSeriesEndAt,
    setExamSeries,
}) {
    const { requestAPI, showToast } = useAppContext();

    const [exam, setExamForm] = useState({ positive_marks: 1, negative_marks: -1 });
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

    const addExam = useCallback(() => {
        if (!isExamScheduleValid()) return;

        requestAPI({
            requestPath: `exam-series/${examSeriesId}/exams`,
            requestMethod: "POST",
            requestPostBody: {
                subject_id: exam?.subject_id,
                start_at: getWriteableDate({ date: exam?.start_at }),
                end_at: getWriteableDate({ date: exam?.end_at }),
                positive_marks: exam?.positive_marks ?? 1,
                negative_marks: exam?.negative_marks ?? -1,
            },
            setLoading: setLoading,
            onRequestFailure: () => showToast({ severity: "error", summary: "Failed", detail: "Failed To Add Exam !", life: 2000 }),
            onResponseReceieved: ({ error, ...addedExam }, responseCode) => {
                if (addedExam && responseCode === 201) {
                    showToast({ severity: "success", summary: "Added", detail: "Exam Added", life: 1000 });
                    setExamSeries((prev) => ({
                        ...prev,
                        exams: [addedExam, ...(prev?.exams || [])],
                    }));
                    setExamForm({ positive_marks: 1, negative_marks: -1 });
                    closeDialog();
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: error || "Failed To Add Exam !", life: 2000 });
                }
            },
        });
    }, [closeDialog, exam, examSeriesId, isExamScheduleValid, requestAPI, setExamSeries, showToast]);

    return (
        <Dialog
            header="Add New Exam"
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
                title="Add New Exam"
                highlights={["Select subject and schedule", seriesRangeHighlight].filter(Boolean)}
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

            <FloatLabel className="mt-5">
                <InputNumber
                    useGrouping={false}
                    value={exam?.positive_marks}
                    inputId="positive_marks"
                    className="w-full"
                    onChange={(e) => setExamForm((prev) => ({ ...prev, positive_marks: e.value }))}
                    disabled={loading}
                />
                <label htmlFor="positive_marks" className={TEXT_SMALL}>
                    Positive Marks
                </label>
            </FloatLabel>

            <FloatLabel className="mt-5">
                <InputNumber
                    useGrouping={false}
                    value={exam?.negative_marks}
                    inputId="negative_marks"
                    className="w-full"
                    onChange={(e) => setExamForm((prev) => ({ ...prev, negative_marks: e.value }))}
                    disabled={loading}
                />
                <label htmlFor="negative_marks" className={TEXT_SMALL}>
                    Negative Marks
                </label>
            </FloatLabel>

            <Button className="mt-3" label="Add Exam" severity="warning" loading={loading} onClick={addExam} />
        </Dialog>
    );
}
