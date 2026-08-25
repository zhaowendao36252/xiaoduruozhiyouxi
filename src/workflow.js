export const ITEM_TYPES = {
  handpiece: 'DentalHandpiece',
  instruments: 'GeneralInstrument',
  cleaningBasket: 'CleaningBasket',
  dryingTray: 'InstrumentTray',
  pouchBatch: 'SterilizationPouch',
  loadBasket: 'SterilizationLoadBasket',
  dispatchBox: 'DispatchContainer',
};

const feedbackLabels = {
  transferBox: '污染器械密闭转运盒', handpiece: '牙科手机', instruments: '普通器械',
  cleaningBasket: '金属清洗篮', dryingTray: '器械干燥托盘', pouchBatch: '器械包装批次',
  loadBasket: '灭菌装载篮', dispatchBox: '洁净发放容器', sterilizer: '压力蒸汽灭菌器',
  sterileCabinet: '无菌物品储存柜', wrongDevice: '错误设备',
};

export const scenes = {
  pretreatment: { name: '器械预处理区', short: '接收与准备', tone: 'orange' },
  rinse: { name: '漂洗处理间', short: '清洗与养护', tone: 'blue' },
  packaging: { name: '分拣、包装和灭菌区', short: '包装与灭菌', tone: 'teal' },
  storage: { name: '无菌储存和发放区', short: '储存与发放', tone: 'green' },
};

const move = (id, title, instruction, item, from, to, state, scene, options = {}) => ({
  id, title, instruction, action: 'move', item, from, to, state, scene, ...options,
});
const operate = (id, title, instruction, target, action, state, scene, options = {}) => ({
  id, title, instruction, target, action, state, scene, ...options,
});

