import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { KEY_AUTHENTICATION_TOKEN } from "../constants";
import { useAppContext } from "../providers/ProviderAppContainer";
import { setCurrentUser } from "../redux/sliceUser";

export default function ProcessAuthenticationToken({children}) {
    const { requestAPI,  setApplicationBlocker } = useAppContext();

    const loggedInUser = useSelector((state) => state.stateUser);

    const dispatch = useDispatch();

    const clearAuthenticationToken = useCallback(() => localStorage.removeItem(KEY_AUTHENTICATION_TOKEN), []);


    useEffect(() => {
        if (!loggedInUser && localStorage.getItem(KEY_AUTHENTICATION_TOKEN)) {
            console.log(loggedInUser)

            requestAPI({
                requestPath: "authentication-tokens",
                onRequestFailure: clearAuthenticationToken,
                setLoading: (loading) => setApplicationBlocker(loading ? {title: "Processing Authentication Token", message: "Restoring Your Session..." } : loading),
                onResponseReceieved: (user, responseCode) => {
                    if (user && responseCode === 200) {
                        dispatch(setCurrentUser(user));
                    } else {
                        clearAuthenticationToken();
                    }
                },
            });
        }

    },[loggedInUser, requestAPI, setApplicationBlocker, dispatch, clearAuthenticationToken])

    return children;

}

