import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppContext } from "../providers/ProviderAppContainer";
import Loading from "../components/common/Loading";
import NoContent from "../components/common/NoContent";
import TransactionStatus from "../components/payment_gateway_payloads/TransactionStatus";
import ExamSeriesTransactionStatus from "../components/payment_gateway_payloads/ExamSeriesTransactionStatus";

const PAYMENT_GATEWAY_TYPE_EXAM_SERIES = "EXAM_SERIES";

export default function PaymentGatewayPayLoad() {
    const [paymentGatewayPayLoad, setPaymentGateWayPayLoad] = useState();
    const [loading, setLoading] = useState();
    const [error, setError] = useState();
    const { requestAPI } = useAppContext();
    const navigate = useNavigate();

    const { paymentGatewayPayloadId } = useParams();

    useEffect(() => {
        if (paymentGatewayPayloadId)
            requestAPI({
                requestPath: `payment-gateway-payloads/${paymentGatewayPayloadId}`,
                requestMethod: "GET",
                setLoading: setLoading,
                onRequestStart: setError,
                onRequestFailure: setError,
                onResponseReceieved: (paymentGatewayPayLoad, responseCode) => {
                    if (paymentGatewayPayLoad && responseCode === 200) {
                        setPaymentGateWayPayLoad(paymentGatewayPayLoad);

                        if (paymentGatewayPayLoad?.type === PAYMENT_GATEWAY_TYPE_EXAM_SERIES && paymentGatewayPayLoad?.transaction?.paid) {
                            navigate(`/exam-series/${paymentGatewayPayLoad.exam_series_id}`);
                        }
                    } else {
                        setError("Couldn't load Payment Result");
                    }
                },
            });
    }, [paymentGatewayPayloadId, requestAPI, navigate]);

    return (
        <div className="flex flex-column h-full justify-content-center p-4 surface-ground text-color">
            {loading ? (
                <Loading message="Loading Payment Status" />
            ) : error ? (
                <NoContent error={error} />
            ) : paymentGatewayPayLoad?.transaction?.paid ? (
                paymentGatewayPayLoad?.type === PAYMENT_GATEWAY_TYPE_EXAM_SERIES ? (
                    <ExamSeriesTransactionStatus examSeries={paymentGatewayPayLoad?.examSeries} />
                ) : (
                    <TransactionStatus {...paymentGatewayPayLoad} />
                )
            ) : (
                <NoContent error={"Payment Was Unsuccesful"} />
            )}
        </div>
    );
}