export const missions = [
  {
    id: 'video-1-sort-rinse-ultrasonic',
    video: '1.分拣器械—漂洗—超声酶洗.mp4',
    title: '接收、分拣与超声酶洗',
    summary: '转运盒进入分拣台，牙科手机单独分流，普通器械随金属清洗篮完成漂洗和超声酶洗。',
    steps: [
      move('receive-box', '接收污染器械', '将密闭防渗漏转运盒放到接收台。', 'transferBox', 'receivingPoint', 'sortingTable', 'Received', 'pretreatment'),
      operate('open-box', '打开转运盒', '点击转运盒锁扣，打开盒盖后才能分拣。', 'transferBox', 'open', 'Received', 'pretreatment'),
      move('sort-handpiece', '分出牙科手机', '拿起牙科手机，放到专用手机托盘。', 'handpiece', 'transferBox', 'handpieceTray', 'Sorted', 'pretreatment'),
      move('sort-instruments', '普通器械入篮', '将普通口腔器械放入金属清洗篮。', 'instruments', 'transferBox', 'cleaningBasket', 'Sorted', 'pretreatment'),
      move('basket-to-rinse', '移至漂洗槽', '连同金属清洗篮一起移到漂洗槽，不要散拿器械。', 'cleaningBasket', 'sortingTable', 'rinseSink', 'Sorted', 'rinse'),
      operate('rinse-basket', '漂洗器械篮', '使用水枪均匀漂洗篮内器械。', 'waterGun', 'operate', 'Rinsed', 'rinse', { duration: 1800 }),
      move('basket-to-ultrasonic', '移至超声清洗机', '将完成漂洗的金属清洗篮移到超声清洗机前。', 'cleaningBasket', 'rinseSink', 'ultrasonicDeck', 'Rinsed', 'rinse'),
      operate('open-ultrasonic', '打开超声槽盖', '打开医用超声波清洗机槽盖。', 'ultrasonic', 'open', 'Rinsed', 'rinse'),
      move('load-ultrasonic', '装入清洗篮', '将整个金属清洗篮放入超声槽。', 'cleaningBasket', 'ultrasonicDeck', 'ultrasonic', 'Rinsed', 'rinse'),
      operate('close-ultrasonic', '关闭槽盖', '关闭槽盖，确认清洗篮已正确装载。', 'ultrasonic', 'close', 'Rinsed', 'rinse'),
      operate('run-ultrasonic', '启动超声酶洗', '启动超声酶洗程序，等待程序完成。', 'ultrasonic', 'program', 'UltrasonicWashed', 'rinse', { duration: 2200 }),
    ],
  },
  {
    id: 'video-2-dual-branch-care',
    video: '2.高压冲洗手机—吹干—手机注油—吹干手机—放入烘干机—器械进行终末漂洗—吹干器械——放入烘干机.mp4',
    title: '手机与普通器械双支线处理',
    summary: '牙科手机走高压冲洗、两次吹干和自动注油支线；普通器械走终末漂洗和吹干支线，最后在干燥柜汇合。',
    steps: [
      move('handpiece-to-flush', '手机接入高压冲洗位', '从专用托盘拿起牙科手机，对准专业管腔冲洗接口。', 'handpiece', 'handpieceTray', 'highPressurePort', 'Sorted', 'rinse', { branch: '牙科手机' }),
      operate('connect-flush', '连接冲洗接口', '旋紧牙科手机接头，确认接口匹配。', 'highPressurePort', 'connect', 'Sorted', 'rinse', { branch: '牙科手机' }),
      operate('flush-handpiece', '高压冲洗手机', '启动高压冲洗，冲洗牙科手机内部管腔。', 'highPressurePort', 'operate', 'Rinsed', 'rinse', { branch: '牙科手机', duration: 1700 }),
      move('handpiece-to-air-1', '第一次吹干', '将牙科手机移至压缩空气吹干枪位置。', 'handpiece', 'highPressurePort', 'airGun', 'Rinsed', 'rinse', { branch: '牙科手机' }),
      operate('air-dry-handpiece-1', '吹干手机内外部', '使用医用压缩空气吹干枪排出手机管腔水分。', 'airGun', 'operate', 'AirDried', 'rinse', { branch: '牙科手机', duration: 1600 }),
      move('handpiece-to-oiler', '安装到注油接口', '把牙科手机安装到智能养护注油机的匹配接口。', 'handpiece', 'airGun', 'oilingMachine', 'AirDried', 'rinse', { branch: '牙科手机' }),
      operate('close-oiler', '关闭注油机', '关闭养护机上盖，防止油雾外逸。', 'oilingMachine', 'close', 'AirDried', 'rinse', { branch: '牙科手机' }),
      operate('run-oiler', '一键注油养护', '启动专用养护程序，完成内部注油。', 'oilingMachine', 'program', 'Lubricated', 'rinse', { branch: '牙科手机', duration: 1900 }),
      move('handpiece-to-air-2', '取出并再次吹干', '取出已注油手机，移回压缩空气吹干位。', 'handpiece', 'oilingMachine', 'airGun', 'Lubricated', 'rinse', { branch: '牙科手机' }),
      operate('air-dry-handpiece-2', '排出多余润滑油', '再次使用压缩空气，吹除手机内部多余润滑油。', 'airGun', 'operate', 'Lubricated', 'rinse', { branch: '牙科手机', duration: 1600 }),
      move('handpiece-to-dry-tray', '手机放入干燥托盘', '将牙科手机放入干燥柜专用托盘。', 'handpiece', 'airGun', 'dryingTray', 'Lubricated', 'rinse', { branch: '牙科手机' }),
      operate('open-ultrasonic-after', '打开超声槽盖', '超声程序完成，打开槽盖准备取篮。', 'ultrasonic', 'open', 'UltrasonicWashed', 'rinse', { branch: '普通器械' }),
      move('basket-to-final-rinse', '清洗篮移至终末漂洗', '从超声槽取出金属清洗篮，移动到终末漂洗槽。', 'cleaningBasket', 'ultrasonic', 'finalRinseSink', 'UltrasonicWashed', 'rinse', { branch: '普通器械' }),
      operate('final-rinse', '执行终末漂洗', '使用终末漂洗水源充分漂洗整篮器械。', 'finalRinseSink', 'operate', 'FinalRinsed', 'rinse', { branch: '普通器械', duration: 1800 }),
      move('basket-to-air', '器械篮移至吹干位', '连篮移动到压缩空气吹干工位。', 'cleaningBasket', 'finalRinseSink', 'airGun', 'FinalRinsed', 'rinse', { branch: '普通器械' }),
      operate('air-dry-instruments', '吹干普通器械', '逐面吹干器械和关节缝隙，避免残留水分。', 'airGun', 'operate', 'AirDried', 'rinse', { branch: '普通器械', duration: 1800 }),
      move('basket-to-dry-tray', '器械篮放入干燥托盘', '将普通器械清洗篮放到干燥托盘，与手机支线汇合。', 'cleaningBasket', 'airGun', 'dryingTray', 'AirDried', 'rinse', { branch: '普通器械' }),
      move('tray-to-dryer', '装入医用器械干燥柜', '把装有两类器械的托盘推入干燥柜。', 'dryingTray', 'dryerDeck', 'dryingCabinet', 'AirDried', 'rinse'),
      operate('close-dryer', '关闭干燥柜门', '关闭柜门，确认托盘完全进入。', 'dryingCabinet', 'close', 'AirDried', 'rinse'),
      operate('run-dryer', '启动干燥程序', '启动医用器械干燥柜，等待两条支线全部完成。', 'dryingCabinet', 'program', 'MachineDried', 'rinse', { duration: 2300 }),
    ],
  },
  {
    id: 'video-3-dry-transfer-sort',
    video: '3.烘干的器械转运至分拣台—分拣器械.mp4',
    title: '干燥后转运与分拣',
    summary: '打开完成运行的干燥柜，整托盘转运到分拣台，再逐件按包装组合排列。',
    steps: [
      operate('open-dryer', '打开干燥柜', '确认干燥完成提示后打开柜门。', 'dryingCabinet', 'open', 'MachineDried', 'packaging'),
      move('tray-to-post-sort', '整托盘转运', '取出金属托盘，沿工作动线移动到分拣工作台。', 'dryingTray', 'dryingCabinet', 'postDrySortingTable', 'MachineDried', 'packaging'),
      move('handpiece-post-sort', '分拣牙科手机', '从托盘取出牙科手机，放到手机包装组合位。', 'handpiece', 'dryingTray', 'handpiecePackGroup', 'PostDrySorted', 'packaging'),
      move('instruments-post-sort', '分拣普通器械', '从清洗篮逐件取出普通器械，按包装组合排列。', 'instruments', 'cleaningBasket', 'instrumentPackGroup', 'PostDrySorted', 'packaging'),
      operate('inspect-groups', '整理并检查器械', '在带光源放大镜下确认器械清洁、干燥、功能完好。', 'inspectionLamp', 'operate', 'Inspected', 'packaging', { duration: 1500 }),
    ],
  },
  {
    id: 'video-4-pack-seal',
    video: '4.打包—包装.mp4',
    title: '纸塑包装与热封',
    summary: '选择合适尺寸的医用纸塑包装袋，装入器械，经医用热封机形成可见密封边。',
    steps: [
      operate('choose-pouches', '选择包装袋尺寸', '为牙科手机和普通器械组合选择对应尺寸纸塑包装袋。', 'pouchRack', 'select', 'Inspected', 'packaging'),
      move('handpiece-into-pouch', '牙科手机装袋', '将手机组合放入透明面可观察的纸塑包装袋。', 'handpiece', 'handpiecePackGroup', 'handpiecePouch', 'Packed', 'packaging'),
      move('instruments-into-pouch', '普通器械装袋', '将普通器械组合放入对应纸塑包装袋。', 'instruments', 'instrumentPackGroup', 'instrumentPouch', 'Packed', 'packaging'),
      move('pouches-to-sealer', '送入医用热封机', '整理两个包装袋开口，送入医用纸塑包装热封机导轨。', 'pouchBatch', 'packingBench', 'medicalSealer', 'Packed', 'packaging'),
      operate('seal-pouches', '形成连续密封边', '启动热封程序，确认封口平整、连续、无开裂。', 'medicalSealer', 'program', 'Sealed', 'packaging', { duration: 1900 }),
      move('sealed-to-staging', '移至已封装暂存区', '将已封口器械包放到灭菌前暂存区。', 'pouchBatch', 'medicalSealer', 'sealedStaging', 'Sealed', 'packaging'),
    ],
  },
  {
    id: 'video-5-steam-sterilization',
    video: '5.打包的器械进行消毒.mp4',
    title: '压力蒸汽灭菌',
    summary: '已封口器械包经装载篮进入 B 级压力蒸汽灭菌器，门锁定后运行并打印批次记录。',
    steps: [
      move('pouches-to-load-basket', '器械包装载入篮', '从暂存区拿取密封器械包，按间距放入灭菌装载篮。', 'pouchBatch', 'sealedStaging', 'loadBasket', 'LoadedForSterilization', 'packaging'),
      operate('open-sterilizer', '打开灭菌器舱门', '打开 B 级压力蒸汽灭菌器舱门。', 'sterilizer', 'open', 'LoadedForSterilization', 'packaging'),
      move('load-sterilizer', '装载篮推入腔体', '将金属装载篮平稳推入灭菌器腔体。', 'loadBasket', 'sterilizerDeck', 'sterilizer', 'LoadedForSterilization', 'packaging'),
      operate('close-sterilizer', '关闭并锁定舱门', '关闭舱门并确认门锁指示。', 'sterilizer', 'close', 'LoadedForSterilization', 'packaging'),
      operate('run-sterilizer', '运行压力蒸汽灭菌', '选择包装器械程序并启动，观察温度、压力、时间和批次记录。', 'sterilizer', 'program', 'Sterilized', 'packaging', { duration: 2600 }),
    ],
  },
  {
    id: 'video-6-transfer-to-storage',
    video: '6.消毒完成的器械转运至储存.mp4',
    title: '灭菌后洁净转运',
    summary: '保持包装完整，整篮从灭菌器经洁净传递位置进入无菌储存区。',
    steps: [
      operate('open-sterilizer-after', '打开已完成灭菌器', '确认压力归零和完成提示后打开舱门。', 'sterilizer', 'open', 'Sterilized', 'packaging'),
      move('basket-to-clean-transfer', '取出灭菌装载篮', '从腔体取出装载篮，包装不得拆开。', 'loadBasket', 'sterilizer', 'cleanTransferCart', 'Sterilized', 'packaging'),
      move('cart-to-passbox', '移至洁净传递位置', '推动洁净转运车到储存区传递窗口。', 'loadBasket', 'cleanTransferCart', 'sterilePassBox', 'TransferredToStorage', 'storage'),
      operate('pass-to-storage', '完成无菌区交接', '打开储存侧传递门，接收保持密封的器械包。', 'sterilePassBox', 'operate', 'TransferredToStorage', 'storage'),
    ],
  },
  {
    id: 'video-7-store-dispatch',
    video: '7.器械储存至无菌柜后可转运发放.mp4',
    title: '无菌柜储存与发放',
    summary: '按类别和批次入柜，发放时取出指定器械包并放入洁净发放容器。',
    steps: [
      operate('open-sterile-cabinet', '打开无菌储存柜', '核对柜体分类标签、温湿度与可用储位。', 'sterileCabinet', 'open', 'TransferredToStorage', 'storage'),
      move('packs-to-cabinet', '分类放入无菌柜', '保持包装完整，按类别和批次放入对应柜格。', 'pouchBatch', 'storageReceiving', 'sterileCabinet', 'Stored', 'storage'),
      operate('close-sterile-cabinet', '关闭储存柜', '关闭并锁好柜门，完成储存登记。', 'sterileCabinet', 'close', 'Stored', 'storage'),
      operate('start-dispatch-order', '接收发放任务', '读取发放单：牙科手机包 1 件、普通器械包 2 件。', 'dispatchOrder', 'select', 'PreparedForDispatch', 'storage'),
      operate('reopen-sterile-cabinet', '按任务重新开柜', '打开无菌柜，核对类别、数量和批次。', 'sterileCabinet', 'open', 'PreparedForDispatch', 'storage'),
      move('packs-to-dispatch-box', '装入洁净发放容器', '将指定的 3 件器械包放入洁净发放容器。', 'pouchBatch', 'sterileCabinet', 'dispatchBox', 'PreparedForDispatch', 'storage'),
      move('dispatch-to-window', '移动到发放位置', '关闭洁净容器并移动到发放窗口完成交接。', 'dispatchBox', 'dispatchBench', 'dispatchWindow', 'Dispatched', 'storage'),
    ],
  },
];

