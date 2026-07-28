import { useState, useEffect, useRef } from "react";
import PCLogo from "./src/Images/PartsCheckLogo.png";
import AllureLogo from "./src/Images/allurelogo.svg";

const REPORTS = [
  {
    id: 1,
    name: "Smoke",
    path: "Smoke",
    description: "Preview flow testing for normal users",
    tag: "Core",
    color: "#13a538",
  },
];

function ReportCard({ report, index, visible, stats, reportDate }) {
  const handleOpen = (e) => {
    e.stopPropagation();
    window.open(`/${report.path}/index.html`, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={`card ${visible ? "visible" : ""}`}
      style={{ "--accent": report.color, transitionDelay: `${index * 70}ms` }}
      onClick={handleOpen}
    >
      <div className="card-accent-bar" />
      <div className="card-body">
        <div className="card-name">{report.name}</div>

        {stats ? (
          <div className="card-metrics">
            <div className="metric metric--total">
              <span className="metric-value">{stats.total}</span>
              <span className="metric-label">Test Cases</span>
            </div>
            <div className="metric metric--passed">
              <span className="metric-value">{stats.passed}</span>
              <span className="metric-label">Passed</span>
            </div>
            <div className="metric metric--failed">
              <span className="metric-value">{stats.failed}</span>
              <span className="metric-label">Failed</span>
            </div>
            <div className="metric metric--broken">
              <span className="metric-value">{stats.broken}</span>
              <span className="metric-label">Broken</span>
            </div>
          </div>
        ) : (
          <div className="metrics-skeleton" />
        )}

        <div className="card-footer">
          {reportDate && (
            <span className="card-date">
              {new Date(reportDate).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
          <button className="card-btn" onClick={handleOpen}>
            Open Report
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15,3 21,3 21,9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reportData, setReportData] = useState({});
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const calendarRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!calendarOpen) return;
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [calendarOpen]);

  useEffect(() => {
    REPORTS.forEach((report) => {
      fetch(`/${report.path}/widgets/summary.json`)
        .then((r) => r.json())
        .then((data) => {
          setReportData((prev) => ({
            ...prev,
            [report.id]: {
              stats: data.statistic,
              date: data.time?.stop ?? null,
            },
          }));
        })
        .catch(() => {
          setReportData((prev) => ({
            ...prev,
            [report.id]: { stats: null, date: null },
          }));
        });
    });
  }, []);

  const displayedReports = REPORTS.filter((r) => {
    if (!r.name.toLowerCase().includes(search.toLowerCase())) return false;

    const date = reportData[r.id]?.date;
    if (dateFrom && (!date || new Date(date) < new Date(dateFrom)))
      return false;
    if (
      dateTo &&
      (!date || new Date(date) > new Date(`${dateTo}T23:59:59.999`))
    )
      return false;

    return true;
  }).sort(
    (a, b) => (reportData[b.id]?.date ?? 0) - (reportData[a.id]?.date ?? 0),
  );

  const hasDateFilter = dateFrom || dateTo;
  const clearDateFilter = () => {
    setDateFrom("");
    setDateTo("");
    setActivePreset(null);
  };

  const toISODate = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;

  const applyPreset = (preset) => {
    const today = new Date();
    if (preset === "today") {
      const iso = toISODate(today);
      setDateFrom(iso);
      setDateTo(iso);
      setActivePreset("today");
      setCalendarOpen(false);
    } else if (preset === "week") {
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(today.getDate() - today.getDay());
      const lastWeekStart = new Date(currentWeekStart);
      lastWeekStart.setDate(currentWeekStart.getDate() - 7);
      const lastWeekEnd = new Date(currentWeekStart);
      lastWeekEnd.setDate(currentWeekStart.getDate() - 1);
      setDateFrom(toISODate(lastWeekStart));
      setDateTo(toISODate(lastWeekEnd));
      setActivePreset("week");
      setCalendarOpen(false);
    } else if (preset === "month") {
      const lastMonthStart = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1,
      );
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      setDateFrom(toISODate(lastMonthStart));
      setDateTo(toISODate(lastMonthEnd));
      setActivePreset("month");
      setCalendarOpen(false);
    }
  };

  const selectCalendarDate = (date) => {
    const iso = toISODate(date);
    setDateFrom(iso);
    setDateTo(iso);
    setActivePreset(null);
    setCalendarOpen(false);
  };

  const goToPrevMonth = () =>
    setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const goToNextMonth = () =>
    setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const monthLabel = calendarMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const calendarDays = (() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const startOffset = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: startOffset }, () => null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  })();

  const todayISO = toISODate(new Date());

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --bg: #ffffff;
          --surface: #ffffff;
          --surface2: #f1f5f9;
          --border: rgba(15,23,42,0.09);
          --border-hover: rgba(15,23,42,0.18);
          --text: #0f172a;
          --muted: #64748b;
          --muted2: #475569;
          --accent: #13a538;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'Inter', system-ui, sans-serif;
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }

        /* subtle tint */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(19,165,56,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(19,165,56,0.06) 0%, transparent 55%);
          pointer-events: none;
          z-index: 0;
        }

        .wrapper {
          position: relative;
          z-index: 1;
          max-width: 980px;
          margin: 0 auto;
          padding: 20px 24px 96px;
        }

        /* ── HEADER ── */
        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 48px;
          animation: fadeDown .5s ease both;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-left { display: flex; align-items: center; gap: 20px; }

        .fq-logo {
          height: 42px;
          width: auto;
          object-fit: contain;
          flex-shrink: 0;
        }

        .header-text {}
        .header-title {
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: -.03em;
          color: var(--text);
          line-height: 1.1;
        }
        .header-sub {
          font-size: .72rem;
          color: var(--muted);
          letter-spacing: .06em;
          text-transform: uppercase;
          margin-top: 3px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .allure-logo {
          height: 24px;
          width: auto;
          object-fit: contain;
          flex-shrink: 0;
        }

        .allure-text {
          font-family: 'colfax', sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          white-space: nowrap;
          line-height: 24px;
        }

        .header-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(19,165,56,0.10);
          border: 1px solid rgba(19,165,56,0.22);
          border-radius: 99px;
          padding: 6px 14px;
          font-size: .7rem;
          font-weight: 600;
          color: #0d7a2b;
          letter-spacing: .04em;
        }
        .header-badge::before {
          content: '';
          width: 6px; height: 6px;
          background: #13a538;
          border-radius: 50%;
          box-shadow: 0 0 8px #13a538;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .4; }
        }

        /* ── FILTER BAR ── */
        .filter-bar {
          position: relative;
          z-index: 10;
          display: flex;
          gap: 12px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        /* ── SEARCH ── */
        .search-wrap {
          position: relative;
          flex: 1 1 240px;
          animation: fadeDown .5s .08s ease both;
        }
        .search-icon {
          position: absolute;
          left: 16px; top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 13px 16px 13px 44px;
          font-size: .88rem;
          color: var(--text);
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .search-input::placeholder { color: var(--muted); }
        .search-input:focus {
          border-color: rgba(19,165,56,0.4);
          box-shadow: 0 0 0 3px rgba(19,165,56,0.10);
        }

        /* ── CALENDAR FILTER ── */
        .calendar-wrap {
          position: relative;
          animation: fadeDown .5s .08s ease both;
        }

        .calendar-trigger {
          position: relative;
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--muted2);
          cursor: pointer;
          transition: border-color .2s, color .2s, background .2s;
        }
        .calendar-trigger:hover {
          border-color: var(--border-hover);
          color: var(--text);
        }
        .calendar-trigger.open {
          border-color: rgba(19,165,56,0.4);
          color: #0d7a2b;
          background: rgba(19,165,56,0.10);
        }

        .calendar-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #13a538;
          box-shadow: 0 0 6px #13a538;
        }

        .calendar-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          z-index: 30;
          width: 270px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 12px;
          box-shadow: 0 16px 48px rgba(15,23,42,0.14);
          animation: fadeDown .18s ease both;
        }

        .calendar-presets {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .calendar-preset-btn {
          background: transparent;
          border: none;
          color: var(--text);
          font-family: 'Inter', sans-serif;
          font-size: .82rem;
          font-weight: 500;
          text-align: left;
          padding: 9px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: background .15s, color .15s;
        }
        .calendar-preset-btn:hover { background: var(--surface2); }
        .calendar-preset-btn.active {
          background: rgba(19,165,56,0.14);
          color: #0d7a2b;
          font-weight: 600;
        }

        .calendar-month {
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }

        .calendar-month-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: .78rem;
          font-weight: 600;
          color: var(--text);
        }

        .calendar-nav-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: transparent;
          border: none;
          color: var(--muted2);
          cursor: pointer;
          border-radius: 6px;
          transition: background .15s, color .15s;
        }
        .calendar-nav-btn:hover { background: var(--surface2); color: var(--text); }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 3px;
        }

        .calendar-weekday {
          text-align: center;
          font-size: .6rem;
          font-weight: 600;
          letter-spacing: .04em;
          text-transform: uppercase;
          color: var(--muted);
          padding-bottom: 6px;
        }

        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--text);
          font-family: 'Inter', sans-serif;
          font-size: .74rem;
          cursor: pointer;
          transition: background .15s, color .15s;
        }
        .calendar-day:hover { background: var(--surface2); }
        .calendar-day.today { color: #0d7a2b; font-weight: 700; }
        .calendar-day.selected { background: var(--accent); color: #fff; }
        .calendar-day-empty { aspect-ratio: 1; }

        .calendar-clear-btn {
          width: 100%;
          margin-top: 12px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--muted2);
          font-size: .72rem;
          font-weight: 600;
          padding: 8px 0;
          border-radius: 8px;
          cursor: pointer;
          transition: border-color .2s, color .2s;
        }
        .calendar-clear-btn:hover {
          border-color: var(--border-hover);
          color: var(--text);
        }

        /* ── SECTION LABEL ── */
        .section-label {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: .65rem;
          font-weight: 600;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 20px;
          animation: fadeDown .5s .12s ease both;
        }
        .section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        /* ── GRID ── */
        .report-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 16px;
        }

        /* ── CARD ── */
        .card {
          position: relative;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          opacity: 0;
          transform: translateY(18px);
          transition:
            opacity .4s ease,
            transform .4s ease,
            border-color .2s ease,
            box-shadow .25s ease;
        }
        .card.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .card:hover {
          border-color: var(--border-hover);
          box-shadow:
            0 0 0 1px rgba(15,23,42,0.03),
            0 8px 32px rgba(15,23,42,0.10),
            0 0 40px color-mix(in srgb, var(--accent) 10%, transparent);
          transform: translateY(-3px);
        }

        .card-accent-bar {
          height: 3px;
          background: var(--accent);
          opacity: 0;
          transition: opacity .25s ease;
        }
        .card:hover .card-accent-bar { opacity: 1; }

        .card-body {
          padding: 20px;
        }

        .card-name {
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: -.02em;
          color: var(--text);
          margin-bottom: 14px;
          line-height: 1.25;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        .card-date {
          font-family: 'JetBrains Mono', monospace;
          font-size: .68rem;
          font-weight: 500;
          color: var(--muted2);
          white-space: nowrap;
        }

        .card-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--accent);
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: .7rem;
          font-weight: 600;
          letter-spacing: .02em;
          padding: 8px 14px;
          border-radius: 8px;
          border: none;
          flex-shrink: 0;
          cursor: pointer;
          transition: background .2s, transform .15s, box-shadow .2s;
        }
        .card:hover .card-btn {
          background: color-mix(in srgb, var(--accent) 85%, black);
          transform: scale(1.03);
          box-shadow: 0 4px 16px color-mix(in srgb, var(--accent) 40%, transparent);
        }

        /* ── METRICS ── */
        .card-metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-bottom: 20px;
        }

        .metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 8px 4px;
          border-radius: 8px;
          border: 1px solid var(--border);
          transition: border-color .2s;
        }
        .card:hover .metric { border-color: var(--border-hover); }

        .metric-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.15rem;
          font-weight: 700;
          line-height: 1;
        }
        .metric-label {
          font-size: .52rem;
          font-weight: 600;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: var(--muted);
          text-align: center;
          line-height: 1.2;
        }

        .metric--total  { background: rgba(100,116,139,0.06); }
        .metric--total  .metric-value { color: #64748b; }

        .metric--passed { background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.18); }
        .metric--passed .metric-value { color: #0f9d63; }

        .metric--failed { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.18); }
        .metric--failed .metric-value { color: #dc2626; }

        .metric--broken { background: rgba(245,158,11,0.08); border-color: rgba(245,158,11,0.18); }
        .metric--broken .metric-value { color: #d97706; }

        .metrics-skeleton {
          height: 56px;
          border-radius: 8px;
          background: linear-gradient(90deg, var(--surface2) 25%, rgba(15,23,42,0.03) 50%, var(--surface2) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          margin-bottom: 20px;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── EMPTY ── */
        .empty {
          text-align: center;
          padding: 60px 20px;
          color: var(--muted);
          font-size: .9rem;
        }

        /* ── STATUS STRIP ── */
        .status-strip {
          display: flex;
          gap: 10px;
          margin-top: 40px;
          flex-wrap: wrap;
          animation: fadeUp .45s .5s ease both;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 14px;
          font-size: .68rem;
          font-weight: 500;
          color: var(--muted2);
        }
        .dot {
          width: 6px; height: 6px;
          border-radius: 50%;
        }

        footer {
          margin-top: 72px;
          text-align: center;
          font-size: .63rem;
          color: var(--muted);
          opacity: .6;
          animation: fadeUp .45s .6s ease both;
        }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 500px) {
          .header-title { font-size: 1.1rem; }
        }
      `}</style>

      <div className="wrapper">
        <header>
          <div className="header-left">
            <img src={PCLogo} alt="PartsCheck" className="fq-logo" />
          </div>
          <div className="header-right">
            <img src={AllureLogo} alt="Allure" className="allure-logo" />
            <span className="allure-text">Allure Report</span>
          </div>
        </header>

        <div className="filter-bar">
          <div className="search-wrap">
            <svg
              className="search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="search-input"
              placeholder="Search reports by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="calendar-wrap" ref={calendarRef}>
            <button
              className={`calendar-trigger ${calendarOpen ? "open" : ""}`}
              onClick={() => setCalendarOpen((o) => !o)}
              aria-label="Filter by date"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {hasDateFilter && <span className="calendar-dot" />}
            </button>

            {calendarOpen && (
              <div className="calendar-dropdown">
                <div className="calendar-month">
                  <div className="calendar-month-header">
                    <button
                      className="calendar-nav-btn"
                      onClick={goToPrevMonth}
                      aria-label="Previous month"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <span>{monthLabel}</span>
                    <button
                      className="calendar-nav-btn"
                      onClick={goToNextMonth}
                      aria-label="Next month"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>

                  <div className="calendar-grid">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                      <span key={d} className="calendar-weekday">
                        {d}
                      </span>
                    ))}
                    {calendarDays.map((date, i) =>
                      date ? (
                        <button
                          key={i}
                          className={`calendar-day ${
                            toISODate(date) === todayISO ? "today" : ""
                          } ${
                            toISODate(date) === dateFrom &&
                            toISODate(date) === dateTo
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => selectCalendarDate(date)}
                        >
                          {date.getDate()}
                        </button>
                      ) : (
                        <span key={i} className="calendar-day-empty" />
                      ),
                    )}
                  </div>
                </div>

                <div className="calendar-presets">
                  <button
                    className={`calendar-preset-btn ${activePreset === "today" ? "active" : ""}`}
                    onClick={() => applyPreset("today")}
                  >
                    Today
                  </button>
                  <button
                    className={`calendar-preset-btn ${activePreset === "week" ? "active" : ""}`}
                    onClick={() => applyPreset("week")}
                  >
                    Last Week
                  </button>
                  <button
                    className={`calendar-preset-btn ${activePreset === "month" ? "active" : ""}`}
                    onClick={() => applyPreset("month")}
                  >
                    Last Month
                  </button>
                </div>

                {hasDateFilter && (
                  <button
                    className="calendar-clear-btn"
                    onClick={clearDateFilter}
                  >
                    Clear filter
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="section-label">
          {displayedReports.length} of {REPORTS.length} reports
        </div>

        <div className="report-grid">
          {displayedReports.length === 0 ? (
            <div className="empty" style={{ gridColumn: "1/-1" }}>
              No reports match the current filters
            </div>
          ) : (
            displayedReports.map((report, i) => (
              <ReportCard
                key={report.id}
                report={report}
                index={i}
                visible={visible}
                stats={reportData[report.id]?.stats ?? null}
                reportDate={reportData[report.id]?.date ?? null}
              />
            ))
          )}
        </div>

        <footer>
          PartsCheck Allure Reports · Static Hosting · Vercel ·{" "}
          {new Date().getFullYear()}
        </footer>
      </div>
    </>
  );
}
