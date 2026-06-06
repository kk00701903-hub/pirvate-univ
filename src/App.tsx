import { useState, useEffect } from 'react';

/* ─────────────────────────────── 타입 */
type LevelConfig = {
  name: string; subtitle: string; schools: string[];
  min: number; max: number; color: string; emoji: string; logo: string;
};
type DayRecord = { date: string; score: number; note: string; };

/* ─────────────────────────────── 레벨 데이터 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

const DEFAULT_LEVELS: LevelConfig[] = [
  { name: '레벨 1', subtitle: '지방 국립대 · 식품공학과',
    schools: ['충남대 식품공학과', '강원대 식품생명공학과'],
    min: 0,  max: 19,  color: '#64748b', emoji: '🌱', logo: `${BASE}/logos/level1.png` },
  { name: '레벨 2', subtitle: '수도권 대학 · 식품공학과',
    schools: ['인하대 식품영양학과', '단국대 식품영양학과'],
    min: 20, max: 39,  color: '#059669', emoji: '🌿', logo: `${BASE}/logos/level2.png` },
  { name: '레벨 3', subtitle: '인서울 · 식품공학과',
    schools: ['경희대 식품생명공학과', '중앙대 식품공학전공', '동국대 식품생명공학과', '세종대 식품생명공학과'],
    min: 40, max: 59,  color: '#2563eb', emoji: '🌳', logo: `${BASE}/logos/level3.png` },
  { name: '레벨 4', subtitle: '인서울 상위 · 식품공학과',
    schools: ['한양대(서울) 식품영양학과', '성균관대 식품생명공학과'],
    min: 60, max: 79,  color: '#b45309', emoji: '🔥', logo: `${BASE}/logos/level4.png` },
  { name: '레벨 5', subtitle: '최종 목표',
    schools: ['고려대 식품공학과'],
    min: 80, max: 100, color: '#9b1b1b', emoji: '🏆', logo: `${BASE}/logos/level5.png` },
];

const STORAGE_KEY = 'univer_records';
const LEVELS_KEY  = 'univer_levels';
const LEVELS_VER  = 'v5-2506';

const STAR_LABELS: Record<number, string> = {
  1: '매우 나쁨', 2: '나쁨', 3: '보통', 4: '좋음', 5: '최고!',
};

function getTodayString() { return new Date().toISOString().slice(0, 10); }
function getLevel(s: number, ls: LevelConfig[]) {
  return ls.find((l) => s >= l.min && s <= l.max) ?? ls[0];
}

/* ─────────────────────────────── 레벨 히어로 그라데이션 */
const LEVEL_GRAD = [
  { from: '#e2e8f0', to: '#94a3b8', text: '#1e293b' },   // Lv1 slate
  { from: '#d1fae5', to: '#6ee7b7', text: '#064e3b' },   // Lv2 emerald
  { from: '#dbeafe', to: '#93c5fd', text: '#1e3a8a' },   // Lv3 blue
  { from: '#fef3c7', to: '#fcd34d', text: '#78350f' },   // Lv4 amber
  { from: '#ffe4e6', to: '#fca5a5', text: '#7f1d1d' },   // Lv5 crimson
];

/* ─────────────────────────────── 로고 영역 (280×280) */
function LevelLogoArea({ logo, levelIdx }: { logo: string; levelIdx: number }) {
  const [failed, setFailed] = useState(false);
  const grad = LEVEL_GRAD[levelIdx] ?? LEVEL_GRAD[0];

  if (!failed) return (
    <div className="w-[280px] h-[280px] shrink-0 rounded-3xl overflow-hidden
                    shadow-2xl ring-4 ring-white/60">
      <img src={logo} alt={`레벨 ${levelIdx + 1} 로고`}
        className="w-full h-full object-cover"
        onError={() => setFailed(true)} />
    </div>
  );

  return (
    <div className="w-[280px] h-[280px] shrink-0 flex flex-col items-center justify-center
                    rounded-3xl border-2 border-dashed shadow-inner"
      style={{ borderColor: grad.text + '40', background: grad.text + '08' }}>
      <span className="text-5xl mb-3 opacity-30">🏛️</span>
      <span className="text-sm font-medium opacity-40" style={{ color: grad.text }}>
        level{levelIdx + 1}.png
      </span>
    </div>
  );
}

