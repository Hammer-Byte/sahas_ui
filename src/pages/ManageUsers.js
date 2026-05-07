import { useCallback, useState } from "react";
import PageTitle from "../components/common/PageTitle";
import { Outlet, useNavigate } from "react-router-dom";
import DialogAddUser from "../components/manage_users/DialogAddUser";
import { AUTHORITIES, KEY_AUTHENTICATION_TOKEN } from "../constants";
import HasRequiredAuthority from "../components/dependencies/HasRequiredAuthority";
import { useAppContext } from "../providers/ProviderAppContainer";
import { useDispatch } from "react-redux";
import { removeCurrentUser } from "../redux/sliceUser";

export default function ManageUsers() {
    const disaptch = useDispatch();

    const navigate = useNavigate();

    const { setApplicationBlocker } = useAppContext();

    const [dialogAddUser, setDialogAddUser] = useState({
        visible: false,
    });

    const closeDialogAddUser = useCallback(() => {
        setDialogAddUser((prev) => ({ ...prev, visible: false }));
    }, []);

    return (
        <div className="flex flex-column h-full overflow-hidden">
            <PageTitle
                title={"Manage Users"}
                action={
                    <div className="flex gap-3 align-items-center">
                        <HasRequiredAuthority requiredAuthority={AUTHORITIES.MANAGE_OTHER_USERS}>
                            <span
                                onClick={() => setDialogAddUser((prev) => ({ ...prev, visible: true, closeDialog: closeDialogAddUser }))}
                                className="pi pi-plus"
                            ></span>
                        </HasRequiredAuthority>

                        <i
                            className="pi pi-power-off"
                            onClick={() => {
                                setApplicationBlocker({ title: "Logging out", message: "Clearing Session..." });
                                localStorage.removeItem(KEY_AUTHENTICATION_TOKEN);
                                disaptch(removeCurrentUser());
                                navigate("/");
                                setApplicationBlocker(false);
                            }}
                        ></i>
                    </div>
                }
            />
            <div className="flex-1 min-h-0 overflow-hidden">
                <Outlet />
            </div>
            <DialogAddUser {...dialogAddUser} />
        </div>
    );
}
