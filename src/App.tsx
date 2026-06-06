import { useState, useEffect, createContext, useContext } from 'react';

/* ═══════════════════════════════════════
   테마 토큰
═══════════════════════════════════════ */
type ThemeId = 'light' | 'dark';

const LIGHT = {
  id: 'light' as ThemeId,
  pageBg:        'linear-gradient(160deg, #f0f7ff 0%, #e8f4fd 40%, #fef9ee 100%)',
  blob1:         'rgba(186,230,255,0.35)',
  blob2:         'rgba(254,202,202,0.28)',
  bodyBg:        '#f0f7ff',
  cardBg:        '#ffffff',
  cardBorder:    'rgba(226,232,240,0.9)',
  textH:         '#1e293b',
  textSub:       '#94a3b8',
  textLabel:     '#64748b',
  textBody:      '#475569',
  inputBg:       '#f8fafc',
  inputBorder:   '#e2e8f0',
  inputText:     '#334155',
  inputPlace:    '#cbd5e1',
  rowBg:         '#f8fafc',
  rowBorder:     '#f1f5f9',
  rowText:       '#64748b',
  rowDate:       '#cbd5e1',
  starLabel:     '#d97706',
  footerText:    '#cbd5e1',
  checkBg:       '#dcfce7',
  checkBorder:   '#86efac',
  checkText:     '#16a34a',
  calToday:      '#eff6ff',
  calTodayBorder:'#bfdbfe',
  calRow:        '#f8fafc',
  calBorder:     '#f1f5f9',
  settingsBg:    '#ffffff',
  settingsHBorder:'#f1f5f9',
  setLevelBg:    (c: string) => c + '08',
  setLevelBorder:(c: string) => c + '33',
  recoverBorder: '#fde68a',
  recoverBg:     '#fffbeb',
  recoverListBg: '#f8fafc',
  tabActive:     '#004b8d',
  tabActiveTxt:  '#ffffff',
  tabInactive:   'transparent',
  tabInactiveTxt:'#64748b',
  saveBtn:       'linear-gradient(135deg,#004b8d,#1a6db5)',
  saveShadow:    '0 4px 20px #004b8d44',
  savedBtn:      'linear-gradient(135deg,#22c55e,#16a34a)',
  savedShadow:   '0 4px 20px #22c55e44',
  settSaveBtn:   '#004b8d',
};

const DARK = {
  id: 'dark' as ThemeId,
  pageBg:        '#0a1628',
  blob1:         'rgba(0,75,141,0.22)',
  blob2:         'rgba(139,0,0,0.18)',
  bodyBg:        '#0a1628',
  cardBg:        'rgba(13,31,61,0.88)',
  cardBorder:    'rgba(255,255,255,0.1)',
  textH:         '#f1f5f9',
  textSub:       'rgba(255,255,255,0.32)',
  textLabel:     'rgba(255,255,255,0.55)',
  textBody:      'rgba(255,255,255,0.7)',
  inputBg:       'rgba(255,255,255,0.07)',
  inputBorder:   'rgba(255,255,255,0.15)',
  inputText:     '#e2e8f0',
  inputPlace:    'rgba(255,255,255,0.2)',
  rowBg:         'rgba(255,255,255,0.05)',
  rowBorder:     'rgba(255,255,255,0.06)',
  rowText:       'rgba(255,255,255,0.5)',
  rowDate:       'rgba(255,255,255,0.2)',
  starLabel:     '#d4a017',
  footerText:    'rgba(255,255,255,0.2)',
  checkBg:       'rgba(34,197,94,0.15)',
  checkBorder:   'rgba(34,197,94,0.3)',
  checkText:     '#4ade80',
  calToday:      'rgba(212,160,23,0.18)',
  calTodayBorder:'rgba(212,160,23,0.45)',
  calRow:        'rgba(255,255,255,0.05)',
  calBorder:     'rgba(255,255,255,0.05)',
  settingsBg:    '#0d1f3d',
  settingsHBorder:'rgba(255,255,255,0.1)',
  setLevelBg:    (c: string) => c + '12',
  setLevelBorder:(c: string) => c + '40',
  recoverBorder: 'rgba(212,160,23,0.35)',
  recoverBg:     'rgba(212,160,23,0.08)',
  recoverListBg: 'rgba(255,255,255,0.05)',
  tabActive:     '#d4a017',
  tabActiveTxt:  '#0a1628',
  tabInactive:   'transparent',
  tabInactiveTxt:'rgba(255,255,255,0.45)',
  saveBtn:       'linear-gradient(135deg,#d4a017,#f9d423)',
  saveShadow:    '0 4px 20px #d4a01744',
  savedBtn:      'linear-gradient(135deg,#22c55e,#16a34a)',
  savedShadow:   '0 4px 20px #22c55e44',
  settSaveBtn:   '#d4a017',
};

