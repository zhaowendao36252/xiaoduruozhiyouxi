import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive, BadgeCheck, Box, ChevronRight, CircleHelp, Droplets,
  Gauge, Heart, Home, InspectionPanel, KeyRound, PackageCheck, Play,
  RotateCcw, Search, Settings, ShieldCheck, Sparkles, Speaker, VolumeX,
  SprayCan, Star, ThermometerSun, X,
} from 'lucide-react';

const levels = [
  { title: '器械预处理', short: '预处理', prompt: '喷上保湿泡泡，不让小污渍变干！', guide: '选泡泡喷壶，在器械上来回滑动', scene: 'table', action: 'swipe', goal: 100, correct: 'foam', tools: ['foam', 'towel', 'brush'], stars: 3 },
  { title: '转运分类', short: '分类', prompt: '把器械分类放进安全的转运盒吧！', guide: '选蓝色转运盒，再点击每件器械上的加号', scene: 'sort', action: 'targets', goal: 5, correct: 'box', tools: ['basket', 'box', 'bag'], stars: 3 },
  { title: '超声酶洗', short: '酶洗', prompt: '让酶液和超声波一起赶走污渍！', guide: '选酶液，在清洗槽里来回滑动', scene: 'ultrasonic', action: 'swipe', goal: 100, correct: 'enzyme', tools: ['water', 'enzyme', 'soap'], stars: 3 },
  { title: '流动水冲洗', short: '冲洗', prompt: '用流动水冲走所有泡泡！', guide: '选冲洗水枪，在器械上来回滑动', scene: 'sink', action: 'swipe', goal: 100, correct: 'hose', tools: ['hose', 'cup', 'towel'], stars: 3 },
  { title: '自动清洗消毒', short: '机洗消毒', prompt: '装好器械，长按启动清洗消毒机！', guide: '选启动钥匙，按住机器按钮直到程序完成', scene: 'washer', action: 'hold', goal: 100, correct: 'key', tools: ['key', 'brush', 'fan'], stars: 3 },
  { title: '干燥', short: '干燥', prompt: '拿起干燥吹风机，赶走每一颗小水珠！', guide: '选干燥吹风机，在水珠上来回移动', scene: 'dry', action: 'swipe', goal: 100, correct: 'fan', tools: ['towel', 'fan', 'water'], stars: 3 },
  { title: '注油', short: '注油', prompt: '给活动关节滴上小小润滑油！', guide: '选注油瓶，依次点击 5 个关节上的加号', scene: 'oil', action: 'targets', goal: 5, correct: 'oil', tools: ['enzyme', 'oil', 'soap'], stars: 3 },
  { title: '检查', short: '检查', prompt: '移动放大镜，扫描藏起来的小污点！', guide: '选放大镜，不用点击，慢慢移动扫描 5 个区域', scene: 'inspect', action: 'scan', goal: 5, correct: 'glass', tools: ['glass', 'lamp', 'towel'], stars: 3 },
  { title: '包装', short: '包装', prompt: '按编号顺序装袋并封好袋口！', guide: '选无菌包装袋，按 1 → 4 的顺序完成封口', scene: 'pack', action: 'ordered', order: [0, 2, 1, 3], goal: 4, correct: 'pouch', tools: ['box', 'pouch', 'basket'], stars: 3, advanced: true },
  { title: '灭菌', short: '灭菌', prompt: '顺时针转动旋钮，完成高温蒸汽灭菌！', guide: '选温度旋钮，沿圆环顺时针完成 3 圈', scene: 'sterilize', action: 'rotate', turns: 3, goal: 100, correct: 'dial', tools: ['dial', 'key', 'hose'], stars: 3, advanced: true },
  { title: '储存', short: '储存', prompt: '记住 6 步顺序，把无菌包放进储存柜！', guide: '选储存柜，记住 6 个柜格闪现的编号，再按顺序点击', scene: 'storage', action: 'memory', order: [4, 1, 5, 0, 3, 2], goal: 6, correct: 'cabinet', tools: ['basket', 'cabinet', 'box'], stars: 3, advanced: true },
  { title: '发放', short: '发放', prompt: '跟上快节奏，抓住窄窄的绿色时机！', guide: '选发放托盘，游标进入绿色区域时按下交接', scene: 'issue', action: 'timing', goal: 4, correct: 'tray', tools: ['tray', 'pouch', 'bag'], stars: 3, advanced: true },
];

const levelFacts = [
  '及时保湿能避免污渍干涸，让后续清洗更容易。',
  '密闭分类转运可以保护工作人员，也能避免环境污染。',
  '多酶液会分解污渍，超声波能清理器械细小缝隙。',
  '流动水会把松动的污渍和残留清洗液一起带走。',
  '清洗消毒机用标准程序完成清洗、漂洗与热消毒。',
  '彻底干燥可以减少水分残留，为检查和包装做准备。',
  '适量润滑能让器械关节保持灵活，延长使用寿命。',
  '灯光和放大镜可以帮助发现肉眼不易察觉的残留。',
  '完好的包装能够在灭菌后继续保护器械。',
  '高温蒸汽需要达到规定的温度、压力和时间。',
  '无菌包要放在清洁、干燥且分类明确的区域。',
  '发放前还要再次核对包装、日期和灭菌标识。',
];

const dirtSpots = [
  { left: 24, top: 8, size: 10, clearsAt: 18 },
  { left: 42, top: 5, size: 15, clearsAt: 34 },
  { left: 61, top: 10, size: 9, clearsAt: 49 },
  { left: 78, top: 4, size: 13, clearsAt: 65 },
  { left: 96, top: 9, size: 8, clearsAt: 82 },
  { left: 115, top: 7, size: 11, clearsAt: 100 },
];

function DryerToolIcon({ size = 34, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" {...props}>
      <path d="M7 22 29 16v25L7 35Z" fill="#75d4e7" stroke="#227f9b" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M7 22v13l-4-2V24Z" fill="#dff8fb" stroke="#227f9b" strokeWidth="2.5" strokeLinejoin="round"/>
      <rect x="27" y="13" width="29" height="31" rx="14" fill="#35aecb" stroke="#227f9b" strokeWidth="3"/>
      <circle cx="46" cy="28.5" r="9" fill="#eafcff" stroke="#227f9b" strokeWidth="2.5"/>
      <path d="m46 20 2.5 6 5.5 2.5-5.5 2.2-2.5 6-2.5-6-5.5-2.2 5.5-2.5Z" fill="#ffbf4b"/>
      <path d="M35 41h14l-3 18H33Z" fill="#58c3da" stroke="#227f9b" strokeWidth="3" strokeLinejoin="round"/>
      <rect x="38" y="46" width="6" height="4" rx="2" fill="#fff"/>
      <path d="M15 25h10M14 30h11" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".75"/>
    </svg>
  );
}

