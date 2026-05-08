import PageTitle from "../components/common/PageTitle";
import { useState } from "react";
import Summary from "../components/revenue/Summary";
import Transactions from "../components/revenue/Transactions";
import moment from "moment";
import { TabPanel, TabView } from "primereact/tabview";

export default function Revenue() {
    const [dates, setDates] = useState([
        moment().subtract(7, "days").toDate(), // Start date (7 days ago)
        moment().endOf("day").toDate(), // End date (Today)
    ]);

    return (
        <div className="flex flex-column h-full">
            <PageTitle
                title={"Revenue"}
                
            />
            <TabView className="flex-1 overflow-y-auto" panelContainerClassName="p-0">
                <TabPanel header="Courses">
                    <Summary dates={dates} setDates={setDates} />
                    <Transactions dates={dates} />
                </TabPanel>
                <TabPanel header="P.C.A.T">
                    <p>fetch PCAT Revenue</p>
                </TabPanel>
            </TabView>
        </div>
    );
}
