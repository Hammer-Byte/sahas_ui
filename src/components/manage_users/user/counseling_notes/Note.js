import { Button } from "primereact/button";
import { getReadableDate } from "../../../../utils";
import Detail from "../../../common/Detail";
import { useCallback, useState } from "react";
import { useAppContext } from "../../../../providers/ProviderAppContainer";
import ProgressiveControl from "../../../common/ProgressiveControl";
import ConfirmationWrapper from "../../../common/ConfirmationWrapper";
import HasRequiredAuthority from "../../../dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../../../../constants";
import { Badge } from "primereact/badge";

export default function Note({ id, created_by_full_name, created_at, note, type, media, setNotes, setDialogEditCounselingNote }) {
    const { requestAPI, showToast } = useAppContext();

    const [loading, setLoading] = useState();

    const getNoteSeverityByType = useCallback((type) => {
        if (type === "NEGATIVE") {
            return "danger";
        }
        if (type === "POSITIVE") {
            return "success";
        }
    }, []);

    const deleteCounselingNote = useCallback(() => {
        requestAPI({
            requestPath: `counseling-notes/${id}`,
            requestMethod: "DELETE",
            setLoading: setLoading,
            parseResponseBody: false,
            onResponseReceieved: (_, responseCode) => {
                if (responseCode === 204) {
                    showToast({ severity: "success", summary: "Deleted", detail: "Counseling Note Deleted", life: 1000 });
                    setNotes((prev) => prev.filter((item) => item?.id !== id));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Delete Counseling Note !", life: 2000 });
                }
            },
        });
    }, [id, requestAPI, setNotes, showToast]);

    return (
        <div className="flex align-items-start gap-2 mb-2">
            <div className="flex flex-column flex-1 gap-2 mb-2">
                <Detail
                    icon="pi pi-angle-right"
                    title={`${created_by_full_name} at ${getReadableDate({ date: created_at })}`}
                    value={note}
                />
                {!!media && (
                    <a href={media} target="_blank" rel="noopener noreferrer">
                        <img src={media} alt="Counseling media" className="max-w-8rem border-round border-1 border-gray-300" />
                    </a>
                )}
            </div>

            <div className="flex align-items-center gap-2">
                {type && <Badge severity={getNoteSeverityByType(type)} value={type} />}

                <HasRequiredAuthority requiredAuthority={AUTHORITIES.UPDATE_COUNSELING_NOTE}>
                    <Button
                        className="w-2rem h-2rem"
                        icon="pi pi-pencil"
                        rounded
                        severity="warning"
                        onClick={() =>
                            setDialogEditCounselingNote((prev) => ({
                                ...prev,
                                visible: true,
                                id,
                                note,
                                type,
                                media,
                            }))
                        }
                    />
                </HasRequiredAuthority>

                <HasRequiredAuthority requiredAuthority={AUTHORITIES.DELETE_COUNSELING_NOTE}>
                    <ProgressiveControl
                        loading={loading}
                        control={
                            <ConfirmationWrapper action={deleteCounselingNote}>
                                <Button className="w-2rem h-2rem" icon="pi pi-trash" rounded severity="danger" />
                            </ConfirmationWrapper>
                        }
                    />
                </HasRequiredAuthority>
            </div>
        </div>
    );
}
