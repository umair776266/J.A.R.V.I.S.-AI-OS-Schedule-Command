import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createTask,
  toggleTaskComplete,
  deleteTask,
  filterTasks,
  getScheduleMetrics,
  normalizeTime,
  formatTime12h,
  findMatchingTask,
} from './scheduler.ts';

test('normalizeTime formats AM/PM times to 24h standard', () => {
  assert.equal(normalizeTime('3pm'), '15:00');
  assert.equal(normalizeTime('3:30 pm'), '15:30');
  assert.equal(normalizeTime('9:15 am'), '09:15');
  assert.equal(normalizeTime('12:00 pm'), '12:00');
  assert.equal(normalizeTime('12:30 am'), '00:30');
  assert.equal(normalizeTime('18:45'), '18:45');
});

test('formatTime12h formats 24h string to user-friendly 12h display', () => {
  assert.equal(formatTime12h('14:00'), '2:00 PM');
  assert.equal(formatTime12h('09:30'), '9:30 AM');
  assert.equal(formatTime12h('00:15'), '12:15 AM');
  assert.equal(formatTime12h('12:00'), '12:00 PM');
});

test('createTask sets sensible defaults and retains priority', () => {
  const task = createTask({
    title: 'Review AlphaFold prediction',
    time: '2pm',
    category: 'research',
    priority: 'high',
  });

  assert.equal(task.title, 'Review AlphaFold prediction');
  assert.equal(task.time, '14:00');
  assert.equal(task.category, 'research');
  assert.equal(task.priority, 'high');
  assert.equal(task.completed, false);
  assert.equal(task.durationMinutes, 30);
  assert.ok(task.id.startsWith('task-'));
});

test('toggleTaskComplete flips task completion status', () => {
  const t1 = createTask({ title: 'Task 1' });
  const t2 = createTask({ title: 'Task 2' });
  const tasks = [t1, t2];

  const updated = toggleTaskComplete(tasks, t1.id);
  assert.equal(updated.find((t) => t.id === t1.id)?.completed, true);
  assert.equal(updated.find((t) => t.id === t2.id)?.completed, false);

  const toggledBack = toggleTaskComplete(updated, t1.id);
  assert.equal(toggledBack.find((t) => t.id === t1.id)?.completed, false);
});

test('deleteTask removes the target item', () => {
  const t1 = createTask({ title: 'Task 1' });
  const t2 = createTask({ title: 'Task 2' });
  const list = [t1, t2];

  const result = deleteTask(list, t1.id);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, t2.id);
});

test('filterTasks properly filters by category, priority, and search text', () => {
  const t1 = createTask({ title: 'Morning briefing', category: 'schedule', priority: 'high', time: '09:00' });
  const t2 = createTask({ title: 'PubChem query for Aspirin', category: 'research', priority: 'medium', time: '11:00' });
  const t3 = createTask({ title: 'System cache purge', category: 'system', priority: 'low', time: '16:00' });

  const all = [t1, t2, t3];

  const researchOnly = filterTasks(all, { category: 'research' });
  assert.equal(researchOnly.length, 1);
  assert.equal(researchOnly[0].title, t2.title);

  const queryMatch = filterTasks(all, { query: 'aspirin' });
  assert.equal(queryMatch.length, 1);
  assert.equal(queryMatch[0].id, t2.id);

  const highOnly = filterTasks(all, { priority: 'high' });
  assert.equal(highOnly.length, 1);
  assert.equal(highOnly[0].id, t1.id);
});

test('getScheduleMetrics computes pending, completed, and completion rates', () => {
  const t1 = createTask({ title: 'Task 1', priority: 'high' });
  const t2 = createTask({ title: 'Task 2', priority: 'medium' });
  const t3 = createTask({ title: 'Task 3', priority: 'low' });

  let tasks = [t1, t2, t3];
  tasks = toggleTaskComplete(tasks, t1.id);

  const metrics = getScheduleMetrics(tasks);
  assert.equal(metrics.total, 3);
  assert.equal(metrics.completed, 1);
  assert.equal(metrics.pending, 2);
  assert.equal(metrics.completionRate, 33);
});

test('findMatchingTask fuzzy finds tasks by partial name', () => {
  const t1 = createTask({ title: 'Stark Industries Board Meeting' });
  const tasks = [t1];

  const found = findMatchingTask(tasks, 'board meeting');
  assert.ok(found);
  assert.equal(found?.id, t1.id);
});