export const allSteps = missions.flatMap((mission, missionIndex) =>
  mission.steps.map((step, stepIndex) => ({ ...step, missionIndex, stepIndex })),
);

export function createInitialWorkflowState() {
  return {
    version: 2,
    missionIndex: 0,
    stepIndex: 0,
    completedMissions: [],
    history: [],
    items: {
      transferBox: { type: 'TransferBox', state: 'Dirty', location: 'receivingPoint', open: false, count: 1 },
      handpiece: { type: ITEM_TYPES.handpiece, state: 'Dirty', location: 'transferBox', packaged: false, sealed: false, sterilized: false, count: 1 },
      instruments: { type: ITEM_TYPES.instruments, state: 'Dirty', location: 'transferBox', packaged: false, sealed: false, sterilized: false, count: 2 },
      cleaningBasket: { type: ITEM_TYPES.cleaningBasket, state: 'Empty', location: 'sortingTable', contents: [], count: 1 },
      dryingTray: { type: ITEM_TYPES.dryingTray, state: 'Empty', location: 'dryerDeck', contents: [], count: 1 },
      pouchBatch: { type: ITEM_TYPES.pouchBatch, state: 'Empty', location: 'packingBench', contents: [], count: 3, packaged: false, sealed: false, sterilized: false },
      loadBasket: { type: ITEM_TYPES.loadBasket, state: 'Empty', location: 'sterilizerDeck', contents: [], count: 1 },
      dispatchBox: { type: ITEM_TYPES.dispatchBox, state: 'Empty', location: 'dispatchBench', contents: [], count: 1 },
    },
    devices: {
      transferBox: { open: false }, ultrasonic: { open: false, running: false },
      oilingMachine: { open: true, running: false }, dryingCabinet: { open: true, running: false },
      sterilizer: { open: false, locked: false, running: false }, sterileCabinet: { open: false },
    },
  };
}

