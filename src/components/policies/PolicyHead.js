import { getReadableDate } from "../../utils";
import { TEXT_NORMAL, TEXT_SMALL } from "../../style";
import ProgressiveControl from "../common/ProgressiveControl";
import ConfirmationWrapper from "../common/ConfirmationWrapper";
import { Button } from "primereact/button";
import { useCallback, useState } from "react";
import { useAppContext } from "../../providers/ProviderAppContainer";
import HasRequiredAuthority from "../dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../../constants";

export default function PolicyHead({ id, title, updated_at, description, setPolicies, setDialogEditPolicy }) {
    const { requestAPI, showToast } = useAppContext();

    const [loading, setLoading] = useState();

    const deletePolicy = useCallback(() => {
        requestAPI({
            requestPath: `policies/${id}`,
            requestMethod: "DELETE",
            setLoading,
            parseResponseBody: false,
            onResponseReceieved: (_, responseCode) => {
                if (responseCode === 204) {
                    showToast({ severity: "success", summary: "Deleted", detail: "Policy Deleted", life: 1000 });
                    setPolicies((prev) => prev?.filter((policy) => policy?.id !== id));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Delete Policy !", life: 2000 });
                }
            },
        });
    }, [id, requestAPI, setPolicies, showToast]);

    return (
        <div className="flex align-items-center">
            <div className="flex-1 flex flex-column gap-2 align-items-start">
                <p className={`m-0 p-0 ${TEXT_NORMAL}`}>
                    {id}. {title}
                </p>
                {updated_at && (
                    <p className={`${TEXT_SMALL} m-0 p-0 font-medium text-color-secondary`}>
                        <i className={`${TEXT_SMALL} pi pi-calendar`}></i> Updated at {getReadableDate({ date: updated_at })}
                    </p>
                )}
            </div>
            <HasRequiredAuthority requiredAuthority={AUTHORITIES.UPDATE_POLICY}>
                <ProgressiveControl
                    loading={loading}
                    control={
                        <Button
                            className="w-2rem h-2rem mx-2"
                            icon="pi pi-pencil"
                            rounded
                            severity="warning"
                            onClick={() =>
                                setDialogEditPolicy((prev) => ({
                                    ...prev,
                                    visible: true,
                                    setPolicies,
                                    id,
                                    title,
                                    description,
                                }))
                            }
                        />
                    }
                />
            </HasRequiredAuthority>

            <HasRequiredAuthority requiredAuthority={AUTHORITIES.DELETE_POLICY}>
                <ProgressiveControl
                    loading={loading}
                    control={
                        <ConfirmationWrapper action={deletePolicy}>
                            <Button className="w-2rem h-2rem" icon="pi pi-trash" rounded severity="danger" />
                        </ConfirmationWrapper>
                    }
                />
            </HasRequiredAuthority>
        </div>
    );
}
