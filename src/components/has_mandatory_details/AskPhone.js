import { useCallback, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { classNames } from "primereact/utils";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { useDispatch } from "react-redux";
import { updateCurrentUser } from "../../redux/sliceUser";
import { InputNumber } from "primereact/inputnumber";

export default function AskPhone({ id }) {
    const { requestAPI, showToast } = useAppContext();

    const [phone, setPhone] = useState();
    const [loading, setLoading] = useState();

    const dispatch = useDispatch();

    const updatePhone = useCallback(() => {
        requestAPI({
            requestPath: `users/phone`,
            requestMethod: "PATCH",
            requestPostBody: { id, phone },
            setLoading: setLoading,
            onRequestFailure: () => showToast({ severity: "error", summary: "Failed", detail: "Failed To Update Phone !", life: 2000 }),
            onResponseReceieved: (updatedUser, responseCode) => {
                if (responseCode === 200) {
                    showToast({
                        severity: "success",
                        summary: "Updated",
                        detail: `Phone Updated`,
                        life: 1000,
                    });
                    dispatch(updateCurrentUser(updatedUser));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Update Phone !", life: 2000 });
                }
            },
        });
    }, [dispatch, phone, id, requestAPI, showToast]);

    return (
        <Card
            title="Add Your Contact Details"
            subTitle="Critical Information Missing"
            header={<img alt="Card" src="https://primefaces.org/cdn/primereact/images/usercard.png" />}
            className="m-2"
            pt={{ content: classNames("text-right") }}
        >
            <p className="text-sm line-height-3">
                In Order To Continue With Sahas Smart Studies App - User is Required To Submit The Contact Details. Sahas Smart Studies Respect The Privacy &
                Stores The Details For Internal Usage To Make User Expereice Better !
            </p>

            <Divider />

            <div className="p-inputgroup ">
                <span className="p-inputgroup-addon">
                    <i className="pi pi-user"></i>
                </span>
                <InputNumber useGrouping={false} value={phone || ""} id="phone" className="w-full" placeholder="Phone" onChange={(e) => setPhone(e.value)} />
            </div>

            <Button loading={loading} className="mt-3" label="Save" icon="pi pi-check" severity="warning" onClick={updatePhone} />
        </Card>
    );
}
