import { useCallback, useMemo, useState } from "react";
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
import { EMPTY_EXAM_QUESTION } from "../../constants";
import { getCorrectChoiceOptions } from "./examQuestionUtils";

const CHOICE_FIELDS = ["choice_one", "choice_two", "choice_three", "choice_four"];

export default function DialogAddExamQuestion({ visible, closeDialog, examId, setQuestions }) {
    const { requestAPI, showToast } = useAppContext();

    const [examQuestion, setExamQuestionForm] = useState({ ...EMPTY_EXAM_QUESTION });
    const [loading, setLoading] = useState();

    const correctChoiceOptions = useMemo(() => getCorrectChoiceOptions(examQuestion), [examQuestion]);

    const addExamQuestion = useCallback(() => {
        if (!examQuestion?.correct_choice) {
            showToast({ severity: "warn", summary: "Correct choice", detail: "Please select the correct answer", life: 2000 });
            return;
        }

        requestAPI({
            requestPath: `exam-series/exams/${examId}/questions`,
            requestMethod: "POST",
            requestPostBody: {
                question: examQuestion?.question,
                choice_one: examQuestion?.choice_one,
                choice_two: examQuestion?.choice_two,
                choice_three: examQuestion?.choice_three,
                choice_four: examQuestion?.choice_four,
                correct_choice: examQuestion?.correct_choice,
                media_url: examQuestion?.media_url || null,
            },
            setLoading: setLoading,
            onRequestFailure: () => showToast({ severity: "error", summary: "Failed", detail: "Failed To Add Question !", life: 2000 }),
            onResponseReceieved: ({ error, ...addedQuestion }, responseCode) => {
                if (addedQuestion && responseCode === 201) {
                    showToast({ severity: "success", summary: "Added", detail: "Question Added", life: 1000 });
                    setQuestions((prev) => [...(prev || []), addedQuestion]);
                    setExamQuestionForm({ ...EMPTY_EXAM_QUESTION });
                    closeDialog();
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: error || "Failed To Add Question !", life: 2000 });
                }
            },
        });
    }, [closeDialog, examId, examQuestion, requestAPI, setQuestions, showToast]);

    return (
        <Dialog
            header="Add New Question"
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
                title="Add New Question"
                highlights={["Add question with four choices", "Question image is optional"]}
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

            {CHOICE_FIELDS.map((field, index) => (
                <FloatLabel className="mt-5" key={field}>
                    <InputText
                        value={examQuestion?.[field] || ""}
                        id={field}
                        className="w-full"
                        onChange={(e) => {
                            const value = e.target.value;
                            setExamQuestionForm((prev) => {
                                const next = { ...prev, [field]: value };
                                const options = getCorrectChoiceOptions(next).map(({ value: optionValue }) => optionValue);
                                if (prev.correct_choice && !options.includes(prev.correct_choice)) {
                                    next.correct_choice = "";
                                }
                                return next;
                            });
                        }}
                        disabled={loading}
                    />
                    <label htmlFor={field} className={TEXT_SMALL}>
                        Choice {index + 1}
                    </label>
                </FloatLabel>
            ))}

            <FloatLabel className="mt-5">
                <Dropdown
                    value={examQuestion?.correct_choice || null}
                    onChange={(e) => setExamQuestionForm((prev) => ({ ...prev, correct_choice: e.value }))}
                    options={correctChoiceOptions}
                    optionLabel="label"
                    optionValue="value"
                    placeholder={correctChoiceOptions.length ? "Select correct answer" : "Enter choices first"}
                    className="w-full"
                    disabled={loading || !correctChoiceOptions.length}
                    pt={{
                        label: { className: TEXT_SMALL },
                        item: { className: TEXT_SMALL },
                    }}
                />
                <label htmlFor="correct_choice" className={TEXT_SMALL}>
                    Correct Choice
                </label>
            </FloatLabel>

            <Button className="mt-3" label="Add Question" severity="warning" loading={loading} onClick={addExamQuestion} />
        </Dialog>
    );
}
