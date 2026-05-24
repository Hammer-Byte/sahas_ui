import { Outlet } from "react-router-dom";
import PageTitle from "../components/common/PageTitle";

export default function ManageExamSeries() {
    return (
        <div className="flex flex-column h-full overflow-hidden">
            <PageTitle title="Manage Exam Series" />
            <div className="flex-1 min-h-0 overflow-hidden flex flex-column">
                <Outlet />
            </div>
        </div>
    );
}
