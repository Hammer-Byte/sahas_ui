import { Route, Routes } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import RequiresTemplateConfiguration from "../components/dependencies/RequiresTemplateConfiguration";
import HasRequiredAuthority from "../components/dependencies/HasRequiredAuthority";
import NotFound from "../pages/NotFound";
import Users from "../components/manage_users/Users";
import ManageUsers from "../pages/ManageUsers";
import User from "../components/manage_users/User";
import Basics from "../components/manage_users/user/Basics";
import Inquiries from "../components/manage_users/user/Inquiries";
import Enrollments from "../components/manage_users/user/Enrollments";
import Roles from "../components/manage_users/user/Roles";
import Wallet from "../components/manage_users/user/Wallet";
import ManageRoles from "../pages/ManageRoles";
import ManageAuthorities from "../pages/ManageAuthorities";
import Categories from "../components/catelogue/Categories";
import Courses from "../components/catelogue/Courses";
import Catelogue from "../pages/Catelogue";
import Course from "../pages/Course";
import Subjects from "../components/course/Subjects";
import { Chapters } from "../components/course/Chapters";
import ManageChapterTypes from "../pages/ManageChapterTypes";
import ManageCouponCodes from "../pages/ManageCouponCodes";
import CouponCodes from "../components/manage_coupon_codes/CouponCodes";
import CouponCodeCourses from "../components/manage_coupon_codes/CouponCodeCourses";
import EnrollPage from "../pages/Enroll";
import MediaCatalogue from "../components/course/MediaCatalogue";
import Media from "../pages/Media";
import { AUTHORITIES } from "../constants";
import MyCourses from "../pages/MyCourses";
import Revenue from "../pages/Revenue";
import Devices from "../components/manage_users/user/Devices";
import ChaptersTest from "../pages/ChaptersTest";
import Selection from "../components/chapter_test/Selection";
import Appear from "../components/chapter_test/Appear";
import Result from "../components/chapter_test/Result";
import Policies from "../pages/Policies";
import ManageInquiries from "../pages/ManageInquiries";
import GlobalNotes from "../components/manage_users/user/GlobalNotes";
import StreamSelectionTestResults from "../components/manage_users/user/StreamSelectionTestResults";
import ManageStreamSelection from "../pages/ManageStreamSelection";
import Questions from "../components/manage_stream_selection/question_categories/Questions";
import QRInvites from "../components/manage_stream_selection/QRInvites";
import QuestionCategories from "../components/manage_stream_selection/QuestionCategories";
import ContactUs from "../pages/ContactUs";
import RequiresAuthentication from "../components/dependencies/RequiresAuthentication";
import Tests from "../components/manage_stream_selection/Tests";
import Configs from "../components/manage_stream_selection/Configs";
import Suggestions from "../components/manage_stream_selection/Suggestions";
import ProcessGuestToken from "./ProcessGuestToken";
import Attempt from "../components/stream_selection_test/Attempt";
import Enroll from "../components/stream_selection_test/Enroll";
import TestResult from "../components/stream_selection_test/TestResult";
import Analysis from "../components/stream_selection_test/Analysis";
import RequiresGuestUser from "../components/dependencies/RequiresGuestUser";
import StreamSelectionTest from "../pages/StreamSelectionTest";
import About from "../components/stream_selection_test/About";
import PaymentGatewayPayLoad from "../pages/PaymentGatewayPayLoad";
import Exam from "../pages/Exam";
import ManageExams from "../pages/ManageExams";

