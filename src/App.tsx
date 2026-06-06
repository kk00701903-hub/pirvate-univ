import { useState, useEffect, createContext, useContext } from 'react';

/* ══════════════════════════════════════════════
   테마 ID  (light / dark / auto)
══════════════════════════════════════════════ */
type ThemeId     = 'light' | 'dark' | 'auto';
type EffTheme    = 'light' | 'dark';

/** 현재 시각 기준 시스템 테마: 06:00~19:59 = 주간, 그 외 = 야간 */
function getSystemTheme(): EffTheme {
  const h = new Date().getHours();
  return h >= 6 && h < 20 ? 'light' : 'dark';
}
function getEffTheme(id: ThemeId): EffTheme {
  return id === 'auto' ? getSystemTheme() : id;
}

/* ══════════════════════════════════════════════
   색상 토큰
══════════════════════════════════════════════ */
const LIGHT = {
  pageBg:         'linear-gradient(160deg,#f0f7ff 0%,#e8f4fd 45%,#fef9ee 100%)',
  bodyBg:         '#f0f7ff',
  blob1:          'rgba(186,230,255,0.4)',
  blob2:          'rgba(254,202,202,0.3)',
  cardBg:         '#ffffff',
  cardBorder:     '#e2e8f0',
  textH:          '#1e293b',
  textSub:        '#94a3b8',
  textLabel:      '#64748b',
  textBody:       '#475569',
  inputBg:        '#f8fafc',
  inputBorder:    '#e2e8f0',
  inputText:      '#334155',
  inputPlace:     '#cbd5e1',
  rowBg:          '#f8fafc',
  rowBorder:      '#e9eef5',
  rowText:        '#64748b',
  rowDate:        '#94a3b8',
  calToday:       '#eff6ff',
  calTodayBorder: '#93c5fd',
  calCell:        '#f8fafc',
  calCellBorder:  '#e9eef5',
  calDash:        '#c0cce0',
  calScore:       '#d97706',
  starLabel:      '#d97706',
  footerText:     '#94a3b8',
  checkBg:        '#f0fdf4',
  checkBorder:    '#86efac',
  checkText:      '#16a34a',
  saveBtn:        'linear-gradient(135deg,#004b8d,#1a6db5)',
  saveShadow:     '0 4px 16px rgba(0,75,141,0.35)',
  saveTxt:        '#ffffff',
  savedBtn:       'linear-gradient(135deg,#22c55e,#16a34a)',
  savedShadow:    '0 4px 16px rgba(34,197,94,0.35)',
  savedTxt:       '#ffffff',
  settingsBg:     '#ffffff',
  settingsHBorder:'#e9eef5',
  settingsInputBg:'#f8fafc',
  tabActive:      '#004b8d',
  tabActiveTxt:   '#ffffff',
  tabInactiveTxt: '#64748b',
  settSaveBtn:    '#004b8d',
  settSaveTxt:    '#ffffff',
  setLevelBg:     (c: string) => c + '10',
  setLevelBorder: (c: string) => c + '40',
  recoverBg:      '#fffbeb',
  recoverBorder:  '#fde68a',
};

const DARK = {
  pageBg:         '#0a1628',
  bodyBg:         '#0a1628',
  blob1:          'rgba(0,75,141,0.25)',
  blob2:          'rgba(139,0,0,0.2)',
  cardBg:         '#0f2044',
  cardBorder:     'rgba(255,255,255,0.12)',
  textH:          '#f1f5f9',
  textSub:        'rgba(255,255,255,0.45)',
  textLabel:      'rgba(255,255,255,0.6)',
  textBody:       'rgba(255,255,255,0.75)',
  inputBg:        '#162035',
  inputBorder:    'rgba(255,255,255,0.18)',
  inputText:      '#e2e8f0',
  inputPlace:     'rgba(255,255,255,0.3)',
  rowBg:          '#162035',
  rowBorder:      'rgba(255,255,255,0.1)',
  rowText:        'rgba(255,255,255,0.6)',
  rowDate:        'rgba(255,255,255,0.35)',
  calToday:       'rgba(212,160,23,0.22)',
  calTodayBorder: 'rgba(212,160,23,0.5)',
  calCell:        '#162035',
  calCellBorder:  'rgba(255,255,255,0.08)',
  calDash:        'rgba(255,255,255,0.22)',
  calScore:       '#d4a017',
  starLabel:      '#d4a017',
  footerText:     'rgba(255,255,255,0.25)',
  checkBg:        'rgba(34,197,94,0.15)',
  checkBorder:    'rgba(34,197,94,0.35)',
  checkText:      '#4ade80',
  saveBtn:        'linear-gradient(135deg,#d4a017,#f9d423)',
  saveShadow:     '0 4px 16px rgba(212,160,23,0.35)',
  saveTxt:        '#0a1628',
  savedBtn:       'linear-gradient(135deg,#22c55e,#16a34a)',
  savedShadow:    '0 4px 16px rgba(34,197,94,0.35)',
  savedTxt:       '#ffffff',
  settingsBg:     '#0d1f3d',
  settingsHBorder:'rgba(255,255,255,0.12)',
  settingsInputBg:'#162035',
  tabActive:      '#d4a017',
  tabActiveTxt:   '#0a1628',
  tabInactiveTxt: 'rgba(255,255,255,0.5)',
  settSaveBtn:    '#d4a017',
  settSaveTxt:    '#0a1628',
  setLevelBg:     (c: string) => c + '22',
  setLevelBorder: (c: string) => c + '55',
  recoverBg:      'rgba(212,160,23,0.1)',
  recoverBorder:  'rgba(212,160,23,0.4)',
};

