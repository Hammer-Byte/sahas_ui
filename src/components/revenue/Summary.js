import { Calendar } from "primereact/calendar";
import { classNames } from "primereact/utils";
import { Divider } from "primereact/divider";
import { RUPEE } from "../../constants";
import Detail from "../common/Detail";
import { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../../providers/ProviderAppContainer";
import Loading from "../common/Loading";
import { TEXT_BADGE } from "../../style";
import { Button } from "primereact/button";

export default function Summary({ dates, setDates }) {
    const { requestAPI, showToast } = useAppContext();

    const [loading, setLoading] = useState();
    const [summary, setSummary] = useState();

    const downloadReport = useCallback(() => {
        if (dates)
            requestAPI({
                requestMethod: "GET",
                requestPath: `enrollment-transactions/report`,
                requestGetQuery: {
                    start_date: dates[0],
                    end_date: dates[1],
                },
                onResponseReceieved: ({ error, ...report }, responseCode) => {
                    if (responseCode === 200 && report?.cdn_url) {
                        window.open(report.cdn_url, "_blank", "noopener,noreferrer");
                    } else {
                        showToast({ severity: "error", summary: "Failed", detail: "Failed To Download Report !", life: 2000 });
                    }
                },
                onRequestFailure: () => showToast({ severity: "error", summary: "Failed", detail: "Failed To Download Report !", life: 2000 }),
            });
    }, [dates, requestAPI, showToast]);

    useEffect(() => {
        if (dates)
            requestAPI({
                requestMethod: "GET",
                requestPath: `enrollment-transactions/summary`,
                requestGetQuery: {
                    start_date: dates[0],
                    end_date: dates[1],
                },
                setLoading: setLoading,
                onResponseReceieved: ({ error, ...summary }, responseCode) => {
                    if (summary && responseCode === 200) setSummary(summary);
                    else showToast({ severity: "error", summary: "Failed", detail: "Failed To Load Summary !", life: 2000 });
                },
            });
    }, [dates, requestAPI, showToast]);

    if (loading) {
        return <Loading message={"Preparing Summary"} />;
    }

    return (
        <div>
            <div className="p-2 flex align-items-center jsutify-content-between">
                <span className="font-semibold flex-1">Revenue Summary</span>
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

            <div className="p-2 flex justify-content-between  align-items-center">
                <Detail className={"border-1 border-gray-300 border-round p-3 "} icon={"pi pi-calculator"} title="Transactions" value={summary?.transactions} />
                <Detail className={"border-1 border-gray-300 border-round p-3 "} icon={"pi pi-users"} title="Enrollments" value={summary?.enrollments} />
                <Button rounded severity="contrast" icon={"pi pi-download"} title="Download" value={summary?.enrollments} onClick={downloadReport} />
                <Button rounded severity="contrast" icon={"pi pi-filter-fill"} title="Download" value={summary?.enrollments} />

            </div>
            <div className="px-2 mt-1 flex justify-content-around  ">
                <Detail
                    className={"border-1 border-primary border-round p-2 bg-primary-50"}
                    icon={"pi pi-money-bill"}
                    title="Total"
                    value={`${summary?.total}${RUPEE}`}
                />
                <Detail
                    className={"border-1 border-green-300 border-round p-2 bg-green-100"}
                    icon={"pi pi-box"}
                    title="Collection"
                    value={`${summary?.collection}${RUPEE}`}
                />
                <Detail
                    className={"border-1 border-red-300 border-round p-2 bg-red-100 "}
                    icon={"pi pi-exclamation-circle"}
                    title="Dues"
                    value={`${summary?.due}${RUPEE}`}
                />
            </div>
            <Divider />
        </div>
    );
}
