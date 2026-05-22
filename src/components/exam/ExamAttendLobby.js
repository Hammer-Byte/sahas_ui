import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import Loading from "../common/Loading";
import NoContent from "../common/NoContent";
import Timer from "../common/Timer";
import { getExamStatus, getSecondsUntil, shouldShowCountdownUntilStart } from "../exam_series/examSeriesStatus";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { getReadableDate } from "../../utils";
import { TEXT_LARGE, TEXT_NORMAL, TEXT_SMALL } from "../../style";

export default function ExamAttendLobby() {
    const { examId } = useParams();
    const navigate = useNavigate();
    const { requestAPI } = useAppContext();

    const [exam, setExam] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [timerKey, setTimerKey] = useState(0);
    const [examWindowReady, setExamWindowReady] = useState(false);

    const loadExam = useCallback(() => {
        if (!examId) return;

        requestAPI({
            requestPath: `exams/${examId}`,
            requestMethod: "GET",
            setLoading,
            onRequestStart: setError,
            onRequestFailure: setError,
            onResponseReceieved: (exam, responseCode) => {
                if (exam && responseCode === 200) {
                    setExam(exam);
                    setError();
                } else {
                    setError("Couldn't load exam");
                }
            },
        });
    }, [examId, requestAPI]);

    useEffect(() => {
        loadExam();
    }, [loadExam]);

    const examStatus = useMemo(() => (exam ? getExamStatus({ start_at: exam.start_at, end_at: exam.end_at }) : null), [exam]);

    const secondsUntilStart = useMemo(() => getSecondsUntil({ date: exam?.start_at }), [exam?.start_at, timerKey]);

    const showCountdown = shouldShowCountdownUntilStart(secondsUntilStart);

    const onCountdownComplete = useCallback(() => {
        setTimerKey((prev) => prev + 1);
        setExamWindowReady(true);
    }, []);

    useEffect(() => {
        if (examStatus?.key === "ongoing") {
            setExamWindowReady(true);
        }
    }, [examStatus?.key]);

    const canProceedToAssessment = examStatus?.key === "ongoing" || (examStatus?.key === "upcoming" && examWindowReady);

    if (loading) {
        return <Loading message="Loading Exam" />;
    }

    if (error) {
        return <NoContent error={error} />;
    }

    if (!exam) {
        return <NoContent error="Exam not found" />;
    }

    return (
        <div className="flex flex-column align-items-center gap-3 p-3 flex-1 min-h-0 overflow-y-scroll">
            <span className={`${TEXT_NORMAL} font-semibold`}>{exam.subject_title || `Exam #${examId}`}</span>
            <Tag value={examStatus?.label} severity={examStatus?.severity} pt={{ value: { className: TEXT_SMALL } }} />
            <span className={`${TEXT_SMALL} text-color-secondary text-center`}>
                <i className="pi pi-calendar mr-1"></i>
                {getReadableDate({ date: exam.start_at })} - {getReadableDate({ date: exam.end_at })}
            </span>

            {examStatus?.key === "upcoming" && !examWindowReady && (
                <>
                    {showCountdown ? (
                        <Timer
                            key={timerKey}
                            totalSeconds={secondsUntilStart}
                            tagValue="Exam starts in"
                            onTimeUp={onCountdownComplete}
                        />
                    ) : (
                        <div className="flex flex-column align-items-center gap-2">
                            <span className={`${TEXT_LARGE} font-semibold text-primary`}>{getReadableDate({ date: exam.start_at })}</span>
                            <Tag icon="pi pi-calendar" severity="info" value="Starts on" pt={{ value: { className: TEXT_SMALL } }} />
                        </div>
                    )}
                </>
            )}

            {examStatus?.key === "finished" && (
                <NoContent error="This exam has finished. Assessment is no longer available." />
            )}

            {exam.attempted ? (
                <span
                    className={`${TEXT_SMALL} text-center p-2 border-round border-1 border-green-300 bg-green-100 text-green-800 flex align-items-center justify-content-center gap-2 w-full`}
                >
                    <i className="pi pi-check-circle" aria-hidden />
                    You have already attempted this exam.
                </span>
            ) : (
                canProceedToAssessment && (
                    <Button
                        label="Proctor Candidate Assessment"
                        icon="pi pi-arrow-right"
                        iconPos="right"
                        severity="warning"
                        onClick={() => navigate(`/exams/${examId}/assess-candidate`)}
                    />
                )
            )}
        </div>
    );
}
