import { getReadableDate } from "../../../utils";
import { Tag } from "primereact/tag";
import { TEXT_NORMAL, TEXT_SMALL } from "../../../style";
import IconButton from "../../common/IconButton";
import { useCallback, useState } from "react";
import { useAppContext } from "../../../providers/ProviderAppContainer";
import ProgressiveControl from "../../common/ProgressiveControl";
import HasRequiredAuthority from "../../dependencies/HasRequiredAuthority";
import { AUTHORITIES } from "../../../constants";
import { Divider } from "primereact/divider";

export default function ExamSeriesHead({ setExamSeries, id, index, createdOn, createdBy, title, courseName, note, exams = [] }) {
    const { showToast } = useAppContext();
    const [loading, setLoading] = useState(false);

    const deleteSeries = useCallback(() => {
        setLoading(true);
        setTimeout(() => {
            setExamSeries((prev) => prev?.filter((s) => s?.id !== id));
            showToast({ severity: "success", summary: "Removed", detail: "Exam series removed (dummy)", life: 1500 });
            setLoading(false);
        }, 400);
    }, [id, setExamSeries, showToast]);

    return (
        <div>
            <div className="flex justify-content-between align-items-center gap-2">
                <div className="flex flex-column gap-2 align-items-start">
                    <span className={`${TEXT_NORMAL} font-semibold`}>{title}</span>
                    <span className={`${TEXT_SMALL} text-color-secondary`}>
                        <i className={`${TEXT_SMALL} pi pi-calendar`} /> {getReadableDate({ date: createdOn })}
                    </span>
                    <span className={`${TEXT_SMALL} font-medium text-color-secondary`}>
                        {index}. By {createdBy}
                    </span>
                </div>

                <div className="flex flex-column gap-2 align-items-end">
                    <Tag
                        icon="pi pi-book"
                        severity="info"
                        value={courseName}
                        pt={{
                            icon: { className: TEXT_SMALL },
                            value: { className: TEXT_SMALL },
                        }}
                    />
                    <Tag
                        icon="pi pi-list"
                        severity="success"
                        value={`${exams?.length ?? 0} exam${exams?.length === 1 ? "" : "s"}`}
                        pt={{
                            icon: { className: TEXT_SMALL },
                            value: { className: TEXT_SMALL },
                        }}
                    />
                </div>

                <HasRequiredAuthority requiredAuthority={AUTHORITIES.USE_PAGE_MANAGE_EXAMS}>
                    <ProgressiveControl
                        loading={loading}
                        control={
                            <div className="flex flex-column gap-2">
                                <IconButton icon="pi-trash" onClick={deleteSeries} aria-label="Delete series" color="text-red-500" />
                            </div>
                        }
                    />
                </HasRequiredAuthority>
            </div>

            {!!note && (
                <div>
                    <Divider className="my-3 w-full" />
                    <li className={`${TEXT_SMALL} text-color-secondary font-light`}>{note}</li>
                </div>
            )}
        </div>
    );
}
