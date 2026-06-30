import { useCallback, useState } from "react";

import Category from "./Category";
import { Divider } from "primereact/divider";
import OrderManager from "../common/OrderManager";
import { useOutletContext } from "react-router-dom";
import CategoriesHeader from "./CategoriesHeader";
import DialogEditCategory from "./DialogEditCategory";

export default function Categories() {
    const [updatingViewIndex, setUpdatingViewIndex] = useState();

    const [dialogEditCategory, setDialogEditCategory] = useState({
        visible: false,
    });

    const closeDialogEditCategory = useCallback(() => {
        setDialogEditCategory((prev) => ({ ...prev, visible: false }));
    }, []);

    const { categories, setCategories } = useOutletContext();

    return (
        <div className="flex-1 overflow-hidden flex flex-column">
            <CategoriesHeader {...{ categories, updatingViewIndex, setUpdatingViewIndex }} />

            <Divider />

            <OrderManager
                updatingViewIndex={updatingViewIndex}
                items={categories}
                setItems={setCategories}
                entity={"Categories"}
                itemTemplate={(item) => <Category setDialogEditCategory={setDialogEditCategory} {...item} updatingViewIndex={updatingViewIndex} />}
            />

            {dialogEditCategory?.visible && <DialogEditCategory closeDialog={closeDialogEditCategory} {...dialogEditCategory} />}
        </div>
    );
}
