import { Outlet } from "react-router-dom";
import PageTitle from "../components/common/PageTitle";

export default function AttendExamLayout() {
    return (
        <div className="flex flex-column gap-2 h-full overflow-hidden">
            <PageTitle title="Attend Exam" />
            <Outlet />
        </div>
    );
}
