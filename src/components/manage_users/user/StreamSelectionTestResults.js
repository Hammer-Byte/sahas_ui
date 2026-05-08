import { useEffect, useState } from "react";
import { useAppContext } from "../../../providers/ProviderAppContainer";
import Loading from "../../common/Loading";
import { Accordion, AccordionTab } from "primereact/accordion";
import { getReadableDate } from "../../../utils";
import { useOutletContext } from "react-router-dom";
import NoContent from "../../common/NoContent";
import TestResult from "../../stream_selection_test/TestResult";

export default function StreamSelectionTestResults() {
    const { requestAPI, showToast } = useAppContext();
    const [loading, setLoading] = useState();

    const [streamSelectionTestResults, setStreamSelectionTestResults] = useState();

    const { userId } = useOutletContext();

    useEffect(() => {
        requestAPI({
            requestPath: `users/${userId}/stream-selection-test-results`,
            requestMethod: "GET",
            setLoading: setLoading,
            onResponseReceieved: (streamSelectionTestResults, responseCode) => {
                if (streamSelectionTestResults && responseCode === 200) {
                    setStreamSelectionTestResults(streamSelectionTestResults);
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Load Psychometric Test Result !", life: 2000 });
                }
            },
        });
    }, [requestAPI, showToast, userId]);

    if (loading) {
        return <Loading />;
    }

    const parseResult = (value) => {
        if (typeof value !== "string") return value;
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    };

    return (
        <div className="p-2 flex flex-column h-full min-h-0">
            {streamSelectionTestResults?.length ? (
                <Accordion className="mt-2 flex-1 overflow-y-scroll" activeIndex={0}>
                    {streamSelectionTestResults?.map(({ id, created_at, result, answers }, index) => (
                        <AccordionTab key={id} header={`${streamSelectionTestResults.length - index}. Conducted At - ${getReadableDate({ date: created_at })}`}>
                            <TestResult
                                streamSelectionTestResult={{
                                    id,
                                    created_at,
                                    result: parseResult(result),
                                    answers,
                                }}
                                showAnalysisButton={false}
                                showPublicActions={false}
                            />
                        </AccordionTab>
                    ))}
                </Accordion>
            ) : (
                <NoContent error={"No P.C.A.T. Test results availbale"} />
            )}
        </div>
    );
}
