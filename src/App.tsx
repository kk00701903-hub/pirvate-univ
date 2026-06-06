import { useState, useEffect } from 'react';

const UNIVERSITY_LEVELS = [
  { name: '지방 전문대', min: 0, max: 19, color: '#6b7280', emoji: '🌱' },
  { name: '지방 4년제', min: 20, max: 39, color: '#10b981', emoji: '🌿' },
  { name: '인서울 하위', min: 40, max: 59, color: '#3b82f6', emoji: '🌳' },
  { name: '인서울 중위', min: 60, max: 79, color: '#8b5cf6', emoji: '⭐' },
  { name: '인서울 상위', min: 80, max: 94, color: '#f59e0b', emoji: '🔥' },
  { name: '고려대학교', min: 95, max: 100, color: '#004b8d', emoji: '🏆' },
];

const STORAGE_KEY = 'univer_records';

type DayRecord = {
  date: string;
  score: number;
  note: string;
};

function getLevel(totalScore: number) {
  return (
    UNIVERSITY_LEVELS.find(
      (l) => totalScore >= l.min && totalScore <= l.max,
    ) ?? UNIVERSITY_LEVELS[0]
  );
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [records, setRecords] = useState<DayRecord[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  });
  const [score, setScore] = useState(5);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const today = getTodayString();
  const todayRecord = records.find((r) => r.date === today);

  const totalScore = Math.min(
    100,
    records.reduce((sum, r) => sum + r.score, 0),
  );
  const level = getLevel(totalScore);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const handleSave = () => {
    if (todayRecord) return;
    const newRecord: DayRecord = { date: today, score, note };
    setRecords((prev) => [...prev, newRecord]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm('모든 기록을 초기화할까요?')) {
      setRecords([]);
    }
  };

  const progressPct = Math.min(100, (totalScore / 100) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center px-4 py-10">
      {/* Header */}
      <div className="w-full max-w-md text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-1">대학 레벨업</h1>
        <p className="text-slate-500 text-sm">매일 만족도를 기록하고 고려대까지 레벨업!</p>
      </div>

      {/* Level Card */}
      <div
        className="w-full max-w-md rounded-2xl p-6 mb-6 text-white shadow-lg"
        style={{ background: level.color }}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{level.emoji}</span>
          <div>
            <p className="text-white/70 text-sm">현재 레벨</p>
            <p className="text-2xl font-bold">{level.name}</p>
          </div>
        </div>
        <div className="bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-white transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-right text-white/80 text-sm mt-1">
          {totalScore} / 100 점
        </p>
      </div>

      {/* Today Input */}
      <div className="w-full max-w-md bg-white rounded-2xl p-6 mb-6 shadow-sm border border-slate-100">
        <h2 className="font-semibold text-slate-700 mb-4">
          오늘의 만족도 기록{' '}
          <span className="text-slate-400 font-normal text-sm">({today})</span>
        </h2>

        {todayRecord ? (
          <p className="text-green-600 font-medium text-center py-4">
            ✅ 오늘 기록 완료! ({todayRecord.score}점)
          </p>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm text-slate-600 mb-2">
                만족도: <strong>{score}점</strong>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1점 (매우 나쁨)</span>
                <span>10점 (최고)</span>
              </div>
            </div>
            <textarea
              className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={3}
              placeholder="오늘 하루 한 마디 (선택)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button
              onClick={handleSave}
              className="mt-4 w-full py-3 rounded-xl font-semibold text-white transition-opacity"
              style={{ background: '#004b8d' }}
            >
              {saved ? '저장됨 ✓' : '오늘 기록 저장'}
            </button>
          </>
        )}
      </div>

      {/* History */}
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-slate-700">기록 히스토리</h2>
          <button
            onClick={handleReset}
            className="text-xs text-red-400 hover:text-red-600"
          >
            초기화
          </button>
        </div>
        {records.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">
            아직 기록이 없습니다. 오늘부터 시작해보세요!
          </p>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {[...records].reverse().map((r) => (
              <li
                key={r.date}
                className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0"
              >
                <span className="text-xs text-slate-400 mt-0.5 shrink-0">
                  {r.date}
                </span>
                <span className="font-bold text-blue-700 shrink-0">
                  {r.score}점
                </span>
                {r.note && (
                  <span className="text-sm text-slate-600 truncate">{r.note}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-8">데이터는 기기에만 저장됩니다.</p>
    </div>
  );
}
