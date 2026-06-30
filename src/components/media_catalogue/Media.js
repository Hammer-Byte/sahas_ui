import { useCallback, useMemo, useState } from "react";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { getReadableDate } from "../../utils";
import ProgressiveControl from "../common/ProgressiveControl";
import ConfirmationWrapper from "../common/ConfirmationWrapper";
import DialogEditMedia from "./DialogEditMedia";
import { useNavigate } from "react-router-dom";
import IconButton from "../common/IconButton";
import HasRequiredAuthority from "../dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../../constants";
import { TEXT_NORMAL, TEXT_SMALL } from "../../style";

export default function Media({ id, title, setMediaCatalogue, type, external_url, cdn_url, downloadable, updatingViewIndex, updated_at }) {
    const { requestAPI, showToast } = useAppContext();

    const navigate = useNavigate();

    const [loading, setLoading] = useState();

    const [dialogEditMedia, setDialogEditMedia] = useState({
        visible: false,
    });

    const closeDialogEditMedia = useCallback(() => {
        setDialogEditMedia((prev) => ({ ...prev, visible: false }));
    }, []);

    const deleteMedia = useCallback(() => {
        requestAPI({
            requestPath: `media/${id}`,
            requestMethod: "DELETE",
            setLoading: setLoading,
            parseResponseBody: false,
            onResponseReceieved: (_, responseCode) => {
                if (responseCode === 204) {
                    showToast({
                        severity: "success",
                        summary: "Deleted",
                        detail: `Media Deleted`,
                        life: 1000,
                    });
                    setMediaCatalogue((prev) => prev?.filter((media) => media?.id !== id));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Delete Media !", life: 2000 });
                }
            },
        });
    }, [id, requestAPI, setMediaCatalogue, showToast]);

    const mediaTypeIcon = useMemo(() => {
        if (type.toLowerCase() === "video") {
            return "pi pi-video";
        }

        if (type.toLowerCase() === "pdf") {
            return "pi pi-file-pdf";
        }

        if (type.toLowerCase() === "zoom") {
            return "pi pi-cloud";
        }
    }, [type]);

    return (
        <div className={`flex gap-3 align-items-center border-1 border-gray-300 border-round py-2 px-3 overflow-hidden `}>
            <div onClick={() => navigate(`/media-player/${id}`)} className="flex flex-column flex-1 gap-2">
                <span className={`${TEXT_NORMAL} font-semibold`}>{title}</span>
                <div className={`flex align-items-center gap-1 `}>
                    <i className={`${mediaTypeIcon} ${TEXT_NORMAL}`}></i>
                    <span className={`m-0 p-0 ${TEXT_SMALL}`}>{`Last Updated At ${getReadableDate({ date: updated_at })}`}</span>
                </div>
            </div>
            {!updatingViewIndex && !!external_url && (
                <a href={external_url} target="_blank" rel="noopener noreferrer">
                    <i className={`pi pi-link `}></i>
                </a>
            )}
            {!!updatingViewIndex && <IconButton icon={"pi-equals"} color={"text-indigo-800"} />}

            <HasRequiredAuthority requiredAuthority={AUTHORITIES.UPDATE_MEDIA}>
                {!updatingViewIndex && (
                    <ProgressiveControl
                        loading={loading}
                        control={
                            <IconButton
                                loading={loading}
                                icon={` pi-pencil `}
                                color={"text-orange-500"}
                                onClick={() =>
                                    setDialogEditMedia((prev) => ({
                                        ...prev,
                                        visible: true,
                                        setMediaCatalogue,
                                        id,
                                        title,
                                        type,
                                        external_url,
                                        cdn_url,
                                        downloadable,
                                        closeDialog: closeDialogEditMedia,
                                    }))
                                }
                            />
                        }
                    />
                )}
            </HasRequiredAuthority>

            <HasRequiredAuthority requiredAuthority={AUTHORITIES.DELETE_MEDIA}>
                {!updatingViewIndex && (
                    <ProgressiveControl
                        loading={loading}
                        control={
                            <ConfirmationWrapper action={deleteMedia}>
                                <IconButton icon={`pi-trash`} color={"text-red-500"} />
                            </ConfirmationWrapper>
                        }
                    />
                )}
            </HasRequiredAuthority>

            <HasRequiredAuthority requiredAuthority={AUTHORITIES.UPDATE_MEDIA}>
                {dialogEditMedia?.visible && <DialogEditMedia {...dialogEditMedia} />}
            </HasRequiredAuthority>
        </div>
    );
}
