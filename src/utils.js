import DeviceDetector from "device-detector-js";
import { EMPTY_VALUE } from "./constants";
import moment from "moment";

const deviceDetector = new DeviceDetector();

export function getReadableDate({ date = "", removeTime = false }) {
    const parsingDate = moment(date);
    return parsingDate.isValid() ? parsingDate.format(removeTime ? "DD-MM-YY" : "DD-MM-YY HH:mm") : EMPTY_VALUE;
}

export function getWriteableDate({ date = "", removeTime = false }) {
    const parsingDate = moment(date);
    return parsingDate.isValid() ? parsingDate.format(removeTime ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm") : EMPTY_VALUE;
}

export async function generateDeviceFingerprint() {
    const userAgent = navigator.userAgent;
    const device = deviceDetector.parse(userAgent);

    const type = device.device?.type || "Unknown Type";
    const brand = device.device?.brand || "Unknown Brand";
    const model = device.device?.model || "Unknown Model";
    const os = device.os?.name || "Unknown OS";
    const osVersion = device.os?.version || "";

    const screenRes = window.screen.width + window.screen.height;

    const hardwareFingerPrint = await sha256(
        [
            screenRes,
            global.screen.colorDepth,
            navigator.hardwareConcurrency,
            navigator.deviceMemory || "unknown",
            navigator.platform,
            navigator.maxTouchPoints,
            Intl.DateTimeFormat().resolvedOptions().timeZone,
        ].join("::"),
    );

    return btoa(unescape(encodeURIComponent(`${type} - ${brand} ${model} - ${os}(${osVersion}) - ${screenRes} | ${hardwareFingerPrint}`)));
}

async function sha256(input) {
    const buffer = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getFilterNameFormalized(input) {
    return input.charAt(0).toUpperCase().concat(input.slice(1));
}

export function getViewIndex(items) {
    return items?.length ? items[0]?.view_index - 1 : 0;
}

export function getRandomBackgroundColor() {
    const randomColorClasses = ["bg-red-500", "bg-orange-500", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-cyan-500", "bg-indigo-500"];
    return randomColorClasses[Math.floor(Math.random() * randomColorClasses.length)];
}

export function getFileAcceptType(type) {
    if (type === "video") {
        return ".mp4, .mkv";
    }

    if (type === "pdf") {
        return ".pdf"; // PDFs only
    }

    if (type === "sheet") {
        return ".csv"; // CSVs only
    }

    if (type === "audio") {
        return ".mp3"; // MP3 only
    }

    return ".png"; // PNG only
}

//resource getter
export const getMedia = (resource) => process.env.REACT_APP_BACKEND_SERVER.concat(process.env.REACT_APP_RESOURCES_PATH).concat(resource);

export async function uploadMedia({
    requestPath = "/",
    file,
    onRequestStart = false,
    onResponseReceieved = false,
    onRequestFailure = false,
    onRequestEnd = false,
    parseResponseBody = true,
    onProgress,
} = {}) {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", process.env.REACT_APP_BACKEND_SERVER.concat(process.env.REACT_APP_MEDIA_PATH).concat(requestPath));
    if (onRequestStart) await onRequestStart();

    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
            onProgress(Math.round((event.loaded / event.total) * 100));
        }
    };

    xhr.onload = () => {
        try {
            const jsonResponse = parseResponseBody ? JSON.parse(xhr.responseText) : xhr.responseText;
            if (onResponseReceieved) onResponseReceieved(jsonResponse, xhr.status);
        } catch (e) {
            if (onRequestFailure) onRequestFailure(e?.message);
        } finally {
            if (onRequestEnd) onRequestEnd();
        }
    };

    xhr.onerror = () => onRequestFailure("Network error");
    xhr.onabort = () => onRequestFailure("Upload aborted");

    xhr.send(formData);

    return xhr;
}

export const applyToClipBoard = (value) => navigator.clipboard.writeText(value);

export const hasRequiredAuthority = (authorities, requiredAuthority) => authorities.includes(requiredAuthority);
