import { useSelector } from "react-redux";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import HasRequiredAuthority from "../dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../../constants";
import { TabMenu } from "primereact/tabmenu";
import { useCallback } from "react";

export default function User() {
    const { userId } = useParams();

    const { authorities = [] } = useSelector((state) => state.stateUser);

    const { roles = [] } = useSelector((state) => state.stateTemplateConfig?.global);
    const { courses = [] } = useSelector((state) => state.stateTemplateConfig?.global);
    const { branches = [] } = useSelector((state) => state.stateTemplateConfig?.global);
    const { paymentTypes = [] } = useSelector((state) => state.stateTemplateConfig?.global);

    const getCourseTitle = useCallback((courseId) => courses?.find((course) => course.id === courseId)?.title, [courses]);

    const navigate = useNavigate();

    const items = [
        { label: "Basics", icon: "pi pi-user", command: () => navigate(`basics`, { replace: true }) },
        { label: "Inquiries", icon: "pi pi-question", command: () => navigate(`inquiries`, { replace: true }) },
        { label: "Enrollments", icon: "pi pi-folder-open", command: () => navigate(`enrollments`, { replace: true }) },
        { label: "P.C.A.T.", icon: "pi pi-folder-open", command: () => navigate(`stream-selection-test-results`, { replace: true }) },
        { label: "Devices", icon: "pi pi-tablet", command: () => navigate(`devices`) },
        { label: "Wallet", icon: "pi pi-wallet", command: () => navigate(`wallet`) },
        { label: "Notes", icon: "pi pi-clipboard", command: () => navigate(`global-notes`) },
        { label: "Counseling", icon: "pi pi-comments", command: () => navigate(`counseling-notes`) },
        { label: "Roles", icon: "pi pi-id-card", command: () => navigate(`roles`) },
    ];

    return (
        <HasRequiredAuthority requiredAuthority={AUTHORITIES.USE_CONTAINER_USER}>
            <div className="flex flex-column h-full overflow-hidden">
                <TabMenu model={items} />
                <div className="flex-1 min-h-0 overflow-hidden">
                    <Outlet context={{ roles, userId, authorities, courses, branches, paymentTypes, getCourseTitle }} />
                </div>
            </div>
        </HasRequiredAuthority>
    );
}
