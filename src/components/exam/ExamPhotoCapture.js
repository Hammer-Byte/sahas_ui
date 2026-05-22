import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import Loading from "../common/Loading";
import { uploadMedia } from "../../utils";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { TEXT_NORMAL, TEXT_SMALL } from "../../style";

export default function ExamPhotoCapture({ label, facingMode = "user", cdn_url, setCDNUrl, active = false, disabled = false }) {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const { showToast } = useAppContext();

    const [preview, setPreview] = useState();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState();

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    useEffect(() => {
        if (cdn_url) {
            setPreview(cdn_url);
        }
    }, [cdn_url]);

    useEffect(() => {
        if (!active || disabled || preview || cdn_url) {
            stopCamera();
            return;
        }

        let cancelled = false;

        const startCamera = async () => {
            setError();

            if (!navigator.mediaDevices?.getUserMedia) {
                setError("Camera not supported.");
                return;
            }

            try {
                let stream;
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false });
                } catch {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                }

                if (cancelled) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }
            } catch {
                if (!cancelled) {
                    setError("Allow camera access to continue.");
                }
            }
        };

        startCamera();

        return () => {
            cancelled = true;
            stopCamera();
        };
    }, [active, cdn_url, disabled, facingMode, preview, stopCamera]);

    const capturePhoto = useCallback(() => {
        const video = videoRef.current;
        if (!video?.videoWidth) {
            showToast({ severity: "warn", summary: "Please wait", detail: "Camera is loading", life: 2000 });
            return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            if (!blob) return;

            stopCamera();

            const file = new File([blob], `${facingMode}.jpg`, { type: "image/jpeg" });

            uploadMedia({
                requestPath: "bucketise/images",
                file,
                onRequestStart: () => setUploading(true),
                onRequestFailure: (message) => {
                    setUploading(false);
                    showToast({ severity: "error", summary: "Failed", detail: message, life: 2000 });
                },
                onResponseReceieved: (response, responseCode) => {
                    setUploading(false);
                    if (response?.cdn_url && responseCode === 201) {
                        setCDNUrl(response.cdn_url);
                        setPreview(URL.createObjectURL(file));
                    } else {
                        showToast({ severity: "error", summary: "Failed", detail: "Upload failed", life: 2000 });
                    }
                },
            });
        }, "image/jpeg");
    }, [facingMode, setCDNUrl, showToast, stopCamera]);

    const retake = useCallback(() => {
        setCDNUrl(null);
        setPreview(null);
        setError();
    }, [setCDNUrl]);

    if (uploading) {
        return <Loading message={`Saving ${label}`} />;
    }

    if (preview) {
        return (
            <div className="border-1 border-gray-300 border-round p-3 flex flex-column align-items-center gap-2">
                <span className={`${TEXT_NORMAL} font-semibold`}>{label}</span>
                <img src={preview} alt={label} className="w-full max-w-15rem border-round" />
                <Button label="Retake" icon="pi pi-refresh" size="small" severity="secondary" disabled={disabled} onClick={retake} />
            </div>
        );
    }

    if (!active) {
        return (
            <div className="border-1 border-gray-300 border-round p-3 opacity-60">
                <span className={`${TEXT_SMALL} text-color-secondary`}>{label} — complete the step above first</span>
            </div>
        );
    }

    return (
        <div className="border-1 border-gray-300 border-round p-3 flex flex-column align-items-center gap-2">
            <span className={`${TEXT_NORMAL} font-semibold`}>{label}</span>
            {error && <span className={`${TEXT_SMALL} text-red-500`}>{error}</span>}
            <video ref={videoRef} className="w-full max-w-15rem border-round bg-gray-900" playsInline muted autoPlay />
            <Button label="Take Photo" icon="pi pi-camera" severity="success" size="small" disabled={disabled || !!error} onClick={capturePhoto} />
        </div>
    );
}
