import { Toast } from "primereact/toast";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { generateDeviceFingerprint } from "../utils";
import { KEY_DEVICE_FINGER_PRINT, KEY_AUTHENTICATION_TOKEN, KEY_GUEST_TOKEN } from "../constants";

const ContextApp = createContext();

export const ProviderAppContainer = ({ children }) => {
    const [applicationBlocker, setApplicationBlocker] = useState();
    const [deviceFingerPrint, setDeviceFingerPrint] = useState();

    const toastRef = useRef(null);



    const showToast = useCallback((config) => {
        toastRef.current.show(config);
    }, []);


    //api requests
    const requestAPI = useCallback(
        async function ({
            requestHeaders = {},
            requestService = process.env.REACT_APP_API_PATH,
            requestPath,
            requestMethod = "GET",
            requestGetQuery = false,
            requestPostBody = false,
            onRequestStart = false,
            setLoading = false,
            onResponseReceieved = false,
            parseResponseBody = true,
            onRequestFailure = console.log,
            onRequestEnd = false,
            onUploadProgress = false,
        } = {}) {
            if (onRequestStart) onRequestStart();
            if (setLoading) setLoading(true);
            if (onUploadProgress) onUploadProgress(0);
            //append api backend service path
            requestPath = process.env.REACT_APP_BACKEND_SERVER.concat(requestService).concat(requestPath);

            //api specific path
            if (requestGetQuery) {
                requestPath = requestPath + "?";
                requestPath =
                    requestPath +
                    Object.keys(requestGetQuery)
                        .map((key) => {
                            if (Array.isArray(requestGetQuery[key])) {
                                return requestGetQuery[key]?.map((value) => encodeURIComponent(key) + "=" + encodeURIComponent(value)).join("&");
                            }
                            return encodeURIComponent(key) + "=" + encodeURIComponent(requestGetQuery[key]);
                        })
                        .join("&");
            }

            const fetchOptions = {
                // Adding headers to the request
                headers: {
                    ...(!(requestPostBody instanceof FormData) && { "Content-Type": "application/json" }),
                    [KEY_DEVICE_FINGER_PRINT]: deviceFingerPrint,
                    [KEY_AUTHENTICATION_TOKEN]: localStorage.getItem(KEY_AUTHENTICATION_TOKEN),
                    [KEY_GUEST_TOKEN]: localStorage.getItem(KEY_GUEST_TOKEN),
                    ...requestHeaders,
                },
                // Adding method type
                method: requestMethod.toUpperCase(),
            };

            if (requestPostBody) {
                fetchOptions.body = requestPostBody instanceof FormData ? requestPostBody : JSON.stringify(requestPostBody);
            }

            try {
                const response = await fetch(requestPath, fetchOptions);
                const jsonResponse = parseResponseBody ? await response.json() : response;
                if (response.status === 503) {
                    return setApplicationBlocker({
                        icon: "images/maintenance.gif",
                        title: "Under Maintenance",
                        message: "The application is currently under maintenance. Please try again later.",
                    });
                }
                if (onResponseReceieved) onResponseReceieved(jsonResponse, response.status);
            } catch (e) {
                if (onRequestFailure) onRequestFailure(e.toString());
            } finally {
                if (setLoading) setLoading(false);
            }
            if (onRequestEnd) onRequestEnd();
        },
        [deviceFingerPrint],
    );

    //generating Device FingerPrint
    if (!applicationBlocker && !deviceFingerPrint) {
        setApplicationBlocker({ icon: "images/device.gif", title: "Device Fingerprint", message: "Generating Device Fingerprint..." });
        generateDeviceFingerprint()
            .then(setDeviceFingerPrint)
            .catch(() => setApplicationBlocker({ icon: "images/error.png", message: "Failed To Generate Device Fingerprint" }))
            .finally(setApplicationBlocker);

        return;
    }




    return (
        <ContextApp.Provider
            value={{ showToast, requestAPI, applicationBlocker, setApplicationBlocker }}
        >
            <Toast ref={toastRef} position="top-center" />

            {applicationBlocker ? (
                <div className="h-full w-full flex align-items-center justify-content-center p-3  flex-column">
                    <img src={`${applicationBlocker?.icon || "images/loading.gif"}`} alt="loading" className="w-8rem h-8rem" loading="lazy" />
                    <span className="text-2xl font-bold">{applicationBlocker?.title || "Loading"}</span>
                    <span className="text-sm text-color-secondary mt-2">{applicationBlocker?.message || "Preparing application..."}</span>
                </div>
            ) : (
                deviceFingerPrint && children
            )}
        </ContextApp.Provider>
    );
};

// Custom hook to access the Toast context
export const useAppContext = () => useContext(ContextApp);
