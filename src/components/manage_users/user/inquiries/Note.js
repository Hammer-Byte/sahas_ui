import { Button } from "primereact/button";
import { getReadableDate } from "../../../../utils";
import Detail from "../../../common/Detail";
import { useCallback, useState } from "react";
import { useAppContext } from "../../../../providers/ProviderAppContainer";
import ProgressiveControl from "../../../common/ProgressiveControl";
import ConfirmationWrapper from "../../../common/ConfirmationWrapper";
import HasRequiredAuthority from "../../../dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../../../../constants";

export default function Note({ id, created_by_full_name, created_on, note, setNotes }) {
    const { requestAPI, showToast } = useAppContext();

    const [loading, setLoading] = useState();

    const deleteInquiryNote = useCallback(() => {
        requestAPI({
            requestPath: `inquiry-notes/${id}`,
            requestMethod: "DELETE",
            setLoading: setLoading,
            parseResponseBody: false,
            onResponseReceieved: (_, responseCode) => {
                if (responseCode === 204) {
                    showToast({ severity: "success", summary: "Deleted", detail: "Inquiry Note Deleted", life: 1000 });
                    setNotes((prev) => prev.filter((note) => note?.id !== id));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Deleted Inquiry Note !", life: 2000 });
                }
            },
        });
    }, [id, requestAPI, setNotes, showToast]);

    return (
        <div className="flex align-items-start gap-2 mb-2">
            <Detail
                icon="pi pi-angle-right"
                className="flex-1 mb-2"
                title={`${created_by_full_name} at ${getReadableDate({ date: created_on })}`}
                value={note}
            />
            <HasRequiredAuthority requiredAuthority={AUTHORITIES.DELETE_INQUIRY_NOTE}>
                <ProgressiveControl
                    loading={loading}
                    control={
                        <ConfirmationWrapper action={deleteInquiryNote}>
                            <Button className="w-2rem h-2rem" icon="pi pi-trash" rounded severity="danger" />
                        </ConfirmationWrapper>
                    }
                />
            </HasRequiredAuthority>
        </div>
    );
}
