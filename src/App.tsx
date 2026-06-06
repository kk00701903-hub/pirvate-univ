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
  score: number;
  note: string;
};

/* ───────────────────────────────────────────────
   기본 레벨 데이터
─────────────────────────────────────────────── */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

const DEFAULT_LEVELS: LevelConfig[] = [
  { name: '레벨 1', subtitle: '지방 국립대 · 식품공학과',
    schools: ['충남대 식품공학과', '강원대 식품생명공학과'],
    min: 0, max: 19, color: '#64748b', emoji: '🌱', logo: `${BASE}/logos/level1.png` },
  { name: '레벨 2', subtitle: '수도권 대학 · 식품공학과',
    schools: ['인하대 식품영양학과', '단국대 식품영양학과'],
    min: 20, max: 39, color: '#059669', emoji: '🌿', logo: `${BASE}/logos/level2.png` },
  { name: '레벨 3', subtitle: '인서울 · 식품공학과',
    schools: ['경희대 식품생명공학과', '중앙대 식품공학전공', '동국대 식품생명공학과', '세종대 식품생명공학과'],
    min: 40, max: 59, color: '#2563eb', emoji: '🌳', logo: `${BASE}/logos/level3.png` },
  { name: '레벨 4', subtitle: '인서울 상위 · 식품공학과',
    schools: ['한양대(서울) 식품영양학과', '성균관대 식품생명공학과'],
    min: 60, max: 79, color: '#b45309', emoji: '🔥', logo: `${BASE}/logos/level4.png` },
  { name: '레벨 5', subtitle: '최종 목표',
    schools: ['고려대 식품공학과'],
    min: 80, max: 100, color: '#8b0000', emoji: '🏆', logo: `${BASE}/logos/level5.png` },
];

const STORAGE_KEY = 'univer_records';
const LEVELS_KEY  = 'univer_levels';
const LEVELS_VER  = 'v5-2506';

const STAR_LABELS: Record<number, string> = {
  1: '매우 나쁨', 2: '나쁨', 3: '보통', 4: '좋음', 5: '최고!',
};

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}
function getLevel(totalScore: number, levels: LevelConfig[]) {
  return levels.find((l) => totalScore >= l.min && totalScore <= l.max) ?? levels[0];
}

/* ───────────────────────────────────────────────
   레벨 로고 영역  (4× 크기: 280 × 280)
─────────────────────────────────────────────── */
function LevelLogoArea({ logo, levelIdx }: { logo: string; levelIdx: number }) {
  const [failed, setFailed] = useState(false);

  if (!failed) {
    return (
      <div className="w-[280px] h-[280px] shrink-0 rounded-3xl overflow-hidden ring-pulse
                      shadow-[0_0_60px_rgba(0,0,0,0.5)] border-4 border-white/20">
        <img
          src={logo}
          alt={`레벨 ${levelIdx + 1} 로고`}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className="w-[280px] h-[280px] shrink-0 flex flex-col items-center justify-center
                    rounded-3xl border-2 border-dashed border-white/30 bg-white/5 shadow-inner">
      <span className="text-6xl mb-3 opacity-40">🏛️</span>
      <span className="text-white/40 text-sm font-medium">level{levelIdx + 1}.png</span>
      <span className="text-white/25 text-xs mt-1">public/logos/ 폴더에 배치</span>
    </div>
  );
}

/* ───────────────────────────────────────────────
   별점 선택
─────────────────────────────────────────────── */
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div className="space-y-3">
      <div className="flex gap-3 justify-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            className="text-5xl transition-all duration-150 active:scale-90 hover:scale-115 hover:drop-shadow-lg"
            style={{ filter: n <= display ? 'drop-shadow(0 0 8px #f59e0b)' : 'grayscale(1) opacity(0.25)' }}
          >⭐</button>
        ))}
      </div>
      <p className="text-center text-base font-bold text-[#d4a017] h-6 tracking-wide">
        {display ? `${display}점 · ${STAR_LABELS[display]}` : ''}
      </p>
    </div>
  );
}

