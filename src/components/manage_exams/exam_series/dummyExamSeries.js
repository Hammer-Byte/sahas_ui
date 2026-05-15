/** Placeholder courses until API wiring. */
export const DUMMY_COURSES = [
    { id: "course-sem3", title: "Semester 3" },
    { id: "course-sem2", title: "Semester 2" },
    { id: "course-prep", title: "Competitive Exam Prep" },
];

function iso(d) {
    return new Date(d).toISOString();
}

/** Seed data: one series tied to Sem 3 with four scheduled exams. */
export function getDummyExamSeries() {
    return [
        {
            id: "series-1",
            title: "Sem 3 — Mid-term exam series",
            courseId: "course-sem3",
            courseName: "Semester 3",
            note: "All exams are proctored on campus lab A.",
            createdOn: iso("2026-04-10T09:30:00"),
            createdBy: "Priya Sharma",
            exams: [
                { id: "exam-1", title: "Mathematics — Paper I", scheduledAt: iso("2026-06-02T10:00:00"), durationMinutes: 90 },
                { id: "exam-2", title: "Physics — Unit assessment", scheduledAt: iso("2026-06-04T14:30:00"), durationMinutes: 120 },
                { id: "exam-3", title: "Chemistry — Practical viva", scheduledAt: iso("2026-06-06T11:00:00"), durationMinutes: 45 },
                { id: "exam-4", title: "English — Written", scheduledAt: iso("2026-06-09T09:00:00"), durationMinutes: 180 },
            ],
        },
        {
            id: "series-2",
            title: "Sem 2 — Revision mocks",
            courseId: "course-sem2",
            courseName: "Semester 2",
            note: "",
            createdOn: iso("2026-05-01T16:00:00"),
            createdBy: "Admin",
            exams: [
                { id: "exam-5", title: "Mock Paper A", scheduledAt: iso("2026-05-15T10:00:00"), durationMinutes: 150 },
                { id: "exam-6", title: "Mock Paper B", scheduledAt: iso("2026-05-17T10:00:00"), durationMinutes: 150 },
            ],
        },
    ];
}