type Tokens = typeof LIGHT;
const ThemeCtx = createContext<Tokens>(LIGHT);
function useTheme() { return useContext(ThemeCtx); }

/* ═══════════════════════════════════════
   타입 & 데이터
═══════════════════════════════════════ */
type LevelConfig = {
  name: string; subtitle: string; schools: string[];
  min: number; max: number; color: string; emoji: string; logo: string;
};
type DayRecord = { date: string; score: number; note: string; };

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
const THEME_KEY   = 'univer_theme';

const STAR_LABELS: Record<number, string> = {
  1: '매우 나쁨', 2: '나쁨', 3: '보통', 4: '좋음', 5: '최고!',
};

const LEVEL_GRAD = [
  { from: '#e2e8f0', to: '#94a3b8', text: '#1e293b' },
  { from: '#d1fae5', to: '#6ee7b7', text: '#064e3b' },
  { from: '#dbeafe', to: '#93c5fd', text: '#1e3a8a' },
  { from: '#fef3c7', to: '#fcd34d', text: '#78350f' },
  { from: '#ffe4e6', to: '#fca5a5', text: '#7f1d1d' },
];

function getTodayString() { return new Date().toISOString().slice(0, 10); }
function getLevel(s: number, ls: LevelConfig[]) {
  return ls.find((l) => s >= l.min && s <= l.max) ?? ls[0];
}

