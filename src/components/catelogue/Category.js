import { useCallback, useState } from "react";
import { useAppContext } from "../../providers/ProviderAppContainer";
import ProgressiveControl from "../common/ProgressiveControl";
import ConfirmationWrapper from "../common/ConfirmationWrapper";
import { useNavigate, useOutletContext } from "react-router-dom";
import IconButton from "../common/IconButton";
import HasRequiredAuthority from "../dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../../constants";
import { TEXT_SMALL, ICON_SIZE } from "../../style";

export default function Category({ id, image, title, courses_count, updatingViewIndex, setDialogEditCategory }) {
    const { requestAPI, showToast } = useAppContext();
    const { setCategories } = useOutletContext();

    const [deleting, setDeleting] = useState();

    const navigate = useNavigate();

    const deleteCategory = useCallback(() => {
        requestAPI({
            requestPath: `course-categories/${id}`,
            requestMethod: "DELETE",
            setLoading: setDeleting,
            parseResponseBody: false,
            onResponseReceieved: (_, responseCode) => {
                if (responseCode === 204) {
                    showToast({ severity: "success", summary: "Deleted", detail: "Category Deleted", life: 1000 });
                    setCategories((prev) => prev?.filter((category) => category?.id !== id));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Delete File !", life: 2000 });
                }
            },
        });
    }, [id, requestAPI, setCategories, showToast]);

    return (
        <div
            onClick={() => {
                if (!updatingViewIndex) navigate(`${id}/courses`);
            }}
            className="w-full flex gap-2 align-items-center border-1 border-gray-300 border-round pr-2"
        >
            <img className="border-round-left w-8rem h-4rem" src={image} alt={title} />
            <div className="flex flex-column flex-1 gap-1">
                <span className={`${TEXT_SMALL} font-semibold word-break-all`}>{title}</span>
                <div className="flex align-items-center gap-1 text-orange-800">
                    <i className={`pi pi-book ${TEXT_SMALL}`}></i>
                    <span className={`m-0 p-0  ${TEXT_SMALL}`}>{`${courses_count} Courses`}</span>
                </div>
            </div>
            {!!updatingViewIndex && <IconButton icon={"pi-equals"} color={"text-indigo-800"} className={ICON_SIZE} />}
            {!updatingViewIndex && (
                <HasRequiredAuthority requiredAuthority={AUTHORITIES.UPDATE_COURSE_CATEGORY}>
                    <IconButton
                        icon={"pi-pencil"}
                        color={"text-orange-500"}
                        className={ICON_SIZE}
                        onClick={() =>
                            setDialogEditCategory((prev) => ({
                                ...prev,
                                visible: true,
                                id,
                                title,
                                image,
                            }))
                        }
                    />
                </HasRequiredAuthority>
            )}
            {!updatingViewIndex && (
                <HasRequiredAuthority requiredAuthority={AUTHORITIES.DELETE_COURSE_CATEGORY}>
                    <ProgressiveControl
                        loading={deleting}
                        control={
                            <ConfirmationWrapper action={deleteCategory}>
                                <IconButton icon={"pi-trash"} color={"text-red-500"} className={ICON_SIZE} />
                            </ConfirmationWrapper>
                        }
                    />
                </HasRequiredAuthority>
            )}
            {!updatingViewIndex && <IconButton icon={"pi-arrow-circle-right"} className={ICON_SIZE} />}
        </div>
    );
}
