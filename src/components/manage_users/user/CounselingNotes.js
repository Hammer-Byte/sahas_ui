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
import DialogAddCounselingNote from "./counseling_notes/DialogAddCounselingNote";
import DialogEditCounselingNote from "./counseling_notes/DialogEditCounselingNote";
import Note from "./counseling_notes/Note";

export default function CounselingNotes() {
    const { userId } = useOutletContext();

    const { requestAPI } = useAppContext();

    const [counselingNotes, setCounselingNotes] = useState();
    const [dialogAddCounselingNote, setDialogAddCounselingNote] = useState();
    const [dialogEditCounselingNote, setDialogEditCounselingNote] = useState({
        visible: false,
    });

    const [error, setError] = useState();
    const [loading, setLoading] = useState();

    useEffect(() => {
        requestAPI({
            requestPath: `users/${userId}/counseling-notes`,
            requestMethod: "GET",
            setLoading: setLoading,
            onRequestFailure: setError,
            onResponseReceieved: (counselingNotes, responseCode) => {
                if (counselingNotes && responseCode === 200) {
                    setCounselingNotes(counselingNotes);
                } else {
                    setError("Couldn't load Counseling Notes");
                }
            },
        });
    }, [requestAPI, userId]);

    const closeDialogAddCounselingNote = useCallback(() => {
        setDialogAddCounselingNote((prev) => ({ ...prev, visible: false }));
    }, []);

    const closeDialogEditCounselingNote = useCallback(() => {
        setDialogEditCounselingNote((prev) => ({ ...prev, visible: false }));
    }, []);

    return (
        <div className="flex flex-column h-full min-h-0">
            <TabHeader
                className={"px-3 pt-3"}
                title="User's Counseling Notes"
                highlights={[`Total - ${counselingNotes?.length} Notes`]}
                actionItems={[
                    <HasRequiredAuthority requiredAuthority={AUTHORITIES.MANAGE_OTHER_USERS}>
                        <Button
                            icon="pi pi-plus"
                            severity="warning"
                            onClick={() =>
                                setDialogAddCounselingNote((prev) => ({
                                    ...prev,
                                    visible: true,
                                    closeDialog: closeDialogAddCounselingNote,
                                }))
                            }
                        />
                    </HasRequiredAuthority>,
                ]}
            />
            <Divider />
            <div className="flex-1 min-h-0 px-3 pb-2 overflow-y-scroll gap-2 flex flex-column">
                {loading ? (
                    <Loading message="Loading Counseling Notes" />
                ) : error ? (
                    <NoContent error={error} />
                ) : counselingNotes?.length ? (
                    counselingNotes.map((note) => (
                        <Note key={note?.id} {...note} setNotes={setCounselingNotes} setDialogEditCounselingNote={setDialogEditCounselingNote} />
                    ))
                ) : (
                    <NoContent error={"No Counseling Notes Found"} />
                )}
            </div>

            {dialogAddCounselingNote?.visible && <DialogAddCounselingNote {...dialogAddCounselingNote} setCounselingNotes={setCounselingNotes} />}
            {dialogEditCounselingNote?.visible && (
                <DialogEditCounselingNote closeDialog={closeDialogEditCounselingNote} setCounselingNotes={setCounselingNotes} {...dialogEditCounselingNote} />
            )}
        </div>
    );
}
