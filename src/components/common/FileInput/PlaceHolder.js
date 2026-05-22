import { useCallback, useRef, useState } from "react";
import Loading from "../Loading";
import { getFileAcceptType, uploadMedia } from "../../../utils";

import { useAppContext } from "../../../providers/ProviderAppContainer";
import { ICON_SIZE, TEXT_NORMAL } from "../../../style";

export default function PlaceHolder({ label, type, setCDNUrl, setPreview, disabled, capture }) {
    const fileInputRef = useRef(null);

    const { showToast } = useAppContext();

    const [uploadProgress, setUploadProgress] = useState();

    const onFileSelected = useCallback(
        (event) => {
            const file = event.target?.files[0];
            if (file) {
                uploadMedia({
                    requestPath: `bucketise/${type}s`,
                    file,
                    onRequestEnd: false,
                    onRequestFailure: (error) => {
                        showToast({ severity: "error", summary: "Failed", detail: error, life: 2000 });
                        setUploadProgress(false);
                    },
                    onRequestStart: setUploadProgress,
                    parseResponseBody: true,
                    onProgress: setUploadProgress,
                    onResponseReceieved: ({ cdn_url }, responseCode) => {
                        if (cdn_url && responseCode === 201) {
                            showToast({ severity: "success", summary: "Uploaded", detail: "File Uploaded", life: 1000 });
                            setCDNUrl(cdn_url);
                            setPreview(URL.createObjectURL(file));
                        } else showToast({ severity: "error", summary: "Failed", detail: "Failed To Upload File !", life: 2000 });
                    },
                });
            }
        },
        [setCDNUrl, setPreview, showToast, type]
    );

    return uploadProgress ? (
        <Loading message={`Uploading ${uploadProgress}%`} />
    ) : (
        <div
            className="flex flex-column align-items-center justify-content-center gap-3"
            onClick={() => {
                if (!disabled) {
                    fileInputRef.current.click();
                }
            }}
        >
            <i className={`pi pi-cloud-upload border-circle bg-gray-200 text-gray-500 p-4 ${ICON_SIZE}`}></i>
            <span className={`${TEXT_NORMAL} text-gray-500`}>Select {label}</span>
            {!disabled && (
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileSelected}
                    accept={getFileAcceptType(type)}
                    capture={capture}
                    style={{ display: "none" }}
                />
            )}
        </div>
    );
}
