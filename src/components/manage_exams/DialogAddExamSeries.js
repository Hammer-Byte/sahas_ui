import { useCallback, useState } from "react";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { Dialog } from "primereact/dialog";
import TabHeader from "../common/TabHeader";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { useSelector } from "react-redux";
import { getWriteableDate } from "../../utils";
import { TEXT_SMALL, TEXT_TITLE } from "../../style";

export default function DialogAddExamSeries({ visible, closeDialog, setExamSeries }) {
    const { requestAPI, showToast } = useAppContext();
    const { courses = [] } = useSelector((state) => state.stateTemplateConfig?.global);

    const [examSeries, setExamSeriesForm] = useState({ active: false });
    const [loading, setLoading] = useState();

    const addExamSeries = useCallback(() => {
        requestAPI({
            requestPath: "exam-series",
            requestMethod: "POST",
            requestPostBody: {
                title: examSeries?.title,
                course_id: examSeries?.course_id,
                fees: examSeries?.fees,
                active: examSeries?.active,
                start_at: getWriteableDate({ date: examSeries?.start_at }),
                end_at: getWriteableDate({ date: examSeries?.end_at }),
            },
            setLoading: setLoading,
            onRequestFailure: () => showToast({ severity: "error", summary: "Failed", detail: "Failed To Add Exam Series !", life: 2000 }),
            onResponseReceieved: ({ error, ...addedExamSeries }, responseCode) => {
                if (addedExamSeries && responseCode === 201) {
                    showToast({ severity: "success", summary: "Added", detail: "Exam Series Added", life: 1000 });
                    setExamSeries((prev) => [addedExamSeries, ...(prev || [])]);
                    setExamSeriesForm({ active: false });
                    closeDialog();
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: error || "Failed To Add Exam Series !", life: 2000 });
                }
            },
        });
    }, [closeDialog, examSeries, requestAPI, setExamSeries, showToast]);

    return (
        <Dialog
            header="Add New Exam Series"
            visible={visible}
            className="w-11"
            onHide={closeDialog}
            pt={{
                headertitle: { className: TEXT_TITLE },
                content: { className: "overflow-scroll" },
            }}
        >
            <TabHeader className="pt-3" title="Add New Exam Series" highlights={["New exam series can be added"]} />

            <FloatLabel className="mt-5">
                <InputText
                    value={examSeries?.title || ""}
                    id="title"
                    className="w-full"
                    onChange={(e) => setExamSeriesForm((prev) => ({ ...prev, title: e.target.value }))}
                    disabled={loading}
                />
                <label htmlFor="title" className={TEXT_SMALL}>
                    Title
                </label>
            </FloatLabel>

            <FloatLabel className="mt-5">
                <Dropdown
                    value={courses?.find(({ id }) => id === examSeries?.course_id)}
                    onChange={(e) => setExamSeriesForm((prev) => ({ ...prev, course_id: e.value?.id }))}
                    options={courses}
                    optionLabel="title"
                    className="w-full"
                    disabled={loading}
                    pt={{
                        label: { className: TEXT_SMALL },
                        item: { className: TEXT_SMALL },
                    }}
                />
                <label htmlFor="course_id" className={TEXT_SMALL}>
                    Course
                </label>
            </FloatLabel>

            <FloatLabel className="mt-5">
                <InputNumber
                    value={examSeries?.fees}
                    id="fees"
                    className="w-full"
                    onChange={(e) => setExamSeriesForm((prev) => ({ ...prev, fees: e.value }))}
                    disabled={loading}
                />
                <label htmlFor="fees" className={TEXT_SMALL}>
                    Fees
                </label>
            </FloatLabel>

            <FloatLabel className="mt-5">
                <Calendar
                    dateFormat="dd/mm/yy"
                    inputId="start_at"
                    className="w-full"
                    value={examSeries?.start_at}
                    onChange={(e) => setExamSeriesForm((prev) => ({ ...prev, start_at: e.value }))}
                    disabled={loading}
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
                    value={examSeries?.end_at}
                    onChange={(e) => setExamSeriesForm((prev) => ({ ...prev, end_at: e.value }))}
                    disabled={loading}
                    showTime
                    hourFormat="24"
                    showIcon
                />
                <label htmlFor="end_at" className={TEXT_SMALL}>
                    End
                </label>
            </FloatLabel>

            <div className="flex align-items-center gap-2 mt-5">
                <Checkbox
                    inputId="active"
                    onChange={({ checked }) => setExamSeriesForm((prev) => ({ ...prev, active: checked }))}
                    checked={!!examSeries?.active}
                    disabled={loading}
                />
                <label htmlFor="active" className={TEXT_SMALL}>
                    Active
                </label>
            </div>

            <Button className="mt-3" label="Add Exam Series" severity="warning" loading={loading} onClick={addExamSeries} />
        </Dialog>
    );
}