export function getCurrentMission(state) {
  return missions[state.missionIndex] ?? null;
}

export function getCurrentStep(state) {
  return getCurrentMission(state)?.steps[state.stepIndex] ?? null;
}

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

function actionLabel(step) {
  if (step.action === 'move') return `移动${step.item}`;
  return `${step.action}:${step.target}`;
}

export function describeExpectedAction(step) {
  if (!step) return '当前任务已完成';
  if (step.action === 'move') return `请将${step.title.replace(/^.*?/, '') || '物品'}移动到正确工作位：${step.instruction}`;
  const actionNames = { open: '打开', close: '关闭', connect: '连接', operate: '操作', program: '启动程序', select: '选择' };
  return `${actionNames[step.action] ?? '操作'}“${step.title}”：${step.instruction}`;
}

function validateInvariants(state) {
  const { handpiece, instruments, pouchBatch } = state.items;
  if (handpiece.count !== 1 || instruments.count !== 2 || pouchBatch.count !== 3) throw new Error('器械数量发生异常');
  if (pouchBatch.sterilized && !pouchBatch.sealed) throw new Error('未封口包装不能成为已灭菌状态');
  if ((handpiece.sterilized || instruments.sterilized) && (!handpiece.packaged || !instruments.packaged)) throw new Error('裸器械不能进入已灭菌状态');
  return true;
}

