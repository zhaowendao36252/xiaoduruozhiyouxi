import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, Archive, BadgeCheck, Box, CheckCircle2, ChevronRight,
  CircleHelp, Droplets, Gauge, Home, InspectionPanel, LockKeyhole, PackageCheck,
  Play, RotateCcw, Search, ShieldCheck, Sparkles, Wind, X,
} from 'lucide-react';
import {
  advanceMission, createInitialWorkflowState, getCurrentMission, getCurrentStep,
  isWorkflowComplete, missions, performWorkflowAction, scenes,
} from './workflow.js';

const STORAGE_KEY = 'sterilization-workflow-v2';
const TRANSITION_MS = 5500;

const locationLabels = {
  receivingPoint: '污染器械接收点', sortingTable: '接收分拣台', transferBox: '密闭转运盒',
  handpieceTray: '牙科手机专用托盘', cleaningBasket: '金属清洗篮', rinseSink: '漂洗槽',
  ultrasonicDeck: '超声设备装载位', ultrasonic: '医用超声波清洗机', highPressurePort: '手机高压冲洗接口',
  airGun: '医用压缩空气吹干枪', oilingMachine: '牙科手机自动注油养护机',
  finalRinseSink: '终末漂洗槽', dryingTray: '器械干燥托盘', dryerDeck: '干燥柜装载位',
  dryingCabinet: '医用器械干燥柜', postDrySortingTable: '干燥后分拣台', handpiecePackGroup: '手机包装组合位',
  instrumentPackGroup: '普通器械组合位', inspectionLamp: '带光源检查放大镜', pouchRack: '医用纸塑包装袋架',
  handpiecePouch: '手机纸塑包装袋', instrumentPouch: '器械纸塑包装袋', packingBench: '包装工作台',
  medicalSealer: '医用纸塑包装热封机', sealedStaging: '已封装暂存区', loadBasket: '灭菌装载篮',
  sterilizerDeck: '灭菌装载位', sterilizer: 'B 级压力蒸汽灭菌器', cleanTransferCart: '洁净转运车',
  sterilePassBox: '无菌区传递位置', storageReceiving: '无菌物品接收台', sterileCabinet: '无菌物品储存柜',
  dispatchOrder: '发放任务单', dispatchBox: '洁净发放容器', dispatchBench: '发放装载台', dispatchWindow: '发放窗口',
};

const itemLabels = {
  transferBox: '密闭防渗漏转运盒', handpiece: '牙科弯手机', instruments: '普通口腔器械 ×2',
  cleaningBasket: '金属清洗篮', dryingTray: '器械干燥托盘', pouchBatch: '密封器械包 ×3',
  loadBasket: '灭菌装载篮', dispatchBox: '洁净发放容器',
};

const stateLabels = {
  Dirty: '污染', Received: '已接收', Sorted: '已分拣', Rinsed: '已漂洗', UltrasonicWashed: '已超声酶洗',
  FinalRinsed: '已终末漂洗', AirDried: '已吹干', Lubricated: '已注油养护', MachineDried: '已机器干燥',
  PostDrySorted: '干燥后已分拣', Inspected: '已检查', Packed: '已装袋', Sealed: '已热封',
  LoadedForSterilization: '已装载', Sterilized: '已压力蒸汽灭菌', TransferredToStorage: '已转运至无菌区',
  Stored: '已入柜', PreparedForDispatch: '待发放', Dispatched: '已发放', Empty: '空', Loaded: '已装载',
};

const sceneLocations = {
  pretreatment: { receivingPoint: [14, 64], sortingTable: [50, 60], handpieceTray: [76, 45], cleaningBasket: [73, 69], transferBox: [30, 54] },
  rinse: {
    sortingTable: [8, 64], handpieceTray: [12, 42], rinseSink: [27, 61], finalRinseSink: [43, 61],
    ultrasonicDeck: [58, 62], ultrasonic: [61, 47], highPressurePort: [36, 33], airGun: [48, 29],
    oilingMachine: [73, 48], dryingTray: [84, 66], dryerDeck: [87, 61], dryingCabinet: [91, 39], cleaningBasket: [24, 54],
  },
  packaging: {
    dryingCabinet: [8, 42], dryingTray: [17, 65], postDrySortingTable: [31, 60], handpiecePackGroup: [28, 44],
    instrumentPackGroup: [38, 44], inspectionLamp: [45, 28], pouchRack: [53, 30], handpiecePouch: [49, 58],
    instrumentPouch: [57, 58], packingBench: [55, 67], medicalSealer: [67, 48], sealedStaging: [73, 68],
    loadBasket: [82, 61], sterilizerDeck: [87, 65], sterilizer: [91, 40], cleanTransferCart: [86, 77],
  },
  storage: {
    cleanTransferCart: [8, 65], sterilePassBox: [23, 39], storageReceiving: [37, 62], sterileCabinet: [57, 39],
    dispatchOrder: [69, 29], dispatchBox: [75, 60], dispatchBench: [76, 68], dispatchWindow: [91, 40],
  },
};

