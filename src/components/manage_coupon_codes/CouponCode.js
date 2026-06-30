import { useCallback, useState } from "react";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { getReadableDate } from "../../utils";
import ProgressiveControl from "../common/ProgressiveControl";
import ConfirmationWrapper from "../common/ConfirmationWrapper";
import DialogEditCouponCode from "./DialogEditCouponCode";
import { useNavigate } from "react-router-dom";
import HasRequiredAuthority from "../dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../../constants";
import { TEXT_NORMAL, TEXT_SMALL } from "../../style";

export default function CouponCode({ id, code, active, updated_at, setCouponCodes }) {
    const { requestAPI, showToast } = useAppContext();

    const navigate = useNavigate();

    const [deleting, setDeleting] = useState();

    const [dialogEditCouponCode, setDialogEditCouponCode] = useState({
        visible: false,
    });

    const closeDialogEditCouponCode = useCallback(() => {
        setDialogEditCouponCode((prev) => ({ ...prev, visible: false }));
    }, []);

    const deleteCouponCode = useCallback(() => {
        requestAPI({
            requestPath: `coupon-codes/${id}`,
            requestMethod: "DELETE",
            setLoading: setDeleting,
            parseResponseBody: false,
            onResponseReceieved: (_, responseCode) => {
                if (responseCode === 204) {
                    showToast({
                        severity: "success",
                        summary: "Deleted",
                        detail: `Coupon Code Deleted`,
                        life: 1000,
                    });
                    setCouponCodes((prev) => prev?.filter((couponCode) => couponCode?.id !== id));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Delete Coupon Code !", life: 2000 });
                }
            },
        });
    }, [id, requestAPI, setCouponCodes, showToast]);

    return (
        <div
            className={`flex gap-3 align-items-center border-1 border-gray-300 border-round py-2 px-3 overflow-hidden text-white ${active ? "bg-green-500 " : "bg-red-500"
                }`}
        >
            <div className="flex flex-column flex-1 gap-2" onClick={() => navigate(`${id}/courses`)}>
                <span className={`${TEXT_NORMAL} font-semibold`}>
                    {id}. {code}
                </span>
                <div className={`flex align-items-center gap-1 `}>
                    <i className={`pi pi-book ${TEXT_NORMAL}`}></i>
                    <span className={`m-0 p-0 ${TEXT_SMALL}`}>{`Last Updated At ${getReadableDate({ date: updated_at })}`}</span>
                </div>
            </div>

            <HasRequiredAuthority requiredAuthority={AUTHORITIES.UPDATE_COUPON_CODE}>
                <i
                    className={`pi pi-pencil `}
                    onClick={() =>
                        setDialogEditCouponCode((prev) => ({
                            ...prev,
                            visible: true,
                            setCouponCodes,
                            id,
                            code,
                            active,
                            closeDialog: closeDialogEditCouponCode,
                        }))
                    }
                ></i>
            </HasRequiredAuthority>

            {
                <HasRequiredAuthority requiredAuthority={AUTHORITIES.DELETE_COUPON_CODE}>
                    <ProgressiveControl
                        loading={deleting}
                        control={
                            <ConfirmationWrapper action={deleteCouponCode}>
                                <i className="pi pi-trash" />
                            </ConfirmationWrapper>
                        }
                    />
                </HasRequiredAuthority>
            }
            {dialogEditCouponCode?.visible && <DialogEditCouponCode {...dialogEditCouponCode} />}
        </div>
    );
}
