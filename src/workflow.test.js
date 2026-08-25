import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceMission, createInitialWorkflowState, getCurrentStep, isWorkflowComplete,
  missions, performWorkflowAction, validateWorkflowState,
} from './workflow.js';

function expectedAction(step) {
  return step.action === 'move'
    ? { type: 'move', item: step.item, to: step.to }
    : { type: step.action, target: step.target };
}

function completeWorkflow() {
  let state = createInitialWorkflowState();
  for (let missionIndex = 0; missionIndex < missions.length; missionIndex += 1) {
    const mission = missions[missionIndex];
    for (let index = 0; index < mission.steps.length; index += 1) {
      const step = getCurrentStep(state);
      const result = performWorkflowAction(state, expectedAction(step));
      assert.equal(result.ok, true, `step failed: ${step.id}`);
      state = result.state;
    }
    const advanced = advanceMission(state);
    assert.equal(advanced.ok, true);
    state = advanced.state;
  }
  return state;
}

function progressToStep(targetId) {
  let state = createInitialWorkflowState();
  while (!isWorkflowComplete(state)) {
    const step = getCurrentStep(state);
    if (step?.id === targetId) return state;
    if (!step) {
      const advanced = advanceMission(state);
      assert.equal(advanced.ok, true);
      state = advanced.state;
      continue;
    }
    const result = performWorkflowAction(state, expectedAction(step));
    assert.equal(result.ok, true, `setup step failed: ${step.id}`);
    state = result.state;
  }
  throw new Error(`target step not found: ${targetId}`);
}

test('完整 7 段流程可通关且器械数量守恒', () => {
  const state = completeWorkflow();
  assert.equal(isWorkflowComplete(state), true);
  assert.equal(state.items.handpiece.count, 1);
  assert.equal(state.items.instruments.count, 2);
  assert.equal(state.items.pouchBatch.count, 3);
  assert.equal(state.items.pouchBatch.state, 'Dispatched');
  assert.equal(state.items.pouchBatch.sealed, true);
  assert.equal(state.items.pouchBatch.sterilized, true);
  assert.deepEqual(state.items.dispatchBox.contents, ['handpiecePack', 'instrumentPackA', 'instrumentPackB']);
  assert.equal(state.completedMissions.length, 7);
  assert.equal(state.history.length, missions.reduce((total, mission) => total + mission.steps.length, 0));
  assert.equal(validateWorkflowState(state), true);
});

test('错误物品和错误工作位会被阻止且不推进状态', () => {
  const state = createInitialWorkflowState();
  const wrongItem = performWorkflowAction(state, { type: 'move', item: 'handpiece', to: 'sortingTable' });
  assert.equal(wrongItem.ok, false);
  assert.match(wrongItem.error, /正确下一步/);
  assert.equal(wrongItem.state.stepIndex, 0);

  const wrongDestination = performWorkflowAction(state, { type: 'move', item: 'transferBox', to: 'ultrasonic' });
  assert.equal(wrongDestination.ok, false);
  assert.equal(wrongDestination.state.items.transferBox.location, 'receivingPoint');
});

test('未完成当前任务不能跳到下一段视频流程', () => {
  const state = createInitialWorkflowState();
  const result = advanceMission(state);
  assert.equal(result.ok, false);
  assert.match(result.error, /尚未完成/);
});

test('灭菌后包装状态保持，序列化恢复不丢失进度', () => {
  const finalState = completeWorkflow();
  const restored = JSON.parse(JSON.stringify(finalState));
  assert.equal(restored.items.handpiece.packaged, true);
  assert.equal(restored.items.instruments.packaged, true);
  assert.equal(restored.items.pouchBatch.sealed, true);
  assert.equal(restored.items.pouchBatch.sterilized, true);
  assert.equal(restored.items.handpiece.location, 'handpiecePouch');
  assert.equal(validateWorkflowState(restored), true);
});

test('未封口器械和未锁门状态不能越过压力蒸汽灭菌前置条件', () => {
  const beforeSealing = progressToStep('seal-pouches');
  const bareLoad = performWorkflowAction(beforeSealing, { type: 'move', item: 'pouchBatch', to: 'loadBasket' });
  assert.equal(bareLoad.ok, false);
  assert.match(bareLoad.error, /正确下一步.*热封程序/);

  const beforeDoorLock = progressToStep('close-sterilizer');
  const earlyStart = performWorkflowAction(beforeDoorLock, { type: 'program', target: 'sterilizer' });
  assert.equal(earlyStart.ok, false);
  assert.match(earlyStart.error, /正确下一步.*门锁指示/);
  assert.equal(beforeDoorLock.items.pouchBatch.sterilized, false);
});

test('未灭菌不得入柜，发放类别与数量必须匹配任务', () => {
  const beforeSterilization = progressToStep('run-sterilizer');
  const prematureStorage = performWorkflowAction(beforeSterilization, { type: 'move', item: 'pouchBatch', to: 'sterileCabinet' });
  assert.equal(prematureStorage.ok, false);
  assert.match(prematureStorage.error, /正确下一步.*包装器械程序/);

  const beforeDispatch = progressToStep('packs-to-dispatch-box');
  const wrongPackage = performWorkflowAction(beforeDispatch, { type: 'move', item: 'handpiece', to: 'dispatchBox' });
  assert.equal(wrongPackage.ok, false);
  assert.match(wrongPackage.error, /正确下一步.*3 件器械包/);
  assert.deepEqual(beforeDispatch.items.dispatchBox.contents, []);
});
