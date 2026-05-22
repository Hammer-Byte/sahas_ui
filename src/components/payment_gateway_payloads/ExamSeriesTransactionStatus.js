import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { TEXT_LARGE, TEXT_NORMAL } from "../../style";

export default function ExamSeriesTransactionStatus({ examSeries }) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-column align-items-center m-3 border-1 border-round border-gray-300 px-2 py-4 gap-2 shadow-3 bg-white">
            <span className={`${TEXT_LARGE} font-semibold`}>Payment Was Succesful</span>
            {examSeries?.title && <span className={`${TEXT_NORMAL} text-color-secondary`}>{examSeries.title}</span>}
            <img src="/images/success.png" alt="success" className="w-6rem lg:w-8rem" />
            <Button
                icon="pi pi-arrow-right"
                iconPos="right"
                className="w-full"
                severity="warning"
                label="Go To Exam Series"
                onClick={() => navigate(`/exam-series/${examSeries?.id}`)}
            />
        </div>
    );
}