function loadSavedState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.version === 2) return saved;
  } catch { /* start a fresh traceable workflow */ }
  return createInitialWorkflowState();
}

function EquipmentIcon({ kind }) {
  const props = { size: 28, strokeWidth: 2.2 };
  if (/Sink|Port|Gun/.test(kind)) return kind === 'airGun' ? <Wind {...props}/> : <Droplets {...props}/>;
  if (/Basket|Tray|Table|Bench|Deck/.test(kind)) return <Archive {...props}/>;
  if (/Pouch|Sealer|Pack|Staging/.test(kind)) return <PackageCheck {...props}/>;
  if (/Cabinet|dryer/.test(kind)) return <Archive {...props}/>;
  if (/sterilizer|ultrasonic|Machine/.test(kind)) return <Gauge {...props}/>;
  if (/Lamp/.test(kind)) return <Search {...props}/>;
  if (/Box|Pass|Window|receiving/.test(kind)) return <Box {...props}/>;
  return <InspectionPanel {...props}/>;
}

function ItemIcon({ item }) {
  if (item === 'handpiece') return <span className="handpiece-art"><i/><i/></span>;
  if (item === 'instruments') return <span className="instrument-set"><i/><i/><i/></span>;
  if (item === 'pouchBatch') return <PackageCheck/>;
  if (item === 'transferBox' || item === 'dispatchBox') return <Box/>;
  return <Archive/>;
}

function Station({ id, label, className = '', active, onActivate, children }) {
  return (
    <button type="button" className={`station station-${id} ${className} ${active ? 'active-target' : ''}`} data-location={id} data-target={id} aria-label={label}
      onClick={() => onActivate(id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); onActivate(id, true); }}>
      <span className="station-icon"><EquipmentIcon kind={id}/></span><b>{label}</b>{children}{active && <em>放到这里</em>}
    </button>
  );
}

function PretreatmentScene({ activeId, onActivate }) {
  const p = (id) => ({ active: id === activeId, onActivate });
  return <><div className="room-wall"><div className="upper-cabinets"/><div className="clinical-sign">器械预处理区</div></div><div className="counter counter-a"><span className="small-sink"/><span className="biohazard">☣</span></div><Station id="receivingPoint" label="污染器械接收点" {...p('receivingPoint')}/><Station id="sortingTable" label="接收分拣台" {...p('sortingTable')}/><Station id="handpieceTray" label="牙科手机托盘" {...p('handpieceTray')}/><Station id="cleaningBasket" label="金属清洗篮" {...p('cleaningBasket')}/><Station id="transferBox" label="密闭转运盒" {...p('transferBox')}/></>;
}

function RinseScene({ activeId, onActivate }) {
  const p = (id) => ({ active: id === activeId, onActivate });
  return <><div className="room-wall"><div className="process-signs"><span>初洗</span><span>漂洗</span><span>终末漂洗</span><span>气枪</span></div></div><div className="counter counter-b"><i/><i/><i/><i/></div><Station id="sortingTable" label="分拣台" {...p('sortingTable')}/><Station id="handpieceTray" label="手机托盘" {...p('handpieceTray')}/><Station id="rinseSink" label="漂洗槽" className="wet-station" {...p('rinseSink')}/><Station id="finalRinseSink" label="终末漂洗槽" className="wet-station" {...p('finalRinseSink')}/><Station id="ultrasonicDeck" label="超声装载位" {...p('ultrasonicDeck')}/><Station id="ultrasonic" label="医用超声波清洗机" className="machine ultrasonic-machine" {...p('ultrasonic')}><span className="machine-screen">14:52</span></Station><Station id="highPressurePort" label="手机高压冲洗接口" className="compact-station" {...p('highPressurePort')}/><Station id="airGun" label="压缩空气吹干枪" className="compact-station" {...p('airGun')}><span className="coil">〰〰</span></Station><Station id="oilingMachine" label="自动注油养护机" className="machine oil-machine" {...p('oilingMachine')}><span className="nozzles">••••••<br/>••••••</span></Station><Station id="dryingTray" label="干燥托盘" {...p('dryingTray')}/><Station id="dryerDeck" label="干燥装载位" {...p('dryerDeck')}/><Station id="dryingCabinet" label="医用器械干燥柜" className="machine dry-cabinet" {...p('dryingCabinet')}><span className="cabinet-window">▦</span></Station><Station id="cleaningBasket" label="金属清洗篮" {...p('cleaningBasket')}/></>;
}

