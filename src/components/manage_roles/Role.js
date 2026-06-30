import Detail from "../common/Detail";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { useCallback, useState } from "react";
import { Button } from "primereact/button";
import { useDispatch } from "react-redux";
import { removeRole, replaceRole } from "../../redux/sliceTemplateConfig";
import DialogManageRoleAuthorities from "./DialogManageRoleAuthority";
import ProgressiveControl from "../common/ProgressiveControl";
import ConfirmationWrapper from "../common/ConfirmationWrapper";
import { Checkbox } from "primereact/checkbox";
import { AUTHORITIES } from "../../constants";
import HasRequiredAuthority from "../dependencies/HasRequiredAuthority";

export default function Role({ created_on, ...props }) {
    const { requestAPI, showToast } = useAppContext();
    const [deleting, setDeleting] = useState();
    const [updating, setUpdating] = useState();

    const [dialogManageRoleAuthorities, setDialogManageRoleAuthorities] = useState({
        visible: false,
        roleId: props?.id,
    });
    const closeDialogAddCourse = useCallback(() => {
        setDialogManageRoleAuthorities((prev) => ({ ...prev, visible: false }));
    }, []);

    const dispatch = useDispatch();

    const deleteRole = useCallback(() => {
        requestAPI({
            requestPath: `roles/${props?.id}`,
            requestMethod: "DELETE",
            setLoading: setDeleting,
            parseResponseBody: false,
            onResponseReceieved: (_, responseCode) => {
                if (responseCode === 204) {
                    showToast({ severity: "success", summary: "Deleted", detail: "Role Deleted", life: 1000 });
                    dispatch(removeRole(props?.id));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Deleted Role !", life: 2000 });
                }
            },
        });
    }, [dispatch, props?.id, requestAPI, showToast]);

    const updateRole = useCallback(
        (updatedKeys) => {
            requestAPI({
                requestPath: `roles`,
                requestMethod: "PATCH",
                requestPostBody: { ...props, ...updatedKeys },
                setLoading: setUpdating,
                onResponseReceieved: (updatedRole, responseCode) => {
                    if (updatedRole && responseCode === 200) {
                        showToast({ severity: "success", summary: "Updated", detail: "Role Updated Succesfully", life: 1000 });
                        // setEnrollments((prev) => prev.map((role) => (role?.id === props?.id ? updatedRole : role)));
                        dispatch(replaceRole(updatedRole));
                    } else {
                        showToast({ severity: "error", summary: "Failed", detail: "Failed To Updated Role !", life: 2000 });
                    }
                },
            });
        },
        [dispatch, props, requestAPI, showToast]
    );

    return (
        <div className="flex align-items-center gap-2">
            <Detail className={"flex-1"} icon="pi pi-angle-right" title={`Created At ${created_on}`} value={props?.title} />
            <HasRequiredAuthority requiredAuthority={AUTHORITIES.UPDATE_ROLES}>
                <ProgressiveControl
                    loading={updating}
                    control={<Checkbox checked={Boolean(props?.active)} onChange={({ checked }) => updateRole({ active: checked })} />}
                />
            </HasRequiredAuthority>

            <HasRequiredAuthority requiredAuthority={AUTHORITIES.READ_ROLES_AUTHORITIES}>
                <Button
                    className="w-2rem h-2rem"
                    icon="pi pi-list-check"
                    rounded
                    severity="warning"
                    onClick={() =>
                        setDialogManageRoleAuthorities((prev) => ({
                            ...prev,
                            visible: true,
                            closeDialog: closeDialogAddCourse,
                        }))
                    }
                />
            </HasRequiredAuthority>

            <HasRequiredAuthority requiredAuthority={AUTHORITIES.DELETE_ROLES}>
                <ProgressiveControl
                    loading={deleting}
                    control={
                        <ConfirmationWrapper action={deleteRole}>
                            <Button className="w-2rem h-2rem" icon="pi pi-trash" rounded severity="danger" />
                        </ConfirmationWrapper>
                    }
                />
            </HasRequiredAuthority>

            {dialogManageRoleAuthorities?.visible && <DialogManageRoleAuthorities {...dialogManageRoleAuthorities} />}
        </div>
    );
}
