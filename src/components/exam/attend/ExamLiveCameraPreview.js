import { useEffect, useRef } from "react";
import { TEXT_SMALL } from "../../../style";

export default function ExamLiveCameraPreview() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        let cancelled = false;

        const startPreview = async () => {
            if (!navigator.mediaDevices?.getUserMedia) {
                return;
            }

            try {
                let stream;
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
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
                // Optional supervised preview during exam.
            }
        };

        startPreview();

        return () => {
            cancelled = true;
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };
    }, []);

    return (
        <div className="flex align-items-center justify-content-center gap-2 px-2 py-2 border-bottom-1 border-gray-200 bg-gray-50">
            <div
                className="flex-shrink-0 border-round border-1 border-gray-300 overflow-hidden bg-gray-900"
                style={{ width: "2rem", height: "2rem", minWidth: "2rem", minHeight: "2rem" }}
            >
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay style={{ width: "2rem", height: "2rem" }} />
            </div>
            <span className={`${TEXT_SMALL} text-color-secondary`}>Assessment is getting supervised</span>
        </div>
    );
}
