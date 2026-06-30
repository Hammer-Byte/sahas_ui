import { useAppContext } from "../../providers/ProviderAppContainer";
import { useCallback, useState } from "react";
import ProgressiveControl from "../common/ProgressiveControl";
import ConfirmationWrapper from "../common/ConfirmationWrapper";
import { useNavigate } from "react-router-dom";
import { getReadableDate } from "../../utils";
import IconButton from "../common/IconButton";
import HasRequiredAuthority from "../dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../../constants";
import { TEXT_NORMAL, TEXT_SMALL } from "../../style";

export default function Subject({
    id,
    title,
    subject_id,
    setSubjects,
    background_color,
    test_timer_minutes,
    test_size,
    updatingViewIndex,
    updated_at,
    setDialogEditSubject,
}) {
    const navigate = useNavigate();

    const { requestAPI, showToast } = useAppContext();

    const [deleting, setDeleting] = useState();

    const deleteSubject = useCallback(() => {
        requestAPI({
            requestPath: `course-subjects/${id}`,
            requestMethod: "DELETE",
            setLoading: setDeleting,
            parseResponseBody: false,
            onResponseReceieved: (_, responseCode) => {
                if (responseCode === 204) {
                    showToast({
                        severity: "success",
                        summary: "Deleted",
                        detail: `Subject Deleted`,
                        life: 1000,
                    });
                    setSubjects((prev) => prev?.filter((course) => course?.id !== id));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Delete Subject !", life: 2000 });
                }
            },
        });
    }, [id, requestAPI, setSubjects, showToast]);

    return (
        <div
            onClick={() => {
                if (!updatingViewIndex) navigate(`${subject_id}/chapters`);
            }}
            style={{ backgroundColor: background_color }}
            className="flex gap-3 align-items-center border-1 border-gray-300 border-round py-2 px-3 overflow-hidden"
        >
            <div className="flex flex-column flex-1 gap-2">
                <span className={`${TEXT_NORMAL} font-semibold ${background_color && "text-white"}`}>{title}</span>
                <div className={`flex align-items-center gap-1 text-orange-800 ${background_color && "text-white"}`}>
                    <i className={`pi pi-book ${TEXT_NORMAL}`}></i>
                    <span className={`m-0 p-0 ${TEXT_SMALL}`}>{`Last Updated At ${getReadableDate({ date: updated_at })}`}</span>
                </div>
            </div>
            {!!updatingViewIndex && <IconButton icon={"pi-equals"} color={background_color ? "text-white" : `text-indigo-800`} />}

            <HasRequiredAuthority requiredAuthority={AUTHORITIES.UPDATE_COURSE_SUBJECT}>
                {!updatingViewIndex && (
                    <IconButton
                        icon={`pi pi-pencil `}
                        color={background_color ? "text-white" : `text-orange-500`}
                        onClick={() =>
                            setDialogEditSubject((prev) => ({
                                ...prev,
                                visible: true,
                                setSubjects,
                                id: subject_id,
                                title,
                                background_color,
                                test_timer_minutes,
                                test_size,
                            }))
                        }
                    />
                )}
            </HasRequiredAuthority>

            <HasRequiredAuthority requiredAuthority={AUTHORITIES.DELETE_COURSE_SUBJECT}>
                {!updatingViewIndex && (
                    <ProgressiveControl
                        loading={deleting}
                        control={
                            <ConfirmationWrapper action={deleteSubject}>
                                <IconButton icon={`pi-trash`} color={background_color ? "text-white" : "text-red-500"} />
                            </ConfirmationWrapper>
                        }
                    />
                )}
            </HasRequiredAuthority>

            {!!updatingViewIndex && <IconButton icon={"pi-arrow-circle-right"} color={background_color ? "text-white" : "text-indigo-800"} />}
        </div>
    );
}