type Tokens = typeof LIGHT;
const ThemeCtx = createContext<Tokens>(LIGHT);
const useTheme = () => useContext(ThemeCtx);

/* ══════════════════════════════════════════════
   레벨 카드 그라데이션
   Light: 흰색 계열 (레벨별 파스텔 틴트)
   Dark : 파란색 계열 (딥 네이비 베이스)
══════════════════════════════════════════════ */
const GRAD_LIGHT = [
  { from: '#ffffff', to: '#f1f5f9', text: '#1e293b' },  // Lv1 순백·슬레이트
  { from: '#f0fffe', to: '#ccfbf1', text: '#134e4a' },  // Lv2 흰색·틸
  { from: '#f0f9ff', to: '#bae6fd', text: '#0c4a6e' },  // Lv3 흰색·스카이
  { from: '#f5f3ff', to: '#ddd6fe', text: '#1e1b4b' },  // Lv4 흰색·인디고
  { from: '#faf5ff', to: '#e9d5ff', text: '#2e1065' },  // Lv5 흰색·바이올렛
  { from: '#fff7ed', to: '#fed7aa', text: '#7c2d12' },  // Lv6 흰색·오렌지
  { from: '#f0fdf4', to: '#bbf7d0', text: '#14532d' },  // Lv7 흰색·그린
  { from: '#fffbeb', to: '#fde68a', text: '#78350f' },  // Lv8 흰색·앰버
  { from: '#fff1f2', to: '#fecdd3', text: '#7f1d1d' },  // Lv9 흰색·크림슨
];

const GRAD_DARK = [
  { from: '#0e1c2e', to: '#1c3450', text: '#e2e8f0' },  // Lv1 다크 스틸 블루
  { from: '#0a1e32', to: '#0e3452', text: '#99f6e4' },  // Lv2 다크 틸 블루
  { from: '#0a1628', to: '#0d2e60', text: '#bae6fd' },  // Lv3 다크 로열 블루
  { from: '#0a1628', to: '#14196a', text: '#c7d2fe' },  // Lv4 다크 인디고 블루
  { from: '#0a1628', to: '#1b145e', text: '#ddd6fe' },  // Lv5 다크 바이올렛 블루
  { from: '#0a1628', to: '#192c54', text: '#bae6fd' },  // Lv6 다크 세룰리안
  { from: '#0a1628', to: '#0d2c4a', text: '#a5f3fc' },  // Lv7 다크 오션 블루
  { from: '#0a1628', to: '#102440', text: '#93c5fd' },  // Lv8 다크 미드나이트
  { from: '#0a1222', to: '#1e0a18', text: '#fecaca' },  // Lv9 다크 크림슨 (최종)
];

/* ══════════════════════════════════════════════
   타입 & 데이터
══════════════════════════════════════════════ */
type LevelConfig = {
  name: string; subtitle: string; schools: string[];
  min: number; max: number; color: string; emoji: string; logo: string;
};
type DayRecord = { date: string; score: number; note: string; };

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/* ─────────────────────────────────────────────────────────
   레벨 점수 설계 기준
   수능 2주 전(2027-11-04)까지 매일 4.5점 기록 시 레벨 9 도달
   오늘(2026-06-07)부터 515일 × 4.5점/일 = 2318점 → Lv9 진입
   Lv1~8: 0~2317점 구간을 290점 간격으로 균등 배분 (≈ 64일 / 레벨)
──────────────────────────────────────────────────────── */
const LV9_THRESHOLD = 2318; // 515일 × 4.5점

const DEFAULT_LEVELS: LevelConfig[] = [
  { name: '레벨 1', subtitle: '출발! 첫 번째 목표',
    schools: ['충남대 식품공학과'],
    min: 0,    max: 289,   color: '#64748b', emoji: '🌱', logo: `${BASE}/logos/level1.png` },
  { name: '레벨 2', subtitle: '두 달의 꾸준함',
    schools: ['인하대 식품영양학과'],
    min: 290,  max: 579,   color: '#0d9488', emoji: '🌿', logo: `${BASE}/logos/level2.png` },
  { name: '레벨 3', subtitle: '100일 돌파!',
    schools: ['서울과기대 식품공학과'],
    min: 580,  max: 869,   color: '#0284c7', emoji: '🚀', logo: `${BASE}/logos/level3.png` },
  { name: '레벨 4', subtitle: '6개월 성장',
    schools: ['단국대 식품공학과'],
    min: 870,  max: 1159,  color: '#4338ca', emoji: '⚡', logo: `${BASE}/logos/level4.png` },
  { name: '레벨 5', subtitle: '중간 지점 돌파!',
    schools: ['세종대 식품생명공학과'],
    min: 1160, max: 1449,  color: '#7c3aed', emoji: '🌟', logo: `${BASE}/logos/level5.png` },
  { name: '레벨 6', subtitle: '상위권 진입',
    schools: ['동국대 식품생명공학과'],
    min: 1450, max: 1739,  color: '#ea580c', emoji: '🔥', logo: `${BASE}/logos/level6.png` },
  { name: '레벨 7', subtitle: '거의 다 왔다!',
    schools: ['경희대 식품생명공학과'],
    min: 1740, max: 2029,  color: '#16a34a', emoji: '🏅', logo: `${BASE}/logos/level7.png` },
  { name: '레벨 8', subtitle: '수능 D-100 이내',
    schools: ['성균관대 식품생명공학과'],
    min: 2030, max: 2317,  color: '#b45309', emoji: '💎', logo: `${BASE}/logos/level8.png` },
  { name: '레벨 9', subtitle: '수능 2주 전 최종 목표 달성!',
    schools: ['고려대 식품공학과'],
    min: 2318, max: 9999999, color: '#9b1b1b', emoji: '🏆', logo: `${BASE}/logos/level9.png` },
];

