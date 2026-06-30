import { useCallback, useState } from "react";
import { useAppContext } from "../../../providers/ProviderAppContainer";
import { ICON_SIZE, TEXT_NORMAL } from "../../../style";
import ProgressiveControl from "../../common/ProgressiveControl";
import ConfirmationWrapper from "../../common/ConfirmationWrapper";
import IconButton from "../../common/IconButton";
import { useDispatch } from "react-redux";
import { deleteStreamSelectionSuggestion } from "../../../redux/sliceTemplateConfig";


export default function Suggestion({ id, title, pdf, updatingViewIndex, setDialogEditSuggestion }) {
    const { requestAPI, showToast } = useAppContext();
    const [loading, setLoading] = useState();
    const dispatch = useDispatch();

    const deleteSuggestion = useCallback(() => {
        requestAPI({
            requestPath: `stream-selection-suggestions/${id}`,
            requestMethod: "DELETE",
            parseResponseBody: false,
            setLoading,
            onResponseReceieved: (_, responseCode) => {
                if (responseCode === 204) {
                    showToast({ severity: "success", summary: "Deleted", detail: "Suggestion Deleted", life: 1000 });
                    dispatch(deleteStreamSelectionSuggestion(id));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Delete Suggestion !", life: 2000 });
                }
            },
        });
    }, [id, requestAPI,dispatch, showToast]);

    return (
        <div className="flex align-items-center border-1 border-round px-2 py-3 gap-2 border-gray-300">
            <div className="flex-1 flex gap-2">
                <span className={`font-semibold ${TEXT_NORMAL}`}>{id}. {title}</span>
                {!updatingViewIndex && !!pdf && (
                    <IconButton
                        icon={"pi-file-pdf"}
                        color={"text-red-600"}
                        className={ICON_SIZE}
                        onClick={() => window.open(pdf, "_blank", "noopener,noreferrer")}
                    />
                )}
            </div>
            {!!updatingViewIndex && <IconButton icon={"pi-equals"} color={"text-indigo-800"} className={ICON_SIZE} />}
            {!updatingViewIndex && (
                <ProgressiveControl
                    loading={loading}
                    control={
                        <div className="flex gap-2">
                            <IconButton
                                icon={"pi-pencil"}
                                color={"text-orange-500"}
                                className={ICON_SIZE}
                                onClick={() =>
                                    setDialogEditSuggestion((prev) => ({
                                        ...prev,
                                        visible: true,
                                        id,
                                        title,
                                        pdf,
                                    }))
                                }
                            />
                            <ConfirmationWrapper action={deleteSuggestion}>
                                <IconButton color={"text-red-500"} icon="pi pi-trash" rounded className={ICON_SIZE} />
                            </ConfirmationWrapper>
                        </div>
                    }
                />
            )}
        </div>
    );
}
