import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import TabHeader from "../common/TabHeader";
import Loading from "../common/Loading";
import NoContent from "../common/NoContent";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { getReadableDate } from "../../utils";
import { TEXT_NORMAL, TEXT_SMALL } from "../../style";

function EnrollmentCard({ enrollment, onViewProfile }) {
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
            <div className="flex justify-content-end mt-1">
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

    return (
        <div className="flex flex-column flex-1 min-h-0 overflow-hidden">
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
            <div className="flex-1 min-h-0 px-3 pb-2 overflow-y-scroll flex flex-column gap-2">
                {loading ? (
                    <Loading message="Loading Enrollments" />
                ) : error ? (
                    <NoContent error={error} />
                ) : enrollments?.length ? (
                    enrollments.map((enrollment) => (
                        <EnrollmentCard key={enrollment.id} enrollment={enrollment} onViewProfile={viewProfile} />
                    ))
                ) : (
                    <NoContent error="No enrollments found for this exam series" />
                )}
            </div>
        </div>
    );
}