const STORAGE_KEY = 'univer_records';
const LEVELS_KEY  = 'univer_levels';
const LEVELS_VER  = 'v9-2607';  // 수능 2주 전 Lv9 도달 기준으로 재설계
const THEME_KEY   = 'univer_theme';

const STAR_LABELS: Record<number, string> = {
  1:'매우 나쁨', 2:'나쁨', 3:'보통', 4:'좋음', 5:'최고!',
};

function getTodayString() { return new Date().toISOString().slice(0, 10); }
function getLevel(s: number, ls: LevelConfig[]) {
  return ls.find((l) => s >= l.min && s <= l.max) ?? ls[0];
}

/** localStorage 안전 저장 (QuotaExceededError 방어) */
function lsSet(key: string, value: string): boolean {
  try { localStorage.setItem(key, value); return true; }
  catch { return false; }
}

/** DayRecord 배열 유효성 검사 — 손상된 항목 필터링 */
function validateRecords(raw: unknown): DayRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (r): r is DayRecord =>
      r !== null && typeof r === 'object' &&
      typeof (r as DayRecord).date === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test((r as DayRecord).date) &&
      typeof (r as DayRecord).score === 'number' &&
      (r as DayRecord).score >= 1 && (r as DayRecord).score <= 5
  );
}

/** 중복 날짜 제거 (최신 값 유지) */
function dedupeRecords(recs: DayRecord[]): DayRecord[] {
  const map = new Map<string, DayRecord>();
  for (const r of recs) map.set(r.date, r);
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/* ══════════════════════════════════════════════
   로고 영역  240 × 240
══════════════════════════════════════════════ */
function LevelLogoArea({ logo, levelIdx, grad }: {
  logo: string; levelIdx: number;
  grad: typeof GRAD_LIGHT[0];
}) {
  const [failed, setFailed] = useState(false);
  if (!failed) return (
    <div className="w-[270px] h-[270px] shrink-0 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/30">
      <img src={logo} alt={`레벨 ${levelIdx + 1} 로고`}
        className="w-full h-full object-cover" onError={() => setFailed(true)} />
    </div>
  );
  return (
    <div className="w-[270px] h-[270px] shrink-0 flex flex-col items-center justify-center
                    rounded-3xl border-2 border-dashed"
      style={{ borderColor: grad.text + '40', background: grad.text + '10' }}>
      <span className="text-6xl mb-3 opacity-25">🏛️</span>
      <span className="text-sm font-medium" style={{ color: grad.text + '80' }}>
        level{levelIdx + 1}.png
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════
   별점 선택
══════════════════════════════════════════════ */
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
            className="text-5xl transition-all duration-100 active:scale-90"
            style={{ filter: n<=d ? 'drop-shadow(0 2px 8px #f59e0b)' : 'grayscale(1) opacity(0.3)' }}>
            ⭐
          </button>
        ))}
      </div>
      <p className="text-center text-base font-bold h-6" style={{ color: th.starLabel }}>
        {d ? `${d}점 · ${STAR_LABELS[d]}` : ''}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════
   테마 선택기 (주간 / 야간 / 자동)
══════════════════════════════════════════════ */
const THEME_OPTIONS: { id: ThemeId; icon: string; label: string }[] = [
  { id: 'light', icon: '☀️', label: '주간' },
  { id: 'dark',  icon: '🌙', label: '야간' },
  { id: 'auto',  icon: '🕐', label: '자동' },
];

