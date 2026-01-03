import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { checkAuthAndRedirect } from "../utils/auth";
import "./quiz.css";

interface QuestionStats {
  questionId: number;
  questionText: string;
  correctAnswer: number | null;
  count: number;
  mean: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
}

export default function QuizResultsPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState<QuestionStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (checkAuthAndRedirect(navigate)) {
      fetchStatistics();
    }
  }, [quizId]);

  async function fetchStatistics() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`/api/quizzes/${quizId}/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setStats(await res.json());
      } else {
        alert("Error loading statistics");
      }
    } catch (error) {
      alert("Error: " + error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="quiz-container">Loading...</div>;

  return (
    <div className="quiz-container">
      <button className="btn-back" onClick={() => navigate("/quizlist")}>
        ← Back
      </button>

      <h1>Fermi Quiz Results</h1>

      {stats.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666", marginTop: "40px" }}>
          No responses yet
        </p>
      ) : (
        <div className="questions-stats">
          {stats.map((stat, index) => (
            <div key={stat.questionId} className="question-stat-card">
              <h3>
                Question {index + 1}: {stat.questionText}
              </h3>

              {stat.count === 0 ? (
                <p className="no-answers">No answers</p>
              ) : (
                <div className="stats-grid">
                  <div className="stat-item">
                    <h4>Participants</h4>
                    <div className="value">{stat.count}</div>
                  </div>
                  <div className="stat-item">
                    <h4>Mean</h4>
                    <div className="value">
                      {stat.mean !== null
                        ? stat.mean.toExponential(2)
                        : "N/A"}
                    </div>
                  </div>
                  <div className="stat-item">
                    <h4>Median</h4>
                    <div className="value">
                      {stat.median !== null
                        ? stat.median.toExponential(2)
                        : "N/A"}
                    </div>
                  </div>
                  <div className="stat-item">
                    <h4>Min</h4>
                    <div className="value">
                      {stat.min !== null ? stat.min.toExponential(2) : "N/A"}
                    </div>
                  </div>
                  <div className="stat-item">
                    <h4>Max</h4>
                    <div className="value">
                      {stat.max !== null ? stat.max.toExponential(2) : "N/A"}
                    </div>
                  </div>
                  {stat.correctAnswer !== null && (
                    <div className="stat-item correct-answer">
                      <h4>Correct Answer</h4>
                      <div className="value">
                        {stat.correctAnswer.toExponential(2)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
