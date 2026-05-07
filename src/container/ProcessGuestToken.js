import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { KEY_GUEST_TOKEN } from "../constants";
import { useAppContext } from "../providers/ProviderAppContainer";
import { setCurrentUser } from "../redux/sliceUser";

export default function ProcessGuestToken() {
    const { requestAPI, setApplicationBlocker } = useAppContext();

    const loggedInUser = useSelector((state) => state.stateUser);

    const dispatch = useDispatch();

    const clearGuestToken = useCallback(() => localStorage.removeItem(KEY_GUEST_TOKEN), []);

    useEffect(() => {
        if ( !loggedInUser && localStorage.getItem(KEY_GUEST_TOKEN)) {
            requestAPI({
                requestPath: "authentication-tokens",
                onRequestFailure: clearGuestToken,
                setLoading: (loading) => setApplicationBlocker(loading ? { message: "Validating Guest Token..." } : loading),
                onResponseReceieved: (user, responseCode) => {
                    if (user && responseCode === 200) {
                        dispatch(setCurrentUser(user));
                    } else {
                        clearGuestToken();
                    }
                },
            });
        }
    }, [ clearGuestToken, dispatch, loggedInUser, requestAPI, setApplicationBlocker]);

    return <Outlet />;
}
