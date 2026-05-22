import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from "primereact/dropdown";
import Loading from "../common/Loading";
import NoContent from "../common/NoContent";
import ExamSeriesCard from "./ExamSeriesCard";
import { useAppContext } from "../../providers/ProviderAppContainer";
import { TEXT_SMALL } from "../../style";

export default function ExamSeriesList() {
    const { courses: allCourses = [] } = useSelector((state) => state.stateTemplateConfig?.global);
    const courses = useMemo(() => allCourses.filter(({ is_bundle }) => !is_bundle), [allCourses]);
    const { requestAPI } = useAppContext();
    const navigate = useNavigate();

    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [examSeries, setExamSeries] = useState();
    const [loadingExamSeries, setLoadingExamSeries] = useState();

    const selectedCourse = useMemo(
        () => courses.find((course) => course.id === selectedCourseId),
        [courses, selectedCourseId],
    );

    const loadExamSeriesByCourse = useCallback(
        (courseId) => {
            if (!courseId) {
                setExamSeries();
                return;
            }

            requestAPI({
                requestPath: `exam-series/courses/${courseId}`,
                requestMethod: "GET",
                setLoading: setLoadingExamSeries,
                onResponseReceieved: (examSeries, responseCode) => {
                    if (examSeries && responseCode === 200) {
                        setExamSeries(examSeries);
                    } else {
                        setExamSeries([]);
                    }
                },
            });
        },
        [requestAPI],
    );

    useEffect(() => {
        loadExamSeriesByCourse(selectedCourseId);
    }, [selectedCourseId, loadExamSeriesByCourse]);

    return (
        <>
            <FloatLabel className="m-3">
                <Dropdown
                    value={selectedCourseId}
                    inputId="course"
                    options={courses}
                    optionLabel="title"
                    optionValue="id"
                    className="w-full"
                    disabled={!courses?.length}
                    onChange={(e) => setSelectedCourseId(e.value)}
                    pt={{
                        label: { className: TEXT_SMALL },
                        item: { className: TEXT_SMALL },
                    }}
                />
                <label htmlFor="course" className={TEXT_SMALL}>
                    Select Course
                </label>
            </FloatLabel>

            <div className="flex-1 min-h-0 overflow-y-scroll flex flex-column gap-2 p-2">
                {!courses?.length ? (
                    <NoContent error="No courses available" />
                ) : !selectedCourseId ? (
                    <NoContent error="Select a course to view exam series" />
                ) : loadingExamSeries ? (
                    <Loading message="Loading Exam Series" />
                ) : examSeries?.length ? (
                    examSeries.map((series) => (
                        <div key={series?.id} className="cursor-pointer" onClick={() => navigate(`../${series.id}`)}>
                            <ExamSeriesCard {...series} />
                        </div>
                    ))
                ) : (
                    <NoContent error="No exam series found for this course" />
                )}
            </div>
        </>
    );
}
