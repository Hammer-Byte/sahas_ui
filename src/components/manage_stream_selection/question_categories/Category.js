import { useCallback, useState } from "react";
import { useAppContext } from "../../../providers/ProviderAppContainer";
import { ICON_SIZE, TEXT_NORMAL, TEXT_SMALL } from "../../../style";
import { getReadableDate } from "../../../utils";
import HasRequiredAuthority from "../../dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../../../constants";
import ProgressiveControl from "../../common/ProgressiveControl";
import ConfirmationWrapper from "../../common/ConfirmationWrapper";
import IconButton from "../../common/IconButton";
import { useNavigate } from "react-router-dom";

export default function Category({ id, title, updated_at, active, questions, setCategories, setDialogEditCategory, updatingViewIndex }) {
    const { requestAPI, showToast } = useAppContext();

    const [loading, setLoading] = useState();

    const navigate = useNavigate();

    const deleteCategory = useCallback(() => {
        requestAPI({
            requestPath: `stream-selection-question-categories/${id}`,
            requestMethod: "DELETE",
            setLoading,
            parseResponseBody: false,
            onResponseReceieved: (_, responseCode) => {
                if (responseCode === 204) {
                    showToast({ severity: "success", summary: "Deleted", detail: "Category Deleted", life: 1000 });
                    setCategories((prev) => prev?.filter((category) => category?.id !== id));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Delete Category !", life: 2000 });
                }
            },
        });
    }, [id, requestAPI, setCategories, showToast]);

    return (
        <div
            className="flex align-items-center border-1 border-round p-2 gap-2  border-gray-300"
            onClick={() => {
                if (!updatingViewIndex) navigate(`${id}`);
            }}
        >
            <div className="flex-1 flex flex-column gap-2 align-items-start">
                <span className={`font-semibold ${TEXT_NORMAL}`}>
                    {id}. {title}
                </span>
                {updated_at && (
                    <p className={`${TEXT_SMALL} m-0 p-0 font-medium text-color-secondary`}>
                        <i className={`${TEXT_SMALL} pi pi-calendar`}></i> Updated at {getReadableDate({ date: updated_at })}
                    </p>
                )}
                <p className={`${TEXT_SMALL} m-0 p-0 font-medium text-color-secondary`}>
                    <i className={`${TEXT_SMALL} pi pi-question-circle`}></i> Questions {questions}
                </p>
            </div>

            {!!updatingViewIndex && <IconButton icon={"pi-equals"} color={"text-indigo-800"} className={ICON_SIZE} />}
            {!updatingViewIndex && (
                <HasRequiredAuthority requiredAuthority={AUTHORITIES.UPDATE_STREAM_SELECTION_QUESTION_CATEGORY}>
                    <ProgressiveControl
                        loading={loading}
                        control={
                            <IconButton
                                icon={"pi-pencil"}
                                color={"text-orange-500"}
                                onClick={() =>
                                    setDialogEditCategory((prev) => ({
                                        ...prev,
                                        visible: true,
                                        setCategories,
                                        id,
                                        title,
                                        active,
                                    }))
                                }
                            />
                        }
                    />
                </HasRequiredAuthority>
            )}

            {!updatingViewIndex && (
                <HasRequiredAuthority requiredAuthority={AUTHORITIES.DELETE_STREAM_SELECTION_QUESTION_CATEGORY}>
                    <ProgressiveControl
                        loading={loading}
                        control={
                            <ConfirmationWrapper action={deleteCategory}>
                                <IconButton color={"text-red-500"} icon="pi pi-trash" rounded className={ICON_SIZE} />
                            </ConfirmationWrapper>
                        }
                    />
                </HasRequiredAuthority>
            )}
        </div>
    );
}
