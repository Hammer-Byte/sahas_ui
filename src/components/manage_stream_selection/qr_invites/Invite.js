import QRCode from "react-qr-code";
import { getReadableDate } from "../../../utils";
import ProgressiveControl from "../../common/ProgressiveControl";
import ConfirmationWrapper from "../../common/ConfirmationWrapper";
import { useCallback, useRef, useState } from "react";
import { Button } from "primereact/button";
import HasRequiredAuthority from "../../dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../../../constants";
import IconButton from "../../common/IconButton";
import { ICON_SIZE, TEXT_BADGE, TEXT_LARGE, TEXT_SMALL } from "../../../style";
import { useAppContext } from "../../../providers/ProviderAppContainer";

export default function Invite({ id, title, active, updated_at, setDialogEditInvite, setStreamSelectionTestInvites }) {
    const { requestAPI, showToast } = useAppContext();

    const [loading, setLoading] = useState();
    const qrWrapRef = useRef(null);

    const downloadQrPng = useCallback(() => {
        const svg = qrWrapRef.current?.querySelector("svg");
        if (!svg) {
            showToast({ severity: "warn", summary: "QR", detail: "Could not export QR code.", life: 2000 });
            return;
        }
        let svgString = new XMLSerializer().serializeToString(svg);
        if (!/^<svg[^>]+xmlns=/.test(svgString)) {
            svgString = svgString.replace(/^<svg\b/, '<svg xmlns="http://www.w3.org/2000/svg" ');
        }
        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        const exportSize = 512;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = exportSize;
            canvas.height = exportSize;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, exportSize, exportSize);
            ctx.drawImage(img, 0, 0, exportSize, exportSize);
            URL.revokeObjectURL(url);
            const a = document.createElement("a");
            a.href = canvas.toDataURL("image/png");
            a.download = `psychometric-invite-${id}-qr.png`;
            a.click();
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            showToast({ severity: "error", summary: "Failed", detail: "Could not generate QR image.", life: 2000 });
        };
        img.src = url;
    }, [id, showToast]);

    const deleteInvite = useCallback(() => {
        requestAPI({
            requestPath: `stream-selection-test-invites/${id}`,
            requestMethod: "DELETE",
            setLoading,
            parseResponseBody: false,
            onResponseReceieved: (_, responseCode) => {
                if (responseCode === 204) {
                    showToast({ severity: "success", summary: "Deleted", detail: "Psychometric Test invite Deleted", life: 1000 });
                    setStreamSelectionTestInvites((prev) => prev?.filter((invite) => invite?.id !== id));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Delete Psychometric Test Invite !", life: 2000 });
                }
            },
        });
    }, [id, requestAPI, setStreamSelectionTestInvites, showToast]);

    return (
        <div className="flex gap-2">
            <div className="flex-1 flex flex-column gap-2 align-items-start">
                <div className="flex gap-3 align-items-center">
                    <span className={`font-semibold ${TEXT_LARGE}`}>
                        {id}. Venue - {title}
                    </span>
                </div>
                <div className={`flex align-items-center gap-1 ${TEXT_SMALL}`}>
                    <span className="pi pi-calendar" />
                    <span>{getReadableDate({ date: updated_at })}</span>
                </div>
                <div className="flex gap-2 align-items-center">
                    <span className={`${TEXT_BADGE} font-semibold ${!!active ? "text-green-800" : "text-red-500"}`}>{!!active ? "Active" : "Inactive"}</span>
                    <HasRequiredAuthority requiredAuthority={AUTHORITIES.UPDATE_STREAM_SELECTION_TEST_INVITE}>
                        <IconButton
                            icon={`pi-pencil`}
                            color={"text-orange-500"}
                            onClick={() =>
                                setDialogEditInvite((prev) => ({
                                    ...prev,
                                    visible: true,
                                    setStreamSelectionTestInvites,
                                    id,
                                    title,
                                    active,
                                }))
                            }
                        />
                    </HasRequiredAuthority>
                    <HasRequiredAuthority requiredAuthority={AUTHORITIES.DELETE_STREAM_SELECTION_TEST_INVITE}>
                        <ProgressiveControl
                            loading={loading}
                            control={
                                <ConfirmationWrapper action={deleteInvite}>
                                    <IconButton icon={"pi-trash"} color={"text-red-500"} className={ICON_SIZE} />
                                </ConfirmationWrapper>
                            }
                        />
                    </HasRequiredAuthority>
                </div>
            </div>
            <div className="flex flex-column align-items-center gap-1">
                <div ref={qrWrapRef}>
                    <QRCode size={88} value={JSON.stringify({ id })} />
                </div>
                <Button type="button" label="Download" icon="pi pi-download" size="small" text severity="secondary" onClick={downloadQrPng} />
            </div>
        </div>
    );
}
