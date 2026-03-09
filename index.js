'use strict';

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_NAMES = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
  thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday'
};

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function getCurrentTime(timezone) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(now);

  const hour = parseInt(parts.find(p => p.type === 'hour').value, 10);
  const minute = parseInt(parts.find(p => p.type === 'minute').value, 10);

  const dayParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    weekday: 'short'
  }).formatToParts(now);
  const dayName = dayParts.find(p => p.type === 'weekday').value.toLowerCase();

  return { hour, minute, dayKey: dayName.substring(0, 3), totalMinutes: hour * 60 + minute };
}

module.exports = {
  isOpen: (hours, timezone = 'Europe/London') => {
    const { dayKey, totalMinutes } = getCurrentTime(timezone);
    const today = hours[dayKey];
    if (!today || today.closed) return false;
    const open = timeToMinutes(today.open);
    const close = timeToMinutes(today.close);
    return totalMinutes >= open && totalMinutes < close;
  },

  formatHours: (hours) => {
    const order = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    return order.map(day => {
      const h = hours[day];
      if (!h || h.closed) return `${DAY_NAMES[day]}: Closed`;
      return `${DAY_NAMES[day]}: ${h.open} - ${h.close}`;
    }).join('\n');
  },

  nextOpen: (hours, timezone = 'Europe/London') => {
    const { dayKey, totalMinutes } = getCurrentTime(timezone);
    const dayIndex = DAYS.indexOf(dayKey);

    // Check if still opening today
    const today = hours[dayKey];
    if (today && !today.closed) {
      const open = timeToMinutes(today.open);
      if (totalMinutes < open) {
        return { day: DAY_NAMES[dayKey], time: today.open };
      }
    }

    // Check next 7 days
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (dayIndex + i) % 7;
      const nextDayKey = DAYS[nextDayIndex];
      const nextDay = hours[nextDayKey];
      if (nextDay && !nextDay.closed) {
        return { day: DAY_NAMES[nextDayKey], time: nextDay.open };
      }
    }

    return null;
  }
};
