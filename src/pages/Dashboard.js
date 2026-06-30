import { useDispatch, useSelector } from "react-redux";
import Operations from "../components/dashboard/Operations";
import { useAppContext } from "../providers/ProviderAppContainer";
import { Badge } from "primereact/badge";
import CarouselImages from "../components/dashboard/CarouselImages";
import ExamReminder from "../components/dashboard/ExamReminder";
import { TEXT_SMALL, TEXT_TITLE } from "../style";
import HasRequiredAuthority from "../components/dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../constants";
import { DialogDashboard } from "../components/dashboard/DialogDashboard";
import { updateDashboardDialog } from "../redux/sliceTemplateConfig";

export default function Dashboard() {
    const { isDevelopmentBuild, deviceFingerPrint } = useAppContext();

    const pageConfig = useSelector((state) => state.stateTemplateConfig?.dash_board);

    const dispatch = useDispatch();

    const sahasWhatsAppShareMessage = `*Sahas Institute of Commerce*

Holistic commerce learning with expert teachers, videos & step-by-step guidance in Business Studies, Economics, Accounting, Finance & Statistics.

*Courses:*
• 11th & 12th Commerce (English & Gujarati)
• FY, SY & TY B.Com (MSU)
• CA & CS

Explore programs & the *Sahas Smart Studies* app:
https://www.sahasinstitute.com/`;

    return (
        <div className="flex flex-column h-full overflow-hidden">
            <div className="bg-primary shadow-3 flex align-items-center gap-3 p-2">
                <div className="w-8 flex-1">
                    <p className={`${TEXT_TITLE} m-0 font-semibold`}>Welcome To Sahas Smart Studies</p>
                    {isDevelopmentBuild && (
                        <div className={`${TEXT_SMALL} mt-1 white-space-nowrap text-overflow-ellipsis overflow-hidden opacity-90`}>
                            Device ID - {deviceFingerPrint}
                        </div>
                    )}
                </div>

                <HasRequiredAuthority requiredAuthority={AUTHORITIES.MANAGE_DASHBOARD_DIALOG}>
                    <i
                        className="pi pi-pen-to-square p-overlay-badge"
                        style={{ fontSize: "1.5rem" }}
                        onClick={() => dispatch(updateDashboardDialog({ active: true }))}
                    />
                </HasRequiredAuthority>

                <i
                    className="pi pi-share-alt p-overlay-badge"
                    style={{ fontSize: "1.5rem" }}
                    title="Share on WhatsApp"
                    onClick={() =>
                        window.open(`https://wa.me/?text=${encodeURIComponent(sahasWhatsAppShareMessage)}`, "_blank", "noopener,noreferrer")
                    }
                />

                <i className="pi pi-bell p-overlay-badge mr-2" style={{ fontSize: "1.5rem" }}>
                    <Badge value="2" severity="warning"></Badge>
                </i>
            </div>

            <ExamReminder className="mb-2" />
            <CarouselImages className={"mb-2"} images={pageConfig?.carousel_images} />
            <Operations className={"mx-2 mt-2 flex-1 min-h-0 overflow-scroll"} />

            <DialogDashboard dialogDashboard={pageConfig?.dialog} />
        </div>
    );
}
