'use strict';

const defaultHolidays = require('./holidays');

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Parse a time string like "09:00" into minutes since midnight.
 * @param {string} time
 * @returns {number}
 */
function parseTime(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Format a Date as 'YYYY-MM-DD'.
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get minutes since midnight for a Date.
 * @param {Date} date
 * @returns {number}
 */
function minutesOfDay(date) {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Check if a UK business is currently open based on configured hours.
 *
 * @example
 * const { BusinessHours } = require('handonweb-uk-business-hours');
 * const hours = new BusinessHours({
 *   monday: { open: '09:00', close: '17:00' },
 *   tuesday: { open: '09:00', close: '17:00' },
 *   // ...
 * });
 * hours.isOpen(); // true or false right now
 */
class BusinessHours {
  /**
   * @param {object} config - Day configs keyed by lowercase day name
   * @param {object} [options]
   * @param {string[]} [options.holidays] - Array of 'YYYY-MM-DD' holiday dates. Defaults to UK bank holidays 2025-2027.
   */
  constructor(config, options = {}) {
    this.config = {};
    for (const day of DAYS) {
      if (config[day]) {
        this.config[day] = config[day];
      }
    }
    this.holidays = new Set(options.holidays || defaultHolidays);
  }

  /**
   * Check if the business is open at the given date/time.
   * @param {Date} [date] - Defaults to now
   * @returns {boolean}
   */
  isOpen(date) {
    const d = date || new Date();

    // Closed on holidays
    if (this.isHoliday(d)) return false;

    const dayName = DAYS[d.getDay()];
    const dayConfig = this.config[dayName];

    // No config for this day = closed
    if (!dayConfig) return false;

    const now = minutesOfDay(d);
    const open = parseTime(dayConfig.open);
    const close = parseTime(dayConfig.close);

    // Outside open hours
    if (now < open || now >= close) return false;

    // Check if we're in a break
    if (dayConfig.breaks) {
      for (const brk of dayConfig.breaks) {
        const brkStart = parseTime(brk.start);
        const brkEnd = parseTime(brk.end);
        if (now >= brkStart && now < brkEnd) return false;
      }
    }

    return true;
  }

  /**
   * Get today's opening hours.
   * @param {Date} [date]
   * @returns {{ open: string, close: string, breaks?: Array<{start: string, end: string}> } | null}
   */
  todayHours(date) {
    const d = date || new Date();
    const dayName = DAYS[d.getDay()];
    const dayConfig = this.config[dayName];
    if (!dayConfig) return null;
    return { ...dayConfig };
  }

  /**
   * Check if a date is a UK bank holiday.
   * @param {Date} [date]
   * @returns {boolean}
   */
  isHoliday(date) {
    const d = date || new Date();
    return this.holidays.has(formatDate(d));
  }

  /**
   * Find the next time the business opens after the given date.
   * @param {Date} [date]
   * @returns {Date}
   */
  nextOpen(date) {
    const d = date ? new Date(date) : new Date();

    // Check if currently before opening today
    const dayName = DAYS[d.getDay()];
    const dayConfig = this.config[dayName];
    if (dayConfig && !this.isHoliday(d)) {
      const openMin = parseTime(dayConfig.open);
      const now = minutesOfDay(d);
      if (now < openMin) {
        const result = new Date(d);
        result.setHours(Math.floor(openMin / 60), openMin % 60, 0, 0);
        return result;
      }

      // If we're in a break, return when break ends
      if (dayConfig.breaks) {
        for (const brk of dayConfig.breaks) {
          const brkStart = parseTime(brk.start);
          const brkEnd = parseTime(brk.end);
          if (now >= brkStart && now < brkEnd) {
            const result = new Date(d);
            result.setHours(Math.floor(brkEnd / 60), brkEnd % 60, 0, 0);
            return result;
          }
        }
      }
    }

    // Search the next 14 days
    for (let i = 1; i <= 14; i++) {
      const next = new Date(d);
      next.setDate(next.getDate() + i);
      next.setHours(0, 0, 0, 0);

      if (this.isHoliday(next)) continue;

      const nextDayName = DAYS[next.getDay()];
      const nextConfig = this.config[nextDayName];
      if (nextConfig) {
        const openMin = parseTime(nextConfig.open);
        next.setHours(Math.floor(openMin / 60), openMin % 60, 0, 0);
        return next;
      }
    }

    return null;
  }
}

module.exports = { BusinessHours };
