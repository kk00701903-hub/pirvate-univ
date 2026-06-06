import { useState, useEffect } from 'react';

/* ───────────────────────────────────────────────
   타입
─────────────────────────────────────────────── */
type LevelConfig = {
  name: string;
  subtitle: string;
  schools: string[];
  min: number;
  max: number;
  color: string;
  emoji: string;
  logo: string;
};

type DayRecord = {
  date: string;
  score: number; // 1~5
  note: string;
};

/* ───────────────────────────────────────────────
   기본 레벨 데이터 (식품공학과 기준)
─────────────────────────────────────────────── */
const DEFAULT_LEVELS: LevelConfig[] = [
  { name: '지방 국립대 (하위)', subtitle: '식품공학과',
    schools: ['충남대 식품공학과', '강원대 식품생명공학과', '공주대 식품공학과', '한경국립대 식품생명공학과'],
    min: 0, max: 19, color: '#6b7280', emoji: '🌱', logo: '/logos/level1.png' },
  { name: '지방 국립대 (상위)', subtitle: '식품공학과',
    schools: ['인하대 식품영양학과', '충북대 식품생명공학과', '경상대 식품공학과', '동아대 식품생명공학과'],
    min: 20, max: 39, color: '#10b981', emoji: '🌿', logo: '/logos/level2.png' },
  { name: '인서울 하위', subtitle: '식품생명공학과',
    schools: ['서울과기대 식품생명공학과', '건국대 식품과학부', '동국대 식품생명공학과', '광운대 식품생명공학과'],
    min: 40, max: 59, color: '#3b82f6', emoji: '🌳', logo: '/logos/level3.png' },
  { name: '인서울 중위', subtitle: '식품공학·영양학과',
    schools: ['경희대 식품생명공학과', '중앙대 식품공학전공', '세종대 식품생명공학과', '단국대 식품영양학과'],
    min: 60, max: 79, color: '#8b5cf6', emoji: '⭐', logo: '/logos/level4.png' },
  { name: '인서울 상위', subtitle: '식품영양학과',
    schools: ['한양대(서울) 식품영양학과', '성균관대 식품생명공학과'],
    min: 80, max: 94, color: '#f59e0b', emoji: '🔥', logo: '/logos/level5.png' },
  { name: '고려대학교', subtitle: '식품공학과 (최종 목표)',
    schools: ['고려대 식품공학과'],
    min: 95, max: 100, color: '#004b8d', emoji: '🏆', logo: '/logos/level6.png' },
];

const STORAGE_KEY = 'univer_records';
const LEVELS_KEY = 'univer_levels';

const STAR_LABELS: Record<number, string> = {
  1: '😞 매우 나쁨',
  2: '😕 나쁨',
  3: '😐 보통',
  4: '🙂 좋음',
  5: '😄 최고!',
};

/* ───────────────────────────────────────────────
   헬퍼
─────────────────────────────────────────────── */
function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function getLevel(totalScore: number, levels: LevelConfig[]) {
  return levels.find((l) => totalScore >= l.min && totalScore <= l.max) ?? levels[0];
}

/* ───────────────────────────────────────────────
   로고/이모지 컴포넌트
─────────────────────────────────────────────── */
function LogoOrEmoji({ logo, emoji }: { logo: string; emoji: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className="text-6xl">{emoji}</span>;
  return (
    <img
      src={logo}
      alt={emoji}
      className="w-24 h-24 object-contain rounded-2xl bg-white/20 p-2"
      onError={() => setFailed(true)}
    />
  );
}

/* ───────────────────────────────────────────────
   별점 선택 컴포넌트
─────────────────────────────────────────────── */
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div>
      <div className="flex gap-3 justify-center my-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            className="text-5xl transition-transform active:scale-90 hover:scale-110"
            style={{ filter: n <= display ? 'none' : 'grayscale(1) opacity(0.3)' }}
          >
            ⭐
          </button>
        ))}
      </div>
      <p className="text-center text-base font-semibold text-slate-600 h-6">
        {STAR_LABELS[display] ?? ''}
      </p>
    </div>
  );
}

