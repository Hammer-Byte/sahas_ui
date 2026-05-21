import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { TEXT_SUBTITLE, TEXT_SMALL, ICON_SIZE } from "../../style";
import { AUTHORITIES } from "../../constants";

export default function Operations({ className }) {
    const { id, authorities = [] } = useSelector((state) => state.stateUser);
    const navigate = useNavigate();

    const operationsSections = useMemo(() => {
        const configOperations = [
            {
                title: "Student's Corner",
                operations: [
                    {
                        title: "All Courses",
                        icon: "pi-sitemap",
                        path: "/course-categories",
                    },
                    {
                        title: "My Courses",
                        icon: "pi-pen-to-square",
                        path: "/my-courses",
                    },
                    {
                        title: "Self Test",
                        icon: "pi-book",
                        path: "/chapters-test/selection",
                    },
                    {
                        title: "Fees Receipts",
                        icon: "pi-receipt",
                        path: `/invoices`,
                    },
                    {
                        title: "Exam Series",
                        icon: "pi-pencil",
                        path: "/exam-series/list",
                    },

                    {
                        title: "Study Planner",
                        icon: "pi-calendar-clock",
                        path: "/my-reminders",
                    },

                    {
                        title: "Counselling",
                        icon: "pi-check-square",
                        path: "/tasks",
                    },
                    {
                        title: "Contact Us",
                        icon: "pi-question-circle",
                        path: "/contact-us",
                    },
                    {
                        title: "My Profile",
                        icon: "pi-user",
                        path: `/manage-users/${id}/basics`,
                    },
                    {
                        title: "Psychometric Test",
                        icon: "pi-lightbulb",
                        path: `/stream-selection-test/about`,
                    },
                    {
                        title: "Policies",
                        icon: "pi-file-pdf",
                        path: "/policies",
                    },
                ],
            },
            {
                title: "Employee Corner",
                required_authority: AUTHORITIES.USE_EMPLOYEE_CORNER,
                operations: [
                    {
                        title: "Users",
                        icon: "pi-users",
                        required_authority: AUTHORITIES.USE_PAGE_USERS,
                        path: "/manage-users",
                    },
                    {
                        title: "Inquiries",
                        icon: "pi-address-book",
                        required_authority: AUTHORITIES.USE_PAGE_USERS,
                        path: "/manage-inquiries",
                    },
                    {
                        title: "My Expenses",
                        icon: "pi-images",
                        required_authority: AUTHORITIES.USE_PAGE_MY_EXPENSES,
                        path: "/my-expenses",
                    },
                    {
                        title: "Exams",
                        icon: "pi-question",
                        required_authority: AUTHORITIES.USE_PAGE_MANAGE_EXAMS,
                        path: "/manage-exam-series/exam-series",
                    },
                ],
            },
            {
                title: "Admin Corner",
                required_authority: AUTHORITIES.USE_ADMIN_CORNER,
                operations: [
                    {
                        title: "Branches",
                        icon: "pi-building-columns",
                        required_authority: AUTHORITIES.USE_PAGE_MANAGE_BRANCHES,
                        path: "/manage-branches",
                    },
                    {
                        title: "Device Requests",
                        icon: "pi-tablet",
                        required_authority: AUTHORITIES.USE_PAGE_MANAGE_STREAMING_DEVICES_REQUESTS,
                        path: "/manage-streaming-devices-requests",
                    },
                    {
                        title: "Financials",
                        icon: "pi-indian-rupee",
                        required_authority: AUTHORITIES.USE_PAGE_FINANCIALS,
                        path: "/financials",
                    },
                    {
                        title: "Revenue",
                        icon: "pi-money-bill",
                        required_authority: AUTHORITIES.USE_PAGE_FINANCIALS,
                        path: "/revenue",
                    },
                    {
                        title: "Exam",
                        icon: "pi-pencil",
                        path: "/manage-exam-series/exam-series",
                    },

                    {
                        title: "Analytics",
                        icon: "pi-chart-bar",
                        required_authority: AUTHORITIES.USE_PAGE_ANALYTICS,
                        path: "/manage-analytics",
                    },
                    {
                        title: "Chapterization",
                        icon: "pi-clone",
                        required_authority: AUTHORITIES.USE_PAGE_CHAPTERIZATION,
                        path: "/manage-chapter-types",
                    },
                    {
                        title: "Coupons",
                        icon: "pi-ticket",
                        required_authority: AUTHORITIES.USE_PAGE_COUPON_CODES,
                        path: "/manage-coupon-codes",
                    },
                    {
                        //stream-selection-test-results
                        title: "Psychometric Tests",
                        icon: "pi-ticket",
                        required_authority: AUTHORITIES.USE_PAGE_COUPON_CODES,
                        path: "/manage-stream-selection/configs",
                    },
                ],
            },
            {
                title: "Developer Corner",
                required_authority: AUTHORITIES.USE_DEVELOPER_CORNER,
                operations: [
                    {
                        title: "Configs",
                        icon: "pi-cog",
                        path: "/manage-branches",
                    },
                    {
                        title: "Roles",
                        icon: "pi-id-card",
                        path: "/manage-roles",
                    },
                    {
                        title: "Authorities",
                        icon: "pi-key",
                        path: "/manage-authorities",
                    },
                ],
            },
        ];

        return configOperations.reduce((acc, item) => {
            if (!!item?.required_authority && !authorities.includes(item?.required_authority)) {
                return acc;
            }

            const operations = item?.operations?.filter((operation) => !operation?.required_authority || authorities.includes(operation?.required_authority));
            if (operations?.length) {
                acc.push({ ...item, operations });
            }

            return acc;
        }, []);
    }, [authorities, id]);

    return (
        <div className={className}>
            {operationsSections?.map((section) => (
                <div className="border-round bg-gray-100 border-1 border-gray-300 mb-2" key={section?.title}>
                    <p className={`m-0 py-3 px-2 font-semibold ${TEXT_SUBTITLE}`}>{section?.title}</p>

                    <div className="grid grid-nogutter">
                        {section?.operations?.map((operation) => (
                            <div
                                className="col-3  flex flex-column gap-1 align-items-center p-2 "
                                key={operation?.title}
                                onClick={() => navigate(operation?.path)}
                            >
                                {/* <i className={`pi ${operation?.icon} border-circle bg-gray-800	p-3 text-white`} style={{ fontSize: "1.25rem" }}></i> */}
                                <i className={`pi ${operation?.icon} border-circle bg-gray-800 p-3 text-white ${ICON_SIZE}`}></i>
                                <p className={`p-0 m-0 text-center ${TEXT_SMALL}`}>{operation?.title}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
