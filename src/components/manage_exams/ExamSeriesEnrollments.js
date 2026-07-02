import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Panel } from "primereact/panel";
import TabHeader from "../common/TabHeader";
import Loading from "../common/Loading";
import NoContent from "../common/NoContent";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { getReadableDate } from "../../utils";
import { TEXT_NORMAL, TEXT_SMALL } from "../../style";

function getSubmissionRows(submissions) {
    if (Array.isArray(submissions)) {
        return submissions.map((submission, index) => {
            if (typeof submission === "object" && submission !== null) {
                const examKey =
                    submission.exam_key ||
                    submission.key ||
                    submission.exam ||
                    (submission.exam_id != null ? `exam-${submission.exam_id}` : `exam-${index + 1}`);
                const marks = submission.marks ?? submission.value ?? submission.exam_marks ?? submission.total_marks ?? 0;

                return { examKey, marks };
            }

            return { examKey: `exam-${index + 1}`, marks: submission };
        });
    }

    if (submissions && typeof submissions === "object") {
        return Object.entries(submissions).map(([examKey, marks]) => ({ examKey, marks }));
    }

    return [];
}

function EnrollmentCard({ enrollment, onViewProfile, onInspect }) {
    const submissionRows = getSubmissionRows(enrollment?.submissions);

    return (
        <div className="border-1 border-gray-300 border-round py-2 px-3 flex flex-column gap-2">
            <span className={`${TEXT_NORMAL} font-semibold`}>{enrollment.full_name || "—"}</span>
            <span className={`${TEXT_SMALL} text-color-secondary`}>
                <i className="pi pi-envelope mr-1"></i>
                {enrollment.email || "—"}
            </span>
            <span className={`${TEXT_SMALL} text-color-secondary`}>
                <i className="pi pi-phone mr-1"></i>
                {enrollment.phone || "—"}
            </span>
            <span className={`${TEXT_SMALL} text-color-secondary`}>
                <i className="pi pi-calendar mr-1"></i>
                Enrolled {getReadableDate({ date: enrollment.created_on })}
            </span>

            <Panel header="Result" toggleable collapsed className="mt-1">
                {submissionRows.length ? (
                    <div className="flex flex-column gap-2">
                        {submissionRows.map(({ examKey, marks }, index) => (
                            <span key={`${examKey}-${index}`} className={TEXT_NORMAL}>
                                {index + 1}. {examKey} - {marks}
                            </span>
                        ))}
                    </div>
                ) : (
                    <span className={`${TEXT_SMALL} text-color-secondary`}>No submissions found</span>
                )}
            </Panel>

            <div className="flex justify-content-end gap-2 mt-1">
                <Button
                    label="Inspect"
                    icon="pi pi-search"
                    size="small"
                    outlined
                    disabled={!enrollment.user_id}
                    onClick={() => onInspect(enrollment)}
                    pt={{
                        label: { className: TEXT_SMALL },
                    }}
                />
                <Button
                    label="View Profile"
                    icon="pi pi-user"
                    size="small"
                    outlined
                    disabled={!enrollment.user_id}
                    onClick={() => onViewProfile(enrollment.user_id)}
                    pt={{
                        label: { className: TEXT_SMALL },
                    }}
                />
            </div>
        </div>
    );
}

export default function ExamSeriesEnrollments() {
    const { id: examSeriesId } = useParams();
    const navigate = useNavigate();
    const { requestAPI } = useAppContext();

    const [examSeries, setExamSeries] = useState();
    const [enrollments, setEnrollments] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();

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

    const loadEnrollments = useCallback(() => {
        if (!examSeriesId) return;

        requestAPI({
            requestPath: `exam-series/${examSeriesId}/enrollments`,
            requestMethod: "GET",
            setLoading,
            onRequestStart: setError,
            onRequestFailure: setError,
            onResponseReceieved: (enrollments, responseCode) => {
                if (enrollments && responseCode === 200) {
                    setEnrollments(enrollments);
                    setError();
                } else {
                    setError(enrollments?.error || "Couldn't load exam series enrollments");
                }
            },
        });
    }, [examSeriesId, requestAPI]);

    useEffect(() => {
        loadExamSeries();
        loadEnrollments();
    }, [loadExamSeries, loadEnrollments]);

    const viewProfile = useCallback(
        (userId) => {
            navigate(`/manage-users/${userId}/basics`);
        },
        [navigate],
    );

    const inspectSubmissions = useCallback(
        (enrollment) => {
            navigate(`/manage-exam-series/${examSeriesId}/users/${enrollment.user_id}/submissions`, {
                state: { full_name: enrollment.full_name },
            });
        },
        [examSeriesId, navigate],
    );

    return (
        <div className="flex flex-column flex-1 min-h-0 h-full overflow-hidden">
            <TabHeader
                className="px-3 py-3"
                title="Exam Series Enrollments"
                highlights={[
                    examSeries?.title || (examSeriesId ? `Series #${examSeriesId}` : ""),
                    enrollments?.length != null ? `Total - ${enrollments.length}` : "",
                ]}
                actionItems={[
                    <Button key="back" icon="pi pi-arrow-left" rounded text onClick={() => navigate("/manage-exam-series/exam-series")} />,
                ]}
            />
            <div className="flex-1 min-h-0 px-3 pb-2 overflow-y-auto flex flex-column gap-2">
                {loading ? (
                    <Loading message="Loading Enrollments" />
                ) : error ? (
                    <NoContent error={error} />
                ) : enrollments?.length ? (
                    enrollments.map((enrollment) => (
                        <EnrollmentCard
                            key={enrollment.id}
                            enrollment={enrollment}
                            onViewProfile={viewProfile}
                            onInspect={inspectSubmissions}
                        />
                    ))
                ) : (
                    <NoContent error="No enrollments found for this exam series" />
                )}
            </div>
        </div>
    );
}
