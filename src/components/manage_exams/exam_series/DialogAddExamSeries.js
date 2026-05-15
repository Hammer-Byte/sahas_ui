import { Dialog } from "primereact/dialog";
import TabHeader from "../../common/TabHeader";
import { useCallback, useState } from "react";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { TEXT_TITLE, TEXT_SMALL } from "../../../style";
import HasRequiredAuthority from "../../dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../../../constants";
import { DUMMY_COURSES } from "./dummyExamSeries";
import { useAppContext } from "../../../providers/ProviderAppContainer";

function newExamRow() {
    return { localKey: `new-${Date.now()}-${Math.random()}`, title: "", scheduledAt: null, durationMinutes: 90 };
}

export default function DialogAddExamSeries({ visible, closeDialog, setExamSeries }) {
    const { showToast } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ courseId: null, title: "", note: "", exams: [newExamRow()] });

    const resetForm = useCallback(() => {
        setForm({ courseId: null, title: "", note: "", exams: [newExamRow()] });
    }, []);

    const addExamRow = useCallback(() => {
        setForm((prev) => ({ ...prev, exams: [...(prev.exams || []), newExamRow()] }));
    }, []);

    const removeExamRow = useCallback((localKey) => {
        setForm((prev) => ({
            ...prev,
            exams: prev.exams?.filter((e) => e.localKey !== localKey) || [],
        }));
    }, []);

    const updateExamRow = useCallback((localKey, patch) => {
        setForm((prev) => ({
            ...prev,
            exams: prev.exams?.map((e) => (e.localKey === localKey ? { ...e, ...patch } : e)) || [],
        }));
    }, []);

    const submit = useCallback(() => {
        if (!form?.title?.trim()) {
            showToast({ severity: "warn", summary: "Title required", detail: "Enter a series title.", life: 2000 });
            return;
        }
        if (!form?.courseId) {
            showToast({ severity: "warn", summary: "Course required", detail: "Select a course.", life: 2000 });
            return;
        }
        const course = DUMMY_COURSES.find((c) => c.id === form.courseId);
        const validExams = (form.exams || [])
            .filter((e) => e.title?.trim() && e.scheduledAt)
            .map((e, i) => ({
                id: `exam-new-${Date.now()}-${i}`,
                title: e.title.trim(),
                scheduledAt: e.scheduledAt instanceof Date ? e.scheduledAt.toISOString() : e.scheduledAt,
                durationMinutes: e.durationMinutes ?? 90,
            }));
        if (!validExams.length) {
            showToast({ severity: "warn", summary: "Exams required", detail: "Add at least one exam with title and date.", life: 2500 });
            return;
        }

        setLoading(true);
        setTimeout(() => {
            const series = {
                id: `series-${Date.now()}`,
                title: form.title.trim(),
                courseId: form.courseId,
                courseName: course?.title || "",
                note: form.note?.trim() || "",
                createdOn: new Date().toISOString(),
                createdBy: "You (dummy)",
                exams: validExams,
            };
            setExamSeries((prev) => [series, ...(prev || [])]);
            showToast({ severity: "success", summary: "Added", detail: "Exam series saved locally (dummy).", life: 2000 });
            resetForm();
            closeDialog();
            setLoading(false);
        }, 350);
    }, [closeDialog, form, resetForm, setExamSeries, showToast]);

    return (
        <Dialog
            header="Add exam series"
            visible={visible}
            className="w-11 md:w-8"
            onHide={closeDialog}
            pt={{
                headertitle: { className: TEXT_TITLE },
                content: { className: "overflow-auto max-h-screen" },
            }}
        >
            <TabHeader
                className="pt-3"
                title="New series for a course"
                highlights={["Series groups multiple exams with their own date and time."]}
            />

            <FloatLabel className="mt-5">
                <Dropdown
                    inputId="course"
                    value={form.courseId}
                    options={DUMMY_COURSES}
                    optionLabel="title"
                    optionValue="id"
                    className="w-full"
                    onChange={(e) => setForm((prev) => ({ ...prev, courseId: e.value }))}
                    disabled={loading}
                    pt={{ label: { className: TEXT_SMALL }, item: { className: TEXT_SMALL } }}
                />
                <label htmlFor="course" className={TEXT_SMALL}>
                    Course
                </label>
            </FloatLabel>

            <FloatLabel className="mt-5">
                <InputText
                    id="series_title"
                    className="w-full"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    disabled={loading}
                />
                <label htmlFor="series_title" className={TEXT_SMALL}>
                    Series title
                </label>
            </FloatLabel>

            <FloatLabel className="mt-5">
                <InputTextarea
                    id="series_note"
                    rows={3}
                    className="w-full"
                    value={form.note}
                    onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                    disabled={loading}
                />
                <label htmlFor="series_note">Note (optional)</label>
            </FloatLabel>

            <div className="mt-4 flex justify-content-between align-items-center">
                <p className={`${TEXT_SMALL} font-bold text-color-secondary m-0`}>Exams in this series</p>
                <Button type="button" label="Add exam" icon="pi pi-plus" text severity="secondary" size="small" onClick={addExamRow} disabled={loading} />
            </div>

            <div className="flex flex-column gap-3 mt-2">
                {form.exams?.map((row) => (
                    <div key={row.localKey} className="border-1 border-round border-300 p-3 flex flex-column gap-3">
                        <div className="flex justify-content-between align-items-center gap-2">
                            <span className={`${TEXT_SMALL} text-color-secondary`}>Exam slot</span>
                            {form.exams.length > 1 ? (
                                <Button
                                    type="button"
                                    icon="pi pi-trash"
                                    text
                                    rounded
                                    severity="danger"
                                    aria-label="Remove row"
                                    onClick={() => removeExamRow(row.localKey)}
                                    disabled={loading}
                                />
                            ) : null}
                        </div>
                        <FloatLabel>
                            <InputText
                                id={`t-${row.localKey}`}
                                className="w-full"
                                value={row.title}
                                onChange={(e) => updateExamRow(row.localKey, { title: e.target.value })}
                                disabled={loading}
                            />
                            <label htmlFor={`t-${row.localKey}`} className={TEXT_SMALL}>
                                Exam title
                            </label>
                        </FloatLabel>
                        <FloatLabel>
                            <Calendar
                                inputId={`d-${row.localKey}`}
                                className="w-full"
                                value={row.scheduledAt}
                                onChange={(e) => updateExamRow(row.localKey, { scheduledAt: e.value })}
                                showTime
                                hourFormat="24"
                                dateFormat="dd/mm/yy"
                                showIcon
                                disabled={loading}
                            />
                            <label htmlFor={`d-${row.localKey}`} className={TEXT_SMALL}>
                                Date & time
                            </label>
                        </FloatLabel>
                    </div>
                ))}
            </div>

            <HasRequiredAuthority requiredAuthority={AUTHORITIES.USE_PAGE_MANAGE_EXAMS}>
                <Button
                    className="mt-4 w-full sm:w-auto"
                    label="Save series"
                    severity="warning"
                    loading={loading}
                    onClick={submit}
                    pt={{ label: { className: TEXT_SMALL } }}
                />
            </HasRequiredAuthority>
        </Dialog>
    );
}
