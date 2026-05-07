import { useEffect, useState } from "react";
import moment from "moment";
import { Calendar } from "primereact/calendar";
import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { useAppContext } from "../../providers/ProviderAppContainer";
import Loading from "../common/Loading";
import NoContent from "../common/NoContent";
import { TEXT_BADGE, TEXT_SMALL } from "../../style";
import { getReadableDate } from "../../utils";
import { useNavigate } from "react-router-dom";

export default function Tests() {
    const { requestAPI, showToast } = useAppContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState();
    const [tests, setTests] = useState();
    const [dates, setDates] = useState([moment().subtract(7, "days").toDate(), moment().endOf("day").toDate()]);

    useEffect(() => {
        if (!dates?.[0] || !dates?.[1]) return;
        requestAPI({
            requestMethod: "GET",
            requestPath: "stream-selection-tests",
            requestGetQuery: {
                start_date: dates[0],
                end_date: dates[1],
            },
            setLoading,
            onResponseReceieved: (response, responseCode) => {
                if (responseCode === 200) {
                    const values = Array.isArray(response) ? response : response?.streamSelectionTests || response?.tests || [];
                    setTests(values);
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Load Stream Selection Tests !", life: 2000 });
                }
            },
            onRequestFailure: () => showToast({ severity: "error", summary: "Failed", detail: "Failed To Load Stream Selection Tests !", life: 2000 }),
        });
    }, [dates, requestAPI, showToast]);

    if (loading) {
        return <Loading message={"Fetching Stream Selection Tests"} />;
    }

    return (
        <div className="flex-1 flex flex-column min-h-0">
            <div className="p-2 flex align-items-center justify-content-between gap-2 flex-wrap">
                <span className="font-semibold">Stream Selection Tests</span>
                <Calendar
                    pt={{
                        input: {
                            root: {
                                className: classNames("bg-orange-500 text-white font-semibold border-1 border-orange-600 p-2 text-center", TEXT_BADGE),
                            },
                        },
                    }}
                    value={dates}
                    onChange={(e) => setDates(e.value)}
                    selectionMode="range"
                    readOnlyInput
                    hideOnRangeSelection
                    dateFormat="dd/mm/yy"
                />
            </div>

            {tests?.length ? (
                <div className="flex-1 overflow-y-scroll p-2 flex flex-column gap-2">
                    {tests.map((test) => (
                        <div key={test?.id} className="surface-card border-1 surface-border border-round p-3">
                            <div className="flex justify-content-between align-items-center gap-2 mb-2">
                                <span className="font-semibold">Test #{test?.id}</span>
                                <span className={`text-color-secondary ${TEXT_SMALL}`}>{getReadableDate({ date: test?.created_at })}</span>
                            </div>
                            <div className={`text-color-secondary ${TEXT_SMALL} line-height-3`}>
                                <div>User Id: {test?.user_id || "-"}</div>
                                <div>Full Name: {test?.full_name || "-"}</div>
                                <div>Created At: {getReadableDate({ date: test?.created_at })}</div>
                            </div>
                            <div className="mt-3 flex gap-2 flex-wrap">
                                <Button
                                    type="button"
                                    outlined
                                    icon="pi pi-user"
                                    label="Visit Profile"
                                    disabled={!test?.user_id}
                                    onClick={() => navigate(`/manage-users/${test?.user_id}/stream-selection-test-results`)}
                                />
                                <Button
                                    type="button"
                                    icon="pi pi-external-link"
                                    label="View"
                                    severity="secondary"
                                    disabled={!test?.report_url}
                                    onClick={() => window.open(test?.report_url, "_blank", "noopener,noreferrer")}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <NoContent />
            )}
        </div>
    );
}