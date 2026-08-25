import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import pretreatmentBackground from './assets/scene-backgrounds/01-pretreatment.jpg';
import sortingBackground from './assets/scene-backgrounds/02-sorting.jpg';
import ultrasonicBackground from './assets/scene-backgrounds/03-ultrasonic.jpg';
import rinsingBackground from './assets/scene-backgrounds/04-rinsing.jpg';
import washerBackground from './assets/scene-backgrounds/05-washer.jpg';
import dryingBackground from './assets/scene-backgrounds/06-drying.jpg';
import oilingBackground from './assets/scene-backgrounds/07-oiling.jpg';
import inspectionBackground from './assets/scene-backgrounds/08-inspection.jpg';
import packagingBackground from './assets/scene-backgrounds/09-packaging.jpg';
import sterilizationBackground from './assets/scene-backgrounds/10-sterilization.jpg';
import storageBackground from './assets/scene-backgrounds/11-storage.jpg';
import dispatchBackground from './assets/scene-backgrounds/12-dispatch.jpg';
import {
  Archive, BadgeCheck, Box, ChevronRight, CircleHelp, Droplets,
  Gauge, Heart, Home, InspectionPanel, KeyRound, PackageCheck, Play,
  RotateCcw, Search, Settings, ShieldCheck, Sparkles, Speaker, VolumeX,
  SprayCan, Star, ThermometerSun, X,
} from 'lucide-react';

const levels = [
  { title: '器械预处理', short: '预处理', prompt: '选择正确工具：使用棉球处理器械表面可见污渍。', guide: '选择棉球，在器械表面来回擦拭', scene: 'table', action: 'swipe', goal: 100, correct: 'cotton', tools: ['cotton', 'towel', 'brush'], stars: 3, narrationTrack: 1 },
  { title: '转运分类', short: '分类', prompt: '选择正确容器：将牙科器械逐件分类放入密闭转运盒。', guide: '选择密闭转运盒，依次放入分类后的器械', scene: 'sort', action: 'targets', goal: 5, correct: 'box', tools: ['basket', 'box', 'bag'], stars: 3, narrationTrack: 2 },
  { title: '超声酶洗', short: '酶洗', prompt: '选择正确清洗剂：加入多酶液，以震荡模式进行超声酶洗。', guide: '选择多酶液，在超声清洗机内完成酶洗', scene: 'ultrasonic', action: 'swipe', goal: 100, correct: 'enzyme', tools: ['water', 'enzyme', 'soap'], stars: 3, narrationTrack: 3 },
  { title: '流动水冲洗', short: '冲洗', prompt: '选择正确工具：使用流动水冲洗器械表面和缝隙。', guide: '选择高压冲洗枪，在器械上来回冲洗', scene: 'sink', action: 'swipe', goal: 100, correct: 'hose', tools: ['hose', 'cup', 'towel'], stars: 3, narrationTrack: 4 },
  { title: '终末漂洗', short: '终末漂洗', prompt: '选择正确用水：使用纯水漂洗。', guide: '选择纯水，在终末漂洗槽内完成漂洗', scene: 'finalRinse', action: 'swipe', goal: 100, correct: 'pureWater', tools: ['pureWater', 'brush', 'fan'], stars: 3, narrationTrack: 5 },
  { title: '吹干', short: '吹干', prompt: '选择正确工具：使用气枪吹走水珠。', guide: '选择气枪，在器械表面和缝隙来回吹干', scene: 'airDry', action: 'swipe', goal: 100, correct: 'fan', tools: ['towel', 'fan', 'water'], stars: 3, narrationTrack: 6 },
  { title: '注油', short: '注油', prompt: '选择专用设备：往牙科手机内注入润滑油。', guide: '选择手机注油机，依次连接牙科手机接口', scene: 'oil', action: 'targets', goal: 5, correct: 'oil', tools: ['enzyme', 'oil', 'soap'], stars: 3, narrationTrack: 7 },
  { title: '清洗消毒', short: '清洗消毒', prompt: '放好器械，按住按键，启动清洗消毒机器，等待程序全部完成。', guide: '放好器械，按住启动按钮，等待清洗消毒程序全部完成', scene: 'washer', action: 'hold', goal: 100, correct: 'key', tools: ['key', 'brush', 'fan'], stars: 3, narrationTrack: 9 },
  { title: '检查', short: '检查', prompt: '选择正确工具：使用放大镜检查器械清洁状况。', guide: '选择放大镜，移动扫描检查 5 个区域', scene: 'inspect', action: 'scan', goal: 5, correct: 'glass', tools: ['glass', 'lamp', 'towel'], stars: 3, narrationTrack: 8 },
  { title: '包装', short: '包装', prompt: '选择正确设备：将器械装入纸塑袋，并进行热封。', guide: '选择封口机，按顺序完成 4 个器械包热封', scene: 'pack', action: 'ordered', order: [0, 2, 1, 3], goal: 4, correct: 'sealer', tools: ['box', 'sealer', 'basket'], stars: 3, advanced: true, narrationTrack: 9 },
  { title: '灭菌', short: '灭菌', prompt: '选择正确控制项：将封装器械放入压力蒸汽灭菌器。', guide: '选择温度旋钮，顺时针启动灭菌程序', scene: 'sterilize', action: 'rotate', turns: 3, goal: 100, correct: 'dial', tools: ['dial', 'key', 'hose'], stars: 3, advanced: true, narrationTrack: 10 },
  { title: '储存', short: '储存', prompt: '选择正确位置：将已灭菌器械包分类放入无菌储存柜。', guide: '选择无菌储存柜，按亮起的标签顺序入柜', scene: 'storage', action: 'memory', order: [4, 1, 5, 0, 3, 2], goal: 6, correct: 'cabinet', tools: ['basket', 'cabinet', 'box'], stars: 3, advanced: true, narrationTrack: 11 },
  { title: '发放', short: '发放', prompt: '选择正确容器：按照需求，进行器械发放。', guide: '选择洁净发放托盘，在正确时机完成交接', scene: 'issue', action: 'timing', goal: 4, correct: 'tray', tools: ['tray', 'pouch', 'bag'], stars: 3, advanced: true, narrationTrack: 12 },
];

