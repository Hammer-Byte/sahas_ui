import NoContent from "../common/NoContent";
import { Accordion, AccordionTab } from "primereact/accordion";
import ExamSeriesHead from "./exam_series/ExamSeriesHead";
import ExamSeries from "./exam_series/ExamSeries";

export default function ExamSeriesList({ examSeries, setExamSeries }) {
    return (
        <div className="flex-1 min-h-0 px-3 pb-2 overflow-y-auto gap-2 flex flex-column">
            {examSeries?.length ? (
                <Accordion>
                    {examSeries.map((series, index) => (
                        <AccordionTab
                            key={series?.id}
                            pt={{
                                content: { className: "p-0" },
                                headeraction: { className: "px-2 py-3" },
                            }}
                            header={() => (
                                <ExamSeriesHead {...series} setExamSeries={setExamSeries} index={examSeries.length - index} />
                            )}
                        >
                            <ExamSeries key={series?.id} {...series} />
                        </AccordionTab>
                    ))}
                </Accordion>
            ) : (
                <NoContent error="No exam series yet. Use + to add one." />
            )}
        </div>
    );
}
