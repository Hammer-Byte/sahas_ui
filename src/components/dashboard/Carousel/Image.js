import { Button } from "primereact/button";
import { useCallback, useState } from "react";
import { useAppContext } from "../../../providers/ProviderAppContainer";
import { useDispatch } from "react-redux";
import { removeCarouselImage } from "../../../redux/sliceTemplateConfig";
import HasRequiredAuthority from "../../dependencies/HasRequiredAuthority";
import ConfirmationWrapper from "../../common/ConfirmationWrapper";
import { AUTHORITIES } from "../../../constants";

export default function Image({ id, click_link, source }) {
    const { requestAPI, showToast } = useAppContext();
    const [deleting, setDeleting] = useState();
    const dispatch = useDispatch();

    const deleteCarouselImage = useCallback(() => {
        requestAPI({
            requestPath: `template-configs/dashboard/carousel-images/${id}`,
            requestMethod: "DELETE",
            setLoading: setDeleting,
            parseResponseBody: false,
            onResponseReceieved: (_, responseCode) => {
                if (responseCode === 204) {
                    showToast({ severity: "success", summary: "Deleted", detail: "Carousel Image Deleted", life: 1000 });
                    dispatch(removeCarouselImage(id));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Deleted Carousel Image !", life: 2000 });
                }
            },
        });
    }, [dispatch, id, requestAPI, showToast]);

    return (
        <div className="relative p-2">
            <img
                onClick={() => {
                    if (click_link) window.open(click_link, "_blank");
                }}
                width="100%"
                className="border-round-lg shadow-2 block h-14rem "
                src={source}
                alt={source}
            />

            <HasRequiredAuthority requiredAuthority={AUTHORITIES.DELETE_CAROUSEL}>
                <ConfirmationWrapper action={deleteCarouselImage}>
                    <Button
                        className="absolute bottom-0 right-0 m-3"
                        icon="pi pi-trash"
                        rounded
                        outlined
                        severity="danger"
                        aria-label="Cancel"
                        loading={deleting}
                    />
                </ConfirmationWrapper>
            </HasRequiredAuthority>
        </div>
    );
}
