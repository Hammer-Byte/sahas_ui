import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import ExamPhotoCapture from "./ExamPhotoCapture";
import Loading from "../common/Loading";
import NoContent from "../common/NoContent";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { TEXT_NORMAL, TEXT_SMALL } from "../../style";

export default function AssesCandidate() {
    const { examId } = useParams();
    const navigate = useNavigate();
    const { requestAPI } = useAppContext();

    const [instructionsAccepted, setInstructionsAccepted] = useState(false);
    const [identityUrl, setIdentityUrl] = useState();
    const [selfieUrl, setSelfieUrl] = useState();
    const [loading, setLoading] = useState(false);
    const [checkingAttempt, setCheckingAttempt] = useState(true);
    const [error, setError] = useState();

    useEffect(() => {
        if (!examId) return;

        requestAPI({
            requestPath: `exams/${examId}`,
            requestMethod: "GET",
            setLoading: setCheckingAttempt,
            onRequestFailure: setError,
            onResponseReceieved: (exam, responseCode) => {
                if (exam?.attempted && responseCode === 200) {
                    navigate(`/exams/${examId}`, { replace: true });
                    return;
                }

                if (!exam || responseCode !== 200) {
                    setError(exam?.error || "Couldn't load exam");
                }
            },
        });
    }, [examId, navigate, requestAPI]);

    const photosReady = !!identityUrl && !!selfieUrl;
    const canStartAssessment = instructionsAccepted && photosReady;

    const startAssessment = useCallback(() => {
        if (!examId || !canStartAssessment) return;

        requestAPI({
            requestPath: `exams/${examId}/candidature`,
            requestMethod: "POST",
            requestPostBody: { identity: identityUrl, selfie: selfieUrl },
            setLoading,
            onRequestStart: () => setError(),
            onRequestFailure: setError,
            onResponseReceieved: (response, responseCode) => {
                if (responseCode === 201 || responseCode === 200) {
                    setError();
                    navigate(`/exams/${examId}/assess-candidate/attend`);
                    return;
                }

                setError(response?.error || "Couldn't start assessment");
            },
        });
    }, [canStartAssessment, examId, identityUrl, navigate, requestAPI, selfieUrl]);

    if (checkingAttempt || loading) {
        return <Loading message={loading ? "Starting Assessment" : "Loading Exam"} />;
    }

    return (
        <div className="flex flex-column gap-3 p-3 flex-1 min-h-0 overflow-y-scroll">
            {error && <NoContent error={error} />}

            <span className={`${TEXT_NORMAL} font-semibold`}>Before you begin</span>
            <ul className={`${TEXT_SMALL} text-color-secondary m-0 pl-3 flex flex-column gap-2`}>
                <li>Ensure a stable internet connection for the full duration of the exam.</li>
                <li>Do not refresh or close the browser tab once the assessment has started.</li>
                <li>Read each question carefully before selecting your answer.</li>
                <li>Only one attempt is allowed unless instructed otherwise by your proctor.</li>
            </ul>

            <ExamPhotoCapture
                label="Identity Card Photo"
                facingMode="environment"
                cdn_url={identityUrl}
                setCDNUrl={setIdentityUrl}
                disabled={loading}
            />
            <ExamPhotoCapture
                label="Selfie Photo"
                facingMode="user"
                cdn_url={selfieUrl}
                setCDNUrl={setSelfieUrl}
                disabled={loading}
            />

            <div className="flex align-items-start gap-2 border-1 border-gray-300 border-round p-3">
                <Checkbox
                    inputId="exam-instructions"
                    checked={instructionsAccepted}
                    invalid={!instructionsAccepted}
                    onChange={(e) => setInstructionsAccepted(e.checked)}
                />
                <label htmlFor="exam-instructions" className={TEXT_SMALL}>
                    I have read and understood the instructions above, captured my identity card and selfie, and I am ready to begin the assessment under
                    proctor supervision.
                </label>
            </div>

            <Button
                className="align-self-center"
                label="Start Assessment"
                icon="pi pi-play"
                severity="success"
                disabled={!canStartAssessment}
                onClick={startAssessment}
            />
            <Button
                className="align-self-center"
                label="Back"
                icon="pi pi-arrow-left"
                severity="secondary"
                text
                onClick={() => navigate(`/exams/${examId}`)}
            />
        </div>
    );
}
