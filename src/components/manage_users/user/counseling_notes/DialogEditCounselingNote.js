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
import FileInput from "../../../common/FileInput";

export default function DialogEditCounselingNote({ visible, closeDialog, setCounselingNotes, ...props }) {
    const [note, setNote] = useState(props);
    const [loading, setLoading] = useState();
    const { requestAPI, showToast } = useAppContext();

    const { note_types = [] } = useSelector((state) => state.stateTemplateConfig?.user);

    const editNote = useCallback(() => {
        requestAPI({
            requestPath: `counseling-notes`,
            requestMethod: "PATCH",
            requestPostBody: { id: note.id, note: note.note, type: note.type, attachment: note.attachment },
            setLoading: setLoading,
            onRequestFailure: () => showToast({ severity: "error", summary: "Failed", detail: "Failed To Update Counseling Note !", life: 2000 }),
            onResponseReceieved: (updatedNote, responseCode) => {
                if (updatedNote && responseCode === 200) {
                    showToast({ severity: "success", summary: "Updated", detail: "Counseling Note Updated", life: 1000 });
                    setCounselingNotes((prev) => prev?.map((item) => (item?.id === props?.id ? updatedNote : item)));
                    setNote();
                    closeDialog();
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: updatedNote?.error || "Failed To Update Counseling Note !", life: 2000 });
                }
            },
        });
    }, [closeDialog, note, props?.id, requestAPI, setCounselingNotes, showToast]);

    return (
        <Dialog
            header="Edit Counseling Note"
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
                    id="edit-counseling-note"
                    rows={5}
                    cols={30}
                    className="w-full"
                    onChange={(e) => setNote((prev) => ({ ...prev, note: e.target.value }))}
                    disabled={loading}
                    pt={{
                        root: { className: TEXT_NORMAL },
                    }}
                />
                <label htmlFor="edit-counseling-note">Note</label>
            </FloatLabel>

            <FloatLabel className="mt-4">
                <Dropdown
                    value={note?.type}
                    inputId="edit-counseling-type"
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
                <label htmlFor="edit-counseling-type" className={`${TEXT_SMALL}`}>
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

            <HasRequiredAuthority requiredAuthority={AUTHORITIES.UPDATE_COUNSELING_NOTE}>
                <Button
                    className="mt-3"
                    label="Update Counseling Note"
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
