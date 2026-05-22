import { useEffect, useState } from "react";
import { useInterval } from "primereact/hooks";
import { Tag } from "primereact/tag";
import { TEXT_LARGE } from "../../style";

export default function Timer({ minutes = 0, totalSeconds: totalSecondsProp, onTimeUp, className, tagValue = "Time Remaining" }) {
    const totalSeconds = totalSecondsProp ?? minutes * 60;
    const [seconds, setSeconds] = useState(totalSeconds);
    const [active, setActive] = useState(totalSeconds > 0);

    useEffect(() => {
        setSeconds(totalSeconds);
        setActive(totalSeconds > 0);
    }, [totalSeconds]);

    useInterval(
        () => {
            if (seconds > 0) {
                setSeconds((prev) => prev - 1);
            } else {
                setActive(false);
                if (onTimeUp) onTimeUp(true);
            }
        },
        1000,
        active,
    );

    if (!totalSeconds) return null;

    const formatTime = (total) => {
        const hours = Math.floor(total / 3600);
        const mins = Math.floor((total % 3600) / 60);
        const secs = total % 60;
        const pad = (n) => (n < 10 ? `0${n}` : `${n}`);

        if (hours > 0) {
            return `${hours}:${pad(mins)}:${pad(secs)}`;
        }

        return `${mins}:${pad(secs)}`;
    };

    const isRunningLow = seconds < totalSeconds * 0.2;

    return (
        <div
            className={`flex flex-column align-items-center gap-2 ${className} ${isRunningLow ? "fadeout animation-duration-1000 animation-iteration-infinite" : ""}`}
        >
            <span className={`${TEXT_LARGE} font-bold font-mono ${isRunningLow ? "text-red-500" : "text-primary"}`}>
                {formatTime(seconds)}
            </span>
            <Tag icon="pi pi-clock" severity={isRunningLow ? "danger" : "info"} value={isRunningLow ? "Hurry up!" : tagValue} className="px-3" />
        </div>
    );
}
