import { useDispatch, useSelector } from "react-redux";
import AskFullName from "../has_mandatory_details/AskFullName";
import { useMemo } from "react";
import PageTitle from "../common/PageTitle";
import { removeCurrentUser } from "../../redux/sliceUser";
import { KEY_AUTHENTICATION_TOKEN } from "../../constants";
import AskPhone from "../has_mandatory_details/AskPhone";

export default function HasMandatoryDetails({ children }) {
    const { id, full_name, phone } = useSelector((state) => state.stateUser);

    const dispatch = useDispatch();

    const askMissingDetail = useMemo(() => {
        if (!full_name) {
            return <AskFullName id={id} />;
        }
        if (!phone) {
            return <AskPhone id={id} />;
        }
        return null;
    }, [full_name, id, phone]);

    if (askMissingDetail) {
        return (
            <div>
                <PageTitle
                    title={"Profile Information"}
                    onBackPress={() => {
                        localStorage.removeItem(KEY_AUTHENTICATION_TOKEN);
                        dispatch(removeCurrentUser());
                    }}
                />
                {askMissingDetail}
            </div>
        );
    }
    return children;
}
