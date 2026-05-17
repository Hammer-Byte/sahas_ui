import { Button } from "primereact/button";
import { getReadableDate } from "../../../../utils";
import Detail from "../../../common/Detail";
import { useCallback, useState } from "react";
import { useAppContext } from "../../../../providers/ProviderAppContainer";
import ProgressiveControl from "../../../common/ProgressiveControl";
import HasRequiredAuthority from "../../../dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../../../../constants";
import { Badge } from "primereact/badge";

export default function Note({ id, created_by_full_name, created_at, note, type, setNotes }) {
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


    const deleteGlobalNote = useCallback(() => {
        requestAPI({
            requestPath: `global-notes/${id}`,
            requestMethod: "DELETE",
            setLoading: setLoading,
            parseResponseBody: false,
            onResponseReceieved: (_, responseCode) => {
                if (responseCode === 204) {
                    showToast({ severity: "success", summary: "Deleted", detail: "Global Note Deleted", life: 1000 });
                    setNotes((prev) => prev.filter((note) => note?.id !== id));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Deleted Global Note !", life: 2000 });
                }
            },
        });
    }, [id, requestAPI, setNotes, showToast]);

    return (
        <div className="flex align-items-start gap-2 mb-2">

            <Detail
                icon="pi pi-angle-right"
                className="flex-1 mb-2"
                title={`${created_by_full_name} at ${getReadableDate({ date: created_at })}`}
                value={note}
            />


            <div className="flex align-items-center gap-2">
                {type && <Badge severity={getNoteSeverityByType(type)} value={type} />}

                <HasRequiredAuthority requiredAuthority={AUTHORITIES.DELETE_GLOBAL_NOTE}>
                    <ProgressiveControl
                        loading={loading}
                        control={<Button className="w-2rem h-2rem" icon="pi pi-trash" rounded severity="danger" onClick={deleteGlobalNote} />}
                    />
                </HasRequiredAuthority>
            </div>

        </div>
    );
}
