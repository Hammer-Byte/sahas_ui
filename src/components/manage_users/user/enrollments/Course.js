import { Button } from "primereact/button";
import Detail from "../../../common/Detail";
import { getReadableDate } from "../../../../utils";
import { useOutletContext } from "react-router-dom";
import { useCallback, useState } from "react";
import { useAppContext } from "../../../../providers/ProviderAppContainer";
import ProgressiveControl from "../../../common/ProgressiveControl";
import ConfirmationWrapper from "../../../common/ConfirmationWrapper";
import HasRequiredAuthority from "../../../dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../../../../constants";

export default function Course({ id, setCourses, ...course }) {
    const { getCourseTitle } = useOutletContext();
    const { requestAPI, showToast } = useAppContext();
    const [deleting, setDeleting] = useState();

    const deleteEnrollmentCourse = useCallback(() => {
        requestAPI({
            requestPath: `enrollment-courses/${id}`,
            requestMethod: "DELETE",
            setLoading: setDeleting,
            parseResponseBody: false,
            onResponseReceieved: (_, responseCode) => {
                if (responseCode === 204) {
                    showToast({ severity: "success", summary: "Deleted", detail: "Course Deleted", life: 1000 });
                    setCourses((prev) => prev?.filter((course) => course.id !== id));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Deleted Course !", life: 2000 });
                }
            },
        });
    }, [id, requestAPI, setCourses, showToast]);

    return (
        <div className="flex align-items-start gap-2 mb-2">
            <Detail
                icon="pi pi-angle-right"
                className="flex-1 mb-2"
                title={`By ${course?.created_by_full_name} at ${getReadableDate({ date: course?.created_on })}`}
                value={getCourseTitle(course?.course_id)}
            />

            <HasRequiredAuthority requiredAuthority={AUTHORITIES.DELETE_ENROLLMENT_COURSE}>
                <ProgressiveControl
                    loading={deleting}
                    control={
                        <ConfirmationWrapper action={deleteEnrollmentCourse}>
                            <Button className="w-2rem h-2rem" icon="pi pi-trash" rounded severity="danger" />
                        </ConfirmationWrapper>
                    }
                />
            </HasRequiredAuthority>
        </div>
    );
}
