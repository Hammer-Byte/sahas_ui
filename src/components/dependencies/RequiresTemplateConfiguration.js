import { useDispatch, useSelector } from "react-redux";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { setTemplateConfig } from "../../redux/sliceTemplateConfig";
import { useEffect } from "react";


export default function RequiresTemplateConfiguration({ children }) {
    const { requestAPI, setApplicationBlocker } = useAppContext();

    const templateConfig = useSelector((state) => state.stateTemplateConfig);

    const dispatch = useDispatch();

    
    useEffect(() => {
        if (!templateConfig) {
            requestAPI({
                requestPath: "template-configs",
                setLoading: (loading) => setApplicationBlocker(loading ? { title: "Template Configuration", message: "Fetching Template Configuration..." } : loading),
                onRequestFailure: (error) =>
                    setApplicationBlocker({
                        icon: "images/error.png",
                        title: "No Template Configuration",
                        message: `Unable To Load Template Configuration - ${error}`,
                    }),
                onResponseReceieved: (templateConfig, responseCode) => {
                    if (templateConfig && responseCode === 200) {
                        return dispatch(setTemplateConfig(templateConfig));
                    }
                },
            });
            return;
        }

    }, [templateConfig, requestAPI, setApplicationBlocker, dispatch])

    if (templateConfig) { return children; }

}
