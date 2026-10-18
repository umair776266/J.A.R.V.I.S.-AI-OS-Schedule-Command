import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateDailyCartoonEpisode,
  formatChannelScheduleDirective,
} from './alphaToonEngine.ts';

test('generateDailyCartoonEpisode creates complete episode package for The Alpha Toon', () => {
  const episode = generateDailyCartoonEpisode(1);
  assert.equal(episode.episodeNumber, 1);
  assert.equal(episode.channelName, 'The Alpha Toon');
  assert.ok(episode.scenes.length >= 3);
  assert.ok(episode.youtubePackage.title.includes('The Alpha Toon'));
  assert.ok(episode.tiktokPackage.caption.includes('The Alpha Toon'));
  assert.ok(episode.instaPackage.caption.includes('The Alpha Toon'));
  assert.equal(episode.thumbnail.episodeBadge, 'EPISODE #1');
});

test('generateDailyCartoonEpisode supports custom episode topics', () => {
  const custom = generateDailyCartoonEpisode(5, 'The Quantum Cat Paradox');
  assert.equal(custom.episodeNumber, 5);
  assert.ok(custom.title.includes('The Quantum Cat Paradox'));
  assert.equal(custom.thumbnail.episodeBadge, 'EPISODE #5');
});

test('formatChannelScheduleDirective formats directive for J.A.R.V.I.S. schedule', () => {
  const ep = generateDailyCartoonEpisode(14);
  const directive = formatChannelScheduleDirective(ep);
  assert.ok(directive.directiveTitle.includes('Ep #14'));
  assert.equal(directive.time, '17:00');
  assert.ok(directive.description.includes('YouTube, TikTok, & Insta'));
});
