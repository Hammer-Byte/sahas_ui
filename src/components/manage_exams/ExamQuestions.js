import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import TabHeader from "../common/TabHeader";
import Loading from "../common/Loading";
import NoContent from "../common/NoContent";
import ExamQuestion from "./ExamQuestion";
import DialogAddExamQuestion from "./DialogAddExamQuestion";
import { useAppContext } from "../../providers/ProviderAppContainer";

export default function ExamQuestions() {
    const { id: examId } = useParams();
    const navigate = useNavigate();
    const { requestAPI } = useAppContext();

    const [exam, setExam] = useState();
    const [questions, setQuestions] = useState();
    const [loading, setLoading] = useState();
    const [error, setError] = useState();

    const [dialogAddExamQuestion, setDialogAddExamQuestion] = useState({
        visible: false,
    });

    const closeDialogAddExamQuestion = useCallback(() => {
        setDialogAddExamQuestion((prev) => ({ ...prev, visible: false }));
    }, []);

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
