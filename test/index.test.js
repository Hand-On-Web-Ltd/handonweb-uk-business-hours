'use strict';

const assert = require('assert');
const { BusinessHours } = require('../index');

const config = {
  monday: { open: '09:00', close: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
  tuesday: { open: '09:00', close: '17:00' },
  wednesday: { open: '09:00', close: '17:00' },
  thursday: { open: '09:00', close: '17:00' },
  friday: { open: '09:00', close: '16:00' },
  // Saturday and Sunday closed
};

const bh = new BusinessHours(config);

// Test isOpen — Monday 10am should be open
// 2025-03-10 is a Monday
const mon10am = new Date(2025, 2, 10, 10, 0);
assert.strictEqual(bh.isOpen(mon10am), true, 'Monday 10am should be open');

// Monday 12:30 should be closed (lunch break)
const monLunch = new Date(2025, 2, 10, 12, 30);
assert.strictEqual(bh.isOpen(monLunch), false, 'Monday 12:30 should be closed (lunch)');

// Monday 13:00 should be open again
const monAfterLunch = new Date(2025, 2, 10, 13, 0);
assert.strictEqual(bh.isOpen(monAfterLunch), true, 'Monday 1pm should be open');

// Saturday should be closed
const sat = new Date(2025, 2, 8, 10, 0);
assert.strictEqual(bh.isOpen(sat), false, 'Saturday should be closed');

// Sunday should be closed
const sun = new Date(2025, 2, 9, 10, 0);
assert.strictEqual(bh.isOpen(sun), false, 'Sunday should be closed');

// Before opening hours
const early = new Date(2025, 2, 10, 8, 0);
assert.strictEqual(bh.isOpen(early), false, '8am should be closed');

// After closing
const late = new Date(2025, 2, 10, 17, 30);
assert.strictEqual(bh.isOpen(late), false, '5:30pm should be closed');

// Holiday — Christmas 2025 is a Thursday
const xmas = new Date(2025, 11, 25, 10, 0);
assert.strictEqual(bh.isOpen(xmas), false, 'Christmas should be closed');
assert.strictEqual(bh.isHoliday(xmas), true, 'Christmas is a holiday');

// todayHours
const todayMon = bh.todayHours(mon10am);
assert.strictEqual(todayMon.open, '09:00');
assert.strictEqual(todayMon.close, '17:00');
assert.strictEqual(todayMon.breaks.length, 1);

// todayHours for Saturday returns null
assert.strictEqual(bh.todayHours(sat), null);

// nextOpen — from Saturday should return Monday 9am
const nextFromSat = bh.nextOpen(sat);
assert.strictEqual(nextFromSat.getDay(), 1); // Monday
assert.strictEqual(nextFromSat.getHours(), 9);
assert.strictEqual(nextFromSat.getMinutes(), 0);

// nextOpen — from Monday 8am should return Monday 9am
const nextFromEarly = bh.nextOpen(early);
assert.strictEqual(nextFromEarly.getHours(), 9);
assert.strictEqual(nextFromEarly.getDate(), early.getDate());

// nextOpen — from Monday lunch should return 13:00
const nextFromLunch = bh.nextOpen(monLunch);
assert.strictEqual(nextFromLunch.getHours(), 13);
assert.strictEqual(nextFromLunch.getMinutes(), 0);

// Friday closes at 16:00
const fri3pm = new Date(2025, 2, 14, 15, 0);
assert.strictEqual(bh.isOpen(fri3pm), true, 'Friday 3pm should be open');
const fri4pm = new Date(2025, 2, 14, 16, 0);
assert.strictEqual(bh.isOpen(fri4pm), false, 'Friday 4pm (closing time) should be closed');

console.log('✅ All handonweb-uk-business-hours tests passed');
