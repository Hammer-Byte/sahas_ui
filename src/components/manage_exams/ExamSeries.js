import { useCallback, useEffect, useState } from "react";
import { Button } from "primereact/button";
import TabHeader from "../common/TabHeader";
import Loading from "../common/Loading";
import NoContent from "../common/NoContent";
import Series from "./Series";
import DialogAddExamSeries from "./DialogAddExamSeries";
import { useAppContext } from "../../providers/ProviderAppContainer";

export default function ExamSeries() {
    const { requestAPI } = useAppContext();
    const [examSeries, setExamSeries] = useState();
    const [loading, setLoading] = useState();
    const [error, setError] = useState();

    const [dialogAddExamSeries, setDialogAddExamSeries] = useState({
        visible: false,
    });

    const closeDialogAddExamSeries = useCallback(() => {
        setDialogAddExamSeries((prev) => ({ ...prev, visible: false }));
    }, []);

    useEffect(() => {
        requestAPI({
            requestPath: "exam-series",
            requestMethod: "GET",
            setLoading: setLoading,
            onRequestStart: setError,
            onRequestFailure: setError,
            onResponseReceieved: (examSeries, responseCode) => {
                if (examSeries && responseCode === 200) {
                    setExamSeries(examSeries);
                } else {
                    setError("Couldn't load Exam Series");
                }
            },
        });
    }, [requestAPI]);

    return (
        <div className="flex flex-column flex-1 min-h-0 overflow-hidden">
            <TabHeader
                className="px-3 py-3"
                title="Manage Exam Series"
                highlights={[`Total - ${examSeries?.length || 0} Exam Series`]}
                actionItems={[
                    <Button
                        icon="pi pi-plus"
                        severity="warning"
                        onClick={() =>
                            setDialogAddExamSeries((prev) => ({
                                ...prev,
                                setExamSeries,
                                visible: true,
                                closeDialog: closeDialogAddExamSeries,
                            }))
                        }
                    />,
                ]}
            />
            <div className="flex-1 min-h-0 px-3 pb-2 overflow-y-scroll flex flex-column gap-2">
                {loading ? (
                    <Loading message="Loading Exam Series" />
                ) : error ? (
                    <NoContent error={error} />
                ) : examSeries?.length ? (
                    examSeries.map((item) => <Series key={item?.id} {...item} setExamSeries={setExamSeries} />)
                ) : (
                    <NoContent error="No Exam Series Found" />
                )}
            </div>

            {dialogAddExamSeries?.visible && <DialogAddExamSeries {...dialogAddExamSeries} />}
        </div>
    );
}