function RinseGunToolIcon({ size = 34, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" {...props}>
      <path d="M5 19h29l6 6-7 7H16l-5-5H5Z" fill="#77d9e8" stroke="#227f9b" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M5 21H1M3 18v6" stroke="#227f9b" strokeWidth="3" strokeLinecap="round"/>
      <path d="M33 25h21l6 4-6 4H34" fill="#dff8fb" stroke="#227f9b" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M19 31h15l-3 25H17l-4-6Z" fill="#3eb2cc" stroke="#227f9b" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M31 34 39 45h-9" fill="#ffd05c" stroke="#227f9b" strokeWidth="2.5" strokeLinejoin="round"/>
      <rect x="20" y="37" width="7" height="4" rx="2" fill="#fff"/>
      <path d="M23 56c0 5 16 3 19-1 4-5 0-10-5-9" fill="none" stroke="#58bdd2" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );
}

const toolData = {
  foam: ['泡泡喷壶', SprayCan], towel: ['小毛巾', Archive], brush: ['小刷子', Sparkles],
  basket: ['敞口篮', Archive], box: ['转运盒', Box], bag: ['普通袋', PackageCheck],
  water: ['清水瓶', Droplets], enzyme: ['多酶液', Sparkles], soap: ['洗手液', Droplets],
  hose: ['冲洗水枪', RinseGunToolIcon], cup: ['小水杯', Droplets], key: ['启动钥匙', KeyRound],
  fan: ['干燥吹风机', DryerToolIcon], oil: ['润滑油', Droplets], glass: ['放大镜', Search],
  lamp: ['小台灯', ThermometerSun], pouch: ['包装袋', PackageCheck], dial: ['温度旋钮', Gauge],
  cabinet: ['储存柜', Archive], tray: ['发放托盘', InspectionPanel],
};

function ActionTarget({ index, action, order = [], selectedTool, hit, showMemory, hinted, onActivate, className = '' }) {
  const orderNumber = order.indexOf(index) + 1;
  return (
    <button
      type="button"
      data-target-index={index}
      aria-label={`操作目标 ${index + 1}`}
      tabIndex={action === 'scan' ? -1 : 0}
      className={`action-target anchored-target ${action}-target ${hit ? 'hit' : ''} ${showMemory ? 'memorizing' : ''} ${hinted ? 'next-hint' : ''} ${className}`}
      style={{ '--memory-order': order.indexOf(index) }}
      onClick={action === 'scan' ? undefined : () => onActivate(index)}
    >
      <span>{hit ? '✓' : action === 'ordered' ? orderNumber : action === 'memory' && showMemory ? orderNumber : action === 'scan' ? <Search/> : selectedTool ? '＋' : '?'}</span>
    </button>
  );
}

