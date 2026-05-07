import { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../../providers/ProviderAppContainer";
import Loading from "../common/Loading";
import Error from "../common/Error";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import Ask from "../manage_stream_selection/question_categories/Ask";
import NoContent from "../common/NoContent";
import { updateCurrentUser } from "../../redux/sliceUser";
import { KEY_GUEST } from "../../constants";
import { Title } from "chart.js";

export default function Attempt() {
    const { requestAPI, showToast, setApplicationBlocker } = useAppContext();
    const [loading, setLoading] = useState();
    const [questions, setQuestions] = useState();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState();
    const loggedInUser = useSelector((state) => state.stateUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        requestAPI({
            requestPath: `stream-selection-questions`,
            requestMethod: "GET",

            setLoading: setLoading,
            onResponseReceieved: (questions, responseCode) => {
                if (questions && responseCode === 200) {
                    setQuestions(questions);
                    setCurrentQuestionIndex(0);
                } else {
                    showToast({ severity: "error", summary: "Failed", detail: "Failed To Load Psychometric Test Questions !", life: 2000 });
                }
            },
        });

    }, []);

    const addStreamSelectionTest = () => requestAPI({
        requestPath: `stream-selection-tests`,
        requestMethod: "POST",
        requestHeaders: {
            [KEY_GUEST]: loggedInUser?.id,
        },
        requestPostBody: questions,
        setLoading:(loading)=>setApplicationBlocker(loading ? { title: "Processing Psychometric Test", message: "Your Psychometric Performance is Under Evaluation by Most Advance Ai & Psycologist Opinion By Considering All Aspects of Your Personality" } : loading),
        onResponseReceieved: ({ error, ...streamSelectionTestResult }, responseCode) => {
            if (responseCode === 201) {
                showToast({ severity: "success", summary: "Added", detail: "Psychometric Test Submitted", life: 2000 });
                dispatch(updateCurrentUser({ stream_selection_test_allowed: false }));
                navigate("../result", { replace: true, state: { streamSelectionTestResult } });
            } else {
                showToast({ severity: "error", summary: "Failed", detail: error || "Failed To Submit Psychometric Test !", life: 2000 });
            }
        },
    });
    const askNext = useCallback(() => {
        setCurrentQuestionIndex((prev) => (prev || 0) + 1);
    }, []);

    const askPrevious = useCallback(() => {
        setCurrentQuestionIndex((prev) => prev - 1);
    }, []);

    if (!loggedInUser?.stream_selection_test_allowed) {
        return (
            <div className="flex flex-column gap-3 align-items-center justify-content-center h-full p-3">
                <NoContent error="You are not allowed to take the Psychometric Test yet. Complete enrollment first." />
                <Button label="Go to enroll" severity="warning" outlined onClick={() => navigate("../enroll")} />
            </div>
        );
    }


    return (
        <div className="flex flex-column h-full min-h-0">

            {currentQuestionIndex === questions?.length - 1 && <Button
                    icon="pi pi-arrow-left"
                    className="w-11 align-self-center m-2 flex-shrink-0"
                onClick={addStreamSelectionTest}
                label="Submit"
                severity="warning"
            />}

            <div className="flex justify-content-between align-items-center bg-gray-100 p-2 shadow-2 flex-shrink-0">
                <Button disabled={currentQuestionIndex <= 0} onClick={askPrevious} size="small" text label="Previous" icon="pi pi-arrow-left" />
                <span>
                    {currentQuestionIndex + 1}/{questions?.length}
                </span>
                <Button disabled={currentQuestionIndex >= questions?.length - 1} onClick={askNext} size="small" text label="Next" icon="pi pi-arrow-right" iconPos="right" severity="warning" />
            </div>

            <div className="flex-1 flex flex-column min-h-0 overflow-hidden">
                {loading ? (
                    <Loading />
                ) : questions?.length ? (
                    <Ask
                        askNext={askNext}
                        askPrevious={askPrevious}
                        currentQuestionIndex={currentQuestionIndex}
                        {...questions[currentQuestionIndex]}
                        setQuestions={setQuestions}
                    />
                ) : (
                    <Error error="No Psychometric Test Questions Found" />
                )}
            </div>



        </div>
    );
}
