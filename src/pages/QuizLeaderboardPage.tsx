import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { checkAuthAndRedirect } from "../utils/auth";
import "./quiz.css";

interface QuestionScore {
  questionId: number;
  answer: number;
  score: number;
}

interface LeaderboardEntry {
  rank: number;
  participantId: number;
  participantName: string;
  participantEmail: string;
  participantType: string;
  totalScore: number;
  questionScores: QuestionScore[];
  submittedAt: string;
}

interface LeaderboardData {
  students: LeaderboardEntry[];
  teachers: LeaderboardEntry[];
  guests: LeaderboardEntry[];
}

export default function QuizLeaderboardPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>({ students: [], teachers: [], guests: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (checkAuthAndRedirect(navigate)) {
      fetchLeaderboard();
    }
  }, [quizId]);

  async function fetchLeaderboard() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/quizzes/${quizId}/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setLeaderboard(await res.json());
      } else {
        alert("Error loading leaderboard");
      }
    } catch (error) {
      alert("Error: " + error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="quiz-container">Loading...</div>;
  }

  const renderLeaderboardTable = (entries: LeaderboardEntry[], title: string, color: string) => {
    if (entries.length === 0) return null;

    return (
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ color, marginBottom: "20px" }}>{title}</h2>
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 2 8px rgba(0,0,0,0.1)",
          overflowX: "auto"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>Rank</th>
                <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>Participant</th>
                <th style={{ padding: "15px", textAlign: "center", fontWeight: "bold" }}>Total Score</th>
                <th style={{ padding: "15px", textAlign: "center", fontWeight: "bold" }}>Questions Scores</th>
                <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr
                  key={entry.participantId}
                  style={{
                    borderBottom: "1px solid #e0e0e0",
                    backgroundColor: index < 3 ? (
                      index === 0 ? "#fff9c4" :
                      index === 1 ? "#e3f2fd" :
                      "#f1f8e9"
                    ) : "white"
                  }}
                >
                  <td style={{ padding: "15px", fontWeight: "bold", fontSize: "18px" }}>
                    {entry.rank === 1 && "🥇"}
                    {entry.rank === 2 && "🥈"}
                    {entry.rank === 3 && "🥉"}
                    {entry.rank > 3 && entry.rank}
                  </td>
                  <td style={{ padding: "15px" }}>
                    <div style={{ fontWeight: "600" }}>{entry.participantName}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>{entry.participantEmail}</div>
                  </td>
                  <td style={{
                    padding: "15px",
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "20px",
                    color: entry.totalScore === 0 ? "#4caf50" : entry.totalScore < 10 ? "#ff9800" : "#f44336"
                  }}>
                    {entry.totalScore.toFixed(0)}
                  </td>
                  <td style={{ padding: "15px" }}>
                    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", justifyContent: "center" }}>
                      {entry.questionScores.map((qs, idx) => (
                        <span
                          key={idx}
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            backgroundColor: qs.score === 0 ? "#4caf50" : qs.score <= 2 ? "#ff9800" : "#f44336",
                            color: "white",
                            fontSize: "12px",
                            fontWeight: "600",
                            minWidth: "30px",
                            textAlign: "center"
                          }}
                        >
                          {qs.score}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "15px", fontSize: "14px", color: "#666" }}>
                    {new Date(entry.submittedAt).toLocaleString("de-DE")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="page-wrapper">
      <header className="navbar">
        <span className="logo">SMP 2026</span>
        <div className="nav-right">
          <Link to="/quizlist" className="back-btn">
            ← Back to Quizzes
          </Link>
          <Link to="/login" className="logout-btn">
            Logout
          </Link>
        </div>
      </header>

      <main className="container">
        <h1>Fermi Quiz Leaderboard</h1>

        {leaderboard.students.length === 0 && leaderboard.teachers.length === 0 && leaderboard.guests.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: "40px", color: "#666" }}>
            No participants have submitted yet
          </p>
        ) : (
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {renderLeaderboardTable(leaderboard.students, "🎓 Students Leaderboard", "#1976d2")}
            {renderLeaderboardTable(leaderboard.teachers, "👨‍🏫 Teachers Leaderboard", "#388e3c")}
            {renderLeaderboardTable(leaderboard.guests, "👥 Guests Leaderboard", "#f57c00")}

            <div style={{
              marginTop: "30px",
              padding: "20px",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px"
            }}>
              <h3 style={{ marginTop: 0 }}>Scoring System</h3>
              <ul style={{ marginBottom: 0 }}>
                <li><strong>0 points</strong> = Exact answer or very close</li>
                <li><strong>1-2 points</strong> = Good estimate</li>
                <li><strong>3-7 points</strong> = Far from correct answer</li>
                <li><strong>8 points</strong> = Very far or no answer</li>
                <li><strong>Lower total score = Better rank!</strong></li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
