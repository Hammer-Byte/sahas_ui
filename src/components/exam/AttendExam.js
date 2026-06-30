import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../common/Loading";
import NoContent from "../common/NoContent";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { shuffleQuestions } from "./examQuestionUtils";
import { buildSubmissionPayload, getSecondsUntilExamEnd } from "./attend/examAttendUtils";
import ExamAttendHeader from "./attend/ExamAttendHeader";
import ExamLiveCameraPreview from "./attend/ExamLiveCameraPreview";
import ExamQuestionStrip from "./attend/ExamQuestionStrip";
import ExamQuestionPanel from "./attend/ExamQuestionPanel";
import ExamAttendNavigation from "./attend/ExamAttendNavigation";
import { TEXT_SMALL } from "../../style";

export default function AttendExam() {
    const { examId } = useParams();
    const navigate = useNavigate();
    const { requestAPI, showToast } = useAppContext();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [exam, setExam] = useState();
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState();
    const submitStartedRef = useRef(false);
    const answersRef = useRef(answers);

    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    const loadExamData = useCallback(() => {
        if (!examId) return;

        let examLoaded = false;
        let questionsLoaded = false;
        let loadError;

        const finishLoading = () => {
            if (examLoaded && questionsLoaded) {
                setLoading(false);
                if (loadError) setError(loadError);
            }
        };

        setLoading(true);
        setError();

        requestAPI({
            requestPath: `exams/${examId}`,
            requestMethod: "GET",
            onRequestFailure: (message) => {
                loadError = message;
                examLoaded = true;
                finishLoading();
            },
            onResponseReceieved: (exam, responseCode) => {
                if (exam?.attempted && responseCode === 200) {
                    navigate(`/exams/${examId}`, { replace: true });
                    examLoaded = true;
                    questionsLoaded = true;
                    finishLoading();
                    return;
                }

                if (exam && responseCode === 200) {
                    setExam(exam);
                } else {
                    loadError = exam?.error || "Couldn't load exam";
                }
                examLoaded = true;
                finishLoading();
            },
        });

        requestAPI({
            requestPath: `exams/${examId}/questions`,
            requestMethod: "GET",
            onRequestFailure: (message) => {
                loadError = message;
                questionsLoaded = true;
                finishLoading();
            },
            onResponseReceieved: (questions, responseCode) => {
                if (questions?.length && responseCode === 200) {
                    setQuestions(shuffleQuestions(questions));
                } else {
                    loadError = questions?.error || "Couldn't load exam questions";
                }
                questionsLoaded = true;
                finishLoading();
            },
        });
    }, [examId, navigate, requestAPI]);

    useEffect(() => {
        loadExamData();
    }, [loadExamData]);

    const secondsUntilEnd = useMemo(() => getSecondsUntilExamEnd({ end_at: exam?.end_at }), [exam?.end_at]);

    const currentQuestion = questions[currentIndex];
    const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

    const onSelectAnswer = useCallback(
        (submittedAnswer) => {
            if (!currentQuestion?.id) return;
            setAnswers((prev) => ({ ...prev, [currentQuestion.id]: submittedAnswer }));
        },
        [currentQuestion?.id],
    );

    const onSelectQuestion = useCallback((index) => {
        setCurrentIndex(index);
    }, []);

    const onBack = useCallback(() => {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    }, []);

    const onNext = useCallback(() => {
        setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
    }, [questions.length]);

    const submitExam = useCallback(() => {
        if (!examId || submitStartedRef.current || submitted) return;

        submitStartedRef.current = true;
        setSubmitting(true);
        setSubmitError();

        const submissions = buildSubmissionPayload(answersRef.current);

        requestAPI({
            requestPath: `exams/${examId}/submissions`,
            requestMethod: "POST",
            requestPostBody: { submissions },
            onRequestFailure: (message) => {
                submitStartedRef.current = false;
                setSubmitting(false);
                setSubmitError(message);
                showToast({ severity: "error", summary: "Submission Failed", detail: message, life: 4000 });
            },
            onResponseReceieved: (response, responseCode) => {
                setSubmitting(false);

                if (responseCode === 201) {
                    setSubmitted(true);
                    setSubmitError();
                    showToast({
                        severity: "success",
                        summary: "Submitted",
                        detail: "Your exam answers have been submitted.",
                        life: 3000,
                    });
                    navigate(`/exams/${examId}`, { replace: true });
                    return;
                }

                submitStartedRef.current = false;
                const detail = response?.error || "Failed to submit exam answers";
                setSubmitError(detail);
                showToast({ severity: "error", summary: "Submission Failed", detail, life: 4000 });
            },
        });
    }, [examId, navigate, requestAPI, showToast, submitted]);

    const onSubmitEarly = useCallback(() => {
        if (
            window.confirm(
                "Submit your exam now? You will not be able to change your answers after submitting.",
            )
        ) {
            submitExam();
        }
    }, [submitExam]);

    const onTimeUp = useCallback(() => {
        showToast({ severity: "warn", summary: "Time Up", detail: "Submitting your answers...", life: 3000 });
        submitExam();
    }, [showToast, submitExam]);

    if (loading) {
        return <Loading message="Loading Exam" />;
    }

    if (error || !questions.length) {
        return <NoContent error={error || "No questions available for this exam"} />;
    }

    if (submitting) {
        return <Loading message="Submitting Exam Answers" />;
    }

    const examLocked = submitting || submitted;

    return (
        <div className="flex flex-column flex-1 min-h-0 overflow-hidden">
            <p className={`${TEXT_SMALL} text-center p-2 m-0 bg-orange-500 text-white`}>Do not refresh while taking the exam.</p>

            {submitError && <NoContent error={submitError} />}

            <div className="flex align-items-center justify-content-between gap-3 px-3 py-2 border-bottom-1 border-gray-200 bg-gray-50">
                <ExamLiveCameraPreview />
                <ExamAttendHeader exam={exam} secondsUntilEnd={secondsUntilEnd} onTimeUp={onTimeUp} />
            </div>

            <ExamQuestionStrip
                questions={questions}
                currentIndex={currentIndex}
                answers={answers}
                onSelectQuestion={onSelectQuestion}
            />

            <ExamQuestionPanel
                question={currentQuestion}
                questionNumber={currentIndex + 1}
                selectedAnswer={selectedAnswer}
                onSelectAnswer={onSelectAnswer}
                disabled={examLocked}
            />

            <ExamAttendNavigation
                onBack={onBack}
                onNext={onNext}
                onSubmit={onSubmitEarly}
                canGoBack={!examLocked && currentIndex > 0}
                canGoNext={!examLocked && currentIndex < questions.length - 1}
                canSubmit={!examLocked}
            />
        </div>
    );
}
