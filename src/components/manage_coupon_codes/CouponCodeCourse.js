import { useCallback, useState } from "react";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { getReadableDate } from "../../utils";
import ProgressiveControl from "../common/ProgressiveControl";
import Detail from "../../components/common/Detail";
import DialogEditCouponCodeCourse from "./DialogEditCouponCodeCourse";
import HasRequiredAuthority from "../dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../../constants";
import { TEXT_NORMAL, TEXT_SMALL } from "../../style";

export default function CouponCodeCourse({
    id,
    title,
    updated_at,
    setCouponCodeCourses,
    index,
    discount,
    discount_type,
    validity_days,
    validity_date,
    validity_type,
    distributor_email,
    distributor_name,
    commision,
    commision_type,
}) {
    const { requestAPI, showToast } = useAppContext();

    const [deleting, setDeleting] = useState();

    const [dialogEditCouponCodeCourse, setDialogEditCouponCodeCourse] = useState({
        visible: false,
    });

    const closeDialogEditCouponCodeCourse = useCallback(() => {
        setDialogEditCouponCodeCourse((prev) => ({ ...prev, visible: false }));
    }, []);

    const deleteCouponCodeCourse = useCallback(() => {
        requestAPI({
            requestPath: `coupon-code-courses/${id}`,
            requestMethod: "DELETE",
            setLoading: setDeleting,
            parseResponseBody: false,
            onResponseReceieved: (_, responseCode) => {
                if (responseCode === 204) {
                    showToast({
                        severity: "success",
                        summary: "Deleted",
                        detail: `Coupon Code Course Deleted`,
                        life: 1000,
                    });
                    setCouponCodeCourses((prev) => prev?.filter((couponCodeCourse) => couponCodeCourse?.id !== id));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Delete Coupon Code Course !", life: 2000 });
                }
            },
        });
    }, [id, requestAPI, setCouponCodeCourses, showToast]);

    return (
        <div className={`flex gap-3 align-items-center border-1 border-gray-300 border-round py-2 px-3`}>
            <div className="flex flex-column flex-1 gap-2">
                <span className={`${TEXT_NORMAL} font-semibold`}>
                    {index + 1}. {title}
                </span>
                <div className="flex align-items-center gap-2 mt-2 justify-content-between">
                    <Detail className={"w-8rem"} icon="pi pi-money-bill" title={"Discount"} value={discount.concat(discount_type)} />
                    <Detail
                        className={"flex-1"}
                        icon="pi pi-calendar"
                        title={"Validity"}
                        value={validity_type === "DAYS" ? `${validity_days} Days` : getReadableDate({ date: validity_date, removeTime: true })}
                    />
                </div>
                <div className="flex align-items-center gap-2 mt-2 justify-content-between">
                    <Detail className={"w-8rem"} icon="pi pi-user" title={"Distributor"} value={distributor_name} />
                    <Detail className={"flex-1"} icon="pi pi-gift" title={"Commision"} value={commision.concat(commision_type)} />
                </div>

                <div className={`flex align-items-center gap-1 mt-2`}>
                    <i className={`pi pi-book ${TEXT_NORMAL}`}></i>
                    <span className={`m-0 p-0 ${TEXT_SMALL}`}>{`Last Updated At ${getReadableDate({ date: updated_at })}`}</span>
                </div>
            </div>
            <HasRequiredAuthority requiredAuthority={AUTHORITIES.UPDATE_COUPON_CODE_COURSES}>
                <i
                    className={`pi pi-pencil `}
                    onClick={() =>
                        setDialogEditCouponCodeCourse((prev) => ({
                            ...prev,
                            visible: true,
                            setCouponCodeCourses,
                            id,
                            title,
                            discount,
                            discount_type,
                            validity_days,
                            validity_date: new Date(validity_date),
                            validity_type,
                            distributor_email,
                            commision,
                            commision_type,
                            closeDialog: closeDialogEditCouponCodeCourse,
                        }))
                    }
                ></i>
            </HasRequiredAuthority>
            <HasRequiredAuthority requiredAuthority={AUTHORITIES.DELETE_COUPON_CODE_COURSES}>
                <ProgressiveControl loading={deleting} control={<i className={`pi pi-trash `} onClick={deleteCouponCodeCourse}></i>} />
            </HasRequiredAuthority>
            {dialogEditCouponCodeCourse?.visible && <DialogEditCouponCodeCourse {...dialogEditCouponCodeCourse} />}
        </div>
    );
}
