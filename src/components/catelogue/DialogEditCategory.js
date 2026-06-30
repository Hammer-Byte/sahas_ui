import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { FloatLabel } from "primereact/floatlabel";
import { useCallback, useState } from "react";
import { useAppContext } from "../../providers/ProviderAppContainer";
import TabHeader from "../common/TabHeader";
import { InputText } from "primereact/inputtext";
import FileInput from "../common/FileInput";
import { useOutletContext } from "react-router-dom";
import { TEXT_NORMAL, TEXT_TITLE } from "../../style";
import HasRequiredAuthority from "../dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../../constants";

export default function DialogEditCategory({ visible, closeDialog, ...props }) {
    const { requestAPI, showToast } = useAppContext();
    const { setCategories } = useOutletContext();

    const [category, setCategory] = useState(props);
    const [loading, setLoading] = useState();

    const editCategory = useCallback(() => {
        requestAPI({
            requestPath: `course-categories`,
            requestMethod: "PATCH",
            requestPostBody: category,
            setLoading: setLoading,
            onRequestFailure: () => showToast({ severity: "error", summary: "Failed", detail: "Failed To Update Category !", life: 2000 }),
            onResponseReceieved: ({ error, ...updatedCategory }, responseCode) => {
                if (updatedCategory && responseCode === 200) {
                    showToast({ severity: "success", summary: "Updated", detail: "Category Updated", life: 1000 });
                    setCategories((prev) => prev?.map((item) => (item?.id === props?.id ? updatedCategory : item)));
                    setCategory();
                    closeDialog();
                } else showToast({ severity: "error", summary: "Failed", detail: error || "Failed To Update Category !", life: 2000 });
            },
        });
    }, [category, closeDialog, props?.id, requestAPI, setCategories, showToast]);

    return (
        <Dialog
            header={`Edit ${props?.title}`}
            visible={visible}
            className="w-11"
            onHide={closeDialog}
            pt={{
                headertitle: { className: TEXT_TITLE },
                content: { className: "overflow-visible" },
            }}
        >
            <TabHeader className="pt-3" title="Edit Category" highlights={["Update Category Title", "Update Category Image"]} />

            <FloatLabel className="mt-5">
                <InputText
                    value={category?.title || ""}
                    id="title"
                    className="w-full"
                    onChange={(e) => setCategory((prev) => ({ ...prev, title: e.target.value }))}
                    disabled={loading}
                    pt={{
                        root: { className: TEXT_NORMAL },
                    }}
                />
                <label htmlFor="title" className={`${TEXT_NORMAL}`}>
                    Title
                </label>
            </FloatLabel>

            <FileInput
                className={"mt-3"}
                label="Product Category"
                type="image"
                cdn_url={category?.image}
                setCDNUrl={(cdn_url) => setCategory((prev) => ({ ...prev, image: cdn_url }))}
                disabled={loading}
                pt={{
                    root: { className: TEXT_NORMAL },
                }}
            />

            <HasRequiredAuthority requiredAuthority={AUTHORITIES.UPDATE_COURSE_CATEGORY}>
                <Button
                    className="mt-3"
                    label="Edit Category"
                    severity="warning"
                    loading={loading}
                    onClick={editCategory}
                    pt={{
                        label: { className: TEXT_NORMAL },
                    }}
                />
            </HasRequiredAuthority>
        </Dialog>
    );
}