function ToolIcon({ name, size = 34 }) {
  if (name === 'fan') return <DryerToolIcon size={size} aria-hidden="true" />;
  if (name === 'hose') return <RinseGunToolIcon size={size} aria-hidden="true" />;

  let shape;
  switch (name) {
    case 'foam': shape = <><path d="M23 20h25l5 7v30H18V27Z" fill="#63cee0"/><path d="M28 20v-7h14v7M38 13h14l6 5H43"/><path d="M24 33h23v15H24Z" fill="#e8fbfd"/><circle cx="29" cy="39" r="3" fill="#8ce4ed"/><circle cx="38" cy="43" r="4" fill="#8ce4ed"/><circle cx="45" cy="37" r="2.5" fill="#8ce4ed"/></> ; break;
    case 'towel': shape = <><rect x="9" y="15" width="46" height="37" rx="7" fill="#74d4d0"/><path d="M17 23h30v21H17Z" fill="#c8f4ed"/><path d="M17 34h30M32 23v21" strokeDasharray="3 3"/><path d="M12 49c8-6 13-3 20 0s13 5 20-1"/></> ; break;
    case 'brush': shape = <><path d="M8 42 42 18l8 9-34 24Z" fill="#ffd15d"/><rect x="38" y="13" width="20" height="17" rx="5" transform="rotate(-7 38 13)" fill="#60c9dc"/><path d="m42 14 1-7m5 7 1-8m5 9 2-7"/><circle cx="18" cy="43" r="3" fill="#fff"/></> ; break;
    case 'basket': shape = <><path d="m8 25 6 30h36l6-30Z" fill="#7bd5df"/><path d="M13 25h38M18 34h28M20 44h24M22 18c4-10 16-10 20 0"/><path d="M22 27v25m10-25v25m10-25v25" opacity=".55"/></> ; break;
    case 'box': shape = <><rect x="8" y="21" width="48" height="34" rx="6" fill="#53bcd6"/><path d="M6 21h52v9H6Z" fill="#bdeff3"/><path d="M24 21v-7h16v7M28 39h8"/><rect x="24" y="35" width="16" height="10" rx="3" fill="#fff"/></> ; break;
    case 'bag': shape = <><path d="M13 22h38l5 35H8Z" fill="#ffd86b"/><path d="M22 24c0-13 20-13 20 0" fill="none"/><path d="M15 32h34M21 41h22" opacity=".65"/></> ; break;
    case 'water': shape = <><path d="M24 16h16v8l6 7v26H18V31l6-7Z" fill="#78d9ea"/><path d="M25 8h14v8H25Z" fill="#dff9fc"/><path d="M22 37h20v13H22Z" fill="#fff"/><path d="M32 39c-5 6-5 9 0 10 5-1 5-4 0-10Z" fill="#3ebbd6"/></> ; break;
    case 'enzyme': shape = <><path d="M21 17h22l4 8v32H17V25Z" fill="#8bd58c"/><path d="M24 8h16v9H24Z" fill="#e9f9d8"/><rect x="21" y="30" width="22" height="18" rx="4" fill="#fff"/><text x="32" y="43" textAnchor="middle" fontSize="14" fontWeight="900" fill="#46a55d" stroke="none">E</text></> ; break;
    case 'soap': shape = <><path d="M18 24h31v33H18Z" rx="5" fill="#f6a5c2"/><path d="M25 24v-9h17M35 15V9h17v5" fill="none"/><path d="M49 9h8"/><rect x="23" y="32" width="21" height="16" rx="5" fill="#fff"/><circle cx="34" cy="40" r="5" fill="#ffd9e5"/></> ; break;
    case 'cup': shape = <><path d="M13 19h35l-4 37H17Z" fill="#b9eff3"/><path d="M48 27h5c10 0 9 18-2 18h-5" fill="none"/><path d="M18 29h26"/><path d="M21 37c7 5 13-4 20 0" stroke="#4ac5dc"/></> ; break;
    case 'key': shape = <><circle cx="20" cy="25" r="12" fill="#ffd15c"/><circle cx="20" cy="25" r="5" fill="#fff"/><path d="m29 33 24 22M40 43l6-6m1 13 6-6" strokeWidth="7"/><path d="m29 33 24 22M40 43l6-6m1 13 6-6" stroke="#ffd15c" strokeWidth="3.5"/></> ; break;
    case 'oil': shape = <><path d="M22 21h23l5 9v27H16V30Z" fill="#ffd35b"/><path d="M26 12h15v9H26ZM30 8h8"/><path d="M50 30 58 16"/><path d="M58 13c-5 6-5 10 0 11 5-1 5-5 0-11Z" fill="#f4a82f"/><rect x="21" y="35" width="24" height="14" rx="5" fill="#fff"/></> ; break;
    case 'glass': shape = <><circle cx="27" cy="26" r="17" fill="#cdf5f8"/><circle cx="27" cy="26" r="12" fill="#fff" opacity=".65"/><path d="m39 39 17 17" strokeWidth="9"/><path d="m39 39 17 17" stroke="#63c8d9" strokeWidth="5"/><path d="M18 20c5-6 12-5 16-1" stroke="#fff"/></> ; break;
    case 'lamp': shape = <><path d="M34 9 47 20 32 34 20 22Z" fill="#ffd45d"/><path d="m29 31-9 18M22 19 12 34m7 16h24"/><ellipse cx="31" cy="54" rx="20" ry="5" fill="#65c9d9"/><path d="m41 27 8 8" stroke="#ffb53f" strokeDasharray="3 3"/></> ; break;
    case 'pouch': shape = <><path d="M13 8h38v49H13Z" fill="#e8f5c8"/><path d="M13 16h38M13 50h38" strokeDasharray="3 3"/><rect x="20" y="21" width="24" height="24" rx="5" fill="#bce9e8"/><path d="m24 38 16-10M24 31l15 9" stroke="#6e9ba2"/></> ; break;
    case 'dial': shape = <><circle cx="32" cy="32" r="25" fill="#dcebed"/><circle cx="32" cy="32" r="16" fill="#62c7d9"/><path d="M32 32V18" stroke="#fff" strokeWidth="5" strokeLinecap="round"/><path d="M17 13 12 8m35 5 5-5M8 32H2m54 0h6"/><circle cx="32" cy="32" r="4" fill="#fff"/></> ; break;
    case 'cabinet': shape = <><rect x="10" y="7" width="44" height="51" rx="5" fill="#76ccd5"/><path d="M32 8v49M11 27h42M11 44h42"/><circle cx="27" cy="18" r="2.5" fill="#fff"/><circle cx="37" cy="18" r="2.5" fill="#fff"/><path d="M17 32h9m12 0h9M17 49h9m12 0h9" stroke="#fff" opacity=".8"/></> ; break;
    case 'tray': shape = <><ellipse cx="32" cy="43" rx="27" ry="13" fill="#7cd3df"/><path d="M8 38c4 18 44 18 48 0" fill="#bcecf0"/><path d="M13 36h38M17 31h30"/><path d="M11 44h-7m49 0h7" strokeWidth="4"/></> ; break;
    default: shape = <><circle cx="32" cy="32" r="23" fill="#79d5e2"/><path d="M22 32h20M32 22v20" stroke="#fff" strokeWidth="5"/></>;
  }

  return <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true"><g stroke="#237f98" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">{shape}</g></svg>;
}

function Instrument({ type = 0, clean = false, progress, className = '' }) {
  const cleanliness = Math.max(0, Math.min(100, progress ?? (clean ? 100 : 0)));
  return (
    <div
      className={`instrument instrument-${type} ${cleanliness >= 100 ? 'is-clean' : ''} ${className}`}
    >
      <span className="handle" /><span className="joint" /><span className="tip" />
      <span className="dirt-spots" aria-hidden="true">
        {dirtSpots.map((spot, index) => {
          const remaining = Math.max(0, Math.min(1, (spot.clearsAt - cleanliness) / 18));
          return <i key={index} style={{ left: spot.left, top: spot.top, width: spot.size, height: spot.size * .72, opacity: remaining, transform: `scale(${.35 + remaining * .65}) rotate(${index % 2 ? 18 : -12}deg)` }} />;
        })}
      </span>
    </div>
  );
}

function MachineScene({ kind, progress, turnGoal = 1 }) {
  const isSterilizing = kind === 'sterilize';
  return (
    <div className={`machine-scene scene-${kind}`} style={{ '--scene-progress': `${progress}%` }} aria-hidden="true">
      <div className="machine-top">
        <div className={`machine-light red ${progress < 34 ? 'active' : ''}`} /><div className={`machine-light amber ${progress >= 34 && progress < 100 ? 'active' : ''}`} /><div className={`machine-light green ${progress >= 100 ? 'active' : ''}`} />
      </div>
      <div className="machine-window">
        {isSterilizing ? <><div className="steam s1">〰</div><div className="steam s2">〰</div><div className="sterile-indicator">{progress >= 100 ? '灭菌完成 ✓' : `顺时针 ${(progress / 100 * turnGoal).toFixed(1)} / ${turnGoal} 圈`}</div></> : <><span className="bubble b1" /><span className="bubble b2" /><span className="bubble b3" /></>}
        <Instrument type={0} progress={isSterilizing ? 100 : progress} /><Instrument type={1} progress={isSterilizing ? 100 : progress} />
      </div>
      <div className="machine-label">{kind === 'sterilize' ? 'STEAM' : 'WASH'}</div>
    </div>
  );
}

