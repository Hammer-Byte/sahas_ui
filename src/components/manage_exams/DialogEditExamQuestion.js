import { useCallback, useState } from "react";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { Dialog } from "primereact/dialog";
import TabHeader from "../common/TabHeader";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import FileInput from "../common/FileInput";
import { TEXT_NORMAL, TEXT_SMALL, TEXT_TITLE } from "../../style";
import { CORRECT_CHOICE_OPTIONS } from "../../constants";

export default function DialogEditExamQuestion({ visible, closeDialog, setQuestions, ...props }) {
    const { requestAPI, showToast } = useAppContext();

    const [examQuestion, setExamQuestionForm] = useState({
        ...props,
        correct_choice: Number(props?.correct_choice) || 1,
    });
    const [loading, setLoading] = useState();

    const editExamQuestion = useCallback(() => {
        requestAPI({
            requestPath: "exam-series/exam-questions",
            requestMethod: "PATCH",
            requestPostBody: {
                id: examQuestion?.id,
                question: examQuestion?.question,
                choice_one: examQuestion?.choice_one,
                choice_two: examQuestion?.choice_two,
                choice_three: examQuestion?.choice_three,
                choice_four: examQuestion?.choice_four,
                correct_choice: examQuestion?.correct_choice,
                media_url: examQuestion?.media_url || null,
            },
            setLoading: setLoading,
            onRequestFailure: () => showToast({ severity: "error", summary: "Failed", detail: "Failed To Update Question !", life: 2000 }),
            onResponseReceieved: ({ error, ...updatedQuestion }, responseCode) => {
                if (updatedQuestion && responseCode === 200) {
                    showToast({ severity: "success", summary: "Updated", detail: "Question Updated", life: 1000 });
                    setQuestions((prev) => prev?.map((item) => (item?.id === props?.id ? updatedQuestion : item)));
                    closeDialog();
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: error || "Failed To Update Question !", life: 2000 });
                }
            },
        });
    }, [closeDialog, examQuestion, props?.id, requestAPI, setQuestions, showToast]);

    return (
        <Dialog
            header="Edit Question"
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
                title="Edit Question"
                highlights={["Update question details below", "Question image is optional"]}
            />

            <FileInput
                className="mt-3"
                label="Question Image"
                type="image"
                cdn_url={examQuestion?.media_url}
                setCDNUrl={(cdn_url) => setExamQuestionForm((prev) => ({ ...prev, media_url: cdn_url }))}
                disabled={loading}
                source_accessible={false}
                pt={{
                    root: { className: TEXT_NORMAL },
                }}
            />

            <FloatLabel className="mt-5">
                <InputTextarea
                    value={examQuestion?.question || ""}
                    id="question"
                    className="w-full"
                    onChange={(e) => setExamQuestionForm((prev) => ({ ...prev, question: e.target.value }))}
                    disabled={loading}
                />
                <label htmlFor="question" className={TEXT_SMALL}>
                    Question
                </label>
            </FloatLabel>

            {["choice_one", "choice_two", "choice_three", "choice_four"].map((field, index) => (
                <FloatLabel className="mt-5" key={field}>
                    <InputText
                        value={examQuestion?.[field] || ""}
                        id={field}
                        className="w-full"
                        onChange={(e) => setExamQuestionForm((prev) => ({ ...prev, [field]: e.target.value }))}
                        disabled={loading}
                    />
                    <label htmlFor={field} className={TEXT_SMALL}>
                        Choice {index + 1}
                    </label>
                </FloatLabel>
            ))}

            <FloatLabel className="mt-5">
                <Dropdown
                    value={CORRECT_CHOICE_OPTIONS.find(({ value }) => value === Number(examQuestion?.correct_choice))}
                    onChange={(e) => setExamQuestionForm((prev) => ({ ...prev, correct_choice: e.value?.value }))}
                    options={CORRECT_CHOICE_OPTIONS}
                    optionLabel="label"
                    className="w-full"
                    disabled={loading}
                    pt={{
                        label: { className: TEXT_SMALL },
                        item: { className: TEXT_SMALL },
                    }}
                />
                <label htmlFor="correct_choice" className={TEXT_SMALL}>
                    Correct Choice
                </label>
            </FloatLabel>

            <Button className="mt-3" label="Update Question" severity="warning" loading={loading} onClick={editExamQuestion} />
        </Dialog>
    );
}
