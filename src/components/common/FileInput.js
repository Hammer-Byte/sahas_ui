import Preview from "./FileInput/Preview";
import PlaceHolder from "./FileInput/PlaceHolder";
import { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { applyToClipBoard } from "../../utils";

export default function FileInput({ className, label, type, cdn_url, setCDNUrl, disabled, source_accessible = true, capture }) {
    const [preview, setPreview] = useState();

    useEffect(() => {
        if (!!cdn_url) setPreview(cdn_url);
    }, [cdn_url]);

    return (
        <div className={` p-4 border-1 border-gray-300 border-round ${className} `}>
            {!!preview ? (
                <Preview type={type} disabled={disabled} preview={preview} setPreview={setPreview} setCDNUrl={setCDNUrl} label={label} />
            ) : (
                <PlaceHolder disabled={disabled} label={label} setCDNUrl={setCDNUrl} setPreview={setPreview} type={type} capture={capture} />
            )}

            {!!source_accessible && (
                <div className="p-inputgroup flex-1 mt-2">
                    <InputText value={cdn_url} className="p-inputtext-sm w-full" placeholder="Preview URL" onChange={(e) => setCDNUrl(e.target.value)} />
                    <Button icon="pi pi-copy" className="p-button-warning" onClick={() => applyToClipBoard(cdn_url)} />
                </div>
            )}
        </div>
    );
}