function CartoonNurse() {
  return (
    <div className="nurse" aria-hidden="true">
      <div className="nurse-cap"><span>＋</span></div>
      <div className="nurse-hair" />
      <div className="nurse-face"><i className="eye left"/><i className="eye right"/><i className="smile"/></div>
      <div className="nurse-body"><span className="badge">✓</span></div>
      <div className="nurse-arm" />
    </div>
  );
}

function MainIllustration({ level, progress, hitTargets, itemCount, selectedTool, showMemory, hintedTarget, rotateTurns, onTarget }) {
  const cleanAmount = Math.min(100, progress);
  const hitCount = level.action === 'timing' ? itemCount : hitTargets.length;
  const target = (index, className = '') => <ActionTarget key={`target-${index}`} index={index} action={level.action} order={level.order} selectedTool={selectedTool} hit={hitTargets.includes(index)} showMemory={showMemory} hinted={hintedTarget === index} onActivate={onTarget} className={className}/>;
  if (['washer', 'sterilize'].includes(level.scene)) return <MachineScene kind={level.scene} progress={cleanAmount} turnGoal={rotateTurns} />;
  if (level.scene === 'sort') return (
    <div className="sort-scene">
      <div className="transfer-box"><Box/><b>安全转运盒</b><span>{hitCount} / {level.goal}</span></div>
      <div className="transfer-items">{Array.from({ length: level.goal }, (_, i) => <i key={i} className={hitTargets.includes(i) ? 'stored' : ''}><InspectionPanel/>{target(i)}</i>)}</div>
    </div>
  );
  if (level.scene === 'storage') return (
    <div className="storage-scene"><div className="cabinet">{Array.from({ length: level.goal }, (_, i) => <div key={i} className={hitTargets.includes(i) ? 'filled' : ''}>{hitTargets.includes(i) && <PackageCheck/>}{target(i)}</div>)}</div><div className="supply-packs">{Array.from({ length: level.goal - hitCount }, (_, i) => <span key={i}>待存</span>)}</div><b className="scene-counter">已入柜 {hitCount} / {level.goal}</b></div>
  );
  if (level.scene === 'issue') return (
    <div className="issue-scene" aria-hidden="true"><CartoonNurse/><div className="issue-tray">{Array.from({ length: level.goal }, (_, i) => <span key={i} className={i < hitCount ? 'issued' : ''}>{i < hitCount ? '✓' : '包'}</span>)}</div><b className="scene-counter">已发放 {hitCount} / {level.goal}</b></div>
  );
  if (level.scene === 'ultrasonic') return (
    <div className="basin-scene ultra" aria-hidden="true"><div className="basin-rim"><Instrument type={0} progress={cleanAmount}/><Instrument type={1} progress={cleanAmount}/><div className="water-waves">〰 〰 〰</div></div><div className="basin-base">ULTRA</div></div>
  );
  if (level.scene === 'sink') return (
    <div className="basin-scene sink" aria-hidden="true"><div className="faucet"><span/></div><div className="basin-rim"><Instrument type={0} clean/><Instrument type={2} clean/><div className="water-waves">〰 〰</div><div className="rinse-residue" style={{ opacity: Math.max(0, 1 - cleanAmount / 100) }}><i/><i/><i/><i/><i/></div></div></div>
  );
  if (level.scene === 'dry') return (
    <div className="dry-scene" aria-hidden="true"><div className="air-lines">〰 〰 〰</div><Instrument type={0} clean/><Instrument type={2} clean/><span className="drop d1" style={{ opacity: Math.max(0, 1 - cleanAmount / 35) }}/><span className="drop d2" style={{ opacity: Math.max(0, 1 - cleanAmount / 68) }}/><span className="drop d3" style={{ opacity: Math.max(0, 1 - cleanAmount / 100) }}/></div>
  );
  if (level.scene === 'pack') return (
    <div className="pack-scene"><div className="pouch-grid">{Array.from({ length: level.goal }, (_, i) => <div key={i} className={`mini-pouch ${hitTargets.includes(i) ? 'sealed' : ''}`}><Instrument type={i % 3} clean/><span>{hitTargets.includes(i) ? '已封口' : '待封口'}</span>{target(i)}</div>)}</div><b className="scene-counter">已包装 {hitCount} / {level.goal}</b></div>
  );
  return (
    <div className={`work-tray tray-${level.scene}`}>
      <div className="tray-bed">
        <Instrument type={0} progress={level.scene === 'table' ? 0 : 100}/><Instrument type={1} progress={level.scene === 'table' ? 0 : 100}/><Instrument type={2} progress={level.scene === 'table' ? 0 : 100}/>
        {level.scene === 'table' && <div className="foam-layer" style={{ opacity: Math.min(.9, .08 + cleanAmount / 120) }}><i/><i/><i/><i/><i/></div>}
        {level.scene === 'inspect' && <><div className="magnify-hint"><Search size={55}/></div><div className="inspect-points">{Array.from({ length: level.goal }, (_, i) => <i key={i} className={hitTargets.includes(i) ? 'inspected' : ''}><span/>{target(i)}</i>)}</div></>}
        {level.scene === 'oil' && <div className="oil-points">{Array.from({ length: level.goal }, (_, i) => <i key={i} className={hitTargets.includes(i) ? 'oiled' : ''}><span>◆</span>{target(i)}</i>)}</div>}
      </div>
    </div>
  );
}

function Confetti() {
  return <div className="confetti" aria-hidden="true">{Array.from({ length: 22 }, (_, i) => <i key={i} style={{ '--i': i }} />)}</div>;
}

