import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "primereact/button";
import TabHeader from "../common/TabHeader";
import Loading from "../common/Loading";
import NoContent from "../common/NoContent";
import Exam from "./Exam";
import DialogAddExam from "./DialogAddExam";
import { useAppContext } from "../../providers/ProviderAppContainer";

export default function Exams() {
    const { id: examSeriesId } = useParams();
    const { requestAPI } = useAppContext();

    const [examSeries, setExamSeries] = useState();
    const [loading, setLoading] = useState();
    const [error, setError] = useState();

    const [dialogAddExam, setDialogAddExam] = useState({
        visible: false,
    });

    const closeDialogAddExam = useCallback(() => {
        setDialogAddExam((prev) => ({ ...prev, visible: false }));
    }, []);

    useEffect(() => {
        if (!examSeriesId) return;

        requestAPI({
            requestPath: `exam-series/${examSeriesId}`,
            requestMethod: "GET",
            setLoading: setLoading,
            onRequestStart: setError,
            onRequestFailure: setError,
            onResponseReceieved: (examSeries, responseCode) => {
                if (examSeries && responseCode === 200) {
                    setExamSeries(examSeries);
                    setError();
                } else {
                    setError("Couldn't load Exams");
                }
            },
        });
    }, [examSeriesId, requestAPI]);

    const exams = examSeries?.exams;

    return (
        <div className="flex flex-column flex-1 min-h-0 overflow-hidden">
            <TabHeader
                className="px-3 py-3"
                title="Exams"
                highlights={[`Exam Series - ${examSeries?.title || examSeriesId}`, `Total - ${exams?.length || 0} Exams`]}
                actionItems={[
                    <Button
                        icon="pi pi-plus"
                        severity="warning"
                        onClick={() =>
                            setDialogAddExam((prev) => ({
                                ...prev,
                                visible: true,
                                closeDialog: closeDialogAddExam,
                                examSeriesId,
                                subjects: examSeries?.subjects,
                                examSeriesStartAt: examSeries?.start_at,
                                examSeriesEndAt: examSeries?.end_at,
                                setExamSeries,
                            }))
                        }
                    />,
                ]}
            />
            <div className="flex-1 min-h-0 px-3 pb-2 overflow-y-scroll flex flex-column gap-2">
                {loading ? (
                    <Loading message="Loading Exams" />
                ) : error ? (
                    <NoContent error={error} />
                ) : exams?.length ? (
                    exams.map((exam) => (
                        <Exam
                            key={exam?.id}
                            {...exam}
                            setExamSeries={setExamSeries}
                            subjects={examSeries?.subjects}
                            examSeriesStartAt={examSeries?.start_at}
                            examSeriesEndAt={examSeries?.end_at}
                        />
                    ))
                ) : (
                    <NoContent error="No Exams Found" />
                )}
            </div>

            {dialogAddExam?.visible && <DialogAddExam {...dialogAddExam} />}
        </div>
    );
}
