"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../layout";
import { auth } from "@/lib/firebase";
import { getClientAuthToken } from "@/lib/demoAuth";
import Link from "next/link";
import toast from "react-hot-toast";
import PixelIcon from "@/components/ui/PixelIcon";

const CATEGORY_ICONS = {
  Polusi: "trash",
  "Daur Ulang": "recycle",
  Energi: "energy",
  Laut: "earth",
  Hutan: "tree",
  Climate: "spark",
  "Urban Eco": "dashboard",
  "Green Technology": "robot",
  "Air Bersih": "eco",
  Satwa: "butterfly",
};

const DAILY_TIPS = [
  "Bawa tumbler hari ini untuk mengurangi botol sekali pakai.",
  "Pisahkan sampah organik dan anorganik sebelum malam.",
  "Cabut charger yang tidak dipakai untuk hemat energi.",
];

function getRarity(article) {
  return article.rarity || (article.difficulty === "Hard" ? "Epic" : article.difficulty === "Medium" ? "Rare" : "Common");
}

export default function EducationPage() {
  const authContext = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [openedAt, setOpenedAt] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [articleProgress, setArticleProgress] = useState({});

  useEffect(() => {
    if (!authContext?.loading && !authContext?.user) router.push("/login");
  }, [authContext?.user, authContext?.loading, router]);

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    try {
      setBookmarkedIds(JSON.parse(localStorage.getItem("ecoquest:bookmarks") || "[]"));
      setArticleProgress(JSON.parse(localStorage.getItem("ecoquest:article-progress") || "{}"));
    } catch (_) {
      setBookmarkedIds([]);
      setArticleProgress({});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ecoquest:bookmarks", JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  useEffect(() => {
    localStorage.setItem("ecoquest:article-progress", JSON.stringify(articleProgress));
  }, [articleProgress]);

  const loadArticles = async () => {
    setLoadingArticles(true);
    try {
      const res = await fetch("/api/articles");
      if (!res.ok) throw new Error("Failed to load articles");
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error("Failed to load articles:", error);
      toast.error("Gagal memuat artikel.");
    } finally {
      setLoadingArticles(false);
    }
  };

  const openArticle = (article) => {
    setSelectedArticle(article);
    setOpenedAt(Date.now());
    setArticleProgress((current) => ({
      ...current,
      [article.id]: Math.max(current[article.id] || 0, 35),
    }));
    setQuiz(null);
    setAnswers([]);
    setQuizResult(null);
    loadQuiz(article.id);
  };

  const toggleBookmark = (articleId) => {
    setBookmarkedIds((current) =>
      current.includes(articleId)
        ? current.filter((id) => id !== articleId)
        : [...current, articleId]
    );
  };

  const loadQuiz = async (articleId) => {
    try {
      const res = await fetch(`/api/articles/quiz?articleId=${encodeURIComponent(articleId)}`);
      const data = await res.json();
      setQuiz(data.quiz || null);
      setAnswers(new Array(data.quiz?.questions?.length || 0).fill(null));
    } catch (error) {
      console.error("Failed to load quiz:", error);
    }
  };

  const completeReading = async () => {
    if (!selectedArticle || completing) return;
    setCompleting(true);

    try {
      const token = await getClientAuthToken(authContext?.user || auth.currentUser);
      const readingSecondsDelta = Math.max(1, Math.floor((Date.now() - openedAt) / 1000));
      const res = await fetch("/api/articles/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          articleId: selectedArticle.id,
          readingSecondsDelta,
          completed: true,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.reason || data.error || "Failed to complete article");

      if (data.rewardGranted) {
        toast.success(`Knowledge unlocked! +${data.reward?.ecoPoints || 0} EcoPoints`);
      } else {
        toast.success("Progress membaca tersimpan.");
      }
      setArticleProgress((current) => ({ ...current, [selectedArticle.id]: 100 }));

      setSelectedArticle(null);
      setOpenedAt(null);
    } catch (error) {
      console.error("Failed to complete reading:", error);
      toast.error("Baca sebentar lagi untuk membuka reward.");
    } finally {
      setCompleting(false);
    }
  };

  const submitQuiz = async () => {
    if (!selectedArticle || !quiz) return;
    try {
      const token = await getClientAuthToken(authContext?.user || auth.currentUser);
      const res = await fetch("/api/articles/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ articleId: selectedArticle.id, answers }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.reason || data.error || "Quiz failed");
      setQuizResult(data);
      if (data.passed) {
        setArticleProgress((current) => ({
          ...current,
          [selectedArticle.id]: Math.max(current[selectedArticle.id] || 0, 82),
        }));
      }
      toast.success(data.rewardGranted ? `Quiz lulus! +${data.reward?.ecoPoints || 0} EcoPoints` : data.passed ? "Quiz lulus." : "Quiz belum lulus.");
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast.error("Gagal mengirim quiz.");
    }
  };

  const categories = useMemo(() => ["Semua", ...new Set(articles.map((article) => article.category).filter(Boolean))], [articles]);
  const filteredArticles = articles.filter((article) => {
    const content = `${article.title || ""} ${article.summary || ""} ${article.content || ""}`.toLowerCase();
    return content.includes(searchTerm.toLowerCase()) && (selectedCategory === "Semua" || article.category === selectedCategory);
  });
  const featured = filteredArticles[0] || articles[0];
  const totalReward = articles.reduce((sum, article) => sum + (article.readingReward?.xp || article.readingReward?.ecoPoints || 15), 0);
  const quizAnsweredCount = answers.filter((answer) => answer !== null).length;
  const quizInstantScore = quiz?.questions?.reduce((sum, question, index) => (
    sum + (Number(answers[index]) === question.answerIndex ? 1 : 0)
  ), 0) || 0;
  const quizStreak = quizInstantScore;

  if (authContext?.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex justify-center animate-bounce-slow">
            <PixelIcon type="book" className="is-large" />
          </div>
          <p className="font-pixel text-sm text-eco-400 animate-pulse">Loading archive...</p>
        </div>
      </div>
    );
  }

  if (!authContext?.user) return null;

  return (
    <div className="education-terminal min-h-screen px-4 py-8 max-w-7xl mx-auto">
      <div className="education-hero">
        <div>
          <span className="education-kicker">ECO ARCHIVE TERMINAL</span>
          <h1>Education Hub</h1>
          <p>Belajar, jawab quiz, kumpulkan XP, dan naikkan knowledge rank EcoWarrior.</p>
        </div>
        <div className="education-rank-card">
          <PixelIcon type="book" className="is-large" />
          <div>
            <span>Knowledge Rank</span>
            <strong>Seedling Scholar</strong>
            <small>{articles.length} modules / {totalReward} XP pool</small>
          </div>
        </div>
      </div>

      <div className="education-console-grid">
        <section className="education-featured-panel">
          <div className="education-panel-head">
            <span>FEATURED CODEX</span>
            <b>{featured?.category || "Eco"}</b>
          </div>
          {featured && (
            <button type="button" onClick={() => openArticle(featured)} className="education-featured-card">
              <PixelIcon type={CATEGORY_ICONS[featured.category] || "book"} className="is-large" />
              <div>
                <h2>{featured.title}</h2>
                <p>{featured.summary}</p>
                <span>{featured.readTime || "5 menit"} | +{featured.readingReward?.xp || 15} XP | {getRarity(featured)}</span>
              </div>
            </button>
          )}
        </section>

        <aside className="education-side-panel">
          <div className="education-panel-head">
            <span>DAILY ECO TIP</span>
            <b>ONLINE</b>
          </div>
          {DAILY_TIPS.map((tip, index) => (
            <div key={tip} className="education-tip">
              <PixelIcon type={index === 0 ? "leaf" : index === 1 ? "recycle" : "energy"} className="is-tiny" />
              <span>{tip}</span>
            </div>
          ))}
        </aside>
      </div>

      <div className="education-filter-bar">
        <div className="education-search">
          <PixelIcon type="about" className="is-tiny" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search knowledge module..." />
        </div>
        <div className="education-category-list">
          {categories.map((category) => (
            <button key={category} type="button" onClick={() => setSelectedCategory(category)} className={selectedCategory === category ? "is-active" : ""}>
              {category}
            </button>
          ))}
        </div>
      </div>

      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/76 backdrop-blur-sm">
          <div className="education-reader animate-slide-up">
            <div className="education-reader-head">
              <PixelIcon type={CATEGORY_ICONS[selectedArticle.category] || "book"} className="is-large" />
              <button onClick={() => setSelectedArticle(null)} aria-label="Tutup artikel">x</button>
            </div>
            <span className="education-rarity">{selectedArticle.category} | {getRarity(selectedArticle)} | {selectedArticle.difficulty || "Easy"}</span>
            <h2>{selectedArticle.title}</h2>
            <p className="education-reader-reward">Reward: +{selectedArticle.readingReward?.ecoPoints || 15} EP / +{selectedArticle.readingReward?.xp || 15} XP</p>
            <div className="education-reader-content">{selectedArticle.content}</div>

            {quiz && (
              <div className="education-quiz">
                <div className="education-quiz-head">
                  <div>
                    <span>KNOWLEDGE CHECK</span>
                    <h3>Quiz Edukasi</h3>
                  </div>
                  <div className="education-quiz-combo">
                    <b>{quizStreak}x</b>
                    <small>combo</small>
                  </div>
                </div>
                <div className="education-quiz-status">
                  <span>{quizAnsweredCount}/{quiz.questions.length} answered</span>
                  <span>Pass {quiz.passScore || quiz.questions.length}/{quiz.questions.length}</span>
                  <b>+{quiz.reward?.xp || 30} XP</b>
                </div>
                {quiz.questions.map((question, questionIndex) => (
                  <div key={question.id} className="education-question">
                    <p>{question.question}</p>
                    {question.options.map((option, optionIndex) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          const next = [...answers];
                          next[questionIndex] = optionIndex;
                          setAnswers(next);
                        }}
                        className={[
                          answers[questionIndex] === optionIndex ? "is-selected" : "",
                          answers[questionIndex] !== null && question.answerIndex === optionIndex ? "is-correct" : "",
                          answers[questionIndex] === optionIndex && question.answerIndex !== optionIndex ? "is-wrong" : "",
                        ].filter(Boolean).join(" ")}
                      >
                        {option}
                      </button>
                    ))}
                    {answers[questionIndex] !== null && (
                      <div className={`education-answer-feedback ${answers[questionIndex] === question.answerIndex ? "is-correct" : "is-wrong"}`}>
                        <strong>{answers[questionIndex] === question.answerIndex ? "Correct" : "Try again"}</strong>
                        <span>{question.explanation || quizResult?.explanations?.[questionIndex]}</span>
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={submitQuiz} disabled={quizAnsweredCount < quiz.questions.length} className="education-quiz-submit disabled:opacity-50">
                  Submit Quiz
                </button>
                {quizResult && (
                  <div className={`education-quiz-result ${quizResult.passed ? "is-pass" : "is-fail"}`}>
                    <PixelIcon type={quizResult.passed ? "badge" : "about"} className="is-tiny" />
                    <div>
                      <strong>{quizResult.passed ? "Badge progress unlocked" : "Belum lulus"}</strong>
                      <span>Skor: {quizResult.score}/{quizResult.total} | Reward {quizResult.rewardGranted ? `+${quizResult.reward?.ecoPoints || 0} EP` : "sudah / belum terbuka"}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="education-reader-footer">
              <span>Minimal baca {selectedArticle.minReadSeconds || 30} detik untuk reward.</span>
              <button onClick={completeReading} disabled={completing} className="btn-eco text-sm disabled:opacity-50">
                {completing ? "Sync..." : "Claim Knowledge XP"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loadingArticles ? (
        <div className="education-card-grid">
          {[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="education-card is-loading" />)}
        </div>
      ) : (
        <div className="education-card-grid">
          {filteredArticles.map((article) => (
            <article key={article.id} className="education-card">
              <div className="education-card-thumb">
                <PixelIcon type={CATEGORY_ICONS[article.category] || "book"} className="is-large" />
                <button
                  type="button"
                  onClick={() => toggleBookmark(article.id)}
                  className={`education-bookmark ${bookmarkedIds.includes(article.id) ? "is-active" : ""}`}
                  aria-label={bookmarkedIds.includes(article.id) ? "Hapus bookmark" : "Bookmark artikel"}
                >
                  {bookmarkedIds.includes(article.id) ? "SAVED" : "MARK"}
                </button>
              </div>
              <div className="education-card-badges">
                <span className="education-category-badge">{article.category || "Eco"}</span>
                <span className={`education-rarity is-${getRarity(article).toLowerCase()}`}>{getRarity(article)}</span>
              </div>
              <h3>{article.title}</h3>
              <p>{article.summary || `${article.content?.substring(0, 120)}...`}</p>
              <div className="education-progress-row">
                <span>Progress</span>
                <b>{articleProgress[article.id] || 0}%</b>
                <i style={{ width: `${articleProgress[article.id] || 0}%` }} />
              </div>
              <div className="education-card-meta">
                <span>{article.readTime || "5 menit"}</span>
                <span>{article.difficulty || "Easy"}</span>
                <b>+{article.readingReward?.xp || 15} XP</b>
              </div>
              <button type="button" onClick={() => openArticle(article)} className="education-read-btn">
                Read Module
              </button>
            </article>
          ))}
        </div>
      )}

      {!loadingArticles && filteredArticles.length === 0 && (
        <div className="education-empty">
          <PixelIcon type="about" className="is-large" />
          <p>Knowledge module tidak ditemukan.</p>
        </div>
      )}

      <div className="mt-8">
        <Link href="/dashboard" className="btn-eco-outline text-xs">Back to Command HUD</Link>
      </div>
    </div>
  );
}