function App() {
  const [screen, setScreen] = useState('home');
  const [levelIndex, setLevelIndex] = useState(() => Number(localStorage.getItem('clean-game-level') || 0));
  const [progress, setProgress] = useState(0);
  const [selectedTool, setSelectedTool] = useState(null);
  const [wrongTool, setWrongTool] = useState(null);
  const [hitTargets, setHitTargets] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPoint, setDragPoint] = useState(null);
  const [cleaningMarks, setCleaningMarks] = useState([]);
  const [isHolding, setIsHolding] = useState(false);
  const [scanPoint, setScanPoint] = useState(null);
  const [showMemory, setShowMemory] = useState(false);
  const [timingValue, setTimingValue] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState('');
  const [soundOn, setSoundOn] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [earnedStars, setEarnedStars] = useState(() => Number(localStorage.getItem('clean-game-stars') || 0));
  const lastPoint = useRef(null);
  const cleaningMarkId = useRef(0);
  const holdTimer = useRef(null);
  const memoryTimer = useRef(null);
  const lastAngle = useRef(null);
  const reverseTravel = useRef(0);
  const rotationWarned = useRef(false);
  const timingCanScore = useRef(true);
  const timingTrackRef = useRef(null);
  const level = levels[levelIndex];
  const challengeRank = Math.min(3, 1 + Math.floor(levelIndex / 4));
  const assistActive = mistakes >= 2;
  const scanRadius = assistActive ? 76 : mistakes === 1 ? 64 : 54;
  const timingHalfWidth = assistActive ? 14 : mistakes === 1 ? 8 : 5;
  const timingCycleMs = assistActive ? 1850 : mistakes === 1 ? 1500 : 1200;
  const rotateTurns = level.scene === 'sterilize' ? (assistActive ? 2 : mistakes === 1 ? 2.5 : level.turns) : 1;
  const hintedTarget = assistActive && selectedTool && !showMemory && ['ordered', 'memory'].includes(level.action)
    ? level.order?.[hitTargets.length]
    : null;
  const assistCopy = {
    pack: '小助手：保留已完成步骤，下一个编号会发光',
    sterilize: '小助手：顺时针引导已加强，目标调整为 2 圈',
    storage: '小助手：延长记忆时间，并亮起下一格',
    issue: '小助手：绿色区变宽，游标也会慢下来',
  };
  const getTimingEdgeTolerance = () => {
    const trackBounds = timingTrackRef.current?.getBoundingClientRect();
    const cursorBounds = timingTrackRef.current?.querySelector('strong')?.getBoundingClientRect();
    return trackBounds?.width && cursorBounds?.width
      ? (cursorBounds.width / 2 / trackBounds.width) * 100
      : 0;
  };

  const playTone = useCallback((kind = 'tap') => {
    if (!soundOn) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(kind === 'win' ? 523 : kind === 'wrong' ? 160 : 360, ctx.currentTime);
      if (kind === 'win') osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + .28);
      gain.gain.setValueAtTime(.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .32);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + .34);
    } catch { /* sound is optional */ }
  }, [soundOn]);

  const speak = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${level.title}。${level.prompt}。${level.guide}`);
    const availableVoices = window.speechSynthesis.getVoices();
    const mainlandVoices = availableVoices.filter(voice => /^zh-CN\b/i.test(voice.lang));
    const mandarinVoices = mainlandVoices.length ? mainlandVoices : availableVoices.filter(voice => /^zh\b/i.test(voice.lang));
    const naturalVoice = mandarinVoices.find(voice => /natural|online|xiaoxiao|yunxi|google.*(?:普通话|mandarin)/i.test(voice.name)) || mandarinVoices[0];
    if (naturalVoice) utterance.voice = naturalVoice;
    utterance.lang = 'zh-CN';
    utterance.rate = .95;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }, [level]);

  const finishLevel = useCallback(() => {
    if (completed) return;
    setCompleted(true); setProgress(level.goal); playTone('win');
    const nextStars = Math.max(earnedStars, (levelIndex + 1) * 3);
    setEarnedStars(nextStars);
    localStorage.setItem('clean-game-stars', String(nextStars));
    localStorage.setItem('clean-game-level', String(Math.min(levels.length - 1, levelIndex + 1)));
  }, [completed, earnedStars, level.goal, levelIndex, playTone]);

  useEffect(() => {
    if (['targets', 'ordered', 'scan', 'memory'].includes(level.action) && hitTargets.length >= level.goal) finishLevel();
    if (!['targets', 'ordered', 'scan', 'memory'].includes(level.action) && progress >= level.goal) finishLevel();
  }, [finishLevel, hitTargets.length, level.action, level.goal, progress]);

  useEffect(() => {
    if (level.action !== 'timing' || !selectedTool || completed) { setTimingValue(0); return undefined; }
    const startedAt = performance.now();
    const timer = window.setInterval(() => {
      const phase = ((performance.now() - startedAt) % timingCycleMs) / timingCycleMs;
      const next = phase < .5 ? phase * 200 : (1 - phase) * 200;
      const edgeTolerance = getTimingEdgeTolerance();
      if (next < 50 - timingHalfWidth - edgeTolerance || next > 50 + timingHalfWidth + edgeTolerance) timingCanScore.current = true;
      setTimingValue(next);
    }, 32);
    return () => window.clearInterval(timer);
  }, [completed, level.action, selectedTool, timingCycleMs, timingHalfWidth]);

  useEffect(() => () => {
    window.clearInterval(holdTimer.current);
    window.clearTimeout(memoryTimer.current);
  }, []);

  const resetLevel = useCallback(() => {
    window.clearInterval(holdTimer.current); window.clearTimeout(memoryTimer.current);
    setProgress(0); setSelectedTool(null); setWrongTool(null); setHitTargets([]); setIsDragging(false); setDragPoint(null); setCleaningMarks([]); setIsHolding(false); setScanPoint(null); setShowMemory(false); setTimingValue(0); setMistakes(0); setCompleted(false); setMessage(''); lastPoint.current = null; lastAngle.current = null; reverseTravel.current = 0; rotationWarned.current = false; timingCanScore.current = true;
  }, []);

  const startAt = (index) => {
    setLevelIndex(index); setScreen('game');
    setTimeout(resetLevel, 0);
  };

  const chooseTool = (tool) => {
    if (completed) return;
    if (tool !== level.correct) {
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      setWrongTool(tool);
      setMessage(nextMistakes >= 2 ? `小提示：找一找“${toolData[level.correct][0]}”` : '这个工具不合适，再观察一下！'); playTone('wrong');
      setTimeout(() => setWrongTool(current => current === tool ? null : current), 650);
      setTimeout(() => setMessage(''), 1300); return;
    }
    setWrongTool(null); setSelectedTool(tool); playTone('tap');
    if (level.action === 'memory') {
      const previewMs = mistakes >= 2 ? 5200 : mistakes === 1 ? 4200 : 3400;
      setShowMemory(true); setMessage(`认真记住 1 → ${level.goal} 的位置！`);
      window.clearTimeout(memoryTimer.current);
      memoryTimer.current = window.setTimeout(() => { setShowMemory(false); setMessage('轮到你按顺序操作啦！'); }, previewMs);
      setTimeout(() => setMessage(''), previewMs + 1300);
    } else {
      setMessage('选对啦！现在动手吧 ✨'); setTimeout(() => setMessage(''), 1300);
    }
  };

  const handleTarget = (idx) => {
    if (!selectedTool || completed || hitTargets.includes(idx)) return;
    if (level.action === 'memory' && showMemory) return;
    if (['ordered', 'memory'].includes(level.action) && idx !== level.order[hitTargets.length]) {
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes); playTone('wrong');
      if (level.action === 'ordered') {
        setMessage(nextMistakes >= 2 ? '顺序不对，看发光的下一步！' : `请先完成编号 ${hitTargets.length + 1}！`);
        setTimeout(() => setMessage(''), 1400);
        return;
      }
      const keepProgress = nextMistakes >= 2;
      const previewMs = nextMistakes >= 2 ? 5200 : 4200;
      if (!keepProgress) { setHitTargets([]); setProgress(0); }
      setMessage(keepProgress ? '顺序不对，已保留进度并慢速重播！' : '顺序不对，系统会慢速再播放一次！');
      setShowMemory(true);
      window.clearTimeout(memoryTimer.current);
      memoryTimer.current = window.setTimeout(() => { setShowMemory(false); setMessage(''); }, previewMs);
      return;
    }
    const next = [...hitTargets, idx]; setHitTargets(next); setProgress(next.length); playTone('tap');
  };

  const pointerMove = (e) => {
    if (!selectedTool || completed) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    if (level.action === 'scan') {
      const clientX = e.clientX; const clientY = e.clientY;
      const x = clientX - bounds.left; const y = clientY - bounds.top;
      const markerPositions = [...e.currentTarget.querySelectorAll('[data-target-index]')].map(element => {
        const rect = element.getBoundingClientRect();
        return {
          index: Number(element.dataset.targetIndex),
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      });
      setScanPoint({ x, y });
      setHitTargets(current => {
        const marker = markerPositions.find(item => {
          if (current.includes(item.index)) return false;
          return Math.hypot(clientX - item.x, clientY - item.y) < scanRadius;
        });
        if (!marker) return current;
        const found = marker.index;
        const next = [...current, found]; setProgress(next.length); playTone('tap'); return next;
      });
      return;
    }
    if (level.action === 'rotate') {
      if (!isDragging) return;
      setDragPoint({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
      const angle = Math.atan2(e.clientY - (bounds.top + bounds.height / 2), e.clientX - (bounds.left + bounds.width / 2));
      if (lastAngle.current !== null) {
        const delta = Math.atan2(Math.sin(angle - lastAngle.current), Math.cos(angle - lastAngle.current));
        if (delta > 0 && delta < 1.2) {
          setProgress(value => Math.min(level.goal, value + delta * 100 / (Math.PI * 2 * rotateTurns)));
        } else if (delta < 0 && delta > -1.2 && !rotationWarned.current) {
          reverseTravel.current += Math.abs(delta);
          if (reverseTravel.current > .45) {
            rotationWarned.current = true;
            setMistakes(value => value + 1); setMessage('方向反啦，请跟着 ↻ 顺时针转动！'); playTone('wrong');
            setTimeout(() => setMessage(''), 1500);
          }
        }
      }
      lastAngle.current = angle;
      return;
    }
    if (!isDragging || level.action !== 'swipe') return;
    setDragPoint({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
    const point = { x: e.clientX, y: e.clientY };
    if (lastPoint.current) {
      const dist = Math.hypot(point.x - lastPoint.current.x, point.y - lastPoint.current.y);
      if (dist > 5) {
        const markId = ++cleaningMarkId.current;
        setProgress(p => Math.min(level.goal, p + Math.min(2.5, dist / 12)));
        setCleaningMarks(marks => [...marks.slice(-8), { id: markId, x: e.clientX - bounds.left, y: e.clientY - bounds.top }]);
        setTimeout(() => setCleaningMarks(marks => marks.filter(mark => mark.id !== markId)), 520);
        lastPoint.current = point;
      }
    } else lastPoint.current = point;
  };

  const endDrag = () => {
    setIsDragging(false); setDragPoint(null); setScanPoint(null); lastPoint.current = null; lastAngle.current = null; reverseTravel.current = 0; rotationWarned.current = false;
  };

  const startHold = (e) => {
    e.stopPropagation();
    if (!selectedTool || completed || isHolding) return;
    setIsHolding(true); playTone('tap');
    window.clearInterval(holdTimer.current);
    holdTimer.current = window.setInterval(() => setProgress(value => {
      const next = Math.min(level.goal, value + 1.6);
      if (next >= level.goal) { window.clearInterval(holdTimer.current); setIsHolding(false); }
      return next;
    }), 50);
  };

  const endHold = (e) => {
    e?.stopPropagation(); window.clearInterval(holdTimer.current); setIsHolding(false);
  };

  const handleTiming = () => {
    if (!selectedTool || completed) return;
    const edgeTolerance = getTimingEdgeTolerance();
    const lowerBound = 50 - timingHalfWidth - edgeTolerance;
    const upperBound = 50 + timingHalfWidth + edgeTolerance;
    if (timingValue >= lowerBound && timingValue <= upperBound && timingCanScore.current) {
      timingCanScore.current = false; setProgress(value => Math.min(level.goal, value + 1)); setMessage('完美交接！等待下一件'); playTone('tap');
    } else if (!timingCanScore.current) {
      setMessage('下一件无菌包正在准备中…');
    } else {
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes); setMessage(nextMistakes >= 2 ? '小助手已放宽绿色区并降低速度！' : '再等等，游标进入绿色区再交接！'); playTone('wrong');
    }
    setTimeout(() => setMessage(''), 900);
  };

  const nextLevel = () => {
    if (levelIndex === levels.length - 1) { setScreen('final'); return; }
    setLevelIndex(i => i + 1); resetLevel();
  };

  const displayProgress = ['targets', 'ordered', 'scan', 'memory', 'timing'].includes(level.action) ? Math.round((progress / level.goal) * 100) : Math.round(progress);
  const toolCursor = selectedTool ? toolData[selectedTool]?.[0] : '';
  const visualItemCount = ['targets', 'ordered', 'scan', 'memory'].includes(level.action) ? hitTargets.length : level.action === 'timing' ? Math.round(progress) : 0;
  const observation = useMemo(() => {
    const stage = displayProgress === 0 ? 0 : displayProgress < 45 ? 1 : displayProgress < 85 ? 2 : 3;
    const observations = {
      table: { label: '保湿覆盖', sample: 'foam', stages: ['等待喷洒泡沫', '泡沫正在覆盖', '器械保持湿润', '预处理完成'] },
      ultrasonic: { label: '清洗观察', sample: 'dirt', stages: ['污渍清晰可见', '污渍开始松动', '污渍正在减少', '酶洗干净'] },
      sink: { label: '冲洗观察', sample: 'rinse', stages: ['残余泡沫较多', '泡沫正在冲走', '只剩少量泡沫', '冲洗完成'] },
      dry: { label: '干燥观察', sample: 'drops', stages: ['器械还有水珠', '水珠正在减少', '只剩少量水珠', '彻底干燥'] },
    };
    const item = observations[level.scene];
    return item ? { ...item, text: item.stages[stage], stage } : null;
  }, [displayProgress, level.scene]);

  if (screen === 'home') return (
    <main className="app-shell home-screen">
      <div className="clouds"><i/><i/><i/></div>
      <button className="round-button settings-button" aria-label="设置" onClick={() => setShowHelp(true)}><Settings/></button>
      <button className="round-button sound-button" aria-label={soundOn ? '关闭声音' : '打开声音'} onClick={() => setSoundOn(v => !v)}>{soundOn ? <Speaker/> : <VolumeX/>}</button>
      <section className="hero-card">
        <div className="mascot-bubble"><ShieldCheck size={68}/><span className="mascot-face">•ᴗ•</span></div>
        <p className="eyebrow">互动科普展 · DENTAL CLEAN TEAM</p>
        <h1>小小消毒师</h1>
        <p className="hero-subtitle">器械大冒险</p>
        <div className="hero-badges"><span><Sparkles/>12 个任务</span><span><Star/>边玩边学</span><span><Droplets/>观察流程变化</span></div>
        <button className="primary-button" onClick={() => startAt(Math.min(levelIndex, levels.length - 1))}><Play fill="currentColor"/>开始冒险</button>
        {earnedStars > 0 && <button className="text-button" onClick={() => setScreen('map')}>查看闯关地图 <ChevronRight/></button>}
      </section>
      <div className="home-instruments"><Instrument type={0}/><Instrument type={1}/><Instrument type={2}/></div>
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </main>
  );

  if (screen === 'map') return (
    <main className="app-shell map-screen">
      <header className="map-header"><button className="round-button" onClick={() => setScreen('home')}><Home/></button><div><p>消毒岛地图</p><h2>选择任务</h2></div><div className="star-total"><Star fill="currentColor"/> {earnedStars}</div></header>
      <div className="level-map">
        {levels.map((item, i) => {
          const unlocked = i === 0 || earnedStars >= i * 3;
          return <Fragment key={item.title}>{i === 8 && <div className="advanced-zone-marker"><Sparkles/><span><b>进阶挑战区</b><small>规则升级 · 失误后会自动辅助</small></span></div>}<button disabled={!unlocked} className={`map-node ${i % 2 ? 'right' : 'left'} ${unlocked ? 'unlocked' : ''} ${item.advanced ? 'advanced' : ''}`} onClick={() => startAt(i)}><span className="node-number">{i + 1}</span><span className="node-copy"><b>{item.short}</b><small>{unlocked ? (earnedStars >= (i + 1) * 3 ? '★★★' : item.advanced ? '开始进阶任务' : '开始任务') : '完成前一关解锁'}</small></span></button></Fragment>;
        })}
      </div>
    </main>
  );

  if (screen === 'final') return (
    <main className="app-shell final-screen"><Confetti/><div className="final-card"><div className="big-medal"><BadgeCheck/></div><p>全部完成</p><h1>金牌小小消毒师</h1><div className="final-stars"><Star/><Star/><Star/></div><p className="final-copy">你让每一件器械都安全、干净、闪闪发光！</p><button className="primary-button" onClick={() => setScreen('map')}>看看我的奖章</button><button className="text-button" onClick={() => { setLevelIndex(0); resetLevel(); setScreen('game'); }}><RotateCcw/>再玩一次</button></div></main>
  );

  return (
    <main className={`app-shell game-screen ${level.advanced ? 'advanced-level' : ''} ${completed ? 'level-complete' : ''}`}>
      <header className="game-header">
        <button className="round-button" aria-label="返回地图" onClick={() => setScreen('map')}><Home/></button>
        <div className="level-heading"><span>任务 {levelIndex + 1} / {levels.length}</span><b>{level.title}</b></div>
        <button className="round-button" aria-label="朗读提示" onClick={speak}><Speaker/></button>
      </header>
      <div className="progress-track" aria-label={`任务进度 ${displayProgress}%`}><span style={{ width: `${displayProgress}%` }}/><b>{displayProgress}%</b><i><Star fill="currentColor"/></i></div>
      <section className="task-card">
        <div className="helper-avatar"><ShieldCheck/><span>•ᴗ•</span></div>
        <div className="task-copy"><p>{level.prompt}</p><small>{assistActive ? (assistCopy[level.scene] || '小助手已开启：正确工具会发光，操作范围也更宽松') : selectedTool ? level.guide : '先从下方选择合适的工具'}</small><span className="fact-line"><Sparkles/>知识点：{levelFacts[levelIndex]}</span></div>
        <div className={`challenge-level ${level.advanced ? 'advanced' : ''}`} aria-label={`挑战难度 ${challengeRank} 星`}><b>{level.advanced ? '进阶区' : '挑战'}</b><span>{[1,2,3].map(rank => <i key={rank} className={rank <= challengeRank ? 'on' : ''}>★</i>)}</span></div>
      </section>
      <section
        className={`play-zone ${selectedTool ? 'tool-active' : ''}`}
        onPointerDown={(e) => {
          if (['swipe', 'rotate'].includes(level.action) && selectedTool && !completed) {
            const bounds = e.currentTarget.getBoundingClientRect();
            setIsDragging(true);
            setDragPoint({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
            if (level.action === 'rotate') {
              lastAngle.current = Math.atan2(e.clientY - (bounds.top + bounds.height / 2), e.clientX - (bounds.left + bounds.width / 2));
              reverseTravel.current = 0; rotationWarned.current = false;
            }
            else lastPoint.current = { x: e.clientX, y: e.clientY };
            e.currentTarget.setPointerCapture(e.pointerId);
          }
          if (level.action === 'scan' && selectedTool && !completed) { e.currentTarget.setPointerCapture(e.pointerId); pointerMove(e); }
        }}
        onPointerMove={pointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={() => { if (level.action === 'scan') setScanPoint(null); }}
      >
        <div className="scene-glow"/><MainIllustration level={level} progress={displayProgress} hitTargets={hitTargets} itemCount={visualItemCount} selectedTool={selectedTool} showMemory={showMemory} hintedTarget={hintedTarget} rotateTurns={rotateTurns} onTarget={handleTarget}/>
        {observation && <div className={`clean-status process-stage-${observation.stage}`}><span className={`process-sample sample-${observation.sample}`}><i/><i/><i/></span><div><small>{observation.label}</small><b>{observation.text}</b></div></div>}
        {level.action === 'swipe' && selectedTool && <div className={`swipe-hint ${progress > 10 ? 'faded' : ''}`}><span>☝</span>来回滑动</div>}
        {level.action === 'hold' && <button className={`hold-control ${isHolding ? 'holding' : ''}`} onPointerDown={startHold} onPointerUp={endHold} onPointerCancel={endHold} onPointerLeave={endHold} disabled={!selectedTool || completed}><span style={{ '--hold-progress': `${displayProgress}%` }}><Play fill="currentColor"/></span><b>{isHolding ? '机器运行中…' : selectedTool ? '按住启动' : '先选择启动钥匙'}</b><small>{displayProgress}%</small></button>}
        {level.action === 'rotate' && <div className={`rotate-control ${isDragging ? 'rotating' : ''} ${assistActive ? 'assisted' : ''}`} aria-hidden="true"><div><Gauge/><span>↻</span></div><b>{selectedTool ? `顺时针转动 · 目标 ${rotateTurns} 圈` : '先选择温度旋钮'}</b></div>}
        {level.action === 'timing' && <div className={`timing-game ${assistActive ? 'assisted' : ''}`}><div className="timing-copy"><b>{assistActive ? '辅助节奏' : '快节奏交接'}</b><span>已完成 {Math.round(progress)} / {level.goal}</span></div><div ref={timingTrackRef} className="timing-track"><i className="timing-safe" style={{ left: `${50 - timingHalfWidth}%`, width: `${timingHalfWidth * 2}%` }}/><strong style={{ left: `${timingValue}%` }}/></div><button onPointerDown={handleTiming} onClick={(event) => { if (event.detail === 0) handleTiming(); }} disabled={!selectedTool}>现在交接！</button></div>}
        {isDragging && dragPoint && selectedTool && (
          <div className="dragged-tool" style={{ left: dragPoint.x, top: dragPoint.y }} aria-hidden="true">
            <ToolIcon name={selectedTool} size={56}/>
          </div>
        )}
        {cleaningMarks.map(mark => <span key={mark.id} className="cleaning-mark" style={{ left: mark.x, top: mark.y }} aria-hidden="true"><Sparkles/></span>)}
        {level.action === 'scan' && scanPoint && selectedTool && <span className="scan-lens" style={{ left: scanPoint.x, top: scanPoint.y }} aria-hidden="true"><Search/></span>}
        {selectedTool && <div className="active-tool-label"><ToolIcon name={selectedTool} size={20}/>{toolCursor}</div>}
        {message && <div className="toast-message" role="status" aria-live="polite">{message}</div>}
      </section>
      <section className="tool-dock" aria-label="工具栏">
        <div className={`dock-title ${selectedTool ? 'ready' : ''}`}><span>{selectedTool ? '第 2 步 · 去上方动手操作' : '第 1 步 · 选择正确工具'}</span><button onClick={() => setShowHelp(true)}><CircleHelp/>怎么做</button></div>
        <div className="tools-row">
          {level.tools.map(tool => <button key={tool} aria-pressed={selectedTool === tool} className={`tool-button ${selectedTool === tool ? 'selected' : ''} ${wrongTool === tool ? 'wrong' : ''} ${assistActive && tool === level.correct ? 'hinted' : ''}`} onClick={() => chooseTool(tool)}><span className="tool-result" aria-hidden="true">{wrongTool === tool ? '×' : selectedTool === tool ? '✓' : ''}</span><span className="tool-art"><ToolIcon name={tool}/><i/></span><b>{toolData[tool][0]}</b></button>)}
        </div>
      </section>
      {completed && <div className="completion-overlay"><Confetti/><div className="completion-card"><div className="heart-pop"><Heart fill="currentColor"/></div><h2>太棒啦！</h2><p>“{level.title}”完成</p><div className="stars-earned"><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/></div><div className="knowledge-earned"><Sparkles/><span><b>本关知识</b>{levelFacts[levelIndex]}</span></div><button className="primary-button" onClick={nextLevel}>{levelIndex === levels.length - 1 ? '领取消毒师奖章' : '下一项任务'} <ChevronRight/></button></div></div>}
      {showHelp && <HelpModal level={level} onClose={() => setShowHelp(false)} />}
    </main>
  );
}

function HelpModal({ level, onClose }) {
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="help-modal"><button className="modal-close" onClick={onClose}><X/></button><div className="help-icon"><CircleHelp/></div><h2>{level ? '这一关怎么玩？' : '欢迎来到消毒岛'}</h2><p>{level ? level.guide : '每一关先选择正确工具，再按照提示点击或滑动。完成 12 项任务，就能成为金牌小小消毒师！'}</p><div className="help-steps"><span><b>1</b>看提示</span><span><b>2</b>选工具</span><span><b>3</b>动手做</span></div><button className="primary-button" onClick={onClose}>我知道啦</button></div></div>;
}

export default App;
