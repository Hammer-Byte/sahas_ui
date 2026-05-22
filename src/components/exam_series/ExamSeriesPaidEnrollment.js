import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Checkbox } from "primereact/checkbox";
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";
import PageTitle from "../common/PageTitle";
import Loading from "../common/Loading";
import NoContent from "../common/NoContent";
import ButtonPay from "../enroll/ButtonPay";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { getReadableDate } from "../../utils";
import { RUPEE } from "../../constants";
import { TEXT_LARGE, TEXT_NORMAL } from "../../style";

export default function ExamSeriesPaidEnrollment() {
    const { id: examSeriesId } = useParams();
    const navigate = useNavigate();
    const { requestAPI } = useAppContext();
    const { id: userId, phone, full_name } = useSelector((state) => state.stateUser);

    const [paymentGateWayPayLoad, setPaymentGateWayPayLoad] = useState();
    const [loading, setLoading] = useState();
    const [error, setError] = useState();
    const [termsAccepted, setTermsAccepted] = useState(false);

    useEffect(() => {
        if (!examSeriesId) return;

        requestAPI({
            requestPath: "exam-series/payment-gateway-payloads",
            requestMethod: "POST",
            requestPostBody: { exam_series_id: Number(examSeriesId) },
            setLoading,
            onRequestStart: setError,
            onRequestFailure: setError,
            onResponseReceieved: (payload, responseCode) => {
                if (payload && responseCode === 201) {
                    setPaymentGateWayPayLoad(payload);
                    setError();
                } else {
                    setError(payload?.error || "Unable to prepare payment for this exam series");
                }
            },
        });
    }, [examSeriesId, requestAPI]);

    return loading ? (
        <Loading message="Preparing For Payment Gateway" />
    ) : error ? (
        <NoContent error={error} />
    ) : paymentGateWayPayLoad ? (
        <div className="flex flex-column h-full">
            <PageTitle
                title={`Enroll - ${paymentGateWayPayLoad?.examSeries?.title || "Exam Series"}`}
                onBackPress={() => navigate(`/exam-series/${examSeriesId}`)}
            />

            <div className="flex flex-column gap-2 p-4 border-1 border-gray-300 m-2 border-round">
                {paymentGateWayPayLoad?.examSeries?.course_title && (
                    <div className={`flex align-items-center justify-content-between ${TEXT_NORMAL}`}>
                        <span>Course</span>
                        <span className="font-semibold">{paymentGateWayPayLoad.examSeries.course_title}</span>
                    </div>
                )}
                <div className={`flex align-items-center justify-content-between font-bold ${TEXT_LARGE}`}>
                    <span>Fees</span>
                    <span>
                        {paymentGateWayPayLoad?.examSeries?.fees} {RUPEE}
                    </span>
                </div>

                <Divider className="m-0 pt-2" />

                {paymentGateWayPayLoad?.transaction?.preTaxAmount !== paymentGateWayPayLoad?.examSeries?.fees && (
                    <div className="flex align-items-center justify-content-between font-semibold">
                        <span>Pre Tax</span>
                        <span>
                            {paymentGateWayPayLoad?.transaction?.preTaxAmount} {RUPEE}
                        </span>
                    </div>
                )}

                <div className={`flex align-items-center justify-content-between mt-2 ${TEXT_NORMAL}`}>
                    <span>CGST</span>
                    <span>
                        {paymentGateWayPayLoad?.transaction?.cgst} {RUPEE}
                    </span>
                </div>
                <div className={`flex align-items-center justify-content-between ${TEXT_NORMAL}`}>
                    <span>SGST</span>
                    <span>
                        {paymentGateWayPayLoad?.transaction?.sgst} {RUPEE}
                    </span>
                </div>

                <div className="flex align-items-center justify-content-between font-bold">
                    <span>Pay</span>
                    <span>
                        {paymentGateWayPayLoad?.transaction?.amount} {RUPEE}
                    </span>
                </div>
            </div>

            <div className="flex align-items-center gap-2 p-3 border-1 border-gray-300 m-2 border-round">
                <i className="pi pi-calendar"></i>
                <span className="flex-1">Series Schedule</span>
                <span className="font-bold text-right">
                    {getReadableDate({ date: paymentGateWayPayLoad?.examSeries?.start_at })} -{" "}
                    {getReadableDate({ date: paymentGateWayPayLoad?.examSeries?.end_at })}
                </span>
            </div>

            <div className="flex flex-column align-items-center mt-2 gap-3">
                <div className="flex align-items-center gap-2 mb-3">
                    <Checkbox id="exam-series-terms" checked={termsAccepted} invalid={!termsAccepted} onChange={(e) => setTermsAccepted(e.checked)} />
                    <label htmlFor="exam-series-terms" className={TEXT_NORMAL}>
                        I agree to the{" "}
                        <a href="/path-to-your-pdf.pdf" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                            Terms and Conditions
                        </a>
                    </label>
                </div>

                {(!phone || !full_name) && (
                    <Tag
                        onClick={() => navigate(`/manage-users/${userId}/basics`)}
                        className="fadein animation-duration-1000 animation-iteration-infinite"
                        icon="pi pi-exclamation-circle"
                        severity="danger"
                        value="Missing Contact Details"
                    />
                )}

                <ButtonPay {...paymentGateWayPayLoad} disabled={!termsAccepted || !phone || !full_name} icon="pi pi-wallet" />
            </div>
        </div>
    ) : (
        <NoContent error="Unable to enroll in this exam series" />
    );
}
