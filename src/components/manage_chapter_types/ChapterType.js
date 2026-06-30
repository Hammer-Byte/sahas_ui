import { useAppContext } from "../../providers/ProviderAppContainer";
import { useCallback, useState } from "react";
import ProgressiveControl from "../common/ProgressiveControl";
import ConfirmationWrapper from "../common/ConfirmationWrapper";
import { getReadableDate } from "../../utils";
import DialogEditChapterType from "./DialogEditChapterType";
import IconButton from "../common/IconButton";
import HasRequiredAuthority from "../dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../../constants";
import { TEXT_NORMAL, TEXT_SMALL } from "../../style";

export default function ChapterType({ id, title, setChapterTypes, requires_enrollment_digital_access, updatingViewIndex, updated_at, active }) {
    const { requestAPI, showToast } = useAppContext();

    const [deleting, setDeleting] = useState();

    const [dialogEditChapterType, setDialogEditChapterType] = useState({
        visible: false,
    });

    const closeDialogEditChapterType = useCallback(() => {
        setDialogEditChapterType((prev) => ({ ...prev, visible: false }));
    }, []);

    const deleteChapterType = useCallback(() => {
        requestAPI({
            requestPath: `chapter-types/${id}`,
            requestMethod: "DELETE",
            setLoading: setDeleting,
            parseResponseBody: false,
            onResponseReceieved: (_, responseCode) => {
                if (responseCode === 204) {
                    showToast({
                        severity: "success",
                        summary: "Deleted",
                        detail: `Chapter Type Deleted`,
                        life: 1000,
                    });
                    setChapterTypes((prev) => prev?.filter((chapterType) => chapterType?.id !== id));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Delete Chapter Type !", life: 2000 });
                }
            },
        });
    }, [id, requestAPI, setChapterTypes, showToast]);

    return (
        <div
            className={`flex gap-3 align-items-center border-1 border-gray-300 border-round py-2 px-3 overflow-hidden ${
                active ? "bg-green-500" : "bg-red-500"
            }`}
        >
            <div className="flex flex-column flex-1 gap-2">
                <span className={`${TEXT_NORMAL} font-semibold text-white`}>{title}</span>
                <div className={`flex align-items-center gap-1 text-white`}>
                    <i className={`pi pi-book ${TEXT_NORMAL}`}></i>
                    <span className={`m-0 p-0 ${TEXT_SMALL}`}>{`Last Updated At ${getReadableDate({ date: updated_at })}`}</span>
                </div>
            </div>
            {!!updatingViewIndex && <IconButton icon={"pi-equals"} color={"text-white"} />}
            {!updatingViewIndex && (
                <HasRequiredAuthority requiredAuthority={AUTHORITIES.UPDATE_CHAPTER_TYPES}>
                    <IconButton
                        icon={`pi-pencil `}
                        color={"text-white"}
                        onClick={() =>
                            setDialogEditChapterType((prev) => ({
                                ...prev,
                                visible: true,
                                setChapterTypes,
                                id,
                                title,
                                requires_enrollment_digital_access,
                                active,
                                closeDialog: closeDialogEditChapterType,
                            }))
                        }
                    />
                </HasRequiredAuthority>
            )}

            {!updatingViewIndex && (
                <HasRequiredAuthority requiredAuthority={AUTHORITIES.DELETE_CHAPTER_TYPES}>
                    <ProgressiveControl
                        loading={deleting}
                        control={
                            <ConfirmationWrapper action={deleteChapterType}>
                                <IconButton icon={`pi-trash`} color={"text-white"} />
                            </ConfirmationWrapper>
                        }
                    />
                </HasRequiredAuthority>
            )}
            {dialogEditChapterType?.visible && <DialogEditChapterType {...dialogEditChapterType} />}
        </div>
    );
}