function ThemePicker({ value, onChange }: {
  value: ThemeId;
  onChange: (t: ThemeId) => void;
}) {
  const th = useTheme();
  return (
    <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: th.cardBorder }}>
      {THEME_OPTIONS.map((opt) => {
        const active = value === opt.id;
        return (
          <button key={opt.id} onClick={() => onChange(opt.id)}
            className="flex items-center gap-2 px-4 py-2.5 text-base font-bold transition-all"
            style={{
              background: active ? th.tabActive : th.inputBg,
              color: active ? th.tabActiveTxt : th.tabInactiveTxt,
            }}>
            <span className="text-lg leading-none">{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════
   설정 패널
══════════════════════════════════════════════ */
function SettingsPanel({ levels, records, totalScore, themeId, onSave, onAddRecord, onThemeChange, onClose, onExport, onImport }: {
  levels: LevelConfig[]; records: DayRecord[]; totalScore: number;
  themeId: ThemeId;
  onSave: (u: LevelConfig[]) => void;
  onAddRecord: (r: DayRecord) => void;
  onThemeChange: (t: ThemeId) => void;
  onClose: () => void;
  onExport: () => void;
  onImport: () => void;
}) {
  const th = useTheme();
  const [draft, setDraft]       = useState<LevelConfig[]>(levels.map((l) => ({ ...l, schools: [...l.schools] })));
  const [tab, setTab]           = useState<'levels'|'recovery'>('levels');
  const [recDate, setRecDate]   = useState(getTodayString());
  const [recScore, setRecScore] = useState(3);
  const [recNote, setRecNote]   = useState('');
  const [recMsg,  setRecMsg]    = useState('');

  const upSchools = (i: number, raw: string) =>
    setDraft((p) => p.map((l, j) => j===i ? { ...l, schools: raw.split(',').map(s=>s.trim()).filter(Boolean) } : l));
  const upField = (i: number, f: 'name'|'subtitle', v: string) =>
    setDraft((p) => p.map((l, j) => j===i ? { ...l, [f]: v } : l));
  const handleReset = () => {
    if (confirm('기본값으로 초기화할까요?'))
      setDraft(DEFAULT_LEVELS.map((l) => ({ ...l, schools: [...l.schools] })));
  };
  const handleAdd = () => {
    if (!recDate) return;
    if (records.find((r) => r.date===recDate)) { setRecMsg(`⚠️ ${recDate} 이미 기록 있음`); return; }
    onAddRecord({ date: recDate, score: recScore, note: recNote });
    setRecMsg(`✅ ${recDate} · ${recScore}점 추가! (누적 ${(totalScore+recScore).toLocaleString()}점)`);
    setRecNote('');
  };

  const iBase = {
    background: th.settingsInputBg, borderColor: th.inputBorder,
    color: th.inputText, borderWidth: '1px', borderStyle: 'solid' as const,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:'rgba(0,0,0,0.5)', backdropFilter:'blur(6px)' }}>
      <div className="rounded-3xl w-full max-w-[790px] max-h-[92vh] flex flex-col shadow-2xl"
        style={{ background:th.settingsBg, border:`1px solid ${th.settingsHBorder}` }}>

        {/* 헤더 */}
        <div className="px-7 py-5 border-b" style={{ borderColor: th.settingsHBorder }}>
          {/* 테마 선택 */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-base font-bold" style={{ color: th.textLabel }}>🎨 테마 설정</p>
            <ThemePicker value={themeId} onChange={onThemeChange} />
          </div>
          {/* 탭 + 버튼 */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {(['levels','recovery'] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-5 py-2.5 rounded-xl font-bold text-base transition-all"
                  style={{
                    background: tab===t ? th.tabActive : 'transparent',
                    color: tab===t ? th.tabActiveTxt : th.tabInactiveTxt,
                  }}>
                  {t==='levels' ? '🏫 레벨 설정' : '🔧 점수 복구'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2.5">
              {tab==='levels' && (
                <>
                  <button onClick={handleReset}
                    className="text-base px-4 py-2.5 rounded-xl"
                    style={{ color: th.textSub }}>기본값 복원</button>
                  <button onClick={() => onSave(draft)}
                    className="text-base font-bold px-5 py-2.5 rounded-xl"
                    style={{ background:th.settSaveBtn, color:th.settSaveTxt }}>저장</button>
                </>
              )}
              <button onClick={onClose} className="text-2xl px-2" style={{ color:th.textSub }}>✕</button>
            </div>
          </div>
        </div>

        {/* 탭: 레벨 설정 */}
        {tab==='levels' && (
          <div className="overflow-y-auto px-7 py-6 space-y-4">
            {draft.map((lv, i) => (
              <div key={i} className="rounded-2xl p-5 border"
                style={{ background:th.setLevelBg(lv.color), borderColor:th.setLevelBorder(lv.color) }}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lv.emoji}</span>
                    <span className="text-sm font-bold text-white px-3.5 py-1.5 rounded-full"
                      style={{ background:lv.color }}>
                      Lv.{i+1} · {lv.min.toLocaleString()}~{lv.max === 9999999 ? '∞' : lv.max.toLocaleString()}점
                    </span>
                  </div>
                  <div className="w-14 h-14 rounded-xl overflow-hidden border shrink-0"
                    style={{ borderColor:lv.color+'55' }}>
                    <img src={lv.logo} alt="" className="w-full h-full object-contain p-1"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity='0'; }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {(['name','subtitle'] as const).map((f) => (
                    <div key={f}>
                      <label className="text-sm mb-1.5 block" style={{ color:th.textLabel }}>
                        {f==='name'?'레벨 이름':'부제목'}
                      </label>
                      <input className="w-full rounded-xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                        style={iBase} value={lv[f]} onChange={(e) => upField(i,f,e.target.value)} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-sm mb-1.5 block" style={{ color:th.textLabel }}>
                    대학 목록 <span style={{ color:th.textSub }}>(쉼표 구분)</span>
                  </label>
                  <input className="w-full rounded-xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                    style={iBase} value={lv.schools.join(', ')} onChange={(e) => upSchools(i,e.target.value)} />
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {lv.schools.map((s) => (
                      <span key={s} className="text-sm px-3 py-1 rounded-full text-white"
                        style={{ background:lv.color }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 탭: 점수 복구 */}
        {tab==='recovery' && (
          <div className="overflow-y-auto px-7 py-6 space-y-4">
            {/* 현재 점수 요약 */}
            <div className="rounded-2xl p-5 flex items-center gap-5 border"
              style={{ background:th.rowBg, borderColor:th.rowBorder }}>
              <div className="text-5xl font-black" style={{ color:th.tabActive }}>{totalScore.toLocaleString()}</div>
              <div>
                <p className="font-bold text-lg" style={{ color:th.textH }}>현재 누적 점수</p>
                <p className="text-base" style={{ color:th.textSub }}>
                  {records.length}일 기록 · 누적 {records.reduce((s,r)=>s+r.score,0).toLocaleString()}점
                  / 목표 {LV9_THRESHOLD.toLocaleString()}점
                </p>
              </div>
            </div>

            {/* 백업 / 복원 */}
            <div className="rounded-2xl p-5 border" style={{ background:th.rowBg, borderColor:th.rowBorder }}>
              <p className="font-bold text-base mb-3" style={{ color:th.textH }}>💾 데이터 백업 / 복원</p>
              <p className="text-sm mb-4" style={{ color:th.textSub }}>
                기기를 바꾸거나 앱을 재설치할 때 JSON 파일로 기록을 안전하게 이동할 수 있습니다.
                <br/>
                <span className="font-semibold" style={{ color:th.textLabel }}>
                  ⚠️ PWA(홈 화면) 모드와 Safari 브라우저는 저장소가 분리됩니다.
                </span>
              </p>
              <div className="flex gap-3">
                <button onClick={onExport}
                  className="flex-1 py-3 rounded-xl font-bold text-base transition-all active:scale-95 flex items-center justify-center gap-2"
                  style={{ background:th.tabActive, color:th.tabActiveTxt }}>
                  💾 JSON 백업
                </button>
                <button onClick={onImport}
                  className="flex-1 py-3 rounded-xl font-bold text-base transition-all active:scale-95 flex items-center justify-center gap-2 border"
                  style={{ background:th.settingsInputBg, borderColor:th.cardBorder, color:th.textBody }}>
                  📂 JSON 복원
                </button>
              </div>
            </div>
            <div className="rounded-2xl p-6 border"
              style={{ background:th.recoverBg, borderColor:th.recoverBorder }}>
              <h3 className="font-bold text-xl mb-1.5" style={{ color:th.textH }}>📅 날짜별 점수 추가</h3>
              <p className="text-base mb-5" style={{ color:th.textSub }}>
                기록이 사라진 날짜의 점수를 직접 입력해 복구하세요.
              </p>
              <div className="grid grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="text-sm mb-1.5 block font-medium" style={{ color:th.textLabel }}>날짜 선택</label>
                  <input type="date"
                    className="w-full rounded-xl px-4 py-3 text-base border focus:outline-none focus:ring-2 focus:ring-amber-400"
                    style={iBase} value={recDate} max={getTodayString()}
                    onChange={(e) => { setRecDate(e.target.value); setRecMsg(''); }} />
                </div>
                <div>
                  <label className="text-sm mb-1.5 block font-medium" style={{ color:th.textLabel }}>별점</label>
                  <div className="flex gap-2 items-center h-[52px]">
                    {[1,2,3,4,5].map((n) => (
                      <button key={n} onClick={() => setRecScore(n)}
                        className="text-3xl transition-transform active:scale-90"
                        style={{ filter:n<=recScore?'drop-shadow(0 0 5px #f59e0b)':'grayscale(1) opacity(0.3)' }}>
                        ⭐
                      </button>
                    ))}
                    <span className="text-base font-bold ml-2" style={{ color:th.starLabel }}>{recScore}점</span>
                  </div>
                </div>
              </div>
              <div className="mb-5">
                <label className="text-sm mb-1.5 block font-medium" style={{ color:th.textLabel }}>메모 (선택)</label>
                <input className="w-full rounded-xl px-4 py-3 text-base border focus:outline-none focus:ring-2 focus:ring-amber-400"
                  style={iBase} placeholder="예: 복구된 기록" value={recNote}
                  onChange={(e) => setRecNote(e.target.value)} />
              </div>
              <button onClick={handleAdd}
                className="w-full py-4 rounded-xl font-bold text-white text-base active:scale-95 bg-amber-500 hover:bg-amber-600 transition-colors">
                이 날짜 점수 추가
              </button>
              {recMsg && (
                <p className="mt-3 text-sm text-center font-medium rounded-xl py-3 px-4 border"
                  style={{ color:th.textBody, background:th.rowBg, borderColor:th.rowBorder }}>
                  {recMsg}
                </p>
              )}
            </div>
            {records.length > 0 && (
              <div>
                <h3 className="text-base font-semibold mb-3" style={{ color:th.textSub }}>
                  저장된 기록 ({records.length}개)
                </h3>
                <ul className="space-y-2 max-h-52 overflow-y-auto">
                  {[...records].sort((a,b) => b.date.localeCompare(a.date)).map((r) => (
                    <li key={r.date} className="flex items-center gap-4 rounded-xl px-4 py-3 border"
                      style={{ background:th.rowBg, borderColor:th.rowBorder }}>
                      <span className="text-sm w-24 shrink-0" style={{ color:th.rowDate }}>{r.date}</span>
                      <div className="flex">
                        {[1,2,3,4,5].map((n) => (
                          <span key={n} className="text-base"
                            style={{ filter:n<=r.score?'none':'grayscale(1) opacity(0.2)' }}>⭐</span>
                        ))}
                      </div>
                      {r.note && <span className="text-sm truncate" style={{ color:th.textSub }}>· {r.note}</span>}
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

/* ══════════════════════════════════════════════
   수능 카운트다운
══════════════════════════════════════════════ */
const SUNEUNG_DATE = new Date('2027-11-18T00:00:00');

function CountdownBanner() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  const diff = SUNEUNG_DATE.getTime() - now.getTime();
  if (diff <= 0) return (
    <div className="w-full rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 p-5 mb-5 text-center shadow-lg">
      <p className="text-2xl font-bold text-white">🎉 수능 당일! 최선을 다하세요!</p>
    </div>
  );
  const ts   = Math.floor(diff / 1000);
  const days = Math.floor(ts / 86400);
  const hrs  = Math.floor((ts % 86400) / 3600);
  const mins = Math.floor((ts % 3600) / 60);
  const secs = ts % 60;
  return (
    <div className="w-full rounded-2xl mb-5 overflow-hidden shadow-lg relative"
      style={{ background:'linear-gradient(135deg,#004b8d 0%,#1565c0 55%,#9b1b1b 100%)' }}>
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{ backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize:'28px 28px' }} />
      <div className="relative flex items-center justify-between gap-4 px-7 py-5">
        <div>
          <p className="text-white/60 text-xs font-bold tracking-widest uppercase mb-1.5">2027 CSAT Countdown</p>
          <p className="text-white text-xl font-bold">2027년 11월 18일(목)</p>
          <p className="text-yellow-200 text-sm font-medium mt-1">합격의 그날까지, 매일 한 걸음 🎯</p>
        </div>
        <div className="flex gap-2.5">
          {[['DAYS',days],['HRS',hrs],['MIN',mins],['SEC',secs]].map(([label,val]) => (
            <div key={label as string}
              className="flex flex-col items-center bg-black/25 border border-white/25 rounded-2xl px-4 py-3 min-w-[60px]">
              <span className="text-3xl font-black text-white tabular-nums leading-none tick-anim">
                {String(val).padStart(2,'0')}
              </span>
              <span className="text-[11px] text-white/55 mt-1.5 tracking-wider">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   메인 앱
══════════════════════════════════════════════ */
export default function App() {
  const [records, setRecords] = useState<DayRecord[]>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      return dedupeRecords(validateRecords(raw));
    } catch { return []; }
  });
  const [levels, setLevels] = useState<LevelConfig[]>(() => {
    try {
      const ver = localStorage.getItem(LEVELS_KEY+'_ver');
      if (ver !== LEVELS_VER) {
        localStorage.removeItem(LEVELS_KEY);
        localStorage.setItem(LEVELS_KEY+'_ver', LEVELS_VER);
        return DEFAULT_LEVELS;
      }
      const saved = localStorage.getItem(LEVELS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_LEVELS;
    } catch { return DEFAULT_LEVELS; }
  });

  /* 테마 상태 (light / dark / auto) */
  const [themeId, setThemeId]   = useState<ThemeId>(() =>
    (localStorage.getItem(THEME_KEY) as ThemeId) ?? 'light'
  );
  /* 실제 적용 테마 */
  const [effTheme, setEffTheme] = useState<EffTheme>(() => getEffTheme(
    (localStorage.getItem(THEME_KEY) as ThemeId) ?? 'light'
  ));

  /* auto 모드: 1분마다 시간 확인 */
  useEffect(() => {
    const update = () => setEffTheme(getEffTheme(themeId));
    update();
    if (themeId !== 'auto') return;
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [themeId]);

  const th = effTheme === 'dark' ? DARK : LIGHT;

  const [score, setScore]       = useState(3);
  const [note, setNote]         = useState('');
  const [saved, setSaved]       = useState(false);
  const [saveErr, setSaveErr]   = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const today    = getTodayString();
  const todayRec = records.find((r) => r.date === today);
  const total    = records.reduce((s, r) => s + r.score, 0);
  const level    = getLevel(total, levels);
  const lvIdx    = levels.indexOf(level);
  const levelPct = level.max === 9999999
    ? 100
    : Math.min(100, Math.round(((total - level.min) / (level.max - level.min + 1)) * 100));
  const grad     = (effTheme === 'dark' ? GRAD_DARK : GRAD_LIGHT)[lvIdx] ?? GRAD_LIGHT[0];

  useEffect(() => {
    const ok = lsSet(STORAGE_KEY, JSON.stringify(records));
    setSaveErr(!ok);
  }, [records]);
  useEffect(() => { lsSet(LEVELS_KEY, JSON.stringify(levels)); }, [levels]);
  useEffect(() => {
    lsSet(THEME_KEY, themeId);
    document.body.style.background = th.bodyBg;
  }, [themeId, effTheme, th.bodyBg]);

  const handleSave       = () => {
    if (todayRec) return;
    setRecords((p) => [...p, { date:today, score, note }]);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };
  const handleReset      = () => { if (confirm('모든 기록을 초기화할까요?')) setRecords([]); };
  const handleSaveLevels = (u: LevelConfig[]) => { setLevels(u); setShowSettings(false); };
  const handleAddRecord  = (r: DayRecord) => setRecords((p) => [...p, r]);
  const handleSetTheme   = (t: ThemeId)   => setThemeId(t);
  const handleExport = () => {
    const blob = new Blob(
      [JSON.stringify({ exportedAt: new Date().toISOString(), records }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `univer-records-${today}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json,application/json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          /* 직접 배열이거나 {records:[...]} 형태 모두 지원 */
          const rawArr = Array.isArray(parsed) ? parsed : (parsed.records ?? []);
          const imported = validateRecords(rawArr);
          if (imported.length === 0) { alert('유효한 기록을 찾을 수 없습니다.'); return; }
          const merged = dedupeRecords([...records, ...imported]);
          if (confirm(`${imported.length}개의 기록을 가져옵니다.\n기존 기록과 병합됩니다. 계속할까요?`)) {
            setRecords(merged);
          }
        } catch { alert('파일을 읽는 중 오류가 발생했습니다. JSON 형식을 확인해주세요.'); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const last7  = Array.from({ length:7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate()-(6-i)); return d.toISOString().slice(0,10);
  });
  const DAY_KO = ['일','월','화','수','목','금','토'];

  /* 현재 테마 아이콘 표시 */
  const headerIcon = themeId === 'auto'
    ? (effTheme === 'dark' ? '🌙' : '☀️')
    : themeId === 'dark' ? '🌙' : '☀️';

  return (
    <ThemeCtx.Provider value={th}>
      {/* placeholder CSS 변수 */}
      <style>{`:root{--placeholder-color:${th.inputPlace};}`}</style>

      <div className="min-h-screen relative flex flex-col items-center px-5 py-7 overflow-x-hidden"
        style={{ background:th.pageBg, transition:'background 0.4s' }}>

        {/* 배경 블롭 */}
        <div className="fixed top-[-80px] left-[-80px] w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none"
          style={{ background:th.blob1, transition:'background 0.4s' }} />
        <div className="fixed bottom-[-100px] right-[-60px] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
          style={{ background:th.blob2, transition:'background 0.4s' }} />

        {showSettings && (
          <SettingsPanel
            levels={levels} records={records} totalScore={total}
            themeId={themeId}
            onSave={handleSaveLevels} onAddRecord={handleAddRecord}
            onThemeChange={handleSetTheme}
            onExport={handleExport} onImport={handleImport}
            onClose={() => setShowSettings(false)} />
        )}

        <div className="w-full max-w-[820px] relative z-10">

          {/* ── 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-3xl">🎓</span>
                <h1 className="text-3xl font-black tracking-tight" style={{ color:th.textH }}>대학 레벨업</h1>
              </div>
              <p className="text-sm pl-1" style={{ color:th.textSub }}>
                고려대 식품공학과까지, 오늘도 캠퍼스를 향해
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* 빠른 테마 순환 */}
              <button
                onClick={() => {
                  const order: ThemeId[] = ['light','dark','auto'];
                  setThemeId(order[(order.indexOf(themeId)+1) % 3]);
                }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl border transition-all active:scale-90"
                style={{ background:th.cardBg, borderColor:th.cardBorder, color:th.textH }}
                title={`현재: ${themeId==='auto'?'자동':themeId==='dark'?'야간':'주간'} → 클릭해서 변경`}>
                {headerIcon}
              </button>
              <button onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-base border transition-all active:scale-95"
                style={{ background:th.cardBg, borderColor:th.cardBorder, color:th.textBody }}>
                ⚙️ 설정
              </button>
            </div>
          </div>

          {/* ── 저장 오류 경고 (기기 저장 용량 부족 시) */}
          {saveErr && (
            <div className="w-full rounded-2xl mb-4 px-5 py-3 flex items-center gap-3 text-sm font-semibold"
              style={{ background:'#fef2f2', border:'1px solid #fca5a5', color:'#991b1b' }}>
              <span className="text-xl">⚠️</span>
              <span>기기 저장 공간이 부족해 기록이 저장되지 않았습니다. JSON 백업 후 불필요한 파일을 정리해주세요.</span>
            </div>
          )}

          {/* ── 카운트다운 */}
          <CountdownBanner />

          {/* ── 레벨 히어로 카드 */}
          <div className="w-full rounded-3xl mb-6 overflow-hidden shadow-xl"
            style={{
              background:`linear-gradient(135deg,${grad.from} 0%,${grad.to} 100%)`,
              transition:'background 0.4s',
            }}>
            <div className="h-2" style={{ background:level.color }} />
            <div className="p-7">
              {/* 레벨 뱃지 */}
              <div className="flex items-center gap-2 mb-5">
                <span className="text-xs font-black tracking-[0.18em] uppercase opacity-55"
                  style={{ color:grad.text }}>Current Level</span>
                <div className="h-px flex-1 opacity-15" style={{ background:grad.text }} />
                <span className="text-sm font-black px-4 py-1.5 rounded-full"
                  style={{ color:grad.text, background:grad.text+'20', border:`1px solid ${grad.text}30` }}>
                  {lvIdx+1} / {levels.length}
                </span>
              </div>

              <div className="flex items-center gap-6">
                {/* 텍스트 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold tracking-widest uppercase mb-2 opacity-65"
                    style={{ color:grad.text }}>
                    {level.emoji} {level.subtitle}
                  </p>
                  <h2 className="text-5xl font-black leading-none mb-4 tracking-tight" style={{ color:grad.text }}>
                    {level.name}
                  </h2>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {level.schools.map((s) => (
                      <span key={s} className="text-sm font-semibold rounded-full px-3.5 py-1.5"
                        style={{ color:grad.text, background:grad.text+'20', border:`1px solid ${grad.text}28` }}>
                        {s}
                      </span>
                    ))}
                  </div>
                  {/* 진행 바 — 현재 레벨 내 진행도 */}
                  <div>
                    <div className="flex justify-between text-sm mb-2" style={{ color:grad.text+'99' }}>
                      <span className="font-medium">레벨 내 진행도</span>
                      <span className="font-black" style={{ color:grad.text }}>
                        {levelPct}%
                      </span>
                    </div>
                    <div className="h-4 rounded-full overflow-hidden"
                      style={{ background:grad.text+'22', border:`1px solid ${grad.text}25` }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width:`${levelPct}%`,
                          background:level.color,
                          boxShadow:`0 0 10px ${level.color}99`,
                        }} />
                    </div>
                    {/* 전체 누적 & 고려대 목표까지 남은 점수 */}
                    <div className="flex justify-between mt-2 opacity-65" style={{ color:grad.text }}>
                      <span className="text-xs">누적 {total.toLocaleString()}점</span>
                      <span className="text-xs font-semibold">
                        {total >= LV9_THRESHOLD
                          ? '🏆 고려대 목표 달성!'
                          : `Lv9까지 ${(LV9_THRESHOLD - total).toLocaleString()}점`}
                      </span>
                    </div>
                  </div>
                </div>
                {/* 로고 */}
                <div className="shrink-0">
                  <LevelLogoArea logo={level.logo} levelIdx={lvIdx} grad={grad} />
                </div>
              </div>
            </div>
          </div>

          {/* ── 2열 그리드 */}
          <div className="grid grid-cols-2 gap-5">

            {/* 오늘의 만족도 */}
            <div className="rounded-3xl p-7 border shadow-md"
              style={{ background:th.cardBg, borderColor:th.cardBorder, transition:'background 0.4s,border-color 0.4s' }}>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-2xl">✏️</span>
                <h2 className="font-black text-xl" style={{ color:th.textH }}>오늘의 만족도</h2>
              </div>
              <p className="text-sm mb-5 pl-9" style={{ color:th.textSub }}>{today}</p>

              {todayRec ? (
                <div className="flex flex-col items-center py-6 gap-4">
                  <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center text-3xl"
                    style={{ background:th.checkBg, borderColor:th.checkBorder }}>✅</div>
                  <p className="font-bold text-lg" style={{ color:th.checkText }}>오늘 기록 완료!</p>
                  <div className="flex gap-1.5">
                    {[1,2,3,4,5].map((n) => (
                      <span key={n} className="text-3xl"
                        style={{ filter:n<=todayRec.score?'drop-shadow(0 0 6px #f59e0b)':'grayscale(1) opacity(0.2)' }}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  {todayRec.note && (
                    <p className="text-sm text-center italic" style={{ color:th.textSub }}>"{todayRec.note}"</p>
                  )}
                </div>
              ) : (
                <>
                  <StarPicker value={score} onChange={setScore} />
                  <textarea
                    className="w-full rounded-2xl p-4 text-base resize-none mt-5 border focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows={4} placeholder="오늘 하루 한 마디 (선택)" value={note}
                    onChange={(e) => setNote(e.target.value)}
                    style={{ background:th.inputBg, borderColor:th.inputBorder, color:th.inputText }}
                  />
                  <button onClick={handleSave}
                    className="mt-4 w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-95"
                    style={{
                      background: saved?th.savedBtn:th.saveBtn,
                      boxShadow:  saved?th.savedShadow:th.saveShadow,
                      color:      saved?th.savedTxt:th.saveTxt,
                    }}>
                    {saved ? '✓ 저장됨!' : '오늘 기록 저장'}
                  </button>
                </>
              )}
            </div>

            {/* 이번 주 기록 */}
            <div className="rounded-3xl p-7 border shadow-md flex flex-col"
              style={{ background:th.cardBg, borderColor:th.cardBorder, transition:'background 0.4s,border-color 0.4s' }}>
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">📅</span>
                  <div>
                    <h2 className="font-black text-xl" style={{ color:th.textH }}>이번 주 기록</h2>
                    <p className="text-sm" style={{ color:th.textSub }}>최근 7일</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={handleExport} title="JSON으로 백업"
                    className="text-sm px-3 py-2 rounded-xl font-semibold" style={{ color:'#3b82f6' }}>💾</button>
                  <button onClick={handleImport} title="JSON에서 복원"
                    className="text-sm px-3 py-2 rounded-xl font-semibold" style={{ color:'#10b981' }}>📂</button>
                  <button onClick={handleReset}
                    className="text-sm px-3 py-2 rounded-xl" style={{ color:'#f87171' }}>초기화</button>
                </div>
              </div>

              {/* 7일 달력 */}
              <div className="grid grid-cols-7 gap-1.5 mb-4">
                {last7.map((date) => {
                  const rec     = records.find((r) => r.date===date);
                  const d       = new Date(date+'T00:00:00');
                  const isToday = date===today;
                  const isSun   = d.getDay()===0;
                  const isSat   = d.getDay()===6;
                  return (
                    <div key={date}
                      className="flex flex-col items-center rounded-2xl py-2.5 px-1 border transition-colors"
                      style={{
                        background:   isToday?th.calToday:th.calCell,
                        borderColor:  isToday?th.calTodayBorder:th.calCellBorder,
                      }}>
                      <span className="text-xs font-bold mb-1"
                        style={{ color:isSun?'#f87171':isSat?'#60a5fa':th.textSub }}>
                        {DAY_KO[d.getDay()]}
                      </span>
                      <span className="text-[10px] mb-1.5" style={{ color:th.rowDate }}>
                        {date.slice(5).replace('-','/')}
                      </span>
                      {rec ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="flex flex-wrap justify-center">
                            {[1,2,3,4,5].map((n) => (
                              <span key={n} className="text-[10px]"
                                style={{ filter:n<=rec.score?'none':'grayscale(1) opacity(0.15)' }}>⭐</span>
                            ))}
                          </div>
                          <span className="text-xs font-black" style={{ color:th.calScore }}>{rec.score}점</span>
                        </div>
                      ) : (
                        <span className="text-base font-medium" style={{ color:th.calDash }}>—</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 메모 */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {last7
                  .map((date) => records.find((r) => r.date===date))
                  .filter((r): r is DayRecord => !!r && !!r.note)
                  .reverse()
                  .map((r) => (
                    <div key={r.date} className="flex gap-3 items-start rounded-2xl px-4 py-3 border"
                      style={{ background:th.rowBg, borderColor:th.rowBorder }}>
                      <span className="text-sm shrink-0 mt-0.5 w-12" style={{ color:th.rowDate }}>
                        {r.date.slice(5).replace('-','/')}
                      </span>
                      <span className="text-sm leading-relaxed italic" style={{ color:th.rowText }}>
                        "{r.note}"
                      </span>
                    </div>
                  ))}
                {last7.every((d) => { const r=records.find((rc)=>rc.date===d); return !r||!r.note; }) && (
                  <p className="text-sm text-center py-4" style={{ color:th.calDash }}>
                    이번 주 메모가 없습니다.
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* 푸터 */}
          <p className="text-sm mt-7 text-center" style={{ color:th.footerText }}>
            데이터는 이 기기에 저장됩니다 · 💾 버튼으로 JSON 백업 가능
          </p>
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}
