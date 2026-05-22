import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import Loading from "../common/Loading";
import { uploadMedia } from "../../utils";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { TEXT_NORMAL, TEXT_SMALL } from "../../style";

export default function ExamPhotoCapture({ label, facingMode = "user", cdn_url, setCDNUrl, disabled = false }) {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const { showToast } = useAppContext();

    const [cameraActive, setCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState();
    const [uploadProgress, setUploadProgress] = useState(false);
    const [previewUrl, setPreviewUrl] = useState();

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    }, []);

    useEffect(() => {
        if (cdn_url) {
            setPreviewUrl(cdn_url);
        }
    }, [cdn_url]);

    useEffect(() => () => stopCamera(), [stopCamera]);

    const startCamera = useCallback(async () => {
        if (disabled) return;

        setCameraError();
        stopCamera();

        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraError("Camera is not supported on this device or browser.");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode },
                audio: false,
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setCameraActive(true);
        } catch {
            setCameraError("Camera permission is required. Please allow camera access and try again.");
        }
    }, [disabled, facingMode, stopCamera]);

    const capturePhoto = useCallback(() => {
        const video = videoRef.current;
        if (!video?.videoWidth) return;

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);

        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    showToast({ severity: "error", summary: "Failed", detail: "Could not capture photo", life: 2000 });
                    return;
                }

                stopCamera();

                const file = new File([blob], `${facingMode}-${Date.now()}.jpg`, { type: "image/jpeg" });

                uploadMedia({
                    requestPath: "bucketise/images",
                    file,
                    onRequestStart: setUploadProgress,
                    onRequestFailure: (error) => {
                        setUploadProgress(false);
                        showToast({ severity: "error", summary: "Failed", detail: error, life: 2000 });
                    },
                    onProgress: setUploadProgress,
                    onResponseReceieved: ({ cdn_url: uploadedUrl }, responseCode) => {
                        setUploadProgress(false);
                        if (uploadedUrl && responseCode === 201) {
                            setCDNUrl(uploadedUrl);
                            setPreviewUrl(URL.createObjectURL(file));
                            showToast({ severity: "success", summary: "Captured", detail: "Photo uploaded", life: 1000 });
                        } else {
                            showToast({ severity: "error", summary: "Failed", detail: "Failed to upload photo", life: 2000 });
                        }
                    },
                });
            },
            "image/jpeg",
            0.92,
        );
    }, [facingMode, setCDNUrl, showToast, stopCamera]);

    const clearPhoto = useCallback(() => {
        setCDNUrl(null);
        setPreviewUrl(null);
        setCameraError();
    }, [setCDNUrl]);

    if (uploadProgress) {
        return (
            <div className="border-1 border-gray-300 border-round p-4">
                <Loading message={`Uploading ${label}${typeof uploadProgress === "number" ? ` ${uploadProgress}%` : ""}`} />
            </div>
        );
    }

    return (
        <div className="border-1 border-gray-300 border-round p-4 flex flex-column gap-3">
            <span className={`${TEXT_NORMAL} font-semibold`}>{label}</span>
            <span className={`${TEXT_SMALL} text-color-secondary`}>Use your device camera — gallery upload is not allowed here.</span>

            {cameraError && <span className={`${TEXT_SMALL} text-red-500`}>{cameraError}</span>}

            {previewUrl && !cameraActive ? (
                <div className="flex flex-column align-items-center gap-3">
                    <img src={previewUrl} alt={label} className="w-full max-w-20rem border-round border-1 border-gray-300 object-contain" />
                    <div className="flex gap-2">
                        <Button label="Retake" icon="pi pi-refresh" severity="warning" size="small" disabled={disabled} onClick={clearPhoto} />
                    </div>
                </div>
            ) : cameraActive ? (
                <div className="flex flex-column align-items-center gap-3">
                    <video ref={videoRef} className="w-full max-w-20rem border-round border-1 border-gray-300" playsInline muted autoPlay />
                    <div className="flex gap-2">
                        <Button label="Capture" icon="pi pi-camera" severity="success" size="small" onClick={capturePhoto} />
                        <Button label="Cancel" icon="pi pi-times" severity="secondary" size="small" outlined onClick={stopCamera} />
                    </div>
                </div>
            ) : (
                <Button
                    className="align-self-center"
                    label={`Open camera — ${label}`}
                    icon="pi pi-camera"
                    severity="info"
                    disabled={disabled}
                    onClick={startCamera}
                />
            )}
        </div>
    );
}
