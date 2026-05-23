import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import TabHeader from "../common/TabHeader";
import Loading from "../common/Loading";
import NoContent from "../common/NoContent";
import ExamSeriesCard from "./ExamSeriesCard";
import ExamCard from "./ExamCard";
import { getExamSeriesStatus } from "./examSeriesStatus";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { getReadableDate } from "../../utils";
import { TEXT_LARGE, TEXT_NORMAL, TEXT_SMALL } from "../../style";

export default function ExamSeriesDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { requestAPI, showToast } = useAppContext();

    const [examSeries, setExamSeries] = useState();
    const [loading, setLoading] = useState();
    const [error, setError] = useState();
    const [enrolling, setEnrolling] = useState();

    const loadExamSeries = useCallback(() => {
        if (!id) return;

        requestAPI({
            requestPath: `exam-series/${id}`,
            requestMethod: "GET",
            setLoading,
            onRequestStart: setError,
            onRequestFailure: setError,
            onResponseReceieved: (examSeries, responseCode) => {
                if (examSeries && responseCode === 200) {
                    setExamSeries(examSeries);
                    setError();
                } else {
                    setError("Couldn't load exam series");
                }
            },
        });
    }, [id, requestAPI]);

    useEffect(() => {
        loadExamSeries();
    }, [loadExamSeries]);

    const seriesStatus = useMemo(
        () => (examSeries ? getExamSeriesStatus({ start_at: examSeries.start_at, end_at: examSeries.end_at }) : null),
        [examSeries],
    );

    const showResult = useCallback(() => {
        if (!examSeries?.id) return;
        navigate(`/exam-series/${examSeries.id}/result`);
    }, [examSeries?.id, navigate]);

    const checkMerit = useCallback(() => {
        if (!examSeries?.id) return;
        navigate(`/exam-series/${examSeries.id}/merit`);
    }, [examSeries?.id, navigate]);

    const enrollExam = useCallback(() => {
        if (!examSeries?.id) return;

        requestAPI({
            requestPath: "exam-series/enrollments",
            requestMethod: "POST",
            requestPostBody: { exam_series_id: examSeries.id },
            setLoading: setEnrolling,
            onRequestFailure: () =>
                showToast({ severity: "error", summary: "Failed", detail: "Failed to enroll in exam series", life: 3000 }),
            onResponseReceieved: ({ error, ...enrollment }, responseCode) => {
                if (enrollment && responseCode === 201) {
                    setExamSeries((prev) => ({ ...prev, enrolled: true }));
                    showToast({ severity: "success", summary: "Enrolled", detail: "You are enrolled in this exam series", life: 3000 });
                    return;
                }

                if (responseCode === 405) {
                    navigate(`/exam-series/paid-enrollment/${examSeries.id}`);
                    return;
                }

                showToast({
                    severity: "error",
                    summary: "Failed",
                    detail: error || "Failed to enroll in exam series",
                    life: 3000,
                });
            },
        });
    }, [examSeries?.id, examSeries, navigate, requestAPI, showToast]);

    return (
        <div className="flex flex-column flex-1 min-h-0 overflow-hidden">
            <TabHeader
                className="px-3 py-3"
                title="Exam Series"
                highlights={[
                    examSeries?.title || (id ? `Series #${id}` : ""),
                    examSeries?.exams?.length != null ? `Exams - ${examSeries.exams.length}` : "",
                ]}
                actionItems={[<Button key="back" icon="pi pi-arrow-left" rounded text onClick={() => navigate("/exam-series/list")} />]}
            />

            <div className="flex-1 min-h-0 overflow-y-scroll p-2 flex flex-column gap-3">
                {loading ? (
                    <Loading message="Loading Exam Series" />
                ) : error ? (
                    <NoContent error={error} />
                ) : examSeries ? (
                    <>
                        <ExamSeriesCard {...examSeries} />

                        {!!examSeries.enrolled && (
                            <span
                                className={`${TEXT_SMALL} text-center p-2 border-round border-1 border-green-300 bg-green-100 text-green-800 flex align-items-center justify-content-center gap-2 w-full`}
                            >
                                <i className="pi pi-check-circle" aria-hidden />
                                You have already enrolled in this exam series and can appear for exams.
                            </span>
                        )}

                        {seriesStatus?.key === "upcoming" && (
                            <div className="flex flex-column align-items-center gap-3 py-2">
                                <div className="flex flex-column align-items-center gap-2">
                                    <span className={`${TEXT_LARGE} font-semibold text-primary`}>
                                        {getReadableDate({ date: examSeries.start_at })}
                                    </span>
                                    <Tag icon="pi pi-calendar" severity="info" value="Series starts on" pt={{ value: { className: TEXT_SMALL } }} />
                                </div>
                                {!examSeries.enrolled && (
                                    <Button
                                        label="Enroll Exam Series"
                                        icon="pi pi-user-plus"
                                        severity="warning"
                                        loading={enrolling}
                                        onClick={enrollExam}
                                    />
                                )}
                            </div>
                        )}

                        {seriesStatus?.key === "ongoing" && (
                            <span className={`${TEXT_SMALL} text-center p-2 border-round border-1 border-orange-300 bg-orange-100 text-gray-700`}>
                                This exam series is ongoing.
                            </span>
                        )}

                        {seriesStatus?.key === "finished" && (
                            <div className="flex flex-column align-items-center gap-3">
                                <Button
                                    className="align-self-center"
                                    label="Show Result"
                                    icon="pi pi-chart-bar"
                                    severity="success"
                                    onClick={showResult}
                                />
                                {!!examSeries.enrolled && (
                                    <Button
                                        className="align-self-center"
                                        label="Check Merit"
                                        icon="pi pi-star"
                                        severity="success"
                                        outlined
                                        onClick={checkMerit}
                                    />
                                )}
                            </div>
                        )}

                        <div className="flex flex-column gap-2">
                            <span className={`${TEXT_NORMAL} font-semibold px-1`}>Exams in this series</span>
                            {examSeries.exams?.length ? (
                                examSeries.exams.map((exam) => (
                                    <ExamCard
                                        key={exam.id}
                                        id={exam.id}
                                        subject_title={exam.subject_title}
                                        start_at={exam.start_at}
                                        end_at={exam.end_at}
                                        enrolled={!!examSeries.enrolled}
                                    />
                                ))
                            ) : (
                                <NoContent error="No exams in this series" />
                            )}
                        </div>
                    </>
                ) : (
                    <NoContent error="Exam series not found" />
                )}
            </div>
        </div>
    );
}