const sceneBackgrounds = {
  table: pretreatmentBackground,
  sort: sortingBackground,
  ultrasonic: ultrasonicBackground,
  sink: rinsingBackground,
  washer: washerBackground,
  finalRinse: rinsingBackground,
  airDry: rinsingBackground,
  dry: dryingBackground,
  oil: oilingBackground,
  inspect: inspectionBackground,
  pack: packagingBackground,
  sterilize: sterilizationBackground,
  storage: storageBackground,
  issue: dispatchBackground,
};

const sceneModels = {
  table: { name: '器械预处理台', hint: '棉球预处理' },
  sort: { name: '密闭转运盒', hint: '逐件分类入盒' },
  ultrasonic: { name: '医用超声波清洗机', hint: '震荡酶洗' },
  sink: { name: '流动水冲洗槽', hint: '高压冲洗' },
  finalRinse: { name: '终末漂洗槽', hint: '纯水漂洗' },
  airDry: { name: '压缩空气气枪', hint: '吹走水珠' },
  oil: { name: '牙科手机注油机', hint: '连接手机接口' },
  dry: { name: '医用器械干燥柜', hint: '启动烘干程序' },
  inspect: { name: '带光源检查放大镜', hint: '放大检查' },
  pack: { name: '医用纸塑包装热封机', hint: '包装热封' },
  sterilize: { name: 'Class B 压力蒸汽灭菌器', hint: '高温蒸汽灭菌' },
  storage: { name: '无菌物品储存柜', hint: '分类入柜' },
  issue: { name: '洁净发放与传递窗', hint: '核对后发放' },
  washer: { name: '清洗消毒机', hint: '机洗程序' },
};

