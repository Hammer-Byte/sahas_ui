import { useLocalStorage } from "primereact/hooks";
import { useRef, useState } from "react";
import { Button } from "primereact/button";
import NoContent from "../common/NoContent";
import { TEXT_SMALL } from "../../style";

export default function VideoPlayer({ id, cdn_url }) {
    const [playBackTimes, setPlayBackTimes] = useLocalStorage({}, "videoPlayBacks");
    const videoRef = useRef(null);
    const [error, setError] = useState();
    const [showQualityDropdown, setShowQualityDropdown] = useState(false);
    const QUALITY_OPTIONS = ["Auto", "1080p", "720p", "480p", "360p"];

    if (error) return <NoContent />;

    return (
        <div className="p-3">
            <div className="relative w-full">
                <video
                    onError={() => setError(true)}
                    onPlay={() => !!playBackTimes[id] && (videoRef.current.currentTime = playBackTimes[id])}
                    width="100%"
                    ref={videoRef}
                    controls
                    autoPlay
                    playsInline
                    controlsList="nodownload"
                    disablePictureInPicture
                    onTimeUpdate={() => {
                        playBackTimes[id] = videoRef.current.currentTime;
                        setPlayBackTimes(playBackTimes);
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <source key={cdn_url} src={cdn_url} type="video/mp4" />
                </video>
                <div className="absolute top-0 right-0 m-2 flex flex-column align-items-end">
                    <Button
                        icon="pi pi-cog"
                        text
                        rounded
                        onClick={() => setShowQualityDropdown(!showQualityDropdown)}
                        pt={{
                            root: {
                                className: "w-2rem h-2rem p-0 flex align-items-center justify-content-center border-none border-round bg-black-alpha-50 text-white",
                            },
                            icon: { className: "text-white" },
                        }}
                    />
                    {showQualityDropdown && (
                        <div className="border-round min-w-min bg-black-alpha-90">
                            {QUALITY_OPTIONS.map((quality) => (
                                <div
                                    key={quality}
                                    className={`text-white px-3 py-2 hover:bg-white-alpha-20 ${TEXT_SMALL}`}
                                    onClick={() => setShowQualityDropdown(false)}
                                >
                                    {quality}
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
