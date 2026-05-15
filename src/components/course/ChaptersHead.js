import { useCallback, useEffect, useState } from "react";
import TabHeader from "../common/TabHeader";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { Button } from "primereact/button";
import { useParams } from "react-router-dom";
import DialogAddChapter from "./DialogAddChapter";
import { getViewIndex } from "../../utils";
import HasRequiredAuthority from "../dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../../constants";

export default function ChaptersHead({ setLoading, setError, chapters, setChapters, updatingViewIndex, setUpdatingViewIndex }) {
    const { requestAPI, showToast } = useAppContext();
    const { subjectId } = useParams();
    const [subject, setSubject] = useState();
    const [updating, setUpdating] = useState();

    useEffect(() => {
        requestAPI({
            requestPath: `subjects/${subjectId}`,
            requestMethod: "GET",
            setLoading: setLoading,
            onRequestStart: setError,
            onRequestFailure: () => showToast({ severity: "error", summary: "Failed", detail: "Failed To Load Subject !", life: 2000 }),
            onResponseReceieved: (subject, responseCode) => {
                if (subject && responseCode === 200) setSubject(subject);
                else setError("Couldn't load Chapter Tabs");
            },
        });
    }, [requestAPI, setError, setLoading, showToast, subjectId]);

    const updateViewIndexs = useCallback(() => {
        requestAPI({
            requestPath: `chapters/view_indexes`,
            requestMethod: "PATCH",
            requestPostBody: chapters.map(({ id }, view_index) => ({ id, view_index })),
            setLoading: setUpdating,
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
    }, [chapters, requestAPI, setUpdating, showToast]);

    const [dialogAddChapter, setDialogAddChapter] = useState({
        subjectId,
        visible: false,
    });
    const closeDialogAddChapter = useCallback(() => {
        setDialogAddChapter((prev) => ({ ...prev, visible: false }));
    }, []);

    return (
        <div>
            <TabHeader
                className={"p-3 bg-gray-100"}
                title={`${subject?.title} Chapters`}
                // highlights={[`Demo Chapters Requires No Enrollment`, `Chapters Are Categorized Into Sections`]}
                actionItems={[
                    <HasRequiredAuthority requiredAuthority={AUTHORITIES.CREATE_CHAPTERS}>
                        <Button
                            onClick={() =>
                                setDialogAddChapter((prev) => ({
                                    ...prev,
                                    visible: true,
                                    setChapters,
                                    closeDialog: closeDialogAddChapter,
                                    view_index: getViewIndex(chapters),
                                }))
                            }
                            icon="pi pi-plus"
                            severity="warning"
                        />
                    </HasRequiredAuthority>,
                    <HasRequiredAuthority requiredAuthority={AUTHORITIES.UPDATE_CHAPTERS_VIEW_INDEXES}>
                        {!!chapters?.length && (
                            <Button
                                loading={updating}
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

            {dialogAddChapter?.visible && <DialogAddChapter {...dialogAddChapter} />}
        </div>
    );
}