function PackagingScene({ activeId, onActivate }) {
  const p = (id) => ({ active: id === activeId, onActivate });
  return <><div className="room-wall"><div className="clinical-sign">分拣 · 包装 · 压力蒸汽灭菌</div></div><div className="counter counter-c"/><Station id="dryingCabinet" label="干燥柜" className="machine dry-cabinet" {...p('dryingCabinet')}/><Station id="dryingTray" label="干燥器械托盘" {...p('dryingTray')}/><Station id="postDrySortingTable" label="干燥后分拣台" {...p('postDrySortingTable')}/><Station id="handpiecePackGroup" label="手机组合位" {...p('handpiecePackGroup')}/><Station id="instrumentPackGroup" label="器械组合位" {...p('instrumentPackGroup')}/><Station id="inspectionLamp" label="带光源检查放大镜" className="compact-station inspection-lamp" {...p('inspectionLamp')}/><Station id="pouchRack" label="纸塑包装袋架" {...p('pouchRack')}/><Station id="handpiecePouch" label="手机包装袋" {...p('handpiecePouch')}/><Station id="instrumentPouch" label="器械包装袋" {...p('instrumentPouch')}/><Station id="packingBench" label="包装工作台" {...p('packingBench')}/><Station id="medicalSealer" label="医用纸塑包装热封机" className="machine sealer-machine" {...p('medicalSealer')}><span className="seal-rollers">〓〓</span></Station><Station id="sealedStaging" label="已封装暂存区" {...p('sealedStaging')}/><Station id="loadBasket" label="灭菌装载篮" {...p('loadBasket')}/><Station id="sterilizerDeck" label="灭菌装载位" {...p('sterilizerDeck')}/><Station id="sterilizer" label="B 级压力蒸汽灭菌器" className="machine sterilizer-machine" {...p('sterilizer')}><span className="machine-screen">CLASS B</span></Station><Station id="cleanTransferCart" label="洁净转运车" {...p('cleanTransferCart')}/></>;
}

function StorageScene({ activeId, onActivate }) {
  const p = (id) => ({ active: id === activeId, onActivate });
  return <><div className="room-wall"><div className="clinical-sign">无菌储存与洁净发放</div></div><div className="counter counter-d"/><Station id="cleanTransferCart" label="洁净转运车" {...p('cleanTransferCart')}/><Station id="sterilePassBox" label="无菌区传递窗" className="pass-box" {...p('sterilePassBox')}/><Station id="storageReceiving" label="无菌物品接收台" {...p('storageReceiving')}/><Station id="sterileCabinet" label="无菌物品储存柜" className="sterile-cabinet" {...p('sterileCabinet')}><span className="cabinet-shelves">▤ ▤<br/>▤ ▤</span></Station><Station id="dispatchOrder" label="发放任务单" className="compact-station" {...p('dispatchOrder')}/><Station id="dispatchBox" label="洁净发放容器" {...p('dispatchBox')}/><Station id="dispatchBench" label="发放装载台" {...p('dispatchBench')}/><Station id="dispatchWindow" label="发放窗口" className="pass-box" {...p('dispatchWindow')}/></>;
}

function RoomScene({ scene, step, selectedItem, onStation }) {
  const activeId = step?.action === 'move' ? step.to : step?.target;
  const Scene = scene === 'pretreatment' ? PretreatmentScene : scene === 'rinse' ? RinseScene : scene === 'packaging' ? PackagingScene : StorageScene;
  return <div className={`room-scene scene-${scene} ${selectedItem ? 'has-selection' : ''}`}><Scene activeId={activeId} onActivate={onStation}/><div className="scene-floor"/><span className="flow-line"/><span className="scene-watermark">模拟教学场景 · 非临床操作界面</span></div>;
}