function applyStepEffects(next, step) {
  const item = step.item ? next.items[step.item] : null;
  if (step.action === 'move' && item) item.location = step.to;

  if (step.id === 'open-box') next.devices.transferBox.open = true;
  if (step.id === 'sort-handpiece') next.items.handpiece.state = 'Sorted';
  if (step.id === 'sort-instruments') {
    next.items.instruments.state = 'Sorted';
    next.items.cleaningBasket.contents = ['instruments'];
    next.items.cleaningBasket.state = 'Loaded';
  }
  if (step.id === 'rinse-basket') next.items.instruments.state = 'Rinsed';
  if (step.id === 'open-ultrasonic' || step.id === 'open-ultrasonic-after') next.devices.ultrasonic.open = true;
  if (step.id === 'close-ultrasonic') next.devices.ultrasonic.open = false;
  if (step.id === 'run-ultrasonic') {
    next.items.instruments.state = 'UltrasonicWashed';
    next.items.cleaningBasket.state = 'UltrasonicWashed';
  }
  if (step.id === 'flush-handpiece') next.items.handpiece.state = 'Rinsed';
  if (step.id === 'air-dry-handpiece-1') next.items.handpiece.state = 'AirDried';
  if (step.id === 'close-oiler') next.devices.oilingMachine.open = false;
  if (step.id === 'run-oiler') next.items.handpiece.state = 'Lubricated';
  if (step.id === 'handpiece-to-dry-tray') next.items.dryingTray.contents.push('handpiece');
  if (step.id === 'final-rinse') next.items.instruments.state = 'FinalRinsed';
  if (step.id === 'air-dry-instruments') next.items.instruments.state = 'AirDried';
  if (step.id === 'basket-to-dry-tray') next.items.dryingTray.contents.push('cleaningBasket');
  if (step.id === 'close-dryer') next.devices.dryingCabinet.open = false;
  if (step.id === 'run-dryer') {
    next.items.handpiece.state = 'MachineDried';
    next.items.instruments.state = 'MachineDried';
    next.items.dryingTray.state = 'MachineDried';
  }
  if (step.id === 'open-dryer') next.devices.dryingCabinet.open = true;
  if (step.id === 'handpiece-post-sort') next.items.handpiece.state = 'PostDrySorted';
  if (step.id === 'instruments-post-sort') next.items.instruments.state = 'PostDrySorted';
  if (step.id === 'inspect-groups') {
    next.items.handpiece.state = 'Inspected';
    next.items.instruments.state = 'Inspected';
  }
  if (step.id === 'handpiece-into-pouch') {
    next.items.handpiece.state = 'Packed'; next.items.handpiece.packaged = true;
  }
  if (step.id === 'instruments-into-pouch') {
    next.items.instruments.state = 'Packed'; next.items.instruments.packaged = true;
    next.items.pouchBatch.contents = ['handpiece', 'instrumentPackA', 'instrumentPackB'];
    next.items.pouchBatch.packaged = true; next.items.pouchBatch.state = 'Packed';
  }
  if (step.id === 'seal-pouches') {
    next.items.handpiece.state = 'Sealed'; next.items.handpiece.sealed = true;
    next.items.instruments.state = 'Sealed'; next.items.instruments.sealed = true;
    next.items.pouchBatch.state = 'Sealed'; next.items.pouchBatch.sealed = true;
  }
  if (step.id === 'pouches-to-load-basket') {
    next.items.loadBasket.contents = ['pouchBatch']; next.items.loadBasket.state = 'LoadedForSterilization';
  }
  if (step.id === 'open-sterilizer' || step.id === 'open-sterilizer-after') {
    next.devices.sterilizer.open = true; next.devices.sterilizer.locked = false;
  }
  if (step.id === 'close-sterilizer') {
    next.devices.sterilizer.open = false; next.devices.sterilizer.locked = true;
  }
  if (step.id === 'run-sterilizer') {
    next.items.handpiece.state = 'Sterilized'; next.items.handpiece.sterilized = true;
    next.items.instruments.state = 'Sterilized'; next.items.instruments.sterilized = true;
    next.items.pouchBatch.state = 'Sterilized'; next.items.pouchBatch.sterilized = true;
    next.items.loadBasket.state = 'Sterilized';
  }
  if (step.id === 'cart-to-passbox' || step.id === 'pass-to-storage') next.items.pouchBatch.state = 'TransferredToStorage';
  if (step.id === 'pass-to-storage') next.items.pouchBatch.location = 'storageReceiving';
  if (step.id === 'open-sterile-cabinet' || step.id === 'reopen-sterile-cabinet') next.devices.sterileCabinet.open = true;
  if (step.id === 'packs-to-cabinet') next.items.pouchBatch.state = 'Stored';
  if (step.id === 'close-sterile-cabinet') next.devices.sterileCabinet.open = false;
  if (step.id === 'start-dispatch-order') next.items.pouchBatch.state = 'PreparedForDispatch';
  if (step.id === 'packs-to-dispatch-box') {
    next.items.dispatchBox.contents = ['handpiecePack', 'instrumentPackA', 'instrumentPackB'];
    next.items.dispatchBox.state = 'Loaded';
  }
  if (step.id === 'dispatch-to-window') {
    next.items.pouchBatch.state = 'Dispatched'; next.items.dispatchBox.state = 'Dispatched';
  }
}

