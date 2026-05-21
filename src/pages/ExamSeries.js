import PageTitle from "../components/common/PageTitle";
import { Outlet } from "react-router-dom";

export default function ExamSeries() {
    return (
        <div className="flex flex-column gap-2 h-full overflow-hidden">
            <PageTitle title="Exam Series" />
            <Outlet />
        </div>
    );
}