function MovableToken({ item, step, scene, selected, onSelect }) {
  if (!item || !step || step.action !== 'move') return null;
  const position = sceneLocations[scene]?.[step.from] ?? [18, 72];
  return <button type="button" className={`movable-token ${selected ? 'selected' : ''}`} style={{ '--x': `${position[0]}%`, '--y': `${position[1]}%` }} draggable onDragStart={() => onSelect(item)} onClick={() => onSelect(item)} aria-label={`拿取${itemLabels[item]}`}><ItemIcon item={item}/><b>{itemLabels[item]}</b><span>{selected ? '已拿取' : '点击拿取'}</span></button>;
}

function MissionTransition({ missionIndex, onDone }) {
  const [progress, setProgress] = useState(0); const mission = missions[missionIndex];
  useEffect(() => { const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches; const duration = reduced ? 800 : TRANSITION_MS; const start = performance.now(); const timer = window.setInterval(() => { const value = Math.min(100, (performance.now() - start) / duration * 100); setProgress(value); if (value >= 100) { window.clearInterval(timer); onDone(); } }, 50); return () => window.clearInterval(timer); }, [missionIndex, onDone]);
  const scene = mission.steps[0].scene;
  return <main className={`app-shell workflow-transition tone-${scenes[scene].tone}`}><div className="transition-grid"/><div className="transition-rings"><i/><i/><i/></div><button className="skip-button" onClick={onDone}>跳过 <ChevronRight/></button><section><span>真实流程 · 视频 {missionIndex + 1} / 7</span><div className="transition-emblem"><ShieldCheck/><b>{missionIndex + 1}</b></div><p>{scenes[scene].name}</p><h1>{mission.title}</h1><small>{mission.summary}</small></section><footer><div><span style={{ width: `${progress}%` }}/></div><p>正在进入连续工作位 <b>{Math.max(1, Math.ceil((100 - progress) / 100 * 5.5))} 秒</b></p></footer></main>;
}

function HelpModal({ onClose }) {
  return <div className="modal-backdrop"><div className="help-modal"><button className="modal-close" onClick={onClose}><X/></button><CircleHelp className="help-main-icon"/><h2>怎样完成真实流程？</h2><p>移动步骤：先点击拿取物品，再点击发光的目标工作位；桌面端也可以直接拖放。设备步骤：按提示打开、连接、关闭或启动设备。</p><ul><li>器械不会在关卡间重新生成</li><li>牙科手机与普通器械分支独立处理</li><li>包装、密封和灭菌状态会一直保留到发放</li></ul><button className="primary-button" onClick={onClose}>继续操作</button></div></div>;
}

