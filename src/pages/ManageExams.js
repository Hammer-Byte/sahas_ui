import { useCallback, useMemo, useState } from "react";
import { Button } from "primereact/button";
import PageTitle from "../components/common/PageTitle";
import TabHeader from "../components/common/TabHeader";
import { Divider } from "primereact/divider";
import ExamSeriesList from "../components/manage_exams/ExamSeriesList";
import DialogAddExamSeries from "../components/manage_exams/exam_series/DialogAddExamSeries";
import { AUTHORITIES } from "../constants";
import HasRequiredAuthority from "../components/dependencies/HasRequiredAuthority";
import { getDummyExamSeries } from "../components/manage_exams/exam_series/dummyExamSeries";

export default function ManageExams() {
    const [examSeries, setExamSeries] = useState(() => getDummyExamSeries());

    const [dialogAddExamSeries, setDialogAddExamSeries] = useState({
        visible: false,
    });

    const closeDialogAddExamSeries = useCallback(() => {
        setDialogAddExamSeries((prev) => ({ ...prev, visible: false }));
    }, []);

    const totalExams = useMemo(() => examSeries?.reduce((n, s) => n + (s.exams?.length || 0), 0) ?? 0, [examSeries]);

    return (
        <div className="flex flex-column h-full ">
            <PageTitle title="Manage Exams" />
            <TabHeader
                className={"px-3 pt-3"}
                title="Exam series"
                highlights={[`${examSeries?.length ?? 0} series`, `${totalExams} exams across all series`]}
                actionItems={[
                    <HasRequiredAuthority key="add" requiredAuthority={AUTHORITIES.USE_PAGE_MANAGE_EXAMS}>
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
                        />
                    </HasRequiredAuthority>,
                ]}
            />
            <Divider />
            <div className="flex-1 min-h-0 overflow-hidden flex flex-column">
                <ExamSeriesList examSeries={examSeries} setExamSeries={setExamSeries} />
            </div>

            <DialogAddExamSeries {...dialogAddExamSeries} />
        </div>
    );
}
