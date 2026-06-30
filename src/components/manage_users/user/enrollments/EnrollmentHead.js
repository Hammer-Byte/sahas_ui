import { getReadableDate } from "../../../../utils";
import { Tag } from "primereact/tag";
import { TEXT_NORMAL, TEXT_SMALL } from "../../../../style";
import IconButton from "../../../common/IconButton";
import { useCallback, useState } from "react";
import { useAppContext } from "../../../../providers/ProviderAppContainer";
import ProgressiveControl from "../../../common/ProgressiveControl";
import ConfirmationWrapper from "../../../common/ConfirmationWrapper";
import HasRequiredAuthority from "../../../dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../../../../constants";
import { Divider } from "primereact/divider";
import Error from "../../../common/Error";

export default function EnrollmentHead({
    setDialogEditEnrollment,
    setEnrollments,
    id,
    index,
    created_on,
    created_by_full_name,
    digital_access,
    on_site_access,
    handler,
    amount,
    note,
    start_date,
    end_date,
    courses,
}) {
    const { requestAPI, showToast } = useAppContext();

    const [loading, setLoading] = useState();

    const deleteEnrollment = useCallback(() => {
        requestAPI({
            requestPath: `enrollments/${id}`,
            requestMethod: "DELETE",
            setLoading,
            parseResponseBody: false,
            onResponseReceieved: (_, responseCode) => {
                if (responseCode === 204) {
                    showToast({ severity: "success", summary: "Deleted", detail: "Enrollment Deleted", life: 1000 });
                    setEnrollments((prev) => prev?.filter((enrollment) => enrollment?.id !== id));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Delete Enrollment !", life: 2000 });
                }
            },
        });
    }, [id, requestAPI, setEnrollments, showToast]);

    return (
        <div>
            <div className="flex justify-content-between align-items-center gap-2">
                <div className=" flex flex-column gap-2 align-items-start">
                    <span className={`${TEXT_NORMAL}`}>
                        <i className={`${TEXT_SMALL} pi pi-calendar`}></i> {getReadableDate({ date: created_on })}
                    </span>
                    <span className={`${TEXT_SMALL} font-medium text-color-secondary`}>
                        {index}. By {created_by_full_name}
                    </span>
                    <span className={`${TEXT_SMALL} font-medium text-color-secondary font-semibold`}>{handler}</span>
                </div>

                <div className="flex flex-column gap-2">
                    <Tag
                        icon="pi pi-building-columns"
                        severity={!!on_site_access ? "success" : "danger"}
                        value={!!on_site_access ? "On-Site Access" : "No On-Site Access"}
                        pt={{
                            icon: { className: TEXT_SMALL },
                            value: { className: TEXT_SMALL },
                        }}
                    />
                    <Tag
                        icon="pi pi-globe"
                        severity={!!digital_access ? "success" : "danger"}
                        value={!!digital_access ? "Digital Access" : "No Digital Access"}
                        pt={{
                            icon: { className: TEXT_SMALL },
                            value: { className: TEXT_SMALL },
                        }}
                    />
                </div>

                <HasRequiredAuthority requiredAuthority={AUTHORITIES.MANAGE_OTHER_USERS}>
                    <ProgressiveControl
                        loading={loading}
                        control={
                            <div className="flex flex-column gap-2">
                                <IconButton
                                    icon={"pi-pencil"}
                                    onClick={() =>
                                        setDialogEditEnrollment((prev) => ({
                                            ...prev,
                                            visible: true,
                                            id,
                                            digital_access,
                                            on_site_access,
                                            amount,
                                            note,
                                            start_date: new Date(start_date),
                                            end_date: new Date(end_date),
                                        }))
                                    }
                                    rounded
                                    severity="danger"
                                    aria-label="Edit"
                                    color={"text-orange-500"}
                                />
                                <ConfirmationWrapper action={deleteEnrollment}>
                                    <IconButton icon={"pi-trash"} rounded severity="danger" aria-label="Delete" color={"text-red-500"} />
                                </ConfirmationWrapper>
                            </div>
                        }
                    />
                </HasRequiredAuthority>
            </div>

            {(!!note || !!courses?.length) && (
                <div>
                    <Divider className="my-3 w-full" />
                    {note && <li className={`${TEXT_SMALL} text-color-secondary flex-1 font-light`}>{note}</li>}
                    {!!courses?.length ? (
                        <div className="flex flex-wrap mt-2 gap-2">
                            {courses?.map((course) => (
                                <span className={`p-1 ${TEXT_SMALL} text-color-secondary border-round border-1 border-gray-300 text-light`}>{course}</span>
                            ))}
                        </div>
                    ) : (
                        <Error error="No Courses !" />
                    )}
                </div>
            )}
        </div>
    );
}
