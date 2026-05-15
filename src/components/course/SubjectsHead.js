import { Button } from "primereact/button";
import TabHeader from "../common/TabHeader";
import { getReadableDate, getViewIndex } from "../../utils";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { useCallback, useState } from "react";
import DialogAssignSubjects from "./DialogAssignSubjects";
import DialogAddSubject from "./DialogAddSubject";
import HasRequiredAuthority from "../dependencies/HasRequiredAuthority";
import { AUTHORITIES, RUPEE } from "../../constants";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function SubjectsHead({ course, subjects, setSubjects, updatingViewIndex, setUpdatingViewIndex }) {
    const { showToast, requestAPI } = useAppContext();

    const [loading, setLoading] = useState();

    const loggedInUser = useSelector((state) => state.stateUser);

    const navigate = useNavigate();

    const [dialogAddSubject, setDialogAddSubject] = useState({
        courseId: course?.id,
        visible: false,
    });

    const [dialogAssignSubjects, setDialogAssignSubjects] = useState({
        courseId: course?.id,
        visible: false,
    });

    const closeDialogAddSubject = useCallback(() => {
        setDialogAddSubject((prev) => ({ ...prev, visible: false }));
    }, []);

    const closeDialogAssignSubjects = useCallback(() => {
        setDialogAssignSubjects((prev) => ({ ...prev, visible: false }));
    }, []);

    const updateViewIndexs = useCallback(() => {
        requestAPI({
            requestPath: `course-subjects/view_indexes`,
            requestMethod: "PATCH",
            requestPostBody: subjects.map(({ id }, view_index) => ({ id, view_index })),
            setLoading: setLoading,
            parseResponseBody: false,
            onRequestFailure: () => showToast({ severity: "error", summary: "Failed", detail: "Failed To Update View Indexes !", life: 2000 }),
            onResponseReceieved: (_, responseCode) => {
                if (responseCode === 200) {
                    showToast({
                        severity: "success",
                        summary: "Updated",
                        detail: `View Indexes Updated`,
                        life: 1000,
                    });
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Update View Indexes !", life: 2000 });
                }
            },
        });
    }, [subjects, requestAPI, showToast]);

    return (
        <div>
            <img className="w-full h-8rem block" src={course?.image} alt={course?.title} />
            <TabHeader
                className={"p-3 bg-gray-900 text-white"}
                title="Subjects"
                // highlights={[`Total ${subjects?.length} Subjects`]}
                actionItems={[
                    <HasRequiredAuthority requiredAuthority={AUTHORITIES.CREATE_COURSE_SUBJECT}>
                        <Button
                            disabled={loading}
                            onClick={() => {
                                console.log("subjects at open add:", subjects);
                                const viewIndex = getViewIndex(Array.isArray(subjects) ? subjects : []);
                                console.log("computed viewIndex:", viewIndex, typeof viewIndex);
                                setDialogAddSubject((prev) => ({
                                    ...prev,
                                    visible: true,
                                    setSubjects,
                                    view_index: getViewIndex(subjects),
                                    closeDialog: closeDialogAddSubject,
                                }));
                            }}
                            icon="pi pi-plus"
                            severity="warning"
                        />
                    </HasRequiredAuthority>,
                    <HasRequiredAuthority requiredAuthority={AUTHORITIES.ASSIGN_COURSE_SUBJECT}>
                        <Button
                            disabled={loading}
                            onClick={() =>
                                setDialogAssignSubjects((prev) => ({
                                    ...prev,
                                    visible: true,
                                    courseSubjects: subjects,
                                    setCourseSubjects: setSubjects,
                                    closeDialog: closeDialogAssignSubjects,
                                    view_index: getViewIndex(subjects),
                                }))
                            }
                            icon="pi pi-list-check"
                            severity="info"
                        />
                    </HasRequiredAuthority>,
                    <HasRequiredAuthority requiredAuthority={AUTHORITIES.UPDATE_COURSE_SUBJECT_VIEW_INDEX}>
                        {!!subjects?.length && (
                            <Button
                                loading={loading}
                                onClick={() => {
                                    showToast({
                                        severity: "info",
                                        summary: "Repositioning",
                                        detail: `Repositioning Mode ${!updatingViewIndex ? "Enabled" : "Disabled"}`,
                                        life: 1000,
                                    });
                                    //give signal to update view indexs
                                    if (!!updatingViewIndex) {
                                        updateViewIndexs();
                                    }
                                    setUpdatingViewIndex((prev) => !prev);
                                }}
                                icon="pi pi-arrows-v"
                            />
                        )}
                    </HasRequiredAuthority>,
                ]}
            />

            <div className="px-3 py-2 surface-900 text-white flex gap-2 flex-column">
                {!!(course?.enrollment?.on_site_access || course?.enrollment?.digital_access) && (
                    <div>
                        <TabHeader
                            title="Enrollment Details"
                            highlights={[
                                `Validity - ${getReadableDate({ date: course?.enrollment?.start_date, removeTime: true })} to ${getReadableDate({
                                    date: course?.enrollment?.end_date,
                                    removeTime: true,
                                })}`,
                                [
                                    !!course?.enrollment?.on_site_access ? "On-Site Access" : "No On-Site Access",
                                    !!course?.enrollment?.digital_access ? "Digital Access" : "No Digital Access",
                                ].join(" & "),
                            ]}
                            actionItems={[
                                <Button
                                    onClick={() => navigate(`/manage-users/${loggedInUser?.id}/enrollments`)}
                                    icon="pi pi-receipt"
                                    rounded
                                    severity="info"
                                    aria-label="Invoices"
                                />,
                            ]}
                        />
                        <Button
                            className="mt-2 w-full "
                            onClick={() => window.open(`https://chat.whatsapp.com/${course?.whatsapp_group}`)}
                            icon="pi pi-whatsapp"
                            iconPos="right"
                            severity="success"
                            aria-label="Join Whatsapp Group"
                            label="Join Whatsapp Group"
                            size="small"
                        />
                    </div>
                )}

                {!course?.enrollment?.digital_access && (
                    <Button
                        icon="pi pi-angle-double-right"
                        iconPos="right"
                        className="w-full "
                        severity="warning"
                        label={`Purchase Now @ ${course?.fees} ${RUPEE}`}
                        onClick={() => navigate(`/enroll/${course?.id}`)}
                    />
                )}
            </div>
            {dialogAddSubject?.visible && <DialogAddSubject {...dialogAddSubject} />}
            {dialogAssignSubjects?.visible && <DialogAssignSubjects {...dialogAssignSubjects} />}
        </div>
    );
}
