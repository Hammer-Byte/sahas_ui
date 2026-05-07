import { InputText } from "primereact/inputtext";
import { useCallback, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { classNames } from "primereact/utils";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { useDispatch } from "react-redux";
import { updateCurrentUser } from "../../redux/sliceUser";

export default function AskFullName({ id }) {
    const { requestAPI, showToast } = useAppContext();

    const [fullName, setFullName] = useState();
    const [loading, setLoading] = useState();

    const dispatch = useDispatch();

    const updateFullName = useCallback(() => {
        requestAPI({
            requestPath: `users/name`,
            requestMethod: "PATCH",
            requestPostBody: { id, full_name: fullName },
            setLoading: setLoading,
            onRequestFailure: () => showToast({ severity: "error", summary: "Failed", detail: "Failed To Update Name !", life: 2000 }),
            onResponseReceieved: (updatedUser, responseCode) => {
                if (responseCode === 200) {
                    showToast({
                        severity: "success",
                        summary: "Updated",
                        detail: `Name Updated`,
                        life: 1000,
                    });
                    dispatch(updateCurrentUser(updatedUser));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Update Name !", life: 2000 });
                }
            },
        });
    }, [dispatch, fullName, id, requestAPI, showToast]);

    return (
        <Card
            title="Add Your Name"
            subTitle="Critical Information Missing"
            header={<img alt="Card" src="https://primefaces.org/cdn/primereact/images/usercard.png" />}
            className="m-2"
            pt={{ content: classNames("text-right") }}
        >
            <p className="text-sm line-height-3">
                In Order To Continue With Sahas Smart Studies App - User is Required To Submit The Full Name. Sahas Smart Studies Respect The Privacy & Stores
                The Details For Internal Usage To Make User Expereice Better !
            </p>

            <Divider />

            <div className="p-inputgroup ">
                <span className="p-inputgroup-addon">
                    <i className="pi pi-user"></i>
                </span>
                <InputText value={fullName || ""} id="fullname" className="w-full" placeholder="Full Name" onChange={(e) => setFullName(e.target.value)} />
            </div>

            <Button loading={loading} className="mt-3" label="Save" icon="pi pi-check" severity="warning" onClick={updateFullName} />
        </Card>
    );
}