/* ───────────────────────────────────────────────
   설정 패널
─────────────────────────────────────────────── */
function SettingsPanel({
  levels, records, totalScore, onSave, onAddRecord, onClose,
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
  const [recDate, setRecDate] = useState(getTodayString());
  const [recScore, setRecScore] = useState(3);
  const [recNote, setRecNote] = useState('');
  const [recMsg, setRecMsg] = useState('');

  const updateSchools = (idx: number, raw: string) =>
    setDraft((prev) => prev.map((l, i) => i === idx ? { ...l, schools: raw.split(',').map((s) => s.trim()).filter(Boolean) } : l));
  const updateField = (idx: number, field: 'name' | 'subtitle', val: string) =>
    setDraft((prev) => prev.map((l, i) => i === idx ? { ...l, [field]: val } : l));
  const handleReset = () => {
    if (confirm('기본값으로 초기화할까요?'))
      setDraft(DEFAULT_LEVELS.map((l) => ({ ...l, schools: [...l.schools] })));
  };
  const handleAddRecord = () => {
    if (!recDate) return;
    if (records.find((r) => r.date === recDate)) {
      setRecMsg(`⚠️ ${recDate} 날짜는 이미 기록이 있습니다.`);
      return;
    }
    onAddRecord({ date: recDate, score: recScore, note: recNote });
    setRecMsg(`✅ ${recDate} · ${recScore}점 추가됨! (누적: ${Math.min(100, totalScore + recScore)}점)`);
    setRecNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-[#0d1f3d] border border-white/10 rounded-3xl w-full max-w-[780px] max-h-[88vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/10">
          <div className="flex gap-2">
            {(['levels', 'recovery'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  tab === t ? 'bg-[#d4a017] text-[#0a1628]' : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}>
                {t === 'levels' ? '🏫 레벨 설정' : '🔧 점수 복구'}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            {tab === 'levels' && (
              <>
                <button onClick={handleReset}
                  className="text-sm text-white/40 hover:text-white px-4 py-2 rounded-xl hover:bg-white/10">
                  기본값 복원
                </button>
                <button onClick={() => onSave(draft)}
                  className="text-sm font-bold bg-[#d4a017] text-[#0a1628] px-5 py-2 rounded-xl hover:brightness-110">
                  저장
                </button>
              </>
            )}
            <button onClick={onClose} className="text-white/40 hover:text-white text-2xl leading-none px-2">✕</button>
          </div>
        </div>

        {tab === 'levels' && (
          <div className="overflow-y-auto px-7 py-6 space-y-4">
            {draft.map((level, idx) => (
              <div key={idx} className="rounded-2xl p-5 border border-white/10 bg-white/5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{level.emoji}</span>
                    <div className="text-xs font-bold text-white px-3 py-1 rounded-full"
                      style={{ background: level.color }}>
                      Lv.{idx + 1} · {level.min}~{level.max}점
                    </div>
                  </div>
                  <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden border border-white/20">
                    <img src={level.logo} alt="" className="w-full h-full object-contain p-1"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity='0'; }} />
                    <div className="absolute inset-0 flex items-center justify-center text-white/30 text-xs">
                      {idx+1}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">레벨 이름</label>
                    <input className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#d4a017]"
                      value={level.name} onChange={(e) => updateField(idx, 'name', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">부제목</label>
                    <input className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#d4a017]"
                      value={level.subtitle} onChange={(e) => updateField(idx, 'subtitle', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">
                    대학 목록 <span className="text-white/25">(쉼표로 구분)</span>
                  </label>
                  <input className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#d4a017]"
                    value={level.schools.join(', ')} onChange={(e) => updateSchools(idx, e.target.value)} />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {level.schools.map((s) => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full text-white/90"
                        style={{ background: level.color + 'cc' }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'recovery' && (
          <div className="overflow-y-auto px-7 py-6 space-y-5">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 flex items-center gap-4">
              <div className="text-5xl font-black text-[#d4a017]">{totalScore}</div>
              <div>
                <p className="font-bold text-white">현재 누적 점수</p>
                <p className="text-sm text-white/40">{records.length}일 기록됨 (최대 100점)</p>
              </div>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
              <h3 className="font-bold text-white text-lg mb-1">📅 날짜별 점수 추가</h3>
              <p className="text-sm text-white/50 mb-5">기록이 사라진 날짜의 점수를 직접 입력해서 복구하세요.</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-white/40 mb-1 block font-medium">날짜 선택</label>
                  <input type="date"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    value={recDate} max={getTodayString()}
                    onChange={(e) => { setRecDate(e.target.value); setRecMsg(''); }} />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block font-medium">별점</label>
                  <div className="flex gap-2 items-center h-[46px]">
                    {[1,2,3,4,5].map((n) => (
                      <button key={n} onClick={() => setRecScore(n)}
                        className="text-3xl transition-transform hover:scale-110 active:scale-90"
                        style={{ filter: n <= recScore ? 'drop-shadow(0 0 6px #f59e0b)' : 'grayscale(1) opacity(0.25)' }}>
                        ⭐
                      </button>
                    ))}
                    <span className="text-sm font-bold text-[#d4a017] ml-1">{recScore}점</span>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs text-white/40 mb-1 block font-medium">메모 (선택)</label>
                <input className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="예: 복구된 기록" value={recNote} onChange={(e) => setRecNote(e.target.value)} />
              </div>
              <button onClick={handleAddRecord}
                className="w-full py-3 rounded-2xl font-bold text-[#0a1628] text-base transition-all active:scale-95 bg-[#d4a017] hover:brightness-110">
                이 날짜 점수 추가
              </button>
              {recMsg && (
                <p className="mt-3 text-sm text-center font-medium text-white/70 bg-white/10 rounded-xl py-2 px-4 border border-white/10">
                  {recMsg}
                </p>
              )}
            </div>
            {records.length > 0 && (
              <div>
                <h3 className="font-semibold text-white/50 text-sm mb-3">저장된 기록 ({records.length}개)</h3>
                <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                  {[...records].sort((a, b) => b.date.localeCompare(a.date)).map((r) => (
                    <li key={r.date} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5">
                      <span className="text-sm text-white/40 w-24 shrink-0">{r.date}</span>
                      <div className="flex">
                        {[1,2,3,4,5].map((n) => (
                          <span key={n} className="text-sm"
                            style={{ filter: n <= r.score ? 'none' : 'grayscale(1) opacity(0.2)' }}>⭐</span>
                        ))}
                      </div>
                      {r.note && <span className="text-xs text-white/30 truncate">· {r.note}</span>}
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
   수능 카운트다운  (2027-11-18)
─────────────────────────────────────────────── */
const SUNEUNG_DATE = new Date('2027-11-18T00:00:00');

function CountdownBanner() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const diffMs = SUNEUNG_DATE.getTime() - now.getTime();
  if (diffMs <= 0) {
    return (
      <div className="w-full rounded-3xl bg-gradient-to-r from-yellow-500 to-orange-500 p-5 mb-6 text-center shadow-xl">
        <p className="text-2xl font-bold text-white">🎉 수능 당일! 최선을 다하세요!</p>
      </div>
    );
  }

  const totalSecs = Math.floor(diffMs / 1000);
  const days  = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins  = Math.floor((totalSecs % 3600) / 60);
  const secs  = totalSecs % 60;

  return (
    <div className="w-full rounded-3xl bg-gradient-to-br from-[#1a0a0a] via-[#3d0f0f] to-[#0d2149]
                    border border-white/10 p-5 mb-6 shadow-2xl overflow-hidden relative">
      {/* 배경 글로우 */}
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#d4a017]/10 blur-3xl pointer-events-none" />
      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-1">2027 CSAT Countdown</p>
          <p className="text-white text-lg font-bold">2027년 11월 18일(목)</p>
          <p className="text-[#d4a017] text-sm font-semibold mt-0.5">합격의 그날까지, 매일 한 걸음</p>
        </div>
        <div className="flex gap-3 text-center">
          {[
            { label: 'DAYS', value: days },
            { label: 'HRS',  value: hours },
            { label: 'MIN',  value: mins },
            { label: 'SEC',  value: secs },
          ].map(({ label, value }) => (
            <div key={label}
              className="bg-black/30 border border-white/10 rounded-2xl px-4 py-3 min-w-[64px]">
              <p className="text-3xl font-black text-white tabular-nums leading-none tick-anim">
                {String(value).padStart(2, '0')}
              </p>
              <p className="text-white/40 text-xs mt-1.5 tracking-widest">{label}</p>
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
      const ver = localStorage.getItem(LEVELS_KEY + '_ver');
      if (ver !== LEVELS_VER) {
        localStorage.removeItem(LEVELS_KEY);
        localStorage.setItem(LEVELS_KEY + '_ver', LEVELS_VER);
        return DEFAULT_LEVELS;
      }
      const saved = localStorage.getItem(LEVELS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_LEVELS;
    } catch { return DEFAULT_LEVELS; }
  });

  const [score, setScore] = useState(3);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const today = getTodayString();
  const todayRecord  = records.find((r) => r.date === today);
  const totalScore   = Math.min(100, records.reduce((sum, r) => sum + r.score, 0));
  const level        = getLevel(totalScore, levels);
  const levelIdx     = levels.indexOf(level);
  const progressPct  = totalScore;

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }, [records]);
  useEffect(() => { localStorage.setItem(LEVELS_KEY,  JSON.stringify(levels));  }, [levels]);

  const handleSave = () => {
    if (todayRecord) return;
    setRecords((prev) => [...prev, { date: today, score, note }]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const handleReset      = () => { if (confirm('모든 기록을 초기화할까요?')) setRecords([]); };
  const handleSaveLevels = (updated: LevelConfig[]) => { setLevels(updated); setShowSettings(false); };
  const handleAddRecord  = (record: DayRecord) => setRecords((prev) => [...prev, record]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), records }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `univer-records-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const DAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

  /* 레벨별 그라데이션 팔레트 */
  const levelGrad: Record<number, string> = {
    0: 'from-slate-800 to-slate-600',
    1: 'from-emerald-900 to-emerald-700',
    2: 'from-blue-900 to-blue-700',
    3: 'from-amber-900 to-amber-700',
    4: 'from-[#4a0000] to-[#8b0000]',
  };

  return (
    /* 전체 배경: 캠퍼스 야경 느낌 */
    <div className="min-h-screen bg-[#0a1628] relative flex flex-col items-center px-5 py-8 overflow-x-hidden">
      {/* 글로우 장식 */}
      <div className="fixed top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full
                      bg-[#004b8d]/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full
                      bg-[#8b0000]/15 blur-[100px] pointer-events-none" />

      {showSettings && (
        <SettingsPanel levels={levels} records={records} totalScore={totalScore}
          onSave={handleSaveLevels} onAddRecord={handleAddRecord}
          onClose={() => setShowSettings(false)} />
      )}

      <div className="w-full max-w-[820px] relative z-10">

        {/* ── 헤더 ── */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">🎓</span>
              <h1 className="text-3xl font-black text-white tracking-tight">대학 레벨업</h1>
            </div>
            <p className="text-white/40 text-sm pl-1">고려대 식품공학과까지, 오늘도 캠퍼스를 향해</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm
                       bg-white/10 border border-white/15 text-white/80
                       hover:bg-white/15 active:scale-95 transition-all backdrop-blur-sm"
          >
            ⚙️ 설정
          </button>
        </div>

        {/* ── 수능 카운트다운 ── */}
        <CountdownBanner />

        {/* ── 레벨 히어로 카드 ── */}
        <div className={`w-full rounded-[28px] mb-6 overflow-hidden shadow-2xl relative
                         bg-gradient-to-br ${levelGrad[levelIdx] ?? levelGrad[0]}`}>
          {/* 카드 배경 노이즈/패턴 */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
                                radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }} />
          {/* 상단 골드 라인 */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#d4a017] to-transparent opacity-60" />

          <div className="relative p-8">
            {/* 레벨 배지 */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-black tracking-[0.2em] text-white/40 uppercase">Current Level</span>
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs font-bold text-[#d4a017] bg-[#d4a017]/15 border border-[#d4a017]/30
                               px-3 py-1 rounded-full tracking-wide">
                {levelIdx + 1} / {levels.length}
              </span>
            </div>

            {/* 콘텐츠: 텍스트 + 로고 */}
            <div className="flex items-center gap-8">
              {/* 왼쪽: 텍스트 */}
              <div className="flex-1 min-w-0">
                <p className="text-[#d4a017] text-sm font-bold tracking-widest uppercase mb-2 opacity-80">
                  {level.emoji} {level.subtitle}
                </p>
                <h2 className="text-5xl font-black text-white leading-none mb-4 tracking-tight">
                  {level.name}
                </h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {level.schools.map((s) => (
                    <span key={s}
                      className="text-xs font-semibold text-white/80 bg-white/15 border border-white/20
                                 rounded-full px-3 py-1.5 backdrop-blur-sm">
                      {s}
                    </span>
                  ))}
                </div>

                {/* 진행도 */}
                <div>
                  <div className="flex justify-between text-xs text-white/50 mb-2 font-medium">
                    <span>진행도</span>
                    <span className="text-white font-bold text-sm">{totalScore} <span className="text-white/40 font-normal">/ 100점</span></span>
                  </div>
                  <div className="h-3 rounded-full bg-black/30 overflow-hidden border border-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${progressPct}%`,
                        background: 'linear-gradient(90deg, #d4a017, #f9d423)',
                        boxShadow: '0 0 12px rgba(212,160,23,0.6)',
                      }}
                    />
                  </div>
                  {/* 레벨 구간 마커 */}
                  <div className="flex justify-between text-[10px] text-white/25 mt-1.5 px-0.5">
                    {levels.map((l) => (
                      <span key={l.min}>{l.min}</span>
                    ))}
                    <span>100</span>
                  </div>
                </div>
              </div>

              {/* 오른쪽: 대형 로고 */}
              <div className="shrink-0">
                <LevelLogoArea logo={level.logo} levelIdx={levelIdx} />
              </div>
            </div>
          </div>
        </div>

        {/* ── 2열 그리드 ── */}
        <div className="grid grid-cols-2 gap-5">

          {/* 오늘의 만족도 */}
          <div className="rounded-3xl bg-[#0d1f3d]/80 border border-white/10 p-7 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">📋</span>
              <h2 className="font-black text-white text-xl">오늘의 만족도</h2>
            </div>
            <p className="text-white/30 text-sm mb-5 pl-8">{today}</p>

            {todayRecord ? (
              <div className="flex flex-col items-center justify-center py-6 gap-3">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400/40
                                flex items-center justify-center text-3xl">✅</div>
                <p className="text-green-400 font-bold text-lg">오늘 기록 완료!</p>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((n) => (
                    <span key={n} className="text-2xl"
                      style={{ filter: n <= todayRecord.score ? 'drop-shadow(0 0 6px #f59e0b)' : 'grayscale(1) opacity(0.2)' }}>
                      ⭐
                    </span>
                  ))}
                </div>
                {todayRecord.note && (
                  <p className="text-white/30 text-sm text-center italic">"{todayRecord.note}"</p>
                )}
              </div>
            ) : (
              <>
                <StarPicker value={score} onChange={setScore} />
                <textarea
                  className="w-full bg-white/5 border border-white/15 rounded-2xl p-4 text-sm
                             text-white/80 placeholder-white/20 resize-none mt-5
                             focus:outline-none focus:ring-2 focus:ring-[#d4a017]/50"
                  rows={4}
                  placeholder="오늘 하루 한 마디 (선택)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <button
                  onClick={handleSave}
                  className="mt-4 w-full py-4 rounded-2xl font-black text-[#0a1628] text-base
                             transition-all active:scale-95 hover:brightness-110"
                  style={{
                    background: saved
                      ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                      : 'linear-gradient(135deg,#d4a017,#f9d423)',
                  }}
                >
                  {saved ? '✓ 저장됨!' : '오늘 기록 저장'}
                </button>
              </>
            )}
          </div>

          {/* 이번 주 기록 */}
          <div className="rounded-3xl bg-[#0d1f3d]/80 border border-white/10 p-7 shadow-xl backdrop-blur-sm flex flex-col">
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">📅</span>
                <div>
                  <h2 className="font-black text-white text-xl">이번 주 기록</h2>
                  <p className="text-white/30 text-xs mt-0.5">최근 7일</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={handleExport}
                  className="text-xs text-[#d4a017] hover:text-yellow-300 py-1.5 px-3 rounded-xl
                             hover:bg-[#d4a017]/10 font-semibold transition-colors">
                  💾
                </button>
                <button onClick={handleReset}
                  className="text-xs text-red-400/60 hover:text-red-400 py-1.5 px-3 rounded-xl
                             hover:bg-red-500/10 transition-colors">
                  초기화
                </button>
              </div>
            </div>

            {/* 7일 달력 */}
            <div className="grid grid-cols-7 gap-1.5 mb-5">
              {last7Days.map((date) => {
                const rec = records.find((r) => r.date === date);
                const d = new Date(date + 'T00:00:00');
                const dayLabel = DAY_KO[d.getDay()];
                const isToday = date === today;
                const isSat = d.getDay() === 6;
                const isSun = d.getDay() === 0;
                return (
                  <div key={date}
                    className={`flex flex-col items-center rounded-2xl py-3 px-1 transition-colors ${
                      isToday
                        ? 'bg-[#d4a017]/20 border border-[#d4a017]/40'
                        : 'bg-white/5 border border-white/5'
                    }`}>
                    <span className={`text-xs font-bold mb-1 ${
                      isSun ? 'text-red-400' : isSat ? 'text-blue-400' : 'text-white/40'
                    }`}>{dayLabel}</span>
                    <span className="text-[10px] text-white/25 mb-2">
                      {date.slice(5).replace('-', '/')}
                    </span>
                    {rec ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex flex-wrap justify-center gap-0.5">
                          {[1,2,3,4,5].map((n) => (
                            <span key={n} className="text-xs leading-none"
                              style={{ filter: n <= rec.score ? 'none' : 'grayscale(1) opacity(0.15)' }}>⭐</span>
                          ))}
                        </div>
                        <span className="text-xs font-black text-[#d4a017]">{rec.score}점</span>
                      </div>
                    ) : (
                      <span className="text-white/10 text-lg">—</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 메모 목록 */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {last7Days
                .map((date) => records.find((r) => r.date === date))
                .filter((r): r is DayRecord => !!r && !!r.note)
                .reverse()
                .map((r) => (
                  <div key={r.date} className="flex gap-3 items-start bg-white/5 rounded-xl px-4 py-3 border border-white/5">
                    <span className="text-xs text-white/25 shrink-0 mt-0.5 w-12">{r.date.slice(5).replace('-', '/')}</span>
                    <span className="text-sm text-white/50 leading-relaxed italic">"{r.note}"</span>
                  </div>
                ))}
              {last7Days.every((date) => {
                const r = records.find((rec) => rec.date === date);
                return !r || !r.note;
              }) && (
                <p className="text-white/20 text-sm text-center py-4">이번 주 메모가 없습니다.</p>
              )}
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <p className="text-white/20 text-xs mt-8 text-center tracking-wide">
          데이터는 이 기기에 저장됩니다 · 💾 버튼으로 JSON 백업 가능
        </p>
      </div>
    </div>
  );
}
