import { useAppContext } from "../../providers/ProviderAppContainer";
import { useCallback, useState } from "react";
import ProgressiveControl from "../common/ProgressiveControl";
import ConfirmationWrapper from "../common/ConfirmationWrapper";
import { getReadableDate } from "../../utils";
import { useNavigate } from "react-router-dom";
import IconButton from "../common/IconButton";
import HasRequiredAuthority from "../dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../../constants";
import { TEXT_NORMAL, TEXT_SMALL } from "../../style";

export default function Chapter({ id, title, test_attainable, test_questions_pool, setChapters, type, updatingViewIndex, updated_at, setDialogEditChapter }) {
    const { requestAPI, showToast } = useAppContext();

    const [deleting, setDeleting] = useState();

    const navigate = useNavigate();

    const deleteChapter = useCallback(() => {
        requestAPI({
            requestPath: `chapters/${id}`,
            requestMethod: "DELETE",
            setLoading: setDeleting,
            parseResponseBody: false,
            onResponseReceieved: (_, responseCode) => {
                if (responseCode === 204) {
                    showToast({
                        severity: "success",
                        summary: "Deleted",
                        detail: `Chapter Deleted`,
                        life: 1000,
                    });
                    setChapters((prev) => prev?.filter((chapter) => chapter?.id !== id));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Delete Chapter !", life: 2000 });
                }
            },
        });
    }, [id, requestAPI, setChapters, showToast]);

    return (
        <div
            onClick={() => {
                if (!updatingViewIndex) navigate(`${id}/media`);
            }}
            className={`flex gap-3 align-items-center border-1 border-gray-300 border-round py-2 px-3 overflow-hidden `}
        >
            <div className="flex flex-column flex-1 gap-2">
                <span className={`${TEXT_NORMAL} font-semibold`}>{title}</span>
                <div className={`flex align-items-center gap-1 `}>
                    <i className={`pi pi-book ${TEXT_NORMAL}`}></i>
                    <span className={`m-0 p-0 ${TEXT_SMALL}`}>{`Last Updated At ${getReadableDate({ date: updated_at })}`}</span>
                </div>
            </div>
            {!!updatingViewIndex && <IconButton icon={"pi-equals"} color={"text-indigo-800"} />}

            <HasRequiredAuthority requiredAuthority={AUTHORITIES.UPDATE_CHAPTERS}>
                {!updatingViewIndex && (
                    <ProgressiveControl
                        loading={deleting}
                        control={
                            <IconButton
                                icon={"pi-pencil"}
                                color={"text-orange-500"}
                                onClick={() =>
                                    setDialogEditChapter((prev) => ({
                                        ...prev,
                                        visible: true,
                                        setChapters,
                                        id,
                                        title,
                                        type,
                                        test_attainable,
                                        test_questions_pool,
                                    }))
                                }
                            />
                        }
                    />
                )}
            </HasRequiredAuthority>

            <HasRequiredAuthority requiredAuthority={AUTHORITIES.DELETE_CHAPTERS}>
                {!updatingViewIndex && (
                    <ProgressiveControl
                        loading={deleting}
                        control={
                            <ConfirmationWrapper action={deleteChapter}>
                                <IconButton icon={"pi-trash"} color={"text-red-500"} />
                            </ConfirmationWrapper>
                        }
                    />
                )}
            </HasRequiredAuthority>
        </div>
    );
}