export function performWorkflowAction(state, action) {
  const step = getCurrentStep(state);
  if (!step) return { ok: false, state, error: '当前任务已完成，请进入下一段流程。' };

  const wrongItem = step.action === 'move' && action.item !== step.item;
  const wrongDestination = step.action === 'move' && action.to !== step.to;
  const wrongOperation = step.action !== 'move' && (action.type !== step.action || action.target !== step.target);
  if (wrongItem || wrongDestination || wrongOperation) {
    const subject = action.item || action.target || '当前物品';
    return {
      ok: false,
      state,
      error: `“${feedbackLabels[subject] ?? subject}”当前不能这样操作。正确下一步：${step.instruction}`,
      expected: actionLabel(step),
    };
  }

  const next = cloneState(state);
  applyStepEffects(next, step);
  next.history.push({ missionId: missions[next.missionIndex].id, stepId: step.id, at: Date.now() });
  next.stepIndex += 1;

  if (next.stepIndex >= missions[next.missionIndex].steps.length) {
    next.completedMissions = [...new Set([...next.completedMissions, missions[next.missionIndex].id])];
  }
  validateInvariants(next);
  return { ok: true, state: next, completedMission: next.stepIndex >= missions[next.missionIndex].steps.length };
}

export function advanceMission(state) {
  const mission = getCurrentMission(state);
  if (!mission || state.stepIndex < mission.steps.length) return { ok: false, state, error: '当前流程尚未完成。' };
  if (state.missionIndex >= missions.length - 1) return { ok: true, state: { ...state, finished: true } };
  return { ok: true, state: { ...cloneState(state), missionIndex: state.missionIndex + 1, stepIndex: 0 } };
}

export function isWorkflowComplete(state) {
  return state.completedMissions.length === missions.length && state.items.pouchBatch.state === 'Dispatched';
}

export function validateWorkflowState(state) {
  return validateInvariants(state);
}
