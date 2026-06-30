import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NoContent from "../components/common/NoContent";
import { useAppContext } from "../providers/ProviderAppContainer";
import Loading from "../components/common/Loading";
import PageTitle from "../components/common/PageTitle";
import TabHeader from "../components/common/TabHeader";
import { Button } from "primereact/button";
import MediaPlayer from "../components/media/MediaPlayer";
import HasRequiredAuthority from "../components/dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../constants";

export default function Media() {
    const { mediaId } = useParams();
    const { requestAPI, showToast } = useAppContext();
    const [loading, setLoading] = useState();
    const [media, setMedia] = useState();

    useEffect(() => {
        if (mediaId)
            requestAPI({
                requestPath: `media/${mediaId}`,
                requestMethod: "GET",
                setLoading: setLoading,
                onRequestFailure: () => showToast({ severity: "error", summary: "Failed", detail: "Failed To Load Media !", life: 2000 }),
                onResponseReceieved: ({ error, ...media }, responseCode) => {
                    if (media && responseCode === 200) {
                        setMedia(media);
                    } else {
                        showToast({ severity: "error", summary: "Failed", detail: error || "Failed To Load Media !", life: 3000 });
                    }
                },
            });
    }, [mediaId, requestAPI, showToast]);

    return (
        <div className="flex flex-column h-full overflow-hidden">
            <PageTitle title={`Watching ${media?.type}`} />
            <TabHeader
                className={"p-3"}
                title={media?.title}
                actionItems={[
                    <HasRequiredAuthority requiredAuthority={AUTHORITIES.MANAGE_COURSES}>
                        <a href={media?.cdn_url} target="_blank" rel="noopener noreferrer">
                            <span className="pi pi-download" />
                        </a>
                    </HasRequiredAuthority>,
                ]}
            />

            <div className="flex-1 min-h-0 flex flex-column">
                {loading ? <Loading /> : media ? <MediaPlayer {...media} /> : <NoContent />}
            </div>
        </div>
    );
}
