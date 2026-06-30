import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { FloatLabel } from "primereact/floatlabel";
import { InputTextarea } from "primereact/inputtextarea";
import { useCallback, useState } from "react";
import { useAppContext } from "../../../../providers/ProviderAppContainer";
import { useOutletContext } from "react-router-dom";
import { TEXT_NORMAL, TEXT_SMALL, TEXT_TITLE } from "../../../../style";
import HasRequiredAuthority from "../../../dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../../../../constants";
import { Dropdown } from "primereact/dropdown";
import { useSelector } from "react-redux";
import FileInput from "../../../common/FileInput";

export default function DialogAddCounselingNote({ visible, closeDialog, setCounselingNotes }) {
    const { userId } = useOutletContext();

    const [note, setNote] = useState();
    const [loading, setLoading] = useState();
    const { requestAPI, showToast } = useAppContext();

    const { note_types = [] } = useSelector((state) => state.stateTemplateConfig?.user);

    const addNote = useCallback(() => {
        requestAPI({
            requestPath: `counseling-notes/`,
            requestMethod: "POST",
            requestPostBody: { ...note, user_id: userId },
            setLoading: setLoading,
            onResponseReceieved: (counselingNote, responseCode) => {
                if (responseCode === 201) {
                    showToast({ severity: "success", summary: "Added", detail: "Counseling Note Added", life: 1000 });
                    setCounselingNotes((prev) => [counselingNote, ...prev]);
                    setNote();
                    closeDialog();
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: counselingNote?.error || "Failed To Add Counseling Note !", life: 2000 });
                }
            },
        });
    }, [closeDialog, note, requestAPI, setCounselingNotes, showToast, userId]);

    return (
        <Dialog
            header="Add Counseling Note"
            visible={visible}
            className="w-11"
            onHide={closeDialog}
            pt={{
                headertitle: { className: TEXT_TITLE },
                content: { className: "overflow-visible" },
            }}
        >
            <FloatLabel className="mt-5">
                <InputTextarea
                    value={note?.note || ""}
                    id="counseling-note"
                    rows={5}
                    cols={30}
                    className="w-full"
                    onChange={(e) => setNote((prev) => ({ ...prev, note: e.target.value }))}
                    disabled={loading}
                    pt={{
                        root: { className: TEXT_NORMAL },
                    }}
                />
                <label htmlFor="counseling-note">Note</label>
            </FloatLabel>

            <FloatLabel className="mt-4">
                <Dropdown
                    value={note?.type}
                    inputId="counseling-type"
                    options={note_types}
                    optionLabel="Type"
                    className="w-full"
                    onChange={(e) => setNote((prev) => ({ ...prev, type: e.value }))}
                    disabled={loading}
                    pt={{
                        label: { className: TEXT_SMALL },
                        item: { className: TEXT_SMALL },
                    }}
                />
                <label htmlFor="counseling-type" className={`${TEXT_SMALL}`}>
                    Select Type
                </label>
            </FloatLabel>

            <FileInput
                className="mt-3"
                label="Attachment"
                type="image"
                cdn_url={note?.attachment}
                setCDNUrl={(attachment) => setNote((prev) => ({ ...prev, attachment }))}
                disabled={loading}
            />

            <HasRequiredAuthority requiredAuthority={AUTHORITIES.CREATE_COUNSELING_NOTE}>
                <Button
                    className="mt-3"
                    label="Add Counseling Note"
                    severity="warning"
                    loading={loading}
                    onClick={addNote}
                    pt={{
                        label: { className: TEXT_NORMAL },
                        icon: { className: TEXT_NORMAL },
                    }}
                />
            </HasRequiredAuthority>
        </Dialog>
    );
}