const modelTargetPositions = {
  sort: [[18, 27], [36, 21], [55, 27], [73, 21], [87, 27]],
  oil: [[32, 29], [55, 27], [68, 43], [49, 59], [32, 67]],
  inspect: [[29, 29], [63, 26], [48, 45], [70, 61], [31, 67]],
  pack: [[25, 30], [75, 30], [25, 66], [75, 66]],
  storage: [[31, 27], [69, 27], [31, 49], [69, 49], [31, 71], [69, 71]],
};

const levelFacts = [
  '预处理阶段使用棉球处理可见污渍，避免污染物干结。',
  '污染器械应分类后置于密闭转运盒，减少交叉污染。',
  '多酶液配合震荡模式，可清洁器械细小缝隙。',
  '流动水冲洗能够带走松动的污物和清洗液残留。',
  '终末漂洗使用纯水，减少清洗剂和水垢残留。',
  '气枪吹干可去除器械缝隙和管腔中的水珠。',
  '牙科手机需通过专用注油设备完成润滑保养。',
  '清洗消毒机按程序完成清洗消毒，完成后再进入后续处理。',
  '放大检查有助于发现肉眼不易察觉的残留。',
  '纸塑袋热封后可在灭菌过程及后续储存中保护器械。',
  '压力蒸汽灭菌需满足规定的温度、压力和时间。',
  '无菌包应在清洁、干燥且分类明确的储存柜中保存。',
  '发放前再次核对器械包的类别、数量和灭菌标识。',
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
      <path d="M7 19h29l8 6-8 7H16l-5-5H7Z" fill="#dff1f3" stroke="#227f9b" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M36 24h19l6 4-6 4H37" fill="#8bd7e3" stroke="#227f9b" strokeWidth="3"/>
      <path d="M19 31h16l-5 24H17l-5-7Z" fill="#3bafd0" stroke="#227f9b" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M29 35 39 45h-9" fill="#ffd05c" stroke="#227f9b" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M20 55c1 7 17 5 20 0 3-6-1-11-6-10" fill="none" stroke="#2f90b1" strokeWidth="4" strokeLinecap="round"/>
      <path d="M7 21H1M3 18v6" stroke="#227f9b" strokeWidth="3" strokeLinecap="round"/>
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
  cotton: ['棉球', Archive], foam: ['保湿泡沫', SprayCan], towel: ['吸水巾', Archive], brush: ['清洗刷', Sparkles],
  basket: ['金属清洗篮', Archive], box: ['密闭转运盒', Box], bag: ['普通袋', PackageCheck],
  water: ['清水瓶', Droplets], enzyme: ['多酶液', Sparkles], soap: ['洗手液', Droplets],
  pureWater: ['纯水', Droplets], hose: ['高压冲洗枪', RinseGunToolIcon], cup: ['小水杯', Droplets], key: ['启动按钮', KeyRound],
  fan: ['气枪', DryerToolIcon], oil: ['手机注油机', Settings], glass: ['放大镜', Search],
  lamp: ['小台灯', ThermometerSun], pouch: ['包装袋', PackageCheck], sealer: ['封口机', Settings], dial: ['温度旋钮', Gauge],
  cabinet: ['储存柜', Archive], tray: ['发放托盘', InspectionPanel],
};

function ActionTarget({ index, action, order = [], selectedTool, hit, showMemory, hinted, onActivate, className = '', style = {} }) {
  const orderNumber = order.indexOf(index) + 1;
  return (
    <button
      type="button"
      data-target-index={index}
      aria-label={`操作目标 ${index + 1}`}
      tabIndex={action === 'scan' ? -1 : 0}
      className={`action-target anchored-target ${action}-target ${hit ? 'hit' : ''} ${showMemory ? 'memorizing' : ''} ${hinted ? 'next-hint' : ''} ${className}`}
      style={{ '--memory-order': order.indexOf(index), ...style }}
      onClick={action === 'scan' ? undefined : () => onActivate(index)}
    >
      <span>{hit ? '✓' : action === 'ordered' ? orderNumber : action === 'memory' && showMemory ? orderNumber : action === 'scan' ? <Search/> : selectedTool ? '＋' : '?'}</span>
    </button>
  );
}

