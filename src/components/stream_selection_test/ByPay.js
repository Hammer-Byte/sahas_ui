import { useNavigate } from "react-router-dom";
import { TEXT_NORMAL, TEXT_SMALL } from "../../style";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { useDispatch } from "react-redux";

export default function ByPay() {
    const { requestAPI, showToast } = useAppContext();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [paymentGateWayPayLoad, setPaymentGateWayPayLoad] = useState();



    useEffect(() => {
        if (!paymentGateWayPayLoad)
            requestAPI({
                requestPath: `stream-selection-tests/payment-gateway-payloads`,
                requestMethod: "POST",
                onRequestFailure: () => showToast({ severity: "error", summary: "Failed", detail: "Failed To Load Payment Gateway Payload !", life: 2000 }),
                onResponseReceieved: (paymentGateWayPayLoad, responseCode) => {
                    if (paymentGateWayPayLoad && responseCode === 201) {
                        setPaymentGateWayPayLoad(paymentGateWayPayLoad);
                    }
                },
            });

    }, [requestAPI, paymentGateWayPayLoad]);



    return (
        <div className="flex flex-column align-items-center justify-content-center p-2 text-center">
            <img src="/images/pay_online.png" alt="forbidden" className="w-6rem lg:w-8rem" />
            <p className={`${TEXT_NORMAL} font-bold`}>Pay Online to Start</p>
            <p className={`${TEXT_SMALL} text-color-secondary text-center px-4`}>
                Complete online payment to start your Psychometric Test. UPI, Cards, Net Banking, and Wallet methods are supported.
            </p>


            {paymentGateWayPayLoad?.transaction?.amount > 0 ?
                <form action={paymentGateWayPayLoad?.paymentGateWay?.url} method="post">
                    <input type="hidden" name="key" value={paymentGateWayPayLoad?.paymentGateWay?.merchantKey} />
                    <input type="hidden" name="txnid" value={paymentGateWayPayLoad?.transaction?.id} />
                    <input type="hidden" name="productinfo" value={paymentGateWayPayLoad?.product} />
                    <input type="hidden" name="email" value={paymentGateWayPayLoad?.user?.email} />
                    <input type="hidden" name="firstname" value={paymentGateWayPayLoad?.user?.firstName} />
                    <input type="hidden" name="lastname" value={paymentGateWayPayLoad?.user?.lastName} />
                    <input type="hidden" name="phone" value={paymentGateWayPayLoad?.user?.phone} />
                    <input type="hidden" name="surl" value={paymentGateWayPayLoad?.transaction?.successURL} />
                    <input type="hidden" name="furl" value={paymentGateWayPayLoad?.transaction?.failureURL} />
                    <input type="hidden" name="amount" value={paymentGateWayPayLoad?.transaction?.amount} />
                    <input type="hidden" name="hash" value={paymentGateWayPayLoad?.transaction?.hash} />

                    <Button icon="pi pi-clipboard" label={`Pay ${paymentGateWayPayLoad?.transaction?.amount} Rs`} severity="warning" />
                </form>
                :

                <form action={"/api/temporary-stream-selection-test-enroll/stream-selection-test-allowed"} method="GET">
                    <Button icon="pi pi-clipboard" label={`Start Test For Free`} severity="warning" />
                </form>



            }






        </div>
    );
}