/* ─────────────────────────────── 별점 */
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hov, setHov] = useState(0);
  const d = hov || value;
  return (
    <div className="space-y-3">
      <div className="flex gap-3 justify-center">
        {[1,2,3,4,5].map((n) => (
          <button key={n} onClick={() => onChange(n)}
            onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)}
            className="text-5xl transition-all duration-100 active:scale-90 hover:scale-115"
            style={{ filter: n <= d ? 'drop-shadow(0 2px 8px #f59e0b)' : 'grayscale(1) opacity(0.25)' }}>
            ⭐
          </button>
        ))}
      </div>
      <p className="text-center text-sm font-bold text-amber-600 h-5">
        {d ? `${d}점 · ${STAR_LABELS[d]}` : ''}
      </p>
    </div>
  );
}

/* ─────────────────────────────── 설정 패널 */
function SettingsPanel({ levels, records, totalScore, onSave, onAddRecord, onClose }: {
  levels: LevelConfig[]; records: DayRecord[]; totalScore: number;
  onSave: (u: LevelConfig[]) => void;
  onAddRecord: (r: DayRecord) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<LevelConfig[]>(
    levels.map((l) => ({ ...l, schools: [...l.schools] })));
  const [tab, setTab]       = useState<'levels'|'recovery'>('levels');
  const [recDate, setRecDate]   = useState(getTodayString());
  const [recScore, setRecScore] = useState(3);
  const [recNote, setRecNote]   = useState('');
  const [recMsg,  setRecMsg]    = useState('');

  const upSchools = (i: number, raw: string) =>
    setDraft((p) => p.map((l, j) => j===i ? {...l, schools: raw.split(',').map(s=>s.trim()).filter(Boolean)} : l));
  const upField = (i: number, f: 'name'|'subtitle', v: string) =>
    setDraft((p) => p.map((l, j) => j===i ? {...l,[f]:v} : l));
  const handleReset = () => {
    if (confirm('기본값으로 초기화할까요?'))
      setDraft(DEFAULT_LEVELS.map((l) => ({...l, schools:[...l.schools]})));
  };
  const handleAdd = () => {
    if (!recDate) return;
    if (records.find((r) => r.date === recDate)) { setRecMsg(`⚠️ ${recDate} 이미 기록 있음`); return; }
    onAddRecord({ date: recDate, score: recScore, note: recNote });
    setRecMsg(`✅ ${recDate} · ${recScore}점 추가! (누적 ${Math.min(100, totalScore + recScore)}점)`);
    setRecNote('');
  };

  const inputCls = 'w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-[780px] max-h-[88vh] flex flex-col shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div className="flex gap-2">
            {(['levels','recovery'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  tab===t ? 'bg-[#004b8d] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
                }`}>
                {t==='levels' ? '🏫 레벨 설정' : '🔧 점수 복구'}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            {tab==='levels' && (
              <>
                <button onClick={handleReset}
                  className="text-sm text-slate-400 hover:text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-100">
                  기본값 복원
                </button>
                <button onClick={() => onSave(draft)}
                  className="text-sm font-bold bg-[#004b8d] text-white px-5 py-2 rounded-xl hover:bg-blue-800">
                  저장
                </button>
              </>
            )}
            <button onClick={onClose} className="text-slate-300 hover:text-slate-500 text-2xl leading-none px-2">✕</button>
          </div>
        </div>

        {tab==='levels' && (
          <div className="overflow-y-auto px-7 py-6 space-y-4">
            {draft.map((lv, i) => (
              <div key={i} className="rounded-2xl p-5 border-2"
                style={{ borderColor: lv.color+'33', background: lv.color+'08' }}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lv.emoji}</span>
                    <div className="text-xs font-bold text-white px-3 py-1 rounded-full"
                      style={{ background: lv.color }}>
                      Lv.{i+1} · {lv.min}~{lv.max}점
                    </div>
                  </div>
                  <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden border-2"
                    style={{ borderColor: lv.color+'44' }}>
                    <img src={lv.logo} alt="" className="w-full h-full object-contain p-1"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity='0'; }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">레벨 이름</label>
                    <input className={inputCls} value={lv.name} onChange={(e) => upField(i,'name',e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">부제목</label>
                    <input className={inputCls} value={lv.subtitle} onChange={(e) => upField(i,'subtitle',e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">대학 목록 <span className="text-slate-400">(쉼표 구분)</span></label>
                  <input className={inputCls} value={lv.schools.join(', ')} onChange={(e) => upSchools(i,e.target.value)} />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {lv.schools.map((s) => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full text-white"
                        style={{ background: lv.color }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==='recovery' && (
          <div className="overflow-y-auto px-7 py-6 space-y-5">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 flex items-center gap-4">
              <div className="text-5xl font-black text-[#004b8d]">{totalScore}</div>
              <div>
                <p className="font-bold text-slate-700">현재 누적 점수</p>
                <p className="text-sm text-slate-400">{records.length}일 기록됨 (최대 100점)</p>
              </div>
            </div>
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6">
              <h3 className="font-bold text-slate-700 text-lg mb-1">📅 날짜별 점수 추가</h3>
              <p className="text-sm text-slate-500 mb-5">기록이 사라진 날짜의 점수를 직접 입력해 복구하세요.</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block font-medium">날짜 선택</label>
                  <input type="date"
                    className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                    value={recDate} max={getTodayString()}
                    onChange={(e) => { setRecDate(e.target.value); setRecMsg(''); }} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block font-medium">별점</label>
                  <div className="flex gap-2 items-center h-[46px]">
                    {[1,2,3,4,5].map((n) => (
                      <button key={n} onClick={() => setRecScore(n)}
                        className="text-3xl transition-transform hover:scale-110 active:scale-90"
                        style={{ filter: n<=recScore ? 'drop-shadow(0 0 4px #f59e0b)' : 'grayscale(1) opacity(0.25)' }}>
                        ⭐
                      </button>
                    ))}
                    <span className="text-sm font-bold text-amber-600 ml-1">{recScore}점</span>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs text-slate-500 mb-1 block font-medium">메모 (선택)</label>
                <input className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  placeholder="예: 복구된 기록" value={recNote} onChange={(e) => setRecNote(e.target.value)} />
              </div>
              <button onClick={handleAdd}
                className="w-full py-3 rounded-2xl font-bold text-white text-base active:scale-95 bg-amber-500 hover:bg-amber-600 transition-colors">
                이 날짜 점수 추가
              </button>
              {recMsg && (
                <p className="mt-3 text-sm text-center font-medium text-slate-600 bg-white rounded-xl py-2 px-4 border border-slate-200">
                  {recMsg}
                </p>
              )}
            </div>
            {records.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-500 text-sm mb-3">저장된 기록 ({records.length}개)</h3>
                <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                  {[...records].sort((a,b) => b.date.localeCompare(a.date)).map((r) => (
                    <li key={r.date} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5">
                      <span className="text-sm text-slate-400 w-24 shrink-0">{r.date}</span>
                      <div className="flex">
                        {[1,2,3,4,5].map((n) => (
                          <span key={n} className="text-sm"
                            style={{ filter: n<=r.score ? 'none' : 'grayscale(1) opacity(0.2)' }}>⭐</span>
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

/* ─────────────────────────────── 수능 카운트다운 */
const SUNEUNG_DATE = new Date('2027-11-18T00:00:00');

function CountdownBanner() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);

  const diffMs   = SUNEUNG_DATE.getTime() - now.getTime();
  if (diffMs <= 0) return (
    <div className="w-full rounded-3xl bg-gradient-to-r from-yellow-400 to-orange-400 p-5 mb-6 text-center shadow-lg">
      <p className="text-2xl font-bold text-white">🎉 수능 당일! 최선을 다하세요!</p>
    </div>
  );

  const ts   = Math.floor(diffMs / 1000);
  const days = Math.floor(ts / 86400);
  const hrs  = Math.floor((ts % 86400) / 3600);
  const mins = Math.floor((ts % 3600) / 60);
  const secs = ts % 60;

  return (
    <div className="w-full rounded-3xl mb-6 overflow-hidden shadow-xl relative"
      style={{ background: 'linear-gradient(135deg,#004b8d 0%,#1a6db5 50%,#9b1b1b 100%)' }}>
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
        <div>
          <p className="text-white/70 text-xs font-bold tracking-widest uppercase mb-1">2027 CSAT Countdown</p>
          <p className="text-white text-xl font-bold">2027년 11월 18일(목)</p>
          <p className="text-yellow-200 text-sm font-semibold mt-0.5">합격의 그날까지, 매일 한 걸음 🎯</p>
        </div>
        <div className="flex gap-3 text-center">
          {[['DAYS',days],['HRS',hrs],['MIN',mins],['SEC',secs]].map(([label, value]) => (
            <div key={label as string}
              className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3 min-w-[62px]">
              <p className="text-3xl font-black text-white tabular-nums leading-none tick-anim">
                {String(value).padStart(2, '0')}
              </p>
              <p className="text-white/70 text-xs mt-1.5 tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── 메인 앱 */
export default function App() {
  const [records, setRecords] = useState<DayRecord[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; }
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

  const [score, setScore]           = useState(3);
  const [note, setNote]             = useState('');
  const [saved, setSaved]           = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const today       = getTodayString();
  const todayRecord = records.find((r) => r.date === today);
  const totalScore  = Math.min(100, records.reduce((s, r) => s + r.score, 0));
  const level       = getLevel(totalScore, levels);
  const levelIdx    = levels.indexOf(level);
  const grad        = LEVEL_GRAD[levelIdx] ?? LEVEL_GRAD[0];

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }, [records]);
  useEffect(() => { localStorage.setItem(LEVELS_KEY,  JSON.stringify(levels));  }, [levels]);

  const handleSave = () => {
    if (todayRecord) return;
    setRecords((p) => [...p, { date: today, score, note }]);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };
  const handleReset      = () => { if (confirm('모든 기록을 초기화할까요?')) setRecords([]); };
  const handleSaveLevels = (u: LevelConfig[]) => { setLevels(u); setShowSettings(false); };
  const handleAddRecord  = (r: DayRecord)     => setRecords((p) => [...p, r]);
  const handleExport     = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), records }, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `univer-records-${today}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().slice(0, 10);
  });
  const DAY_KO = ['일','월','화','수','목','금','토'];

  return (
    /* 밝은 캠퍼스 낮 배경 */
    <div className="min-h-screen relative flex flex-col items-center px-5 py-8 overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg, #f0f7ff 0%, #e8f4fd 40%, #fef9ee 100%)' }}>

      {/* 배경 장식 원형 블롭 */}
      <div className="fixed top-[-80px] left-[-80px] w-[500px] h-[500px] rounded-full opacity-30
                      bg-gradient-to-br from-blue-200 to-sky-100 blur-[80px] pointer-events-none" />
      <div className="fixed bottom-[-100px] right-[-60px] w-[400px] h-[400px] rounded-full opacity-25
                      bg-gradient-to-br from-rose-200 to-orange-100 blur-[80px] pointer-events-none" />

      {showSettings && (
        <SettingsPanel levels={levels} records={records} totalScore={totalScore}
          onSave={handleSaveLevels} onAddRecord={handleAddRecord} onClose={() => setShowSettings(false)} />
      )}

      <div className="w-full max-w-[820px] relative z-10">

        {/* ── 헤더 */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-3xl">🎓</span>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">대학 레벨업</h1>
            </div>
            <p className="text-slate-400 text-sm pl-1">고려대 식품공학과까지, 오늘도 캠퍼스를 향해</p>
          </div>
          <button onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm
                       bg-white border border-slate-200 text-slate-600 shadow-sm
                       hover:bg-slate-50 active:scale-95 transition-all">
            ⚙️ 설정
          </button>
        </div>

        {/* ── 수능 카운트다운 */}
        <CountdownBanner />

        {/* ── 레벨 히어로 카드 */}
        <div className="w-full rounded-[28px] mb-6 overflow-hidden shadow-xl relative"
          style={{ background: `linear-gradient(135deg, ${grad.from} 0%, ${grad.to} 100%)` }}>

          {/* 상단 컬러 스트라이프 */}
          <div className="h-1.5 w-full" style={{ background: level.color }} />
          {/* 패턴 */}
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />

          <div className="relative p-8">
            {/* 레벨 뱃지 */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[11px] font-black tracking-[0.18em] uppercase"
                style={{ color: grad.text + 'aa' }}>Current Level</span>
              <div className="h-px flex-1 opacity-20" style={{ background: grad.text }} />
              <span className="text-xs font-black px-3 py-1 rounded-full border"
                style={{ color: grad.text, borderColor: grad.text + '40', background: grad.text + '15' }}>
                {levelIdx + 1} / {levels.length}
              </span>
            </div>

            <div className="flex items-center gap-8">
              {/* 왼쪽 텍스트 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold tracking-widest uppercase mb-2"
                  style={{ color: grad.text + 'bb' }}>
                  {level.emoji} {level.subtitle}
                </p>
                <h2 className="text-5xl font-black leading-none mb-4 tracking-tight" style={{ color: grad.text }}>
                  {level.name}
                </h2>
                <div className="flex flex-wrap gap-2 mb-7">
                  {level.schools.map((s) => (
                    <span key={s} className="text-xs font-semibold rounded-full px-3 py-1.5"
                      style={{
                        color: grad.text,
                        background: grad.text + '18',
                        border: `1px solid ${grad.text}30`,
                      }}>
                      {s}
                    </span>
                  ))}
                </div>

                {/* 진행도 바 */}
                <div>
                  <div className="flex justify-between text-xs mb-2 font-medium"
                    style={{ color: grad.text + '88' }}>
                    <span>진행도</span>
                    <span className="font-black text-sm" style={{ color: grad.text }}>
                      {totalScore}<span className="font-normal opacity-60"> / 100점</span>
                    </span>
                  </div>
                  <div className="h-3.5 rounded-full overflow-hidden border"
                    style={{ background: grad.text + '18', borderColor: grad.text + '25' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${totalScore}%`,
                        background: `linear-gradient(90deg, ${level.color}cc, ${level.color})`,
                        boxShadow: `0 0 10px ${level.color}80`,
                      }} />
                  </div>
                  <div className="flex justify-between mt-1.5 px-0.5"
                    style={{ color: grad.text + '50' }}>
                    {levels.map((l) => (
                      <span key={l.min} className="text-[10px]">{l.min}</span>
                    ))}
                    <span className="text-[10px]">100</span>
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

        {/* ── 2열 그리드 */}
        <div className="grid grid-cols-2 gap-5">

          {/* 오늘의 만족도 */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-7 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">✏️</span>
              <h2 className="font-black text-slate-800 text-xl">오늘의 만족도</h2>
            </div>
            <p className="text-slate-400 text-sm mb-5 pl-8">{today}</p>

            {todayRecord ? (
              <div className="flex flex-col items-center justify-center py-6 gap-3">
                <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-300
                                flex items-center justify-center text-3xl shadow-sm">✅</div>
                <p className="text-green-600 font-bold text-lg">오늘 기록 완료!</p>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((n) => (
                    <span key={n} className="text-2xl"
                      style={{ filter: n<=todayRecord.score ? 'drop-shadow(0 0 4px #f59e0b)' : 'grayscale(1) opacity(0.25)' }}>
                      ⭐
                    </span>
                  ))}
                </div>
                {todayRecord.note && (
                  <p className="text-slate-400 text-sm text-center italic">"{todayRecord.note}"</p>
                )}
              </div>
            ) : (
              <>
                <StarPicker value={score} onChange={setScore} />
                <textarea
                  className="w-full border border-slate-200 rounded-2xl p-4 text-sm
                             text-slate-700 placeholder-slate-300 resize-none mt-5
                             focus:outline-none focus:ring-2 focus:ring-blue-300 bg-slate-50"
                  rows={4}
                  placeholder="오늘 하루 한 마디 (선택)"
                  value={note} onChange={(e) => setNote(e.target.value)}
                />
                <button onClick={handleSave}
                  className="mt-4 w-full py-4 rounded-2xl font-black text-white text-base
                             transition-all active:scale-95 shadow-md"
                  style={{
                    background: saved
                      ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                      : `linear-gradient(135deg,#004b8d,#1a6db5)`,
                    boxShadow: saved ? '0 4px 20px #22c55e44' : '0 4px 20px #004b8d44',
                  }}>
                  {saved ? '✓ 저장됨!' : '오늘 기록 저장'}
                </button>
              </>
            )}
          </div>

          {/* 이번 주 기록 */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-7 shadow-lg flex flex-col">
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">📅</span>
                <div>
                  <h2 className="font-black text-slate-800 text-xl">이번 주 기록</h2>
                  <p className="text-slate-400 text-xs mt-0.5">최근 7일</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={handleExport}
                  className="text-xs text-blue-600 hover:text-blue-700 py-1.5 px-3 rounded-xl
                             hover:bg-blue-50 font-semibold transition-colors">
                  💾
                </button>
                <button onClick={handleReset}
                  className="text-xs text-red-400 hover:text-red-500 py-1.5 px-3 rounded-xl
                             hover:bg-red-50 transition-colors">
                  초기화
                </button>
              </div>
            </div>

            {/* 7일 달력 */}
            <div className="grid grid-cols-7 gap-1.5 mb-5">
              {last7Days.map((date) => {
                const rec    = records.find((r) => r.date === date);
                const d      = new Date(date + 'T00:00:00');
                const isToday = date === today;
                const isSat  = d.getDay() === 6;
                const isSun  = d.getDay() === 0;
                return (
                  <div key={date}
                    className={`flex flex-col items-center rounded-2xl py-3 px-1 border transition-colors ${
                      isToday
                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                        : 'bg-slate-50 border-slate-100'
                    }`}>
                    <span className={`text-xs font-bold mb-1 ${isSun?'text-red-400':isSat?'text-blue-500':'text-slate-400'}`}>
                      {DAY_KO[d.getDay()]}
                    </span>
                    <span className="text-[10px] text-slate-300 mb-2">
                      {date.slice(5).replace('-','/')}
                    </span>
                    {rec ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex flex-wrap justify-center gap-0.5">
                          {[1,2,3,4,5].map((n) => (
                            <span key={n} className="text-xs"
                              style={{ filter: n<=rec.score ? 'none' : 'grayscale(1) opacity(0.15)' }}>⭐</span>
                          ))}
                        </div>
                        <span className="text-xs font-black text-amber-500">{rec.score}점</span>
                      </div>
                    ) : (
                      <span className="text-slate-200 text-lg">—</span>
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
                  <div key={r.date} className="flex gap-3 items-start bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                    <span className="text-xs text-slate-300 shrink-0 mt-0.5 w-12">
                      {r.date.slice(5).replace('-','/')}
                    </span>
                    <span className="text-sm text-slate-500 leading-relaxed italic">"{r.note}"</span>
                  </div>
                ))}
              {last7Days.every((date) => { const r = records.find((rc) => rc.date === date); return !r || !r.note; }) && (
                <p className="text-slate-300 text-sm text-center py-4">이번 주 메모가 없습니다.</p>
              )}
            </div>
          </div>

        </div>

        {/* 푸터 */}
        <p className="text-slate-300 text-xs mt-8 text-center tracking-wide">
          데이터는 이 기기에 저장됩니다 · 💾 버튼으로 JSON 백업 가능
        </p>
      </div>
    </div>
  );
}