/* ───────────────────────────────────────────────
   설정 패널 컴포넌트
─────────────────────────────────────────────── */
function SettingsPanel({
  levels,
  records,
  totalScore,
  onSave,
  onAddRecord,
  onClose,
}: {
  levels: LevelConfig[];
  records: DayRecord[];
  totalScore: number;
  onSave: (updated: LevelConfig[]) => void;
  onAddRecord: (record: DayRecord) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<LevelConfig[]>(
    levels.map((l) => ({ ...l, schools: [...l.schools] })),
  );
  const [tab, setTab] = useState<'levels' | 'recovery'>('levels');

  /* 점수 복구 상태 */
  const [recDate, setRecDate] = useState(getTodayString());
  const [recScore, setRecScore] = useState(3);
  const [recNote, setRecNote] = useState('');
  const [recMsg, setRecMsg] = useState('');

  const updateSchools = (idx: number, raw: string) => {
    const schools = raw.split(',').map((s) => s.trim()).filter(Boolean);
    setDraft((prev) => prev.map((l, i) => (i === idx ? { ...l, schools } : l)));
  };
  const updateField = (idx: number, field: 'name' | 'subtitle', val: string) => {
    setDraft((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: val } : l)));
  };
  const handleReset = () => {
    if (confirm('기본값으로 초기화할까요?'))
      setDraft(DEFAULT_LEVELS.map((l) => ({ ...l, schools: [...l.schools] })));
  };

  const handleAddRecord = () => {
    if (!recDate) return;
    const already = records.find((r) => r.date === recDate);
    if (already) {
      setRecMsg(`⚠️ ${recDate} 날짜는 이미 기록이 있습니다.`);
      return;
    }
    onAddRecord({ date: recDate, score: recScore, note: recNote });
    setRecMsg(`✅ ${recDate} · ${recScore}점 추가됨! (현재 누적: ${Math.min(100, totalScore + recScore)}점)`);
    setRecNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-[780px] max-h-[88vh] flex flex-col shadow-2xl">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <div className="flex gap-2">
            {(['levels', 'recovery'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${
                  tab === t
                    ? 'text-white shadow'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
                style={tab === t ? { background: '#004b8d' } : {}}
              >
                {t === 'levels' ? '🏫 레벨 설정' : '🔧 점수 복구'}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            {tab === 'levels' && (
              <>
                <button
                  onClick={handleReset}
                  className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-100"
                >
                  기본값 복원
                </button>
                <button
                  onClick={() => onSave(draft)}
                  className="text-sm font-bold text-white px-5 py-2 rounded-xl"
                  style={{ background: '#004b8d' }}
                >
                  저장
                </button>
              </>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none px-2">
              ✕
            </button>
          </div>
        </div>

        {/* 탭: 레벨 설정 */}
        {tab === 'levels' && (
          <div className="overflow-y-auto px-8 py-6 space-y-5">
            {draft.map((level, idx) => (
              <div key={idx} className="rounded-2xl p-5 border-2"
                style={{ borderColor: level.color + '55', background: level.color + '08' }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{level.emoji}</span>
                  <div className="text-xs font-bold text-white px-3 py-1 rounded-full"
                    style={{ background: level.color }}>
                    Lv.{idx + 1} · {level.min}~{level.max}점
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">레벨 이름</label>
                    <input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={level.name} onChange={(e) => updateField(idx, 'name', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">부제목</label>
                    <input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={level.subtitle} onChange={(e) => updateField(idx, 'subtitle', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    대학 목록 <span className="text-slate-400">(쉼표로 구분)</span>
                  </label>
                  <input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={level.schools.join(', ')}
                    onChange={(e) => updateSchools(idx, e.target.value)}
                    placeholder="예: 충남대, 전남대, 강원대" />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {level.schools.map((s) => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full text-white"
                        style={{ background: level.color }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 탭: 점수 복구 */}
        {tab === 'recovery' && (
          <div className="overflow-y-auto px-8 py-6 space-y-6">

            {/* 현재 누적 점수 표시 */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 flex items-center gap-4">
              <div className="text-4xl font-black text-slate-700">{totalScore}</div>
              <div>
                <p className="font-semibold text-slate-700">현재 누적 점수</p>
                <p className="text-sm text-slate-400">기록된 별점의 합계 (최대 100점)</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm text-slate-500">{records.length}일 기록됨</p>
              </div>
            </div>

            {/* 날짜별 점수 직접 추가 */}
            <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-6">
              <h3 className="font-bold text-slate-700 text-lg mb-1">📅 날짜별 점수 추가</h3>
              <p className="text-sm text-slate-500 mb-5">
                기록이 사라진 날짜의 점수를 직접 입력해서 복구하세요.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block font-medium">날짜 선택</label>
                  <input
                    type="date"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                    value={recDate}
                    max={getTodayString()}
                    onChange={(e) => { setRecDate(e.target.value); setRecMsg(''); }}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block font-medium">별점</label>
                  <div className="flex gap-2 items-center h-[46px]">
                    {[1,2,3,4,5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setRecScore(n)}
                        className="text-3xl transition-transform hover:scale-110 active:scale-90"
                        style={{ filter: n <= recScore ? 'none' : 'grayscale(1) opacity(0.25)' }}
                      >⭐</button>
                    ))}
                    <span className="text-sm font-bold text-slate-600 ml-1">{recScore}점</span>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs text-slate-500 mb-1 block font-medium">메모 (선택)</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                  placeholder="예: 복구된 기록"
                  value={recNote}
                  onChange={(e) => setRecNote(e.target.value)}
                />
              </div>
              <button
                onClick={handleAddRecord}
                className="w-full py-3 rounded-2xl font-bold text-white text-base transition-all active:scale-95"
                style={{ background: '#ea580c' }}
              >
                이 날짜 점수 추가
              </button>
              {recMsg && (
                <p className="mt-3 text-sm text-center font-medium text-slate-600 bg-white rounded-xl py-2 px-4 border border-slate-200">
                  {recMsg}
                </p>
              )}
            </div>

            {/* 기존 기록 목록 */}
            {records.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-600 text-sm mb-3">현재 저장된 기록 ({records.length}개)</h3>
                <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                  {[...records].sort((a, b) => b.date.localeCompare(a.date)).map((r) => (
                    <li key={r.date} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5">
                      <span className="text-sm text-slate-500 w-24 shrink-0">{r.date}</span>
                      <div className="flex">
                        {[1,2,3,4,5].map((n) => (
                          <span key={n} className="text-sm"
                            style={{ filter: n <= r.score ? 'none' : 'grayscale(1) opacity(0.2)' }}>⭐</span>
                        ))}
                      </div>
                      {r.note && <span className="text-xs text-slate-400 truncate">· {r.note}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   수능 카운트다운 컴포넌트
   2027년 수능: 11월 18일(목)
─────────────────────────────────────────────── */
const SUNEUNG_DATE = new Date('2027-11-18T00:00:00');

function CountdownBanner() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const diffMs = SUNEUNG_DATE.getTime() - now.getTime();
  const isOver = diffMs <= 0;

  const totalSecs = Math.floor(diffMs / 1000);
  const days  = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins  = Math.floor((totalSecs % 3600) / 60);
  const secs  = totalSecs % 60;

  if (isOver) {
    return (
      <div className="w-full rounded-3xl bg-gradient-to-r from-yellow-400 to-orange-400 p-6 mb-6 text-white text-center shadow-lg">
        <p className="text-2xl font-bold">🎉 수능 당일입니다! 최선을 다하세요!</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-3xl bg-gradient-to-r from-[#8b1a1a] to-[#004b8d] p-6 mb-6 text-white shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm font-medium mb-1">2027학년도 대학수학능력시험</p>
          <p className="text-2xl font-bold">2027년 11월 18일(목) · D-<span className="text-yellow-300">{days}</span></p>
        </div>
        <div className="flex gap-3 text-center">
          {[
            { label: '일', value: days },
            { label: '시간', value: hours },
            { label: '분', value: mins },
            { label: '초', value: secs },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/15 rounded-2xl px-4 py-3 min-w-[60px]">
              <p className="text-2xl font-bold tabular-nums leading-none">
                {String(value).padStart(2, '0')}
              </p>
              <p className="text-white/70 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   메인 앱
─────────────────────────────────────────────── */
export default function App() {
  const [records, setRecords] = useState<DayRecord[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
    catch { return []; }
  });

  const [levels, setLevels] = useState<LevelConfig[]>(() => {
    try {
      const saved = localStorage.getItem(LEVELS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_LEVELS;
    } catch { return DEFAULT_LEVELS; }
  });

  const [score, setScore] = useState(3);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const today = getTodayString();
  const todayRecord = records.find((r) => r.date === today);
  const totalScore = Math.min(100, records.reduce((sum, r) => sum + r.score, 0));
  const level = getLevel(totalScore, levels);
  const progressPct = totalScore;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(LEVELS_KEY, JSON.stringify(levels));
  }, [levels]);

  const handleSave = () => {
    if (todayRecord) return;
    setRecords((prev) => [...prev, { date: today, score, note }]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm('모든 기록을 초기화할까요?')) setRecords([]);
  };

  const handleSaveLevels = (updated: LevelConfig[]) => {
    setLevels(updated);
    setShowSettings(false);
  };

  const handleAddRecord = (record: DayRecord) => {
    setRecords((prev) => [...prev, record]);
  };

  /* 기기에 JSON 파일로 저장 */
  const handleExport = () => {
    const data = { exportedAt: new Date().toISOString(), records };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `univer-records-${getTodayString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* 최근 7일 날짜 배열 생성 */
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const DAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center px-6 py-10">
      {showSettings && (
        <SettingsPanel
          levels={levels}
          records={records}
          totalScore={totalScore}
          onSave={handleSaveLevels}
          onAddRecord={handleAddRecord}
          onClose={() => setShowSettings(false)}
        />
      )}

      <div className="w-full max-w-[820px]">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-1">대학 레벨업</h1>
            <p className="text-slate-500 text-base">매일 만족도를 기록하고 고려대 식품공학과까지! 🎯</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-semibold text-base shadow-sm hover:bg-slate-50 active:scale-95 transition-transform"
          >
            ⚙️ 설정
          </button>
        </div>

        {/* 수능 카운트다운 */}
        <CountdownBanner />

        {/* 레벨 카드 */}
        <div
          className="w-full rounded-3xl p-8 mb-6 text-white shadow-xl"
          style={{ background: level.color }}
        >
          {/* 텍스트(왼쪽) + 로고(오른쪽) */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <p className="text-white/70 text-sm font-medium mb-1">
                레벨 {levels.indexOf(level) + 1} / {levels.length}
              </p>
              <p className="text-4xl font-black leading-tight">{level.name}</p>
              <p className="text-white/80 text-base mt-1">{level.subtitle}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {level.schools.map((s) => (
                  <span key={s} className="text-sm bg-white/20 rounded-full px-3 py-1">{s}</span>
                ))}
              </div>
            </div>
            <div className="ml-6 shrink-0">
              <LogoOrEmoji logo={level.logo} emoji={level.emoji} />
            </div>
          </div>
          <div className="bg-white/20 rounded-full h-4 overflow-hidden mt-2">
            <div
              className="h-full rounded-full bg-white transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-right text-white/80 text-base mt-2 font-semibold">
            {totalScore} / 100 점
          </p>
        </div>

        {/* 2열 그리드 */}
        <div className="grid grid-cols-2 gap-6">

          {/* 오늘 입력 */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h2 className="font-bold text-slate-700 text-xl mb-1">
              오늘의 만족도
            </h2>
            <p className="text-slate-400 text-sm mb-5">{today}</p>

            {todayRecord ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <span className="text-6xl">✅</span>
                <p className="text-green-600 font-semibold text-lg">오늘 기록 완료!</p>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((n) => (
                    <span key={n} style={{ filter: n <= todayRecord.score ? 'none' : 'grayscale(1) opacity(0.25)' }} className="text-2xl">⭐</span>
                  ))}
                </div>
                {todayRecord.note && (
                  <p className="text-slate-400 text-sm text-center mt-1 italic">"{todayRecord.note}"</p>
                )}
              </div>
            ) : (
              <>
                <StarPicker value={score} onChange={setScore} />
                <textarea
                  className="w-full border border-slate-200 rounded-xl p-4 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 mt-5"
                  rows={4}
                  placeholder="오늘 하루 한 마디 (선택)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <button
                  onClick={handleSave}
                  className="mt-5 w-full py-4 rounded-2xl font-bold text-white text-lg transition-all active:scale-95"
                  style={{ background: '#004b8d' }}
                >
                  {saved ? '저장됨 ✓' : '오늘 기록 저장'}
                </button>
              </>
            )}
          </div>

          {/* 최근 7일 히스토리 */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="font-bold text-slate-700 text-xl">이번 주 기록</h2>
                <p className="text-slate-400 text-sm mt-0.5">최근 7일</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 py-1.5 px-3 rounded-xl hover:bg-blue-50 font-medium"
                >
                  💾 저장
                </button>
                <button
                  onClick={handleReset}
                  className="text-sm text-red-400 hover:text-red-600 py-1.5 px-3 rounded-xl hover:bg-red-50"
                >
                  초기화
                </button>
              </div>
            </div>

            {/* 7일 달력 그리드 */}
            <div className="grid grid-cols-7 gap-2 mb-5">
              {last7Days.map((date) => {
                const rec = records.find((r) => r.date === date);
                const d = new Date(date + 'T00:00:00');
                const dayLabel = DAY_KO[d.getDay()];
                const isToday = date === today;
                const isSat = d.getDay() === 6;
                const isSun = d.getDay() === 0;
                return (
                  <div
                    key={date}
                    className={`flex flex-col items-center rounded-2xl py-3 px-1 ${
                      isToday ? 'ring-2 ring-blue-400 bg-blue-50' : 'bg-slate-50'
                    }`}
                  >
                    <span className={`text-xs font-semibold mb-1 ${
                      isSun ? 'text-red-400' : isSat ? 'text-blue-400' : 'text-slate-500'
                    }`}>
                      {dayLabel}
                    </span>
                    <span className="text-xs text-slate-400 mb-2">
                      {date.slice(5).replace('-', '/')}
                    </span>
                    {rec ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex flex-wrap justify-center gap-0.5">
                          {[1,2,3,4,5].map((n) => (
                            <span
                              key={n}
                              className="text-sm leading-none"
                              style={{ filter: n <= rec.score ? 'none' : 'grayscale(1) opacity(0.2)' }}
                            >⭐</span>
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-600">{rec.score}점</span>
                      </div>
                    ) : (
                      <span className="text-2xl text-slate-200">—</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 메모 목록 (이번 주 중 메모 있는 날) */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {last7Days
                .map((date) => records.find((r) => r.date === date))
                .filter((r): r is DayRecord => !!r && !!r.note)
                .reverse()
                .map((r) => (
                  <div key={r.date} className="flex gap-3 items-start bg-slate-50 rounded-xl px-4 py-3">
                    <span className="text-xs text-slate-400 shrink-0 mt-0.5 w-20">{r.date.slice(5).replace('-', '/')}</span>
                    <span className="text-sm text-slate-600 leading-relaxed italic">"{r.note}"</span>
                  </div>
                ))}
              {last7Days.every((date) => {
                const r = records.find((rec) => rec.date === date);
                return !r || !r.note;
              }) && (
                <p className="text-slate-400 text-sm text-center py-4">이번 주 메모가 없습니다.</p>
              )}
            </div>
          </div>

        </div>

        <p className="text-sm text-slate-400 mt-8 text-center">
          데이터는 이 기기의 브라우저에 저장됩니다 · 💾 저장 버튼으로 JSON 파일 백업 가능
        </p>
      </div>
    </div>
  );
}
