import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { FloatLabel } from "primereact/floatlabel";
import { InputTextarea } from "primereact/inputtextarea";
import { useCallback, useState } from "react";
import { useAppContext } from "../../../../providers/ProviderAppContainer";
import { TEXT_NORMAL, TEXT_SMALL, TEXT_TITLE } from "../../../../style";
import HasRequiredAuthority from "../../../dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../../../../constants";
import { Dropdown } from "primereact/dropdown";
import { useSelector } from "react-redux";

export default function DialogEditGlobalNote({ visible, closeDialog, setGlobalNotes, ...props }) {
    const [note, setNote] = useState(props);
    const [loading, setLoading] = useState();
    const { requestAPI, showToast } = useAppContext();

    const { note_types = [] } = useSelector((state) => state.stateTemplateConfig?.user);

    const editNote = useCallback(() => {
        requestAPI({
            requestPath: `global-notes`,
            requestMethod: "PATCH",
            requestPostBody: { id: note.id, note: note.note, type: note.type },
            setLoading: setLoading,
            onRequestFailure: () => showToast({ severity: "error", summary: "Failed", detail: "Failed To Update Note !", life: 2000 }),
            onResponseReceieved: (updatedNote, responseCode) => {
                if (updatedNote && responseCode === 200) {
                    showToast({ severity: "success", summary: "Updated", detail: "Note Updated", life: 1000 });
                    setGlobalNotes((prev) => prev?.map((item) => (item?.id === props?.id ? updatedNote : item)));
                    setNote();
                    closeDialog();
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: updatedNote?.error || "Failed To Update Note !", life: 2000 });
                }
            },
        });
    }, [closeDialog, note, props?.id, requestAPI, setGlobalNotes, showToast]);

    return (
        <Dialog
            header="Edit Note"
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
                    id="edit-note"
                    rows={5}
                    cols={30}
                    className="w-full"
                    onChange={(e) => setNote((prev) => ({ ...prev, note: e.target.value }))}
                    disabled={loading}
                    pt={{
                        root: { className: TEXT_NORMAL },
                    }}
                />
                <label htmlFor="edit-note">Note</label>
            </FloatLabel>

            <FloatLabel className="mt-4">
                <Dropdown
                    value={note?.type}
                    inputId="edit-type"
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
                <label htmlFor="edit-type" className={`${TEXT_SMALL}`}>
                    Select Type
                </label>
            </FloatLabel>

            <HasRequiredAuthority requiredAuthority={AUTHORITIES.UPDATE_GLOBAL_NOTE}>
                <Button
                    className="mt-3"
                    label="Update Note"
                    severity="warning"
                    loading={loading}
                    onClick={editNote}
                    pt={{
                        label: { className: TEXT_NORMAL },
                        icon: { className: TEXT_NORMAL },
                    }}
                />
            </HasRequiredAuthority>
        </Dialog>
    );
}