function App() {
  const [workflow, setWorkflow] = useState(loadSavedState); const [screen, setScreen] = useState('home');
  const [selectedItem, setSelectedItem] = useState(null); const [notice, setNotice] = useState(''); const [error, setError] = useState('');
  const [moving, setMoving] = useState(null); const [programming, setProgramming] = useState(false); const [showHelp, setShowHelp] = useState(false); const [transitionKey, setTransitionKey] = useState(0);
  const mission = getCurrentMission(workflow); const step = getCurrentStep(workflow); const missionComplete = mission && workflow.stepIndex >= mission.steps.length;
  const scene = step?.scene ?? mission?.steps.at(-1)?.scene ?? 'storage'; const completedSteps = workflow.history.length;
  const totalSteps = useMemo(() => missions.reduce((sum, item) => sum + item.steps.length, 0), []); const missionProgress = mission ? Math.round(Math.min(100, workflow.stepIndex / mission.steps.length * 100)) : 100;
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(workflow)); }, [workflow]);

  const tone = (kind = 'ok') => { try { const AudioCtx = window.AudioContext || window.webkitAudioContext; const context = new AudioCtx(); const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.frequency.value = kind === 'error' ? 170 : kind === 'complete' ? 720 : 420; oscillator.type = kind === 'error' ? 'sawtooth' : 'sine'; gain.gain.value = .045; oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .22); oscillator.stop(context.currentTime + .24); } catch { /* optional */ } };
  const applyAction = (action) => { const result = performWorkflowAction(workflow, action); if (!result.ok) { setError(result.error); setNotice(''); tone('error'); return false; } setWorkflow(result.state); setError(''); setNotice(`完成：${step.title}`); tone(result.completedMission ? 'complete' : 'ok'); window.setTimeout(() => setNotice(''), 1300); return true; };
  const selectItem = (item) => { if (programming || moving) return; if (step?.action !== 'move') { setError(`当前需要操作设备。正确下一步：${step?.instruction}`); tone('error'); return; } if (item !== step.item) { const result = performWorkflowAction(workflow, { type: 'move', item, to: step.to }); setError(result.error); tone('error'); return; } setSelectedItem(item); setError(''); setNotice(`已拿取：${itemLabels[item]}，请放到“${locationLabels[step.to]}”`); };
  const moveToStation = (target) => { if (!step) return; if (step.action !== 'move') { const result = performWorkflowAction(workflow, { type: 'operate', target }); setError(result.error); tone('error'); return; } if (!selectedItem) { setError(`请先拿取“${itemLabels[step.item]}”，再移动到“${locationLabels[step.to]}”。`); tone('error'); return; } if (target !== step.to) { const result = performWorkflowAction(workflow, { type: 'move', item: selectedItem, to: target }); setError(result.error); tone('error'); return; } setError(''); setNotice(`正在移动到：${locationLabels[target]}`); setMoving({ item: selectedItem, from: step.from, to: target }); window.setTimeout(() => { applyAction({ type: 'move', item: selectedItem, to: target }); setMoving(null); setSelectedItem(null); }, 720); };
  const runOperation = (target = step?.target, actionType = step?.action) => { if (!step || programming || moving) return; if (target !== step.target || actionType !== step.action) { applyAction({ type: actionType, target }); return; } if (step.duration) { setProgramming(true); setError(''); setNotice(`${step.title}运行中…`); window.setTimeout(() => { applyAction({ type: actionType, target }); setProgramming(false); }, step.duration); } else applyAction({ type: actionType, target }); };
  const nextMission = () => { const result = advanceMission(workflow); if (!result.ok) { setError(result.error); return; } setWorkflow(result.state); setSelectedItem(null); setNotice(''); setError(''); if (isWorkflowComplete(result.state) || result.state.finished) setScreen('final'); else { setTransitionKey((value) => value + 1); setScreen('transition'); } };
  const resetAll = () => { const fresh = createInitialWorkflowState(); setWorkflow(fresh); setScreen('home'); setSelectedItem(null); setError(''); setNotice(''); };

  if (screen === 'transition') return <MissionTransition key={`${workflow.missionIndex}-${transitionKey}`} missionIndex={workflow.missionIndex} onDone={() => setScreen('mission')}/>;
  if (screen === 'final') return <main className="app-shell final-screen"><Sparkles className="final-spark s1"/><Sparkles className="final-spark s2"/><section className="final-panel"><div className="final-badge"><BadgeCheck/></div><p>7 段真实流程 · 全部完成</p><h1>无菌器械安全发放</h1><div className="final-chain"><span>污染器械</span><i>→</i><span>清洗养护</span><i>→</i><span>密封灭菌</span><i>→</i><span>无菌发放</span></div><div className="final-facts"><b>{totalSteps}</b><span>个连续操作</span><b>3</b><span>个密封器械包</span><b>0</b><span>件器械丢失</span></div><button className="primary-button" onClick={() => setScreen('home')}><Home/>返回流程总览</button><button className="text-button" onClick={resetAll}><RotateCcw/>从头重新训练</button></section></main>;
  if (screen === 'home') return <main className="app-shell workflow-home"><div className="home-grid"/><header><div className="brand-mark"><ShieldCheck/><span>口腔器械处理<br/><small>DENTAL INSTRUMENT WORKFLOW</small></span></div><button onClick={() => setShowHelp(true)}><CircleHelp/>操作说明</button></header><section className="home-hero"><p>真实工作位 · 连续物品状态 · 7 段操作流程</p><h1>从污染器械<br/><span>到无菌发放</span></h1><small>同一批器械将经过接收、清洗、养护、干燥、包装、压力蒸汽灭菌、储存与发放；每一步都必须在正确设备和容器中完成。</small><button className="primary-button" onClick={() => setScreen('transition')}><Play fill="currentColor"/>{completedSteps ? '继续当前流程' : '开始规范训练'}</button><div className="home-progress"><div><span style={{ width: `${completedSteps / totalSteps * 100}%` }}/></div><b>{completedSteps} / {totalSteps} 操作已完成</b></div></section><section className="mission-map">{missions.map((item, index) => { const done = workflow.completedMissions.includes(item.id); const current = index === workflow.missionIndex; return <article key={item.id} className={`${done ? 'done' : ''} ${current ? 'current' : ''}`}><span>{done ? <CheckCircle2/> : index + 1}</span><div><small>视频 {index + 1}</small><b>{item.title}</b></div>{current && <em>当前</em>}</article>; })}</section>{showHelp && <HelpModal onClose={() => setShowHelp(false)}/>}</main>;

  const operationLabels = { open: '打开设备', close: '关闭并确认', connect: '连接接口', operate: '执行操作', program: '启动程序', select: '确认选择' };
  const statusItems = ['handpiece', 'instruments', 'pouchBatch'];
  return <main className={`app-shell mission-screen tone-${scenes[scene].tone}`}><header className="mission-header"><button className="round-button" onClick={() => setScreen('home')} aria-label="返回流程总览"><Home/></button><div><span>视频 {workflow.missionIndex + 1} / 7 · {scenes[scene].name}</span><b>{mission.title}</b></div><button className="round-button" onClick={() => setShowHelp(true)} aria-label="操作帮助"><CircleHelp/></button></header><div className="mission-progress"><span style={{ width: `${missionProgress}%` }}/><b>{workflow.stepIndex} / {mission.steps.length}</b></div><section className="instruction-card"><div className="step-number">{missionComplete ? '✓' : workflow.stepIndex + 1}</div><div><small>{step?.branch ? `${step.branch}支线` : '当前操作'}</small><h2>{missionComplete ? '本段流程完成' : step.title}</h2><p>{missionComplete ? '器械状态、数量和所属容器已保存，可以进入下一段真实流程。' : step.instruction}</p></div><div className="step-rule"><LockKeyhole/><span>{step?.action === 'move' ? '拿取 → 移动 → 对准 → 放置' : '操作设备 → 获得反馈 → 状态更新'}</span></div></section><section className="scene-shell"><div className="scene-title"><span><i/>当前工作位</span><b>{scenes[scene].short}</b></div><RoomScene scene={scene} step={step} selectedItem={selectedItem} onStation={moveToStation}/>{!missionComplete && <MovableToken item={step?.item} step={step} scene={scene} selected={selectedItem === step?.item} onSelect={selectItem}/>} {moving && <div className="moving-clone" style={{ '--sx': `${sceneLocations[scene]?.[moving.from]?.[0] ?? 20}%`, '--sy': `${sceneLocations[scene]?.[moving.from]?.[1] ?? 70}%`, '--tx': `${sceneLocations[scene]?.[moving.to]?.[0] ?? 75}%`, '--ty': `${sceneLocations[scene]?.[moving.to]?.[1] ?? 45}%` }}><ItemIcon item={moving.item}/></div>}{programming && <div className="program-overlay"><div><Gauge/><b>{step.title}</b><span style={{ '--duration': `${step.duration}ms` }}/><small>设备运行中，请勿中断</small></div></div>}{notice && <div className="scene-toast ok"><CheckCircle2/>{notice}</div>}{error && <div className="scene-toast error"><AlertTriangle/>{error}</div>}</section><aside className="control-panel"><div className="batch-status"><div><small>批次状态</small><b>器械数量持续追踪</b></div>{statusItems.map((item) => <span key={item} className={workflow.items[item].state.toLowerCase()}><ItemIcon item={item}/><i><b>{itemLabels[item]}</b><small>{stateLabels[workflow.items[item].state] ?? workflow.items[item].state}</small></i></span>)}</div>{!missionComplete && step?.action !== 'move' && <div className="operation-actions"><small>设备操作</small><button className="primary-action" onClick={() => runOperation()} disabled={programming}><Play/>{operationLabels[step.action] ?? '执行正确操作'}</button><div><button onClick={() => runOperation('wrongDevice', step.action)}>尝试其他设备</button><button onClick={() => runOperation(step.target, step.action === 'open' ? 'program' : 'open')}>跳过前置动作</button></div></div>}{!missionComplete && step?.action === 'move' && <div className="move-guide"><span className={selectedItem ? 'done' : 'current'}><b>1</b>拿取 {itemLabels[step.item]}</span><ChevronRight/><span className={selectedItem ? 'current' : ''}><b>2</b>放到 {locationLabels[step.to]}</span></div>}{missionComplete && <button className="primary-button next-mission" onClick={nextMission}>{workflow.missionIndex === missions.length - 1 ? '完成无菌发放' : '进入下一段流程'}<ChevronRight/></button>}</aside>{showHelp && <HelpModal onClose={() => setShowHelp(false)}/>}</main>;
}

export default App;
