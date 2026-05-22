import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import TabHeader from "../common/TabHeader";
import Loading from "../common/Loading";
import NoContent from "../common/NoContent";
import ExamQuestion from "./ExamQuestion";
import DialogAddExamQuestion from "./DialogAddExamQuestion";
import FileInput from "../common/FileInput";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { TEXT_NORMAL, TEXT_SMALL } from "../../style";

export default function ExamQuestions() {
    const { id: examId } = useParams();
    const navigate = useNavigate();
    const { requestAPI, showToast } = useAppContext();

    const [exam, setExam] = useState();
    const [questions, setQuestions] = useState();
    const [loading, setLoading] = useState();
    const [error, setError] = useState();

    const [bulkCsvUrl, setBulkCsvUrl] = useState();
    const [bulkLoading, setBulkLoading] = useState(false);

    const [dialogAddExamQuestion, setDialogAddExamQuestion] = useState({
        visible: false,
    });

    const closeDialogAddExamQuestion = useCallback(() => {
        setDialogAddExamQuestion((prev) => ({ ...prev, visible: false }));
    }, []);

    const importQuestionsFromCsv = useCallback(() => {
        if (!examId || !bulkCsvUrl) return;

        requestAPI({
            requestPath: "exam-series/exam-questions/bulk",
            requestMethod: "POST",
            requestPostBody: { exam_id: Number(examId), csv_url: bulkCsvUrl },
            setLoading: setBulkLoading,
            onRequestFailure: () =>
                showToast({ severity: "error", summary: "Import Failed", detail: "Failed to import questions from CSV", life: 3000 }),
            onResponseReceieved: (response, responseCode) => {
                if (responseCode === 201 && response?.questions?.length) {
                    setQuestions((prev) => [...(prev || []), ...response.questions]);
                    setBulkCsvUrl();
                    showToast({
                        severity: "success",
                        summary: "Imported",
                        detail: `${response.count} question(s) added from CSV`,
                        life: 3000,
                    });
                    return;
                }

                showToast({
                    severity: "error",
                    summary: "Import Failed",
                    detail: response?.error || "Failed to import questions from CSV",
                    life: 3000,
                });
            },
        });
    }, [bulkCsvUrl, examId, requestAPI, showToast]);

    useEffect(() => {
        if (!examId) return;

        requestAPI({
            requestPath: `exam-series/exams/${examId}`,
            requestMethod: "GET",
            onResponseReceieved: (exam, responseCode) => {
                if (exam && responseCode === 200) {
                    setExam(exam);
                }
            },
        });

        requestAPI({
            requestPath: `exam-series/exams/${examId}/questions`,
            requestMethod: "GET",
            setLoading: setLoading,
            onRequestStart: setError,
            onRequestFailure: setError,
            onResponseReceieved: (questions, responseCode) => {
                if (questions && responseCode === 200) {
                    setQuestions(questions);
                    setError();
                } else {
                    setError("Couldn't load Questions");
                }
            },
        });
    }, [examId, requestAPI]);

    return (
        <div className="flex flex-column flex-1 min-h-0 overflow-hidden">
            <TabHeader
                className="px-3 py-3"
                title="Exam Questions"
                highlights={[
                    exam?.subject_title ? `Exam - ${exam.subject_title}` : `Exam #${examId}`,
                    `Total - ${questions?.length || 0} Questions`,
                ]}
                actionItems={[
                    <Button
                        icon="pi pi-arrow-left"
                        rounded
                        text
                        onClick={() =>
                            exam?.exam_series_id
                                ? navigate(`/manage-exam-series/${exam.exam_series_id}/exams`)
                                : navigate(-1)
                        }
                    />,
                    <Button
                        icon="pi pi-plus"
                        severity="warning"
                        onClick={() =>
                            setDialogAddExamQuestion((prev) => ({
                                ...prev,
                                visible: true,
                                closeDialog: closeDialogAddExamQuestion,
                                examId,
                                setQuestions,
                            }))
                        }
                    />,
                ]}
            />
            <div className="flex-1 min-h-0 px-3 pb-2 overflow-y-scroll flex flex-column gap-2">
                <div className="border-1 border-gray-300 border-round p-3 flex flex-column gap-3">
                    <span className={`${TEXT_NORMAL} font-semibold`}>Bulk import from CSV</span>
                    <span className={`${TEXT_SMALL} text-color-secondary`}>
                        CSV columns: question, choice_one, choice_two, choice_three, choice_four, correct_choice
                    </span>
                    <FileInput
                        label="Questions CSV"
                        type="sheet"
                        cdn_url={bulkCsvUrl}
                        setCDNUrl={setBulkCsvUrl}
                        disabled={bulkLoading || loading}
                        source_accessible={false}
                    />
                    <Button
                        className="align-self-start"
                        label="Import Questions"
                        icon="pi pi-upload"
                        severity="success"
                        loading={bulkLoading}
                        disabled={!bulkCsvUrl || bulkLoading || loading}
                        onClick={importQuestionsFromCsv}
                    />
                </div>

                {loading ? (
                    <Loading message="Loading Questions" />
                ) : error ? (
                    <NoContent error={error} />
                ) : questions?.length ? (
                    questions.map((question) => <ExamQuestion key={question?.id} {...question} setQuestions={setQuestions} />)
                ) : (
                    <NoContent error="No Questions Found" />
                )}
            </div>

            {dialogAddExamQuestion?.visible && <DialogAddExamQuestion {...dialogAddExamQuestion} />}
        </div>
    );
}
