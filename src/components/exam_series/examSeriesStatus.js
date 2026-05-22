function getStatusFromWindow({ start_at, end_at }) {
    const now = Date.now();
    const start = new Date(start_at).getTime();
    const end = new Date(end_at).getTime();

    if (now < start && now < end) {
        return { key: "upcoming", label: "Upcoming", severity: "info" };
    }

    if (now >= start && now <= end) {
        return { key: "ongoing", label: "Ongoing", severity: "success" };
    }

    if (now > start && now > end) {
        return { key: "finished", label: "Finished", severity: "secondary" };
    }

    return { key: "finished", label: "Finished", severity: "secondary" };
}

export function getExamSeriesStatus({ start_at, end_at }) {
    return getStatusFromWindow({ start_at, end_at });
}

export function getExamStatus({ start_at, end_at }) {
    return getStatusFromWindow({ start_at, end_at });
}

export function getSecondsUntil({ date }) {
    if (!date) return 0;
    return Math.max(0, Math.floor((new Date(date).getTime() - Date.now()) / 1000));
}

export const SECONDS_IN_24_HOURS = 24 * 60 * 60;

export function shouldShowCountdownUntilStart(secondsUntilStart) {
    return secondsUntilStart > 0 && secondsUntilStart < SECONDS_IN_24_HOURS;
}
