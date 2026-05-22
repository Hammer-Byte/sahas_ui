import { Button } from "primereact/button";

export default function ExamAttendNavigation({ onBack, onNext, onSubmit, canGoBack, canGoNext, canSubmit }) {
    return (
        <div className="flex align-items-center justify-content-between gap-2 px-3 py-2 border-top-1 border-gray-200">
            <Button label="Back" icon="pi pi-arrow-left" severity="secondary" size="small" disabled={!canGoBack} onClick={onBack} />
            <Button
                label="Submit"
                icon="pi pi-check"
                severity="success"
                size="small"
                disabled={!canSubmit}
                onClick={onSubmit}
            />
            <Button label="Next" icon="pi pi-arrow-right" iconPos="right" severity="warning" size="small" disabled={!canGoNext} onClick={onNext} />
        </div>
    );
}
