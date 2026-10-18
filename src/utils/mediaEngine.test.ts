import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatHashtags,
  validateCaptionLength,
  generateLocalMediaPackage,
  PLATFORM_LIMITS,
} from './mediaEngine.ts';

test('formatHashtags cleans and adds hash symbols properly', () => {
  const tags = ['tech', '#coding', '  ai ', 'viral#tag'];
  const formatted = formatHashtags(tags);
  assert.equal(formatted, '#tech #coding #ai #viral#tag');
});

test('validateCaptionLength enforces platform character constraints', () => {
  const shortText = 'Hello world';
  const twitterValid = validateCaptionLength(shortText, 'twitter');
  assert.equal(twitterValid.isValid, true);
  assert.equal(twitterValid.remaining, 280 - shortText.length);

  const longText = 'A'.repeat(300);
  const twitterInvalid = validateCaptionLength(longText, 'twitter');
  assert.equal(twitterInvalid.isValid, false);
  assert.ok(twitterInvalid.remaining < 0);
});

test('generateLocalMediaPackage produces platform-tailored scripts and thumbnails', () => {
  const tiktokPackage = generateLocalMediaPackage('AI Voice Assistant', 'tiktok');
  assert.equal(tiktokPackage.platform, 'tiktok');
  assert.ok(tiktokPackage.hook.includes('AI Voice Assistant'));
  assert.equal(tiktokPackage.thumbnail.aspectRatio, '9:16');
  assert.ok(tiktokPackage.script.length >= 4);

  const youtubePackage = generateLocalMediaPackage('AI Voice Assistant', 'youtube');
  assert.equal(youtubePackage.platform, 'youtube');
  assert.equal(youtubePackage.thumbnail.aspectRatio, '16:9');
});
