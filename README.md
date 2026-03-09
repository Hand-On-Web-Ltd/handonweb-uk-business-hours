# handonweb-uk-business-hours

Check if a UK business is currently open. Handles custom hours per day, lunch breaks, and UK bank holidays (2025–2027). Zero dependencies.

## Install

```bash
npm install handonweb-uk-business-hours
```

## Usage

```js
const { BusinessHours } = require('handonweb-uk-business-hours');

const hours = new BusinessHours({
  monday:    { open: '09:00', close: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
  tuesday:   { open: '09:00', close: '17:00' },
  wednesday: { open: '09:00', close: '17:00' },
  thursday:  { open: '09:00', close: '17:00' },
  friday:    { open: '09:00', close: '16:00' },
  // Saturday and Sunday — not listed = closed
});

hours.isOpen();       // true or false right now
hours.isHoliday();    // true if it's a UK bank holiday
hours.todayHours();   // { open: '09:00', close: '17:00', breaks: [...] } or null
hours.nextOpen();     // Date object for the next opening time
```

## API

### `new BusinessHours(config, options?)`

Create an instance with your opening hours.

**config** — object keyed by lowercase day name:
```js
{
  monday: { open: '09:00', close: '17:00' },
  tuesday: { open: '09:00', close: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
  // ...
}
```

**options.holidays** — array of `'YYYY-MM-DD'` strings to override the built-in UK bank holidays.

### `.isOpen(date?)`

Returns `true` if the business is open at the given time (defaults to now). Returns `false` during breaks and bank holidays.

### `.todayHours(date?)`

Returns `{ open, close, breaks? }` for the day, or `null` if closed all day.

### `.isHoliday(date?)`

Returns `true` if the date is a UK bank holiday.

### `.nextOpen(date?)`

Returns a `Date` for when the business next opens. Searches up to 14 days ahead.

## Bank Holidays

Includes England & Wales bank holidays for 2025, 2026, and 2027. Pass your own list via `options.holidays` if needed.

## About Hand On Web
We build AI chatbots, voice agents, and automation tools for businesses.
- 🌐 [handonweb.com](https://www.handonweb.com)
- 📧 outreach@handonweb.com
- 📍 Chester, UK

## Licence
MIT
