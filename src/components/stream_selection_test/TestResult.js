import NoContent from "../common/NoContent";
import Summary from "../common/Summary";
import { Panel } from "primereact/panel";
import { Divider } from "primereact/divider";
import { getRandomBackgroundColor, getReadableDate } from "../../utils";
import ResultSummary from "./ResultSummary";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { useSelector } from "react-redux";

export default function TestResult({ streamSelectionTestResult, showAnalysisButton = true, showPublicActions = true }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { suggestions = [] } = useSelector((state) => state.stateTemplateConfig?.stream_selection || {});
    const routeResult = location.state?.streamSelectionTestResult;
    const currentResult = streamSelectionTestResult || routeResult;

    return currentResult?.result ? (
        <div className="flex-1 flex flex-column overflow-y-scroll">
            <Panel className="m-2" headerTemplate={(options) =>
                <div className={`flex justify-content-space-between align-items-center ${options.className}`}>
                    <span className="font-semibold">Conducted At - {getReadableDate({ date: currentResult?.created_at })}</span>
                    <Button
                        icon="pi pi-download"
                        size="small"
                        outlined
                        disabled={!currentResult?.report_url}
                        onClick={() =>
                            window.open(currentResult?.report_url, "_blank", "noopener,noreferrer")
                        }
                    />
                </div>}>
                <ResultSummary {...currentResult.result} />
                <div className="mt-2 flex flex-column md:flex-row gap-2">
                    {showAnalysisButton && (
                        <Button
                            outlined
                            severity="warning"
                            className="w-full"
                            label="Stream Specific Analysis"
                            icon="pi pi-chart-line"
                            onClick={() => navigate("../analysis", { state: { streamSelectionTestResult: currentResult } })}
                        />
                    )}
                    {!!suggestions?.length &&
                        suggestions.map(({ id, title, pdf }) => (
                            <Button
                                key={id}
                                label={title}
                                className={`w-full border-none ${getRandomBackgroundColor()}`}
                                onClick={() => window.open(pdf, "_blank", "noopener,noreferrer")}
                            />
                        ))}
                </div>
                {showPublicActions && (
                    <div className="mt-2 flex gap-2 w-full">
                        <Button
                            className="flex-1"
                            outlined
                            label="Contact us"
                            icon="pi pi-envelope"
                            onClick={() => navigate("/contact-us")}
                        />
                        <Button
                            className="flex-1"
                            outlined
                            severity="secondary"
                            label="Login to app"
                            icon="pi pi-sign-in"
                            onClick={() => navigate("/")}
                        />
                    </div>
                )}
                <Divider className="my-3" />
                {
                    currentResult?.answers?.length &&
                    <Summary
                        icon={"pi pi-pen-to-square"}
                        title={"Q&A"}
                        values={currentResult?.answers?.map(({ question, answer }) => `${question} -> ${answer}`)}
                    />
                }

            </Panel>
        </div>
    ) : (
        <NoContent error="Failed To Load Psychometric Test Result" />
    );
}