/* ═══════════════════════════════════════
   로고 영역  240 × 240
═══════════════════════════════════════ */
function LevelLogoArea({ logo, levelIdx }: { logo: string; levelIdx: number }) {
  const [failed, setFailed] = useState(false);
  const grad = LEVEL_GRAD[levelIdx] ?? LEVEL_GRAD[0];

  if (!failed) return (
    <div className="w-[240px] h-[240px] shrink-0 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/60">
      <img src={logo} alt={`레벨 ${levelIdx + 1} 로고`}
        className="w-full h-full object-cover"
        onError={() => setFailed(true)} />
    </div>
  );
  return (
    <div className="w-[240px] h-[240px] shrink-0 flex flex-col items-center justify-center
                    rounded-2xl border-2 border-dashed shadow-inner"
      style={{ borderColor: grad.text + '40', background: grad.text + '08' }}>
      <span className="text-5xl mb-3 opacity-30">🏛️</span>
      <span className="text-sm font-medium opacity-40" style={{ color: grad.text }}>
        level{levelIdx + 1}.png
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════
   별점 선택
═══════════════════════════════════════ */
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const th = useTheme();
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
      <p className="text-center text-sm font-bold h-5" style={{ color: th.starLabel }}>
        {d ? `${d}점 · ${STAR_LABELS[d]}` : ''}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════
   테마 토글 버튼
═══════════════════════════════════════ */
function ThemeToggle({ theme, onToggle }: { theme: ThemeId; onToggle: () => void }) {
  const isDark = theme === 'dark';
  return (
    <button
      onClick={onToggle}
      aria-label="테마 전환"
      className="relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm
                 transition-all active:scale-95 border"
      style={{
        background: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
        borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
        color: isDark ? '#f1f5f9' : '#475569',
      }}
    >
      <span className="text-lg leading-none">{isDark ? '🌙' : '☀️'}</span>
      <span>{isDark ? '야간 모드' : '주간 모드'}</span>
      {/* 슬라이더 */}
      <span
        className="w-10 h-5 rounded-full flex items-center transition-all duration-300 ml-1"
        style={{ background: isDark ? '#d4a017' : '#cbd5e1' }}>
        <span
          className="w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300"
          style={{ transform: isDark ? 'translateX(22px)' : 'translateX(2px)' }} />
      </span>
    </button>
  );
}

/* ═══════════════════════════════════════
   설정 패널
═══════════════════════════════════════ */
function SettingsPanel({ levels, records, totalScore, theme, onSave, onAddRecord, onThemeChange, onClose }: {
  levels: LevelConfig[]; records: DayRecord[]; totalScore: number;
  theme: ThemeId;
  onSave: (u: LevelConfig[]) => void;
  onAddRecord: (r: DayRecord) => void;
  onThemeChange: () => void;
  onClose: () => void;
}) {
  const th = useTheme();
  const [draft, setDraft]       = useState<LevelConfig[]>(levels.map((l) => ({ ...l, schools: [...l.schools] })));
  const [tab, setTab]           = useState<'levels'|'recovery'>('levels');
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

  const inputCls = 'w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 border';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
      <div className="rounded-3xl w-full max-w-[740px] max-h-[90vh] flex flex-col shadow-2xl border"
        style={{ background: th.settingsBg, borderColor: th.settingsHBorder }}>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: th.settingsHBorder }}>
          <div className="flex gap-2">
            {(['levels','recovery'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: tab===t ? th.tabActive : th.tabInactive,
                  color: tab===t ? th.tabActiveTxt : th.tabInactiveTxt,
                }}>
                {t==='levels' ? '🏫 레벨 설정' : '🔧 점수 복구'}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            {/* 테마 전환 */}
            <ThemeToggle theme={theme} onToggle={onThemeChange} />
            {tab==='levels' && (
              <>
                <button onClick={handleReset}
                  className="text-sm px-3 py-2 rounded-xl transition-colors"
                  style={{ color: th.textSub }}>
                  기본값 복원
                </button>
                <button onClick={() => onSave(draft)}
                  className="text-sm font-bold text-white px-4 py-2 rounded-xl hover:brightness-110"
                  style={{ background: th.settSaveBtn }}>
                  저장
                </button>
              </>
            )}
            <button onClick={onClose}
              className="text-2xl leading-none px-2 transition-colors"
              style={{ color: th.textSub }}>✕</button>
          </div>
        </div>

        {/* 탭: 레벨 설정 */}
        {tab==='levels' && (
          <div className="overflow-y-auto px-6 py-5 space-y-4">
            {draft.map((lv, i) => (
              <div key={i} className="rounded-2xl p-5 border"
                style={{ background: th.setLevelBg(lv.color), borderColor: th.setLevelBorder(lv.color) }}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lv.emoji}</span>
                    <div className="text-xs font-bold text-white px-3 py-1 rounded-full"
                      style={{ background: lv.color }}>
                      Lv.{i+1} · {lv.min}~{lv.max}점
                    </div>
                  </div>
                  <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden border"
                    style={{ borderColor: lv.color + '44' }}>
                    <img src={lv.logo} alt="" className="w-full h-full object-contain p-1"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity='0'; }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {(['name','subtitle'] as const).map((f) => (
                    <div key={f}>
                      <label className="text-xs mb-1 block" style={{ color: th.textLabel }}>
                        {f==='name' ? '레벨 이름' : '부제목'}
                      </label>
                      <input className={inputCls}
                        style={{ background: th.inputBg, borderColor: th.inputBorder, color: th.inputText }}
                        value={lv[f]} onChange={(e) => upField(i, f, e.target.value)} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: th.textLabel }}>
                    대학 목록 <span style={{ color: th.textSub }}>(쉼표 구분)</span>
                  </label>
                  <input className={inputCls}
                    style={{ background: th.inputBg, borderColor: th.inputBorder, color: th.inputText }}
                    value={lv.schools.join(', ')} onChange={(e) => upSchools(i, e.target.value)} />
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

        {/* 탭: 점수 복구 */}
        {tab==='recovery' && (
          <div className="overflow-y-auto px-6 py-5 space-y-4">
            <div className="rounded-2xl p-5 flex items-center gap-4 border"
              style={{ background: th.rowBg, borderColor: th.rowBorder }}>
              <div className="text-5xl font-black" style={{ color: th.tabActive }}>{totalScore}</div>
              <div>
                <p className="font-bold" style={{ color: th.textH }}>현재 누적 점수</p>
                <p className="text-sm" style={{ color: th.textSub }}>{records.length}일 기록됨 (최대 100점)</p>
              </div>
            </div>
            <div className="rounded-2xl p-5 border"
              style={{ background: th.recoverBg, borderColor: th.recoverBorder }}>
              <h3 className="font-bold text-lg mb-1" style={{ color: th.textH }}>📅 날짜별 점수 추가</h3>
              <p className="text-sm mb-5" style={{ color: th.textSub }}>기록이 사라진 날짜의 점수를 직접 입력해 복구하세요.</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs mb-1 block font-medium" style={{ color: th.textLabel }}>날짜 선택</label>
                  <input type="date"
                    className="w-full rounded-xl px-4 py-3 text-base border focus:outline-none focus:ring-2 focus:ring-amber-400"
                    style={{ background: th.inputBg, borderColor: th.inputBorder, color: th.inputText }}
                    value={recDate} max={getTodayString()}
                    onChange={(e) => { setRecDate(e.target.value); setRecMsg(''); }} />
                </div>
                <div>
                  <label className="text-xs mb-1 block font-medium" style={{ color: th.textLabel }}>별점</label>
                  <div className="flex gap-2 items-center h-[46px]">
                    {[1,2,3,4,5].map((n) => (
                      <button key={n} onClick={() => setRecScore(n)}
                        className="text-3xl transition-transform hover:scale-110 active:scale-90"
                        style={{ filter: n<=recScore ? 'drop-shadow(0 0 4px #f59e0b)' : 'grayscale(1) opacity(0.25)' }}>
                        ⭐
                      </button>
                    ))}
                    <span className="text-sm font-bold ml-1" style={{ color: th.starLabel }}>{recScore}점</span>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs mb-1 block font-medium" style={{ color: th.textLabel }}>메모 (선택)</label>
                <input className="w-full rounded-xl px-4 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-amber-400"
                  style={{ background: th.inputBg, borderColor: th.inputBorder, color: th.inputText }}
                  placeholder="예: 복구된 기록" value={recNote} onChange={(e) => setRecNote(e.target.value)} />
              </div>
              <button onClick={handleAdd}
                className="w-full py-3 rounded-xl font-bold text-white text-base active:scale-95 transition-all bg-amber-500 hover:bg-amber-600">
                이 날짜 점수 추가
              </button>
              {recMsg && (
                <p className="mt-3 text-sm text-center font-medium rounded-xl py-2 px-4 border"
                  style={{ color: th.textBody, background: th.rowBg, borderColor: th.rowBorder }}>
                  {recMsg}
                </p>
              )}
            </div>
            {records.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-3" style={{ color: th.textSub }}>저장된 기록 ({records.length}개)</h3>
                <ul className="space-y-1.5 max-h-44 overflow-y-auto">
                  {[...records].sort((a,b) => b.date.localeCompare(a.date)).map((r) => (
                    <li key={r.date} className="flex items-center gap-3 rounded-xl px-4 py-2.5 border"
                      style={{ background: th.rowBg, borderColor: th.rowBorder }}>
                      <span className="text-sm w-24 shrink-0" style={{ color: th.rowDate }}>{r.date}</span>
                      <div className="flex">
                        {[1,2,3,4,5].map((n) => (
                          <span key={n} className="text-sm"
                            style={{ filter: n<=r.score ? 'none' : 'grayscale(1) opacity(0.2)' }}>⭐</span>
                        ))}
                      </div>
                      {r.note && <span className="text-xs truncate" style={{ color: th.textSub }}>· {r.note}</span>}
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

/* ═══════════════════════════════════════
   수능 카운트다운
═══════════════════════════════════════ */
const SUNEUNG_DATE = new Date('2027-11-18T00:00:00');

function CountdownBanner() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);

  const diffMs = SUNEUNG_DATE.getTime() - now.getTime();
  if (diffMs <= 0) return (
    <div className="w-full rounded-3xl bg-gradient-to-r from-yellow-400 to-orange-400 p-5 mb-5 text-center shadow-lg">
      <p className="text-2xl font-bold text-white">🎉 수능 당일! 최선을 다하세요!</p>
    </div>
  );

  const ts   = Math.floor(diffMs / 1000);
  const days = Math.floor(ts / 86400);
  const hrs  = Math.floor((ts % 86400) / 3600);
  const mins = Math.floor((ts % 3600) / 60);
  const secs = ts % 60;

  return (
    <div className="w-full rounded-2xl mb-5 overflow-hidden shadow-xl relative"
      style={{ background: 'linear-gradient(135deg,#004b8d 0%,#1a6db5 50%,#9b1b1b 100%)' }}>
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      <div className="relative flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mb-1">2027 CSAT Countdown</p>
          <p className="text-white text-base font-bold leading-tight">2027년 11월 18일(목)</p>
          <p className="text-yellow-200 text-xs font-semibold mt-0.5">합격의 그날까지, 매일 한 걸음 🎯</p>
        </div>
        <div className="flex gap-2 text-center">
          {[['DAYS',days],['HRS',hrs],['MIN',mins],['SEC',secs]].map(([label, value]) => (
            <div key={label as string}
              className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2.5 min-w-[54px]">
              <p className="text-2xl font-black text-white tabular-nums leading-none tick-anim">
                {String(value).padStart(2, '0')}
              </p>
              <p className="text-white/60 text-[10px] mt-1 tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   메인 앱
═══════════════════════════════════════ */
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
  const [themeId, setThemeId] = useState<ThemeId>(() =>
    (localStorage.getItem(THEME_KEY) as ThemeId) ?? 'light'
  );

  const [score, setScore]               = useState(3);
  const [note, setNote]                 = useState('');
  const [saved, setSaved]               = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const th       = themeId === 'dark' ? DARK : LIGHT;
  const today    = getTodayString();
  const todayRec = records.find((r) => r.date === today);
  const total    = Math.min(100, records.reduce((s, r) => s + r.score, 0));
  const level    = getLevel(total, levels);
  const levelIdx = levels.indexOf(level);
  const grad     = LEVEL_GRAD[levelIdx] ?? LEVEL_GRAD[0];

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }, [records]);
  useEffect(() => { localStorage.setItem(LEVELS_KEY,  JSON.stringify(levels));  }, [levels]);
  useEffect(() => {
    localStorage.setItem(THEME_KEY, themeId);
    document.body.style.background = th.bodyBg;
  }, [themeId, th.bodyBg]);

  const handleSave = () => {
    if (todayRec) return;
    setRecords((p) => [...p, { date: today, score, note }]);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };
  const handleReset      = () => { if (confirm('모든 기록을 초기화할까요?')) setRecords([]); };
  const handleSaveLevels = (u: LevelConfig[]) => { setLevels(u); setShowSettings(false); };
  const handleAddRecord  = (r: DayRecord) => setRecords((p) => [...p, r]);
  const handleToggleTheme = () => setThemeId((t) => t === 'light' ? 'dark' : 'light');
  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), records }, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `univer-records-${today}.json`; a.click(); URL.revokeObjectURL(url);
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().slice(0, 10);
  });
  const DAY_KO = ['일','월','화','수','목','금','토'];

  return (
    <ThemeCtx.Provider value={th}>
      <div className="min-h-screen relative flex flex-col items-center px-4 py-6 overflow-x-hidden transition-colors duration-300"
        style={{ background: th.pageBg }}>

        {/* 배경 블롭 */}
        <div className="fixed top-[-80px] left-[-80px] w-[500px] h-[500px] rounded-full blur-[80px] pointer-events-none transition-colors duration-500"
          style={{ background: th.blob1 }} />
        <div className="fixed bottom-[-100px] right-[-60px] w-[400px] h-[400px] rounded-full blur-[80px] pointer-events-none transition-colors duration-500"
          style={{ background: th.blob2 }} />

        {showSettings && (
          <SettingsPanel levels={levels} records={records} totalScore={total}
            theme={themeId}
            onSave={handleSaveLevels} onAddRecord={handleAddRecord}
            onThemeChange={handleToggleTheme}
            onClose={() => setShowSettings(false)} />
        )}

        <div className="w-full max-w-[778px] relative z-10">

          {/* ── 헤더 */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-2xl">🎓</span>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: th.textH }}>대학 레벨업</h1>
              </div>
              <p className="text-xs pl-1" style={{ color: th.textSub }}>고려대 식품공학과까지, 오늘도 캠퍼스를 향해</p>
            </div>
            <div className="flex gap-2 items-center">
              {/* 헤더 테마 토글 (빠른 전환용) */}
              <button onClick={handleToggleTheme}
                aria-label="테마 전환"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl
                           transition-all active:scale-90 border"
                style={{
                  background: th.inputBg,
                  borderColor: th.inputBorder,
                  color: th.textH,
                }}>
                {themeId === 'dark' ? '🌙' : '☀️'}
              </button>
              <button onClick={() => setShowSettings(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm
                           border transition-all active:scale-95"
                style={{ background: th.cardBg, borderColor: th.cardBorder, color: th.textBody }}>
                ⚙️ 설정
              </button>
            </div>
          </div>

          {/* ── 수능 카운트다운 */}
          <CountdownBanner />

          {/* ── 레벨 히어로 카드 */}
          <div className="w-full rounded-[24px] mb-5 overflow-hidden shadow-xl"
            style={{ background: `linear-gradient(135deg, ${grad.from} 0%, ${grad.to} 100%)` }}>
            <div className="h-1.5 w-full" style={{ background: level.color }} />
            <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[11px] font-black tracking-[0.18em] uppercase"
                  style={{ color: grad.text + 'aa' }}>Current Level</span>
                <div className="h-px flex-1 opacity-20" style={{ background: grad.text }} />
                <span className="text-xs font-black px-3 py-1 rounded-full border"
                  style={{ color: grad.text, borderColor: grad.text + '40', background: grad.text + '15' }}>
                  {levelIdx + 1} / {levels.length}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold tracking-widest uppercase mb-1.5"
                    style={{ color: grad.text + 'bb' }}>{level.emoji} {level.subtitle}</p>
                  <h2 className="text-4xl font-black leading-none mb-3 tracking-tight" style={{ color: grad.text }}>
                    {level.name}
                  </h2>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {level.schools.map((s) => (
                      <span key={s} className="text-xs font-semibold rounded-full px-2.5 py-1"
                        style={{ color: grad.text, background: grad.text + '18', border: `1px solid ${grad.text}30` }}>
                        {s}
                      </span>
                    ))}
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-medium"
                      style={{ color: grad.text + '88' }}>
                      <span>진행도</span>
                      <span className="font-black" style={{ color: grad.text }}>
                        {total}<span className="font-normal opacity-60"> / 100점</span>
                      </span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden border"
                      style={{ background: grad.text + '18', borderColor: grad.text + '25' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${total}%`,
                          background: `linear-gradient(90deg, ${level.color}cc, ${level.color})`,
                          boxShadow: `0 0 10px ${level.color}80`,
                        }} />
                    </div>
                    <div className="flex justify-between mt-1 px-0.5" style={{ color: grad.text + '50' }}>
                      {levels.map((l) => <span key={l.min} className="text-[10px]">{l.min}</span>)}
                      <span className="text-[10px]">100</span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  <LevelLogoArea logo={level.logo} levelIdx={levelIdx} />
                </div>
              </div>
            </div>
          </div>

          {/* ── 2열 그리드 */}
          <div className="grid grid-cols-2 gap-4">

            {/* 오늘의 만족도 */}
            <div className="rounded-2xl p-5 border shadow-lg transition-colors duration-300"
              style={{ background: th.cardBg, borderColor: th.cardBorder }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">✏️</span>
                <h2 className="font-black text-lg" style={{ color: th.textH }}>오늘의 만족도</h2>
              </div>
              <p className="text-xs mb-4 pl-7" style={{ color: th.textSub }}>{today}</p>

              {todayRec ? (
                <div className="flex flex-col items-center justify-center py-5 gap-3">
                  <div className="w-14 h-14 rounded-full border-2 flex items-center justify-center text-2xl shadow-sm"
                    style={{ background: th.checkBg, borderColor: th.checkBorder }}>✅</div>
                  <p className="font-bold text-base" style={{ color: th.checkText }}>오늘 기록 완료!</p>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((n) => (
                      <span key={n} className="text-2xl"
                        style={{ filter: n<=todayRec.score ? 'drop-shadow(0 0 4px #f59e0b)' : 'grayscale(1) opacity(0.25)' }}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  {todayRec.note && (
                    <p className="text-sm text-center italic" style={{ color: th.textSub }}>"{todayRec.note}"</p>
                  )}
                </div>
              ) : (
                <>
                  <StarPicker value={score} onChange={setScore} />
                  <textarea
                    className="w-full rounded-xl p-3 text-sm resize-none mt-4 border focus:outline-none focus:ring-2 focus:ring-blue-300"
                    style={{
                      background: th.inputBg, borderColor: th.inputBorder,
                      color: th.inputText,
                    }}
                    rows={3}
                    placeholder="오늘 하루 한 마디 (선택)"
                    value={note} onChange={(e) => setNote(e.target.value)}
                  />
                  <button onClick={handleSave}
                    className="mt-3 w-full py-3.5 rounded-xl font-black text-base active:scale-95 transition-all"
                    style={{
                      background: saved ? th.savedBtn : th.saveBtn,
                      boxShadow: saved ? th.savedShadow : th.saveShadow,
                      color: themeId === 'dark' && !saved ? '#0a1628' : '#ffffff',
                    }}>
                    {saved ? '✓ 저장됨!' : '오늘 기록 저장'}
                  </button>
                </>
              )}
            </div>

            {/* 이번 주 기록 */}
            <div className="rounded-2xl p-5 border shadow-lg flex flex-col transition-colors duration-300"
              style={{ background: th.cardBg, borderColor: th.cardBorder }}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  <div>
                    <h2 className="font-black text-lg" style={{ color: th.textH }}>이번 주 기록</h2>
                    <p className="text-xs mt-0.5" style={{ color: th.textSub }}>최근 7일</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={handleExport}
                    className="text-xs py-1.5 px-2.5 rounded-xl font-semibold transition-colors"
                    style={{ color: '#3b82f6' }}>💾</button>
                  <button onClick={handleReset}
                    className="text-xs py-1.5 px-2.5 rounded-xl transition-colors"
                    style={{ color: '#f87171' }}>초기화</button>
                </div>
              </div>

              {/* 7일 달력 */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {last7Days.map((date) => {
                  const rec     = records.find((r) => r.date === date);
                  const d       = new Date(date + 'T00:00:00');
                  const isToday = date === today;
                  const isSat   = d.getDay() === 6;
                  const isSun   = d.getDay() === 0;
                  return (
                    <div key={date}
                      className="flex flex-col items-center rounded-xl py-2.5 px-0.5 border transition-colors"
                      style={{
                        background: isToday ? th.calToday : th.calRow,
                        borderColor: isToday ? th.calTodayBorder : th.calBorder,
                      }}>
                      <span className="text-[11px] font-bold mb-0.5"
                        style={{ color: isSun ? '#f87171' : isSat ? '#60a5fa' : th.textSub }}>
                        {DAY_KO[d.getDay()]}
                      </span>
                      <span className="text-[9px] mb-1.5" style={{ color: th.rowDate }}>
                        {date.slice(5).replace('-','/')}
                      </span>
                      {rec ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="flex flex-wrap justify-center gap-0.5">
                            {[1,2,3,4,5].map((n) => (
                              <span key={n} className="text-[10px]"
                                style={{ filter: n<=rec.score ? 'none' : 'grayscale(1) opacity(0.15)' }}>⭐</span>
                            ))}
                          </div>
                          <span className="text-[10px] font-black" style={{ color: th.starLabel }}>{rec.score}점</span>
                        </div>
                      ) : (
                        <span className="text-base" style={{ color: th.calBorder }}>—</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 메모 */}
              <div className="flex-1 overflow-y-auto space-y-1.5">
                {last7Days
                  .map((date) => records.find((r) => r.date === date))
                  .filter((r): r is DayRecord => !!r && !!r.note)
                  .reverse()
                  .map((r) => (
                    <div key={r.date} className="flex gap-2 items-start rounded-xl px-3 py-2.5 border"
                      style={{ background: th.rowBg, borderColor: th.rowBorder }}>
                      <span className="text-xs shrink-0 mt-0.5 w-10" style={{ color: th.rowDate }}>
                        {r.date.slice(5).replace('-','/')}
                      </span>
                      <span className="text-xs leading-relaxed italic" style={{ color: th.rowText }}>"{r.note}"</span>
                    </div>
                  ))}
                {last7Days.every((date) => { const r = records.find((rc) => rc.date===date); return !r||!r.note; }) && (
                  <p className="text-xs text-center py-3" style={{ color: th.rowDate }}>이번 주 메모가 없습니다.</p>
                )}
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <p className="text-xs mt-6 text-center tracking-wide" style={{ color: th.footerText }}>
            데이터는 이 기기에 저장됩니다 · 💾 버튼으로 JSON 백업 가능
          </p>
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}