export default function App() {


    return (
        <RequiresTemplateConfiguration>
            <Routes>

                    <Route element={<ProcessGuestToken />}>
                        <Route path="/stream-selection-test" element={<StreamSelectionTest />}>
                            <Route path="about" element={<About />} />
                            <Route element={<RequiresGuestUser />}>
                                <Route path="enroll" element={<Enroll />} />
                                <Route path="attempt" element={<Attempt />} />
                                <Route path="result" element={<TestResult />} />
                                <Route path="analysis" element={<Analysis />} />
                            </Route>
                        </Route>
                    </Route>


                    <Route path="/payment-gateway-payloads/:paymentGatewayPayloadId" element={<PaymentGatewayPayLoad />} />
                    <Route path="/contact-us" element={<ContactUs />} />

                    <Route element={<RequiresAuthentication />}>
                        <Route index element={<Dashboard />} />
                        <Route path="/policies" element={<Policies />} />
                        <Route path="/manage-users" element={<ManageUsers />}>
                            <Route
                                index
                                element={
                                    <HasRequiredAuthority showForBidden={true} requiredAuthority={AUTHORITIES.MANAGE_OTHER_USERS}>
                                        <Users />
                                    </HasRequiredAuthority>
                                }
                            />
                            <Route path=":userId" element={<User />}>
                                <Route path="basics" element={<Basics />} />
                                <Route
                                    path="inquiries"
                                    element={
                                        <HasRequiredAuthority showForBidden={true} requiredAuthority={AUTHORITIES.MANAGE_OTHER_USERS}>
                                            <Inquiries />
                                        </HasRequiredAuthority>
                                    }
                                />
                                <Route path="enrollments" element={<Enrollments />} />
                                <Route
                                    path="stream-selection-test-results"
                                    element={
                                        <HasRequiredAuthority showForBidden={true} requiredAuthority={AUTHORITIES.MANAGE_OTHER_USERS}>
                                            <StreamSelectionTestResults />
                                        </HasRequiredAuthority>
                                    }
                                />
                                <Route path="devices" element={<Devices />} />
                                <Route path="wallet" element={<Wallet />} />
                                <Route path="global-notes" element={<GlobalNotes />} />
                                <Route
                                    path="roles"
                                    element={
                                        <HasRequiredAuthority showForBidden={true} requiredAuthority={AUTHORITIES.MANAGE_OTHER_USERS}>
                                            <Roles />
                                        </HasRequiredAuthority>
                                    }
                                />
                            </Route>
                        </Route>
                        <Route
                            path="/manage-inquiries"
                            element={
                                <HasRequiredAuthority showForBidden={true} requiredAuthority={AUTHORITIES.USE_PAGE_INQUIRIES}>
                                    <ManageInquiries />
                                </HasRequiredAuthority>
                            }
                        />
                        <Route path="/course-categories" element={<Catelogue />}>
                            <Route index element={<Categories />} />
                            <Route path=":categoryId/courses" element={<Courses />} />
                        </Route>
                        <Route path="/courses/:courseId" element={<Course />}>
                            <Route path="subjects" element={<Subjects />} />
                            <Route path="subjects/:subjectId">
                                <Route path="chapters" element={<Chapters />} />
                                <Route path="chapters/:chapterId">
                                    <Route path="media" element={<MediaCatalogue />} />
                                </Route>
                            </Route>
                        </Route>
                        <Route path="/my-courses" element={<MyCourses />}></Route>
                        <Route path="/media-player/:mediaId" element={<Media />}></Route>
                        <Route path="/manage-chapter-types" element={<ManageChapterTypes />} />
                        <Route path="/chapters-test" element={<ChaptersTest />}>
                            <Route path="selection" element={<Selection />} />
                            <Route path="appear" element={<Appear />} />
                            <Route path="result" element={<Result />} />
                        </Route>
                        <Route path="/manage-coupon-codes" element={<ManageCouponCodes />}>
                            <Route index element={<CouponCodes />}></Route>
                            <Route path=":couponCodeId/courses" element={<CouponCodeCourses />} />
                        </Route>
                        <Route
                            path="/manage-roles"
                            element={
                                <HasRequiredAuthority showForBidden={true} requiredAuthority={AUTHORITIES.MANAGE_OTHER_USERS}>
                                    <ManageRoles />
                                </HasRequiredAuthority>
                            }
                        />
                        <Route
                            path="/manage-authorities"
                            element={
                                <HasRequiredAuthority showForBidden={true} requiredAuthority={AUTHORITIES.MANAGE_OTHER_USERS}>
                                    <ManageAuthorities />
                                </HasRequiredAuthority>
                            }
                        />

                        <Route path="/manage-stream-selection" element={<ManageStreamSelection />}>
                            <Route path="configs" element={<Configs />} />
                            <Route path="suggestions" element={<Suggestions />} />
                            <Route path="tests" element={<Tests />} />
                            <Route path="qr-invites" element={<QRInvites />} />
                            <Route path="question-categories">
                                <Route index element={<QuestionCategories />} />
                                <Route path=":id" element={<Questions />} />
                            </Route>
                        </Route>

                        <Route path="/enroll/:courseId" element={<EnrollPage />} />
                        <Route path="/revenue" element={<Revenue />} />

                        <Route path="/exam" element={<Exam />}>
                        </Route>
                        <Route path="/manage-exams" element={<ManageExams />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
            </Routes>
        </RequiresTemplateConfiguration>
    );
}
