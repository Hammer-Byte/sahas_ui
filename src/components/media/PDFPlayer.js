import { useState, useEffect, useRef } from "react";

import { Document, Page } from "react-pdf";
import { saveAs } from "file-saver";
import { Button } from "primereact/button";
import { pdfjs } from "react-pdf";
import NoContent from "../common/NoContent";
import { TEXT_BADGE } from "../../style";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.worker.min.js`;

const PDF_PAGE_WIDTH = 595;

export default function PDFPlayer({ cdn_url, title, downloadable }) {
    const [numPages, setNumPages] = useState(null);
    const [scale, setScale] = useState(1.0);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const containerRef = useRef(null);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        adjustScaleToFit();
    };

    const adjustScaleToFit = () => {
        const container = containerRef.current;
        if (!container) return;

        const containerWidth = container.offsetWidth;
        setScale(Math.max(0.5, (containerWidth - 16) / PDF_PAGE_WIDTH));
    };

    useEffect(() => {
        const handleResize = () => adjustScaleToFit();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const zoomIn = () => setScale((prevScale) => prevScale + 0.2);
    const zoomOut = () => setScale((prevScale) => Math.max(0.5, prevScale - 0.2));

    const toggleFullScreenOrZoomOut = () => {
        const element = document.getElementById("pdf-container");

        if (isFullScreen) {
            const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;

            if (exitFullscreen) exitFullscreen.call(document);
            zoomOut();
        } else {
            const requestFullscreen =
                element.requestFullscreen || element.webkitRequestFullscreen || element.mozRequestFullScreen || element.msRequestFullscreen;

            if (requestFullscreen) requestFullscreen.call(element);
        }

        setIsFullScreen(!isFullScreen);
    };

    const disableRightClick = (e) => e.preventDefault();

    return cdn_url ? (
        <div id="pdf-container" ref={containerRef} className="flex flex-column flex-1 min-h-0 h-full">
            <div className="flex align-items-center justify-content-center bg-primary flex-shrink-0">
                {!!numPages && (
                    <span className={`${TEXT_BADGE} font-semibold text-white mr-2`}>
                        {numPages} {numPages === 1 ? "page" : "pages"}
                    </span>
                )}
                <Button icon="pi pi-search-minus" className="p-button-rounded p-button-text text-white" onClick={zoomOut} />
                <Button icon="pi pi-search-plus" className="p-button-rounded p-button-text text-white" onClick={zoomIn} />
                <Button
                    icon={isFullScreen ? "pi pi-window-minimize " : "pi pi-arrows-alt "}
                    className="p-button-rounded p-button-text text-white"
                    onClick={toggleFullScreenOrZoomOut}
                />
                {!!downloadable && <Button icon="pi pi-download" className="p-button-rounded p-button-text" onClick={() => saveAs(cdn_url, `${title}.pdf`)} />}
            </div>
            <div
                className="flex flex-column align-items-center flex-1 overflow-y-auto overflow-x-hidden bg-gray-200 min-h-0 py-2"
                onContextMenu={disableRightClick}
            >
                <Document file={cdn_url} onLoadSuccess={onDocumentLoadSuccess} onLoadError={(error) => console.error("Error loading PDF:", error)}>
                    {!!numPages &&
                        Array.from({ length: numPages }, (_, index) => (
                            <div key={`page_${index + 1}`} className="mb-2">
                                <Page pageNumber={index + 1} scale={scale} renderAnnotationLayer={false} renderTextLayer={false} />
                            </div>
                        ))}
                </Document>
            </div>
        </div>
    ) : (
        <NoContent />
    );
}
