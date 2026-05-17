import { useOutletContext } from "react-router-dom";
import { useAppContext } from "../../../providers/ProviderAppContainer";
import { useCallback, useEffect, useState } from "react";
import TabHeader from "../../common/TabHeader";
import HasRequiredAuthority from "../../dependencies/HasRequiredAuthority";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import { AUTHORITIES } from "../../../constants";
import NoContent from "../../common/NoContent";
import Loading from "../../common/Loading";
import DialogAddGlobalNote from "./global_notes/DialogAddGlobalNote";
import Note from "./global_notes/Note";

export default function GlobalNotes() {
    const { userId } = useOutletContext();

    const { requestAPI } = useAppContext();





    const [globalNotes, setGlobalNotes] = useState();
    const [dialogAddGlobalNote, setDialogAddGlobalNote] = useState();

    const [error, setError] = useState();
    const [loading, setLoading] = useState();

    useEffect(() => {
        requestAPI({
            requestPath: `users/${userId}/global-notes`,
            requestMethod: "GET",
            setLoading: setLoading,
            onRequestFailure: setError,
            onResponseReceieved: (globalNotes, responseCode) => {
                if (globalNotes && responseCode === 200) {
                    setGlobalNotes(globalNotes);
                } else {
                    setError("Couldn't load Global Notes");
                }
            },
        });
    }, [requestAPI, userId]);

    const closeDialogAddGlobalNote = useCallback(() => {
        setDialogAddGlobalNote((prev) => ({ ...prev, visible: false }));
    }, []);

    return (
        <div className="flex flex-column h-full min-h-0">
            <TabHeader
                className={"px-3 pt-3"}
                title={`User's Global Notes`}
                highlights={[`Total - ${globalNotes?.length} Notes`]}
                actionItems={[
                    <HasRequiredAuthority requiredAuthority={AUTHORITIES.CREATE_GLOBAL_NOTE}>
                        <Button
                            icon="pi pi-plus"
                            severity="warning"
                            onClick={() =>
                                setDialogAddGlobalNote((prev) => ({
                                    ...prev,
                                    visible: true,
                                    closeDialog: closeDialogAddGlobalNote,
                                }))
                            }
                        />
                    </HasRequiredAuthority>,
                ]}
            />
            <Divider />
            <div className="flex-1 min-h-0 px-3 pb-2 overflow-y-scroll gap-2 flex flex-column">
                {loading ? (
                    <Loading message="Loading Global Notes" />
                ) : error ? (
                    <NoContent error={error} />
                ) : globalNotes?.length ? (
                    globalNotes.map((note) => <Note key={note?.id} {...note} setNotes={setGlobalNotes} />)
                ) : (
                    <NoContent error={"No Global Notes Found"} />
                )}
            </div>

            {dialogAddGlobalNote?.visible && <DialogAddGlobalNote {...dialogAddGlobalNote} setGlobalNotes={setGlobalNotes} />}
        </div>
    );
}
