import { Chip } from "primereact/chip";
import { Button } from "primereact/button";
import { useCallback, useState } from "react";
import { useAppContext } from "../../../providers/ProviderAppContainer";
import HasRequiredAuthority from "../../dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../../../constants";
import ProgressiveControl from "../../common/ProgressiveControl";
import ConfirmationWrapper from "../../common/ConfirmationWrapper";
import IconButton from "../../common/IconButton";
import { ICON_SIZE } from "../../../style";

export default function Question({ id, question, media_url, options, setQuestions, setDialogEditQuestion, updatingViewIndex }) {
    const [loading, setLoading] = useState();
    const { requestAPI, showToast } = useAppContext();

    const deletePolicy = useCallback(() => {
        requestAPI({
            requestPath: `stream-selection-questions/${id}`,
            requestMethod: "DELETE",
            setLoading,
            parseResponseBody: false,
            onResponseReceieved: (_, responseCode) => {
                if (responseCode === 204) {
                    showToast({ severity: "success", summary: "Deleted", detail: "Psychometric Test Question Deleted", life: 1000 });
                    setQuestions((prev) => prev?.filter((question) => question?.id !== id));
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Delete Psychometric Test Question !", life: 2000 });
                }
            },
        });
    }, [id, requestAPI, setQuestions, showToast]);

    <img className="w-full lg:w-6" src="/images/banner.jpg" alt="banner" />;

    return (
        <div className="border-1 p-2 gap-2 flex border-gray-300 border-round">
            {!!media_url && <img className="w-4rem" src={media_url} alt="media_url" />}
            <div className="flex-1 flex flex-column">
                <div className="flex gap-1">
                    <span className="font-semibold flex-1">{question}</span>
                    {!!updatingViewIndex && <IconButton icon={"pi-equals"} color={"text-indigo-800"} className={ICON_SIZE} />}
                    {!updatingViewIndex && (
                        <HasRequiredAuthority requiredAuthority={AUTHORITIES.UPDATE_STREAM_SELECTION_TEST_QUESTION}>
                            <ProgressiveControl
                                loading={loading}
                                control={
                                    <Button
                                        className="w-2rem h-2rem"
                                        icon="pi pi-pencil"
                                        rounded
                                        severity="warning"
                                        onClick={() =>
                                            setDialogEditQuestion((prev) => ({
                                                ...prev,
                                                visible: true,
                                                setQuestions,
                                                id,
                                                question,
                                                options: options?.map(({ option }) => option),
                                            }))
                                        }
                                    />
                                }
                            />
                        </HasRequiredAuthority>
                    )}
                    {!updatingViewIndex && (
                        <HasRequiredAuthority requiredAuthority={AUTHORITIES.DELETE_STREAM_SELECTION_TEST_QUESTION}>
                            <ProgressiveControl
                                loading={loading}
                                control={
                                    <ConfirmationWrapper action={deletePolicy}>
                                        <Button className="w-2rem h-2rem" icon="pi pi-trash" rounded severity="danger" />
                                    </ConfirmationWrapper>
                                }
                            />
                        </HasRequiredAuthority>
                    )}
                </div>

                <div className="card flex flex-wrap gap-2">
                    {options?.map(({ option }) => (
                        <Chip key={option} label={option} />
                    ))}
                </div>
            </div>
        </div>
    );
}
