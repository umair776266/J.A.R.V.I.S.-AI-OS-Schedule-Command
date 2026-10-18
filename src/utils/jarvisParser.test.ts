import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCommandLocally } from './jarvisParser.ts';

test('parseCommandLocally recognizes scheduling command with time and priority', () => {
  const result = parseCommandLocally('Jarvis, schedule team briefing at 3pm urgent');
  assert.equal(result.intent, 'schedule_add');
  assert.ok(result.taskData);
  assert.equal(result.taskData.title, 'Team briefing');
  assert.equal(result.taskData.time, '15:00');
  assert.equal(result.taskData.priority, 'high');
  assert.ok(result.spokenResponse.includes('Team briefing'));
});

test('parseCommandLocally categorizes research tasks appropriately', () => {
  const result = parseCommandLocally('Remind me to run lab protein analysis at 10:30 am');
  assert.equal(result.intent, 'schedule_add');
  assert.ok(result.taskData);
  assert.equal(result.taskData.category, 'research');
  assert.equal(result.taskData.time, '10:30');
});

test('parseCommandLocally identifies protein bioscience commands', () => {
  const result = parseCommandLocally('Jarvis, analyze protein TP53');
  assert.equal(result.intent, 'science_protein');
  assert.equal(result.scienceData?.queryType, 'protein');
  assert.equal(result.scienceData?.identifier, 'TP53');
  assert.ok(result.spokenResponse.includes('TP53'));
});

test('parseCommandLocally identifies compound bioscience commands', () => {
  const result = parseCommandLocally('PubChem lookup for Aspirin');
  assert.equal(result.intent, 'science_compound');
  assert.equal(result.scienceData?.queryType, 'compound');
  assert.equal(result.scienceData?.identifier, 'Aspirin');
});

test('parseCommandLocally identifies media and video creation commands', () => {
  const result = parseCommandLocally('Jarvis, create a video for my web platform');
  assert.equal(result.intent, 'media_forge');
  assert.ok(result.spokenResponse.includes('Media Forge Studio'));
});

test('parseCommandLocally identifies The Alpha Toon cartoon commands', () => {
  const result = parseCommandLocally('Jarvis, generate today cartoon for The Alpha Toon');
  assert.equal(result.intent, 'alpha_toon');
  assert.ok(result.spokenResponse.includes('The Alpha Toon Channel Automation'));
});

test('parseCommandLocally identifies system protocols', () => {
  const lockdown = parseCommandLocally('Hey Jarvis, initiate protocol lockdown');
  assert.equal(lockdown.intent, 'system_protocol');
  assert.equal(lockdown.protocolData?.action, 'lockdown');

  const focus = parseCommandLocally('Engage focus mode');
  assert.equal(focus.intent, 'system_protocol');
  assert.equal(focus.protocolData?.action, 'focus_mode');

  const diagnostic = parseCommandLocally('Run diagnostic scan');
  assert.equal(diagnostic.intent, 'system_diagnostic');
});

test('parseCommandLocally handles task completion and deletion', () => {
  const complete = parseCommandLocally('Mark "Review blueprints" as complete');
  assert.equal(complete.intent, 'schedule_complete');
  assert.equal(complete.taskData?.title, 'Review blueprints');

  const del = parseCommandLocally('Delete task "Old meeting"');
  assert.equal(del.intent, 'schedule_delete');
  assert.equal(del.taskData?.title, 'Old meeting');
});
