import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import TabHeader from "../common/TabHeader";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { Button } from "primereact/button";
import DialogAssignCourse from "./DialogAssignCourse";
import Loading from "../common/Loading";
import NoContent from "../common/NoContent";
import CouponCodeCourse from "./CouponCodeCourse";

export default function CouponCodeCourses() {
    const { couponCodeId } = useParams();
    const { requestAPI } = useAppContext();

    const { couponCodes } = useOutletContext();

    const couponCode = useMemo(() => couponCodes?.find(({ id }) => id == couponCodeId), [couponCodeId, couponCodes]);

    const [couponCodeCourses, setCouponCodeCourses] = useState();

    const [loading, setLoading] = useState();
    const [error, setError] = useState();

    const [dialogAssignCourse, setDialogAssignCourse] = useState({
        coupon_code_id: couponCode?.id,
        visible: false,
    });

    const closeDialogAddCourse = useCallback(() => {
        setDialogAssignCourse((prev) => ({ ...prev, visible: false }));
    }, []);

    useEffect(() => {
        requestAPI({
            requestPath: `coupon-codes/${couponCodeId}/courses`,
            requestMethod: "GET",
            setLoading: setLoading,
            onRequestStart: setError,
            onRequestFailure: setError,
            onResponseReceieved: (couponCodeCourses, responseCode) => {
                if (couponCodeCourses && responseCode === 200) {
                    setCouponCodeCourses(couponCodeCourses);
                } else {
                    setError("Couldn't load Coupon Code Courses");
                }
            },
        });
    }, [couponCodeId, requestAPI]);

    return (
        <div className="flex-1 overflow-hidden flex flex-column min-h-0">
            <TabHeader
                className={"p-3 bg-gray-900 text-white"}
                title={`Assign Courses - ${couponCode?.code}`}
                highlights={[`Total ${couponCodeCourses?.length} Courses`]}
                actionItems={[
                    <Button
                        onClick={() =>
                            setDialogAssignCourse((prev) => ({
                                ...prev,
                                visible: true,
                                couponCodeId: couponCode?.id,
                                setCouponCodeCourses,
                                closeDialog: closeDialogAddCourse,
                                couponCodeCourses,
                            }))
                        }
                        icon="pi pi-list-check"
                        severity="info"
                    />,
                ]}
            />

            <div className="p-2 flex flex-column gap-2 flex-1 h-full min-h-0 overflow-y-scroll">
                {loading ? (
                    <Loading />
                ) : error ? (
                    <NoContent error={error} />
                ) : couponCodeCourses?.length ? (
                    couponCodeCourses.map((couponCodeCourse, index) => (
                        <CouponCodeCourse setCouponCodeCourses={setCouponCodeCourses} key={couponCodeCourse?.id} {...couponCodeCourse} index={index} />
                    ))
                ) : (
                    <NoContent />
                )}
            </div>

            {dialogAssignCourse?.visible && <DialogAssignCourse {...dialogAssignCourse} />}
        </div>
    );
}
