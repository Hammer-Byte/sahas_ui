import { useCallback, useEffect, useRef, useState } from "react";
import { TEXT_SMALL } from "../../style";

const CONFIRM_TIMEOUT_MS = 3000;

export default function ConfirmationWrapper({ children, action }) {
    const [confirming, setConfirming] = useState(false);
    const timeoutRef = useRef();

    const clearConfirmTimeout = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const reset = useCallback(() => {
        clearConfirmTimeout();
        setConfirming(false);
    }, [clearConfirmTimeout]);

    useEffect(() => () => clearConfirmTimeout(), [clearConfirmTimeout]);

    const startConfirm = useCallback(
        (e) => {
            e.stopPropagation();
            clearConfirmTimeout();
            setConfirming(true);
            timeoutRef.current = setTimeout(reset, CONFIRM_TIMEOUT_MS);
        },
        [clearConfirmTimeout, reset],
    );

    const onConfirmClick = useCallback(
        (e) => {
            e.stopPropagation();
            reset();
            action?.();
        },
        [action, reset],
    );

    if (confirming) {
        return (
            <span className={`${TEXT_SMALL} text-red-500 font-semibold cursor-pointer`} onClick={onConfirmClick}>
                confirm ?
            </span>
        );
    }

    return (
        <span className="inline-flex cursor-pointer" onClickCapture={startConfirm}>
            {children}
        </span>
    );
}
