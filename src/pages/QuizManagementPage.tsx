import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface Question {
    id: number;
    text: string;
    correctAnswer: number | null;
    correctAnswer2: number | null;
    usedIn?: Array<{
        quizId: number;
        sessionId: number;
        sessionTitle: string;
    }>;
}

interface QuizQuestion {
    questionId: number;
    order: number;
    question: Question;
}

interface Quiz {
    id: number;
    sessionId: number;
    createdAt: string;
    session: {
        id: number;
        title: string;
        startsAt: string;
    };
    questions: QuizQuestion[];
}

export default function QuizManagementPage() {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingQuizId, setEditingQuizId] = useState<number | null>(null);
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);

    useEffect(() => {
        fetchQuizzes();
        fetchAllQuestions();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/events/1/sessions", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const sessions = await res.json();
                const quizzesData: Quiz[] = [];
                for (const session of sessions) {
                    if (session.fermiQuiz) {
                        const quizRes = await fetch(`/api/quizzes/session/${session.id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        if (quizRes.ok) {
                            const quizData = await quizRes.json();
                            quizzesData.push({
                                ...quizData,
                                session: {
                                    id: session.id,
                                    title: session.title,
                                    startsAt: session.startsAt,
                                },
                            });
                        }
                    }
                }
                setQuizzes(quizzesData);
            }
        } catch (err) {
            console.error("Failed to fetch quizzes:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllQuestions = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/quizzes/questions", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setAllQuestions(data);
            }
        } catch (err) {
            console.error("Failed to fetch questions:", err);
        }
    };

    const handleDelete = async (quizId: number) => {
        if (!confirm("Are you sure you want to delete this quiz?")) return;

        const token = localStorage.getItem("token");
        const res = await fetch(`/api/quizzes/${quizId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
            fetchQuizzes();
        } else {
            alert("Failed to delete quiz");
        }
    };

    const handleStartEdit = (quiz: Quiz) => {
        setEditingQuizId(quiz.id);
        setSelectedQuestions(quiz.questions.map(q => q.questionId));
    };

    const handleCancelEdit = () => {
        setEditingQuizId(null);
        setSelectedQuestions([]);
    };

    const handleToggleQuestion = (questionId: number) => {
        if (selectedQuestions.includes(questionId)) {
            setSelectedQuestions(selectedQuestions.filter(id => id !== questionId));
        } else {
            if (selectedQuestions.length < 10) {
                setSelectedQuestions([...selectedQuestions, questionId]);
            }
        }
    };

    const moveQuestionUp = (index: number) => {
        if (index === 0) return;
        const newOrder = [...selectedQuestions];
        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
        setSelectedQuestions(newOrder);
    };

    const moveQuestionDown = (index: number) => {
        if (index === selectedQuestions.length - 1) return;
        const newOrder = [...selectedQuestions];
        [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        setSelectedQuestions(newOrder);
    };

    const handleSaveEdit = async (quizId: number) => {
        if (selectedQuestions.length !== 10) {
            alert("Please select exactly 10 questions");
            return;
        }

        const token = localStorage.getItem("token");
        const res = await fetch(`/api/quizzes/${quizId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ questionIds: selectedQuestions }),
        });

        if (res.ok) {
            fetchQuizzes();
            handleCancelEdit();
        } else {
            alert("Failed to update quiz");
        }
    };

    return (
        <div className="page-wrapper">
            <header className="navbar">
                <span className="logo">SMP 2026</span>
                <div className="nav-right">
                    <Link to="/ohomepage" className="back-btn">
                        ← Dashboard
                    </Link>
                    <Link to="/login" className="logout-btn">
                        Logout
                    </Link>
                </div>
            </header>

            <main className="container">
                <h1>Quiz Management</h1>

                {loading ? (
                    <p>Loading quizzes...</p>
                ) : quizzes.length === 0 ? (
                    <p>No quizzes found.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
                        {quizzes.map((quiz) => (
                            <div key={quiz.id} style={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                padding: '20px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <div>
                                        <h2 style={{ margin: '0 0 8px 0' }}>{quiz.session.title}</h2>
                                        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                                            {new Date(quiz.session.startsAt).toLocaleString()}
                                        </p>
                                    </div>
                                    {editingQuizId !== quiz.id && (
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => handleStartEdit(quiz)}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#007bff',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(quiz.id)}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {editingQuizId === quiz.id ? (
                                    <div>
                                        <h3 style={{ marginBottom: '10px' }}>Edit Questions ({selectedQuestions.length}/10)</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                            <div>
                                                <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#666' }}>Available Questions</h4>
                                                <div style={{ maxHeight: '400px', overflowY: 'auto', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '6px' }}>
                                                    {allQuestions
                                                        .filter(q => !selectedQuestions.includes(q.id))
                                                        .map((q) => (
                                                            <div
                                                                key={q.id}
                                                                style={{
                                                                    padding: '8px',
                                                                    marginBottom: '6px',
                                                                    backgroundColor: 'white',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer'
                                                                }}
                                                                onClick={() => handleToggleQuestion(q.id)}
                                                            >
                                                                <p style={{ margin: 0, fontSize: '0.85rem' }}>{q.text}</p>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#666' }}>Selected Questions (Order matters!)</h4>
                                                <div style={{ maxHeight: '400px', overflowY: 'auto', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '6px' }}>
                                                    {selectedQuestions.length === 0 ? (
                                                        <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>Click questions to select</p>
                                                    ) : (
                                                        selectedQuestions.map((qId, index) => {
                                                            const question = allQuestions.find(q => q.id === qId);
                                                            if (!question) return null;
                                                            return (
                                                                <div
                                                                    key={qId}
                                                                    style={{
                                                                        padding: '8px',
                                                                        marginBottom: '6px',
                                                                        backgroundColor: 'white',
                                                                        border: '2px solid #2196f3',
                                                                        borderRadius: '4px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '8px'
                                                                    }}
                                                                >
                                                                    <div style={{
                                                                        width: '24px',
                                                                        height: '24px',
                                                                        backgroundColor: '#2196f3',
                                                                        color: 'white',
                                                                        borderRadius: '50%',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontSize: '0.8rem',
                                                                        fontWeight: 'bold',
                                                                        flexShrink: 0
                                                                    }}>
                                                                        {index + 1}
                                                                    </div>
                                                                    <p style={{ margin: 0, fontSize: '0.85rem', flex: 1 }}>{question.text}</p>
                                                                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                                                        <button
                                                                            onClick={() => moveQuestionUp(index)}
                                                                            disabled={index === 0}
                                                                            style={{
                                                                                width: '28px',
                                                                                height: '28px',
                                                                                backgroundColor: index === 0 ? '#e0e0e0' : '#f0f0f0',
                                                                                border: '1px solid #ddd',
                                                                                borderRadius: '4px',
                                                                                cursor: index === 0 ? 'not-allowed' : 'pointer',
                                                                                fontSize: '14px',
                                                                                opacity: index === 0 ? 0.3 : 1
                                                                            }}
                                                                        >
                                                                            ↑
                                                                        </button>
                                                                        <button
                                                                            onClick={() => moveQuestionDown(index)}
                                                                            disabled={index === selectedQuestions.length - 1}
                                                                            style={{
                                                                                width: '28px',
                                                                                height: '28px',
                                                                                backgroundColor: index === selectedQuestions.length - 1 ? '#e0e0e0' : '#f0f0f0',
                                                                                border: '1px solid #ddd',
                                                                                borderRadius: '4px',
                                                                                cursor: index === selectedQuestions.length - 1 ? 'not-allowed' : 'pointer',
                                                                                fontSize: '14px',
                                                                                opacity: index === selectedQuestions.length - 1 ? 0.3 : 1
                                                                            }}
                                                                        >
                                                                            ↓
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleToggleQuestion(qId)}
                                                                            style={{
                                                                                width: '28px',
                                                                                height: '28px',
                                                                                backgroundColor: '#f8d7da',
                                                                                border: '1px solid #f5c6cb',
                                                                                borderRadius: '4px',
                                                                                cursor: 'pointer',
                                                                                fontSize: '14px',
                                                                                color: '#721c24'
                                                                            }}
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => handleSaveEdit(quiz.id)}
                                                disabled={selectedQuestions.length !== 10}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: selectedQuestions.length === 10 ? '#28a745' : '#ccc',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: selectedQuestions.length === 10 ? 'pointer' : 'not-allowed'
                                                }}
                                            >
                                                Save Changes
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#6c757d',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h3 style={{ marginBottom: '10px' }}>Questions ({quiz.questions.length})</h3>
                                        <ol style={{ paddingLeft: '20px' }}>
                                            {quiz.questions
                                                .sort((a, b) => a.order - b.order)
                                                .map((q) => (
                                                    <li key={q.questionId} style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
                                                        {q.question.text}
                                                    </li>
                                                ))}
                                        </ol>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
