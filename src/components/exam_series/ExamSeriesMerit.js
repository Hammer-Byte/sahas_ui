import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import TabHeader from "../common/TabHeader";
import Loading from "../common/Loading";
import NoContent from "../common/NoContent";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { TEXT_NORMAL, TEXT_SMALL } from "../../style";

export default function ExamSeriesMerit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { requestAPI } = useAppContext();

    const [merit, setMerit] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();

    const loadMerit = useCallback(() => {
        if (!id) return;

        requestAPI({
            requestPath: `exam-series/${id}/merit`,
            requestMethod: "GET",
            setLoading,
            onRequestStart: setError,
            onRequestFailure: setError,
            onResponseReceieved: (merit, responseCode) => {
                if (merit && responseCode === 200) {
                    setMerit(merit);
                    setError();
                } else {
                    setError(merit?.error || "Couldn't load merit list");
                }
            },
        });
    }, [id, requestAPI]);

    useEffect(() => {
        loadMerit();
    }, [loadMerit]);

    return (
        <div className="flex flex-column flex-1 min-h-0 overflow-hidden">
            <TabHeader
                className="px-3 py-3"
                title="Exam Series Merit"
                highlights={[merit?.exam_series_title || (id ? `Series #${id}` : ""), merit?.merit_list?.length != null ? `Ranked - ${merit.merit_list.length}` : ""]}
                actionItems={[<Button key="back" icon="pi pi-arrow-left" rounded text onClick={() => navigate(`/exam-series/${id}`)} />]}
            />

            <div className="flex-1 min-h-0 overflow-y-scroll p-2 flex flex-column gap-3">
                {loading ? (
                    <Loading message="Loading Merit List" />
                ) : error ? (
                    <NoContent error={error} />
                ) : merit ? (
                    <>
                        <span className={`${TEXT_SMALL} text-color-secondary px-1`}>
                            Average is calculated from total marks across {merit.total_exams} exam(s) in this series.
                        </span>

                        {merit.merit_list?.length ? (
                            merit.merit_list.map((entry) => (
                                <div key={entry.user_id} className="border-1 border-gray-300 border-round p-3 flex flex-column gap-2">
                                    <div className="flex align-items-center justify-content-between gap-2 flex-wrap">
                                        <div className="flex align-items-center gap-2">
                                            <Tag value={`#${entry.rank}`} severity={entry.rank === 1 ? "success" : "info"} pt={{ value: { className: TEXT_SMALL } }} />
                                            <span className={`${TEXT_NORMAL} font-semibold`}>{entry.full_name || `User #${entry.user_id}`}</span>
                                        </div>
                                        <Tag
                                            value={`Avg ${entry.average}`}
                                            severity="warning"
                                            icon="pi pi-star"
                                            pt={{ value: { className: TEXT_SMALL } }}
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {entry.exam_scores?.map((examScore) => (
                                            <span
                                                key={examScore.exam_id}
                                                className={`${TEXT_SMALL} px-2 py-1 border-round border-1 border-gray-200 bg-gray-50`}
                                            >
                                                {examScore.subject_title || `Exam #${examScore.exam_id}`}: {examScore.marks}
                                            </span>
                                        ))}
                                    </div>

                                    <span className={`${TEXT_SMALL} text-color-secondary`}>Total marks: {entry.total_marks}</span>
                                </div>
                            ))
                        ) : (
                            <NoContent error="No candidates have attempted exams in this series yet." />
                        )}
                    </>
                ) : (
                    <NoContent error="Merit list not found" />
                )}
            </div>
        </div>
    );
}
