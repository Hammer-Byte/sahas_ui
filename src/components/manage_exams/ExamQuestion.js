import { useCallback, useState } from "react";
import { Tag } from "primereact/tag";
import { Chip } from "primereact/chip";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { ICON_SIZE, TEXT_NORMAL, TEXT_SMALL } from "../../style";
import IconButton from "../common/IconButton";
import ProgressiveControl from "../common/ProgressiveControl";
import DialogEditExamQuestion from "./DialogEditExamQuestion";
import { resolveCorrectChoice } from "./examQuestionUtils";

const CHOICE_FIELDS = ["choice_one", "choice_two", "choice_three", "choice_four"];

export default function ExamQuestion({
    id,
    question,
    choice_one,
    choice_two,
    choice_three,
    choice_four,
    correct_choice,
    media_url,
    setQuestions,
}) {
    const { requestAPI, showToast } = useAppContext();
    const [loading, setLoading] = useState();
    const [dialogEditExamQuestion, setDialogEditExamQuestion] = useState({ visible: false });

    const closeDialogEditExamQuestion = useCallback(() => {
        setDialogEditExamQuestion((prev) => ({ ...prev, visible: false }));
    }, []);

    const deleteExamQuestion = useCallback(() => {
        requestAPI({
            requestPath: `exam-series/exam-questions/${id}`,
            requestMethod: "DELETE",
            parseResponseBody: false,
            setLoading,
            onRequestFailure: () => showToast({ severity: "error", summary: "Failed", detail: "Failed To Delete Question !", life: 2000 }),
            onResponseReceieved: (_, responseCode) => {
                if (responseCode === 204) {
                    showToast({ severity: "success", summary: "Deleted", detail: "Question Deleted", life: 1000 });
                    setQuestions((prev) => prev?.filter((item) => item?.id !== id));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Delete Question !", life: 2000 });
                }
            },
        });
    }, [id, requestAPI, setQuestions, showToast]);

    const choices = { choice_one, choice_two, choice_three, choice_four };
    const resolvedCorrectChoice = resolveCorrectChoice({
        correct_choice,
        choice_one,
        choice_two,
        choice_three,
        choice_four,
    });

    return (
        <div className="border-1 border-gray-300 border-round p-2 flex gap-2">
            {!!media_url && <img className="w-4rem border-round" src={media_url} alt="question" />}
            <div className="flex-1 flex flex-column gap-2">
                <div className="flex align-items-start justify-content-between gap-2">
                    <span className={`${TEXT_NORMAL} font-semibold flex-1`}>
                        {id}. {question}
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
                                        setDialogEditExamQuestion((prev) => ({
                                            ...prev,
                                            visible: true,
                                            closeDialog: closeDialogEditExamQuestion,
                                            setQuestions,
                                            id,
                                            question,
                                            choice_one,
                                            choice_two,
                                            choice_three,
                                            choice_four,
                                            correct_choice,
                                            media_url,
                                        }))
                                    }
                                />
                                <IconButton color="text-red-500" icon="pi pi-trash" rounded onClick={deleteExamQuestion} className={ICON_SIZE} />
                            </div>
                        }
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {CHOICE_FIELDS.map((field) => {
                        const label = choices[field];
                        const isCorrect = label === resolvedCorrectChoice;
                        return isCorrect ? (
                            <Tag key={field} severity="success" value={label} pt={{ value: { className: TEXT_SMALL } }} />
                        ) : (
                            <Chip key={field} label={label} className={TEXT_SMALL} />
                        );
                    })}
                </div>
            </div>

            {dialogEditExamQuestion?.visible && <DialogEditExamQuestion {...dialogEditExamQuestion} />}
        </div>
    );
}