function ToolIcon({ name, size = 34 }) {
  if (name === 'pureWater') name = 'water';
  if (name === 'fan') return <DryerToolIcon size={size} aria-hidden="true" />;
  if (name === 'hose') return <RinseGunToolIcon size={size} aria-hidden="true" />;

  let shape;
  switch (name) {
    case 'cotton': shape = <><circle cx="32" cy="32" r="22" fill="#fffdf6"/><path d="M15 31c8-11 25-12 34 0M16 37c9 10 24 10 32 0" stroke="#d9d8cf" strokeWidth="2"/><circle cx="25" cy="25" r="3" fill="#f1eee2"/><circle cx="38" cy="38" r="3" fill="#f1eee2"/></> ; break;
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
    case 'sealer': shape = <><path d="M9 25h46v23H9Z" rx="5" fill="#e6eff0"/><path d="M14 21h36v8H14Z" fill="#74c9d5"/><path d="M16 31h28M16 38h21"/><rect x="45" y="29" width="6" height="13" rx="2" fill="#ffbb55"/><path d="M4 49h56" strokeWidth="4"/></> ; break;
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
  const target = (index, className = '', style = {}) => <ActionTarget key={`target-${index}`} index={index} action={level.action} order={level.order} selectedTool={selectedTool} hit={hitTargets.includes(index)} showMemory={showMemory} hinted={hintedTarget === index} onActivate={onTarget} className={className} style={style}/>;
  const model = sceneModels[level.scene];
  const positions = modelTargetPositions[level.scene] || [];
  const hasTargets = positions.length > 0;
  const status = cleanAmount >= 100 || (level.goal && hitCount >= level.goal) ? '本步骤完成' : selectedTool ? model.hint : '请选择本步骤所需设备';

  return (
    <div className={`reference-scene-model model-${level.scene}`} onDragStart={(event) => event.preventDefault()}>
      <img src={sceneBackgrounds[level.scene]} alt="" draggable="false" />
      <div className="reference-model-vignette" aria-hidden="true" />
      <div className="reference-model-title"><span>{model.name}</span><b>{status}</b></div>
      {hasTargets && <div className="reference-model-targets">
        {Array.from({ length: level.goal }, (_, index) => {
          const [left, top] = positions[index] || [50, 50];
          return target(index, 'reference-model-target', { left: `${left}%`, top: `${top}%` });
        })}
      </div>}
      {['swipe', 'hold', 'rotate'].includes(level.action) && <div className={`reference-model-progress ${cleanAmount >= 100 ? 'complete' : ''}`}><i style={{ width: `${cleanAmount}%` }}/></div>}
      {level.scene === 'table' && <div className="reference-model-cotton" aria-hidden="true"><ToolIcon name="cotton" size={34}/></div>}
      {level.scene === 'sort' && <div className="reference-sort-box" aria-hidden="true"><ToolIcon name="box" size={46}/><div>{Array.from({ length: level.goal }, (_, index) => <i key={index} className={hitTargets.includes(index) ? 'stored' : ''}>{hitTargets.includes(index) ? '✓' : '⌁'}</i>)}</div><b>分类转运盒</b></div>}
      {level.scene === 'airDry' && <div className="reference-model-air" aria-hidden="true">⌁⌁⌁</div>}
      {level.scene === 'sterilize' && <div className="reference-model-steam" aria-hidden="true">⌁⌁</div>}
      <b className="reference-model-counter">{['targets', 'ordered', 'scan', 'memory', 'timing'].includes(level.action) ? `${hitCount} / ${level.goal}` : `${Math.round(cleanAmount)}%`}</b>
    </div>
  );

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

function CinematicTransition({ fromIndex, toIndex, onSkip }) {
  const fromLevel = levels[fromIndex];
  const toLevel = levels[toIndex];
  return (
    <div className="cinematic-transition" role="dialog" aria-label={`正在从${fromLevel.title}前往${toLevel.title}`}>
      <div className="cinematic-scene cinematic-scene-from" style={{ backgroundImage: `url(${sceneBackgrounds[fromLevel.scene]})` }}/>
      <div className="cinematic-scene cinematic-scene-to" style={{ backgroundImage: `url(${sceneBackgrounds[toLevel.scene]})` }}/>
      <div className="cinematic-vignette"/>
      <div className="cinematic-grain"/>
      <div className="cinematic-light"/>
      <div className="cinematic-flash"/>
      <div className="cinematic-letterbox cinematic-letterbox-top"/>
      <div className="cinematic-letterbox cinematic-letterbox-bottom"/>
      <section className="cinematic-copy cinematic-copy-from">
        <span>SCENE {String(fromIndex + 1).padStart(2, '0')} · COMPLETE</span>
        <h2>{fromLevel.title}</h2>
        <i/>
        <p>本工作区任务完成</p>
      </section>
      <section className="cinematic-copy cinematic-copy-to">
        <span>NEXT WORK AREA</span>
        <p>沿洁净流程继续前行</p>
        <h2>{toLevel.title}</h2>
        <i/>
        <small>任务 {toIndex + 1} / {levels.length}</small>
      </section>
      <div className="cinematic-route" aria-hidden="true"><b>{fromLevel.short}</b><span/><em>→</em><span/><b>{toLevel.short}</b></div>
      <div className="cinematic-progress" aria-hidden="true"><span/></div>
      <button className="cinematic-skip" onClick={onSkip}>跳过转场</button>
    </div>
  );
}

function App() {
  // The revised 13-step workflow has different ordering from the earlier demo.
  // Keep a separate version marker so old saved progress cannot unlock later steps.
  const workflowVersion = 'gold-sterilizer-v2';
  const hasCurrentWorkflow = localStorage.getItem('clean-game-workflow-version') === workflowVersion;
  const [screen, setScreen] = useState('home');
  const [levelIndex, setLevelIndex] = useState(() => hasCurrentWorkflow ? Number(localStorage.getItem('clean-game-level') || 0) : 0);
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
  const [cinematicTransition, setCinematicTransition] = useState(null);
  const [earnedStars, setEarnedStars] = useState(() => hasCurrentWorkflow ? Number(localStorage.getItem('clean-game-stars') || 0) : 0);
  const lastPoint = useRef(null);
  const cleaningMarkId = useRef(0);
  const holdTimer = useRef(null);
  const memoryTimer = useRef(null);
  const lastAngle = useRef(null);
  const reverseTravel = useRef(0);
  const rotationWarned = useRef(false);
  const timingCanScore = useRef(true);
  const timingTrackRef = useRef(null);
  const narrationStartTimer = useRef(null);
  const narrationAudioRef = useRef(null);
  const cinematicTimer = useRef(null);
  useEffect(() => {
    localStorage.setItem('clean-game-workflow-version', workflowVersion);
  }, []);
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
    washer: '小助手：清洗消毒程序会持续运行到进度完成',
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

  const playSpriteChime = useCallback((phase = 'intro') => {
    if (!soundOn) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const notes = phase === 'outro' ? [1319, 988, 1175] : [784, 988, 1319];
      notes.forEach((frequency, index) => {
        const startedAt = ctx.currentTime + index * .06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(frequency, startedAt);
        gain.gain.setValueAtTime(.001, startedAt);
        gain.gain.exponentialRampToValueAtTime(.055, startedAt + .012);
        gain.gain.exponentialRampToValueAtTime(.001, startedAt + .14);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(startedAt); osc.stop(startedAt + .16);
      });
      window.setTimeout(() => ctx.close(), 420);
    } catch { /* sprite chime is optional */ }
  }, [soundOn]);

  const stopNarration = useCallback(() => {
    if (narrationStartTimer.current) {
      window.clearTimeout(narrationStartTimer.current);
      narrationStartTimer.current = null;
    }
    if (narrationAudioRef.current) {
      narrationAudioRef.current.pause();
      narrationAudioRef.current.currentTime = 0;
      narrationAudioRef.current = null;
    }
  }, []);

  const speak = useCallback(() => {
    stopNarration();
    const track = level.narrationTrack;
    if (!track || !soundOn) return;
    const narrationNumber = String(track).padStart(2, '0');
    const audio = new Audio(`${import.meta.env.BASE_URL}audio/narration-${narrationNumber}.mp3`);
    audio.preload = 'auto';
    audio.volume = 1;
    audio.onended = () => playSpriteChime('outro');
    audio.onerror = () => { narrationAudioRef.current = null; };
    narrationAudioRef.current = audio;
    playSpriteChime('intro');
    narrationStartTimer.current = window.setTimeout(() => {
      narrationStartTimer.current = null;
      audio.play().catch(() => {
        narrationAudioRef.current = null;
      });
    }, soundOn ? 260 : 0);
  }, [level.narrationTrack, playSpriteChime, soundOn, stopNarration]);

  // Keep exactly one narration active. Changing a selected level, leaving the
  // game, or turning sound off cancels the previous level before the next one
  // is started.
  useEffect(() => {
    if (screen !== 'game' || !soundOn) {
      stopNarration();
      return undefined;
    }
    const autoPlayTimer = window.setTimeout(() => speak(), 0);
    return () => {
      window.clearTimeout(autoPlayTimer);
      stopNarration();
    };
  }, [screen, levelIndex, soundOn, speak, stopNarration]);

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
    window.clearTimeout(cinematicTimer.current);
    stopNarration();
  }, [stopNarration]);

  const resetLevel = useCallback(() => {
    window.clearInterval(holdTimer.current); window.clearTimeout(memoryTimer.current);
    setProgress(0); setSelectedTool(null); setWrongTool(null); setHitTargets([]); setIsDragging(false); setDragPoint(null); setCleaningMarks([]); setIsHolding(false); setScanPoint(null); setShowMemory(false); setTimingValue(0); setMistakes(0); setCompleted(false); setMessage(''); lastPoint.current = null; lastAngle.current = null; reverseTravel.current = 0; rotationWarned.current = false; timingCanScore.current = true;
  }, []);

  const startAt = (index) => {
    stopNarration();
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

  const finishCinematicTransition = () => {
    if (!cinematicTransition) return;
    window.clearTimeout(cinematicTimer.current);
    stopNarration();
    setLevelIndex(cinematicTransition.toIndex);
    resetLevel();
    setCinematicTransition(null);
  };

  const nextLevel = () => {
    stopNarration();
    if (levelIndex === levels.length - 1) { setScreen('final'); return; }
    const nextTransition = { fromIndex: levelIndex, toIndex: levelIndex + 1 };
    const transitionDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 900 : 6500;
    setCinematicTransition(nextTransition);
    window.clearTimeout(cinematicTimer.current);
    cinematicTimer.current = window.setTimeout(() => {
      setLevelIndex(nextTransition.toIndex);
      resetLevel();
      setCinematicTransition(null);
    }, transitionDuration);
  };

  const displayProgress = ['targets', 'ordered', 'scan', 'memory', 'timing'].includes(level.action) ? Math.round((progress / level.goal) * 100) : Math.round(progress);
  const toolCursor = selectedTool ? toolData[selectedTool]?.[0] : '';
  const visualItemCount = ['targets', 'ordered', 'scan', 'memory'].includes(level.action) ? hitTargets.length : level.action === 'timing' ? Math.round(progress) : 0;
  const observation = useMemo(() => {
    const stage = displayProgress === 0 ? 0 : displayProgress < 45 ? 1 : displayProgress < 85 ? 2 : 3;
    const observations = {
      table: { label: '预处理观察', sample: 'dirt', stages: ['可见污渍待处理', '棉球正在擦拭', '表面污渍减少', '预处理完成'] },
      ultrasonic: { label: '超声酶洗', sample: 'dirt', stages: ['器械待酶洗', '震荡正在进行', '污物正在松脱', '酶洗完成'] },
      sink: { label: '流动水冲洗', sample: 'rinse', stages: ['等待冲洗', '持续冲洗中', '缝隙正在清洁', '冲洗完成'] },
      finalRinse: { label: '终末漂洗', sample: 'rinse', stages: ['等待纯水漂洗', '纯水正在流动', '残留正在去除', '终末漂洗完成'] },
      airDry: { label: '气枪吹干', sample: 'drops', stages: ['器械还有水珠', '水珠正在减少', '缝隙正在吹干', '吹干完成'] },
      dry: { label: '烘干观察', sample: 'drops', stages: ['等待启动干燥柜', '烘干程序运行', '器械正在干燥', '彻底干燥'] },
      washer: { label: '清洗消毒观察', sample: 'rinse', stages: ['等待启动清洗消毒机', '清洗消毒程序运行', '器械正在清洗消毒', '程序全部完成'] },
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
        <h1>小小金牌消毒员</h1>
        <p className="hero-subtitle">器械大冒险</p>
        <div className="hero-badges"><span><Sparkles/>13 个任务</span><span><Star/>边玩边学</span><span><Droplets/>观察流程变化</span></div>
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
          return <Fragment key={item.title}>{i === 9 && <div className="advanced-zone-marker"><Sparkles/><span><b>进阶挑战区</b><small>规则升级 · 失误后会自动辅助</small></span></div>}<button disabled={!unlocked} className={`map-node ${i % 2 ? 'right' : 'left'} ${unlocked ? 'unlocked' : ''} ${item.advanced ? 'advanced' : ''}`} onClick={() => startAt(i)}><span className="node-number">{i + 1}</span><span className="node-copy"><b>{item.short}</b><small>{unlocked ? (earnedStars >= (i + 1) * 3 ? '★★★' : item.advanced ? '开始进阶任务' : '开始任务') : '完成前一关解锁'}</small></span></button></Fragment>;
        })}
      </div>
    </main>
  );

  if (screen === 'final') return (
    <main className="app-shell final-screen"><Confetti/><div className="final-card"><div className="big-medal"><BadgeCheck/></div><p>全部完成</p><h1>小小金牌消毒员</h1><div className="final-stars"><Star/><Star/><Star/></div><p className="final-copy">你已完成牙科器械规范处理全流程！</p><button className="primary-button" onClick={() => setScreen('map')}>看看我的奖章</button><button className="text-button" onClick={() => { setLevelIndex(0); resetLevel(); setScreen('game'); }}><RotateCcw/>再玩一次</button></div></main>
  );

  return (
    <main className={`app-shell game-screen ${level.advanced ? 'advanced-level' : ''} ${completed ? 'level-complete' : ''}`}>
      <header className="game-header">
        <button className="round-button" aria-label="返回地图" onClick={() => { stopNarration(); setScreen('map'); }}><Home/></button>
        <div className="level-heading"><span>任务 {levelIndex + 1} / {levels.length}</span><b>{level.title}</b></div>
        <button className="round-button" aria-label="朗读提示" onClick={speak}><Speaker/></button>
      </header>
      <div className="progress-track" aria-label={`任务进度 ${displayProgress}%`}><span style={{ width: `${displayProgress}%` }}/><b>{displayProgress}%</b><i><Star fill="currentColor"/></i></div>
      <section className="task-card">
        <div className="helper-avatar"><ShieldCheck/><span>•ᴗ•</span></div>
        <div className="task-copy"><p>{level.prompt}</p><small>{assistActive ? (assistCopy[level.scene] || '小助手已开启：当前必做设备已高亮，操作范围也更宽松') : selectedTool ? level.guide : level.tools.length > 1 ? '先从下方选择正确工具' : '从下方拿取本步骤必做工具'}</small><span className="fact-line"><Sparkles/>知识点：{levelFacts[levelIndex]}</span></div>
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
        <div className="scene-background" style={{ backgroundImage: `url(${sceneBackgrounds[level.scene]})` }} aria-hidden="true"/>
        <div className="scene-glow"/><MainIllustration level={level} progress={displayProgress} hitTargets={hitTargets} itemCount={visualItemCount} selectedTool={selectedTool} showMemory={showMemory} hintedTarget={hintedTarget} rotateTurns={rotateTurns} onTarget={handleTarget}/>
        {observation && <div className={`clean-status process-stage-${observation.stage}`}><span className={`process-sample sample-${observation.sample}`}><i/><i/><i/></span><div><small>{observation.label}</small><b>{observation.text}</b></div></div>}
        {level.action === 'swipe' && selectedTool && <div className={`swipe-hint ${progress > 10 ? 'faded' : ''}`}><span>☝</span>来回滑动</div>}
        {level.action === 'hold' && <button className={`hold-control ${isHolding ? 'holding' : ''}`} onPointerDown={startHold} onPointerUp={endHold} onPointerCancel={endHold} onPointerLeave={endHold} disabled={!selectedTool || completed}><span style={{ '--hold-progress': `${displayProgress}%` }}><Play fill="currentColor"/></span><b>{isHolding ? '机器运行中…' : selectedTool ? '按住启动' : '先选择启动按钮'}</b><small>{displayProgress}%</small></button>}
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
        <div className={`dock-title ${selectedTool ? 'ready' : ''}`}><span>{selectedTool ? '第 2 步 · 去上方完成操作' : level.tools.length > 1 ? '第 1 步 · 选择正确工具' : '第 1 步 · 拿取本步骤工具'}</span><button onClick={() => setShowHelp(true)}><CircleHelp/>怎么做</button></div>
        <div className={`tools-row ${level.tools.length === 1 ? 'single-tool' : ''}`}>
          {level.tools.map(tool => <button key={tool} aria-pressed={selectedTool === tool} className={`tool-button ${selectedTool === tool ? 'selected' : ''} ${wrongTool === tool ? 'wrong' : ''} ${assistActive && tool === level.correct ? 'hinted' : ''}`} onClick={() => chooseTool(tool)}><span className="tool-result" aria-hidden="true">{wrongTool === tool ? '×' : selectedTool === tool ? '✓' : ''}</span><span className="tool-art"><ToolIcon name={tool}/><i/></span><b>{toolData[tool][0]}</b></button>)}
        </div>
      </section>
      {completed && !cinematicTransition && (levelIndex === levels.length - 1
        ? <div className="completion-overlay"><Confetti/><div className="completion-card"><div className="heart-pop"><Heart fill="currentColor"/></div><h2>太棒啦！</h2><p>“{level.title}”完成</p><div className="stars-earned"><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/></div><div className="knowledge-earned"><Sparkles/><span><b>本关知识</b>{levelFacts[levelIndex]}</span></div><button className="primary-button" onClick={nextLevel}>领取消毒师奖章 <ChevronRight/></button></div></div>
        : <div className="film-completion"><div className="film-completion-image" style={{ backgroundImage: `url(${sceneBackgrounds[level.scene]})` }}/><div className="film-completion-shade"/><div className="film-completion-copy"><span>SCENE {String(levelIndex + 1).padStart(2, '0')} · COMPLETE</span><h2>{level.title}</h2><p>{levelFacts[levelIndex]}</p><div className="film-completion-stars"><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/></div><button onClick={nextLevel}>进入下一幕 <ChevronRight/></button></div></div>)}
      {cinematicTransition && <CinematicTransition {...cinematicTransition} onSkip={finishCinematicTransition}/>} 
      {showHelp && <HelpModal level={level} onClose={() => setShowHelp(false)} />}
    </main>
  );
}

function HelpModal({ level, onClose }) {
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="help-modal"><button className="modal-close" onClick={onClose}><X/></button><div className="help-icon"><CircleHelp/></div><h2>{level ? '这一关怎么玩？' : '欢迎来到金牌消毒员训练室'}</h2><p>{level ? level.guide : '每一关使用本步骤指定的牙科器械处理工具，依序完成 13 个规范流程。'}</p><div className="help-steps"><span><b>1</b>看提示</span><span><b>2</b>拿工具</span><span><b>3</b>完成操作</span></div><button className="primary-button" onClick={onClose}>我知道啦</button></div></div>;
}

export default App;
