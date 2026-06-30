import { useAppContext } from "../../providers/ProviderAppContainer";
import { useCallback, useState } from "react";
import ProgressiveControl from "../common/ProgressiveControl";
import ConfirmationWrapper from "../common/ConfirmationWrapper";
import { useNavigate } from "react-router-dom";
import IconButton from "../common/IconButton";
import HasRequiredAuthority from "../dependencies/HasRequiredAuthority";
import { AUTHORITIES, RUPEE } from "../../constants";
import { Badge } from "primereact/badge";
import { TEXT_BADGE, TEXT_NORMAL, TEXT_SMALL } from "../../style";

export default function Course({
    id,
    title,
    description,
    fees,
    image,
    is_bundle,
    bundledCourses,
    whatsapp_group,
    setCourses,
    updatingViewIndex,
    setDialogEditCourse,
}) {
    const navigate = useNavigate();

    const { requestAPI, showToast } = useAppContext();

    const [deleting, setDeleting] = useState();

    const deleteCourse = useCallback(() => {
        requestAPI({
            requestPath: `courses/${id}`,
            requestMethod: "DELETE",
            setLoading: setDeleting,
            parseResponseBody: false,

            onResponseReceieved: (_, responseCode) => {
                if (responseCode === 204) {
                    showToast({
                        severity: "success",
                        summary: "Deleted",
                        detail: `Course Deleted`,
                        life: 1000,
                    });
                    setCourses((prev) => prev?.filter((course) => course?.id !== id));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Delete Course !", life: 2000 });
                }
            },
        });
    }, [id, requestAPI, setCourses, showToast]);

    return (
        <div
            onClick={() => {
                if (!updatingViewIndex) {
                    navigate(!is_bundle ? `/courses/${id}/subjects` : `/enroll/${id}`);
                }
            }}
            className="border-1 border-gray-300 border-round flex flex-column gap-2 overflow-hidden pb-2"
        >
            <img className="w-full h-8rem" src={image} alt={title} />

            <div className="flex align-items-center mt-1 px-3 gap-3">
                <span className={`${TEXT_NORMAL} font-semibold text-indigo-800 flex-1`}>
                    <i className={`pi ${TEXT_BADGE} pi-circle-fill`}></i> {title}
                </span>

                {!!is_bundle && <Badge className="align-self-start fadeinleft animation-duration-1000 " value={`${fees} ${RUPEE}`} severity="warning"></Badge>}

                <HasRequiredAuthority requiredAuthority={AUTHORITIES.UPDATE_COURSE}>
                    {!updatingViewIndex && (
                        <ProgressiveControl
                            loading={deleting}
                            control={
                                <IconButton
                                    icon={"pi-pencil"}
                                    color={"text-orange-500"}
                                    onClick={() =>
                                        setDialogEditCourse((prev) => ({
                                            ...prev,
                                            visible: true,
                                            id,
                                            title,
                                            description,
                                            fees,
                                            image,
                                            whatsapp_group,
                                            is_bundle,
                                            bundledCourses,
                                        }))
                                    }
                                />
                            }
                        />
                    )}
                </HasRequiredAuthority>
                <HasRequiredAuthority requiredAuthority={AUTHORITIES.DELETE_COURSE}>
                    {!updatingViewIndex && (
                        <ProgressiveControl
                            loading={deleting}
                            control={
                                <ConfirmationWrapper action={deleteCourse}>
                                    <IconButton icon={"pi-trash"} color={"text-red-500"} />
                                </ConfirmationWrapper>
                            }
                        />
                    )}
                </HasRequiredAuthority>
                {!!updatingViewIndex && <IconButton icon={"pi-equals"} color={"text-indigo-800"} />}
            </div>

            <span className={`${TEXT_SMALL} px-3`}>{description}</span>
        </div>
    );
}
