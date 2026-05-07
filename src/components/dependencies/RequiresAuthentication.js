import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Authentication from "../../pages/Authentication";
import { Outlet } from "react-router-dom";
import { KEY_AUTHENTICATION_TOKEN } from "../../constants";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { setCurrentUser } from "../../redux/sliceUser";
import HasMandatoryDetails from "./HasMandatoryDetails";

export default function RequiresAuthentication() {
    const loggedInUser = useSelector((state) => state.stateUser);
    const dispatch = useDispatch();
    const { requestAPI, setApplicationBlocker } = useAppContext();

    const clearAuthenticationToken = useCallback(() => localStorage.removeItem(KEY_AUTHENTICATION_TOKEN), []);

    useEffect(() => {
        if (!loggedInUser && localStorage.getItem(KEY_AUTHENTICATION_TOKEN)) {
            requestAPI({
                requestPath: "authentication-tokens",
                setLoading: (loading) => setApplicationBlocker(loading ? { title: "Processing Authentication Token", message: "Restoring Your Session..." } : loading),
                onResponseReceieved: (user, responseCode) => {
                    if (user && responseCode === 200) {
                        dispatch(setCurrentUser(user));
                    } else {
                        clearAuthenticationToken();
                    }
                },
            });
        }
    }, [clearAuthenticationToken, dispatch, loggedInUser, requestAPI, setApplicationBlocker]);

    // Avoid auth page flicker while session restoration is still in progress.
    if (!loggedInUser && !!localStorage.getItem(KEY_AUTHENTICATION_TOKEN)) {
        return null;
    }

    if (loggedInUser) {
        return (
            <HasMandatoryDetails>
                <Outlet />
            </HasMandatoryDetails>
        );
    }

    return <Authentication />;
}
