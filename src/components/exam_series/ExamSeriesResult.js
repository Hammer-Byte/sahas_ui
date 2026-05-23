import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { TabPanel, TabView } from "primereact/tabview";
import TabHeader from "../common/TabHeader";
import Loading from "../common/Loading";
import NoContent from "../common/NoContent";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { getReadableDate } from "../../utils";
import { TEXT_NORMAL, TEXT_SMALL } from "../../style";

function ExamResultQuestion({ question }) {
    return (
        <div className="border-1 border-gray-300 border-round p-3 flex flex-column gap-2">
            <div className="flex align-items-start justify-content-between gap-2">
                <span className={`${TEXT_NORMAL} font-semibold flex-1`}>{question.question}</span>
                <Tag
                    value={question.marks ? "Correct" : "Incorrect"}
                    severity={question.marks ? "success" : "danger"}
                    pt={{ value: { className: TEXT_SMALL } }}
                />
            </div>
            <span className={TEXT_SMALL}>
                <span className="font-semibold">Correct answer:</span> {question.correct_choice}
            </span>
            <span className={TEXT_SMALL}>
                <span className="font-semibold">Your answer:</span> {question.submitted_answer || "Not attempted"}
            </span>
            <span className={TEXT_SMALL}>
                <span className="font-semibold">Marks:</span> {question.marks ?? 0}
            </span>
        </div>
    );
}

export default function ExamSeriesResult() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { requestAPI } = useAppContext();

    const [result, setResult] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();

    const loadResult = useCallback(() => {
        if (!id) return;

        requestAPI({
            requestPath: `exam-series/${id}/result`,
            requestMethod: "GET",
            setLoading,
            onRequestStart: setError,
            onRequestFailure: setError,
            onResponseReceieved: (result, responseCode) => {
                if (result && responseCode === 200) {
                    setResult(result);
                    setError();
                } else {
                    setError(result?.error || "Couldn't load exam series result");
                }
            },
        });
    }, [id, requestAPI]);

    useEffect(() => {
        loadResult();
    }, [loadResult]);

    return (
        <div className="flex flex-column flex-1 min-h-0 overflow-hidden">
            <TabHeader
                className="px-3 py-3"
                title="Exam Series Result"
                highlights={[result?.exam_series_title || (id ? `Series #${id}` : ""), result?.exams?.length != null ? `Exams - ${result.exams.length}` : ""]}
                actionItems={[<Button key="back" icon="pi pi-arrow-left" rounded text onClick={() => navigate(`/exam-series/${id}`)} />]}
            />

            <div className="flex-1 min-h-0 overflow-hidden px-2 pb-2">
                {loading ? (
                    <Loading message="Loading Result" />
                ) : error ? (
                    <NoContent error={error} />
                ) : result?.exams?.length ? (
                    <TabView className="h-full" panelContainerClassName="px-1 overflow-y-auto">
                        {result.exams.map((exam) => (
                            <TabPanel
                                key={exam.id}
                                header={exam.subject_title || `Exam #${exam.id}`}
                                pt={{
                                    header: { className: "flex-1" },
                                }}
                            >
                                <div className="flex flex-column gap-3 py-2">
                                    <div className="flex flex-wrap align-items-center gap-2">
                                        <Tag value={`Total marks: ${exam.total_marks ?? 0}`} severity="info" pt={{ value: { className: TEXT_SMALL } }} />
                                        <span className={`${TEXT_SMALL} text-color-secondary`}>
                                            {getReadableDate({ date: exam.start_at })} - {getReadableDate({ date: exam.end_at })}
                                        </span>
                                    </div>

                                    {exam.questions?.length ? (
                                        exam.questions.map((question) => <ExamResultQuestion key={question.id} question={question} />)
                                    ) : (
                                        <NoContent error="No questions in this exam" />
                                    )}
                                </div>
                            </TabPanel>
                        ))}
                    </TabView>
                ) : (
                    <NoContent error="No exam results found for this series" />
                )}
            </div>
        </div>
    );
}
