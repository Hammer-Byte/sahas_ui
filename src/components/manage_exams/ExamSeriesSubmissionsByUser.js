import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { TabPanel, TabView } from "primereact/tabview";
import { classNames } from "primereact/utils";
import TabHeader from "../common/TabHeader";
import Loading from "../common/Loading";
import NoContent from "../common/NoContent";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { getReadableDate } from "../../utils";
import { TEXT_NORMAL, TEXT_SMALL } from "../../style";

function getTotalMarks(submissions = []) {
    return submissions.reduce((sum, submission) => sum + Number(submission?.marks || 0), 0);
}

function SubmissionRow({ submission, index }) {
    const marks = Number(submission?.marks || 0);

    return (
        <div className="border-1 border-gray-300 border-round p-3 flex flex-column gap-2">
            <div className="flex align-items-start justify-content-between gap-2">
                <span className={`${TEXT_NORMAL} font-semibold`}>Question #{submission?.question_id || index + 1}</span>
                <Tag
                    value={marks > 0 ? "Correct" : marks < 0 ? "Incorrect" : "Unattempted"}
                    severity={marks > 0 ? "success" : marks < 0 ? "danger" : "secondary"}
                    pt={{ value: { className: TEXT_SMALL } }}
                />
            </div>
            <span className={TEXT_SMALL}>
                <span className="font-semibold">Submitted answer:</span> {submission?.submitted_answer || "—"}
            </span>
            <span className={TEXT_SMALL}>
                <span className="font-semibold">Marks:</span> {submission?.marks ?? 0}
            </span>
            {submission?.created_on && (
                <span className={`${TEXT_SMALL} text-color-secondary`}>
                    <span className="font-semibold">Submitted at:</span> {getReadableDate({ date: submission.created_on })}
                </span>
            )}
        </div>
    );
}

export default function ExamSeriesSubmissionsByUser() {
    const { exam_series_id: examSeriesId, user_id: userId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { requestAPI } = useAppContext();

    const [result, setResult] = useState();
    const [examSeries, setExamSeries] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();

    const userName = location.state?.full_name;

    const loadExamSeries = useCallback(() => {
        if (!examSeriesId) return;

        requestAPI({
            requestPath: `exam-series/${examSeriesId}`,
            requestMethod: "GET",
            onResponseReceieved: (examSeries, responseCode) => {
                if (examSeries && responseCode === 200) {
                    setExamSeries(examSeries);
                }
            },
        });
    }, [examSeriesId, requestAPI]);

    const loadSubmissions = useCallback(() => {
        if (!examSeriesId || !userId) return;

        requestAPI({
            requestPath: `users/${userId}/exam-series/${examSeriesId}/submissions`,
            requestMethod: "GET",
            setLoading,
            onRequestStart: setError,
            onRequestFailure: setError,
            onResponseReceieved: (response, responseCode) => {
                if (response && responseCode === 200) {
                    setResult(response);
                    setError();
                } else {
                    setResult();
                    setError(response?.error || "Couldn't load exam submissions");
                }
            },
        });
    }, [examSeriesId, requestAPI, userId]);

    useEffect(() => {
        loadExamSeries();
        loadSubmissions();
    }, [loadExamSeries, loadSubmissions]);

    const highlights = useMemo(() => {
        const items = [
            examSeries?.title || (examSeriesId ? `Series #${examSeriesId}` : ""),
            userName || (userId ? `User #${userId}` : ""),
        ];

        if (result?.exams?.length != null) {
            items.push(`Exams - ${result.exams.length}`);
        }

        return items;
    }, [examSeries?.title, examSeriesId, result?.exams?.length, userId, userName]);

    return (
        <div className="flex flex-column flex-1 min-h-0 h-full overflow-hidden">
            <TabHeader
                className="px-3 py-3"
                title="Exam Submissions"
                highlights={highlights}
                actionItems={[
                    <Button
                        key="back"
                        icon="pi pi-arrow-left"
                        rounded
                        text
                        onClick={() => navigate(`/manage-exam-series/enrollments/${examSeriesId}`)}
                    />,
                ]}
            />

            <div className="flex-1 min-h-0 flex flex-column px-2 pb-2 overflow-hidden">
                {loading ? (
                    <Loading message="Loading Submissions" />
                ) : error ? (
                    <NoContent error={error} />
                ) : result?.exams?.length ? (
                    <TabView
                        pt={{
                            root: classNames("overflow-hidden flex flex-column flex-1 min-h-0"),
                            panelcontainer: classNames("px-1 flex-1 overflow-y-auto"),
                        }}
                    >
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
                                        <Tag
                                            value={`Total marks: ${getTotalMarks(exam.submissions)}`}
                                            severity="info"
                                            pt={{ value: { className: TEXT_SMALL } }}
                                        />
                                        <span className={`${TEXT_SMALL} text-color-secondary`}>
                                            <span className="font-semibold">Positive:</span> {exam.positive_marks ?? "—"}
                                        </span>
                                        <span className={`${TEXT_SMALL} text-color-secondary`}>
                                            <span className="font-semibold">Negative:</span> {exam.negative_marks ?? "—"}
                                        </span>
                                        <span
                                            className={`${TEXT_SMALL} flex align-items-center gap-2 border-1 border-primary-200 bg-primary-50 text-primary border-round px-2 py-1`}
                                        >
                                            <i className="pi pi-calendar" aria-hidden />
                                            <span className="font-semibold">Exam window:</span>
                                            <span>
                                                {getReadableDate({ date: exam.start_at })} - {getReadableDate({ date: exam.end_at })}
                                            </span>
                                        </span>
                                    </div>

                                    {exam.submissions?.length ? (
                                        exam.submissions.map((submission, index) => (
                                            <SubmissionRow key={submission.id || `${exam.id}-${submission.question_id}-${index}`} submission={submission} index={index} />
                                        ))
                                    ) : (
                                        <NoContent error="No submissions for this exam" />
                                    )}
                                </div>
                            </TabPanel>
                        ))}
                    </TabView>
                ) : (
                    <NoContent error="No exams found for this series" />
                )}
            </div>
        </div>
    );
}
