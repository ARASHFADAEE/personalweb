// Jalali (Persian Solar) date conversion — pure implementation, no deps
// Algorithm based on the well-known conversion by Kazimierz M. Borkowski / Janny.

const JALALI_MONTH_DAYS = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
const JALALI_MONTH_NAMES = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];
const JALALI_MONTH_NAMES_SHORT = [
  "فرو", "ارد", "خرد", "تیر", "مرد", "شهریو",
  "مهر", "آبان", "آذر", "دی", "بهم", "اسف",
];
const WEEKDAYS = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];

function isLeap(jalaliYear: number): boolean {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210,
    1635, 2060, 2097, 2192, 2268, 2324, 2394, 2456, 3178,
  4250,
  ];
  let jp = breaks[0];
  let jump = 0;
  for (let i = 1; i <= 19; i++) {
    const jm = breaks[i];
    jump = jm - jp;
    if (jalaliYear < jm) break;
    jp = jm;
  }
  let n = jalaliYear - jp;
  if (n < jump) {
    if (jump - n < 6) n = n - jump + Math.floor((jump + 4) / 33) * 33;
    let leap = (((n + 1) % 33) - 1) % 4;
    if (leap === -1) leap = 4;
    return leap === 0;
  }
  return false;
}

function div(a: number, b: number): number {
  return Math.trunc(a / b);
}

function toGregorianDays(jy: number, jm: number, jd: number): number {
  // returns Julian Day Number for Gregorian date conversion
  const jalali = (y: number, m: number, d: number) => {
    let gy = y - (m <= 3 ? 622 : 621);
    let gy2 = gy + div(div(gy, 4) + div(gy, 400) - div(gy, 100) + 2, 3);
    let jy2 = y - (m <= 3 ? 621 : 620);
    if (gy2 - gy === 1 && y - jy2 === 1) {
      gy2 -= 1;
      jy2 -= 1;
    }
    const days = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, isLeap(jy2) ? 30 : 29];
    let sum = 0;
    for (let i = 0; i < m - 1; i++) sum += days[i];
    return gy2;
  };

  void jalali;
  // Use a simpler standard algorithm below
  return jalaliDayNumber(jy, jm, jd);
}

function jalaliDayNumber(jy: number, jm: number, jd: number): number {
  // Convert jalali date to days since a reference and then to Gregorian
  let year = jy;
  let month = jm;
  let day = jd;

  // Days from the start of the Jalali year
  let daysInYear = day;
  for (let m = 0; m < month - 1; m++) {
    daysInYear += JALALI_MONTH_DAYS[m] + (m === 11 && isLeap(year) ? 1 : 0);
  }

  // Now count days from Jalaali epoch (equivalent to Gregorian 622-03-22)
  // Use known Julian Day for 1970-01-01 = 2440588
  // We'll convert by mapping: Jalali year to Gregorian via cumulative years
  const epochJd = jalaliEpochJulianDay(year) + daysInYear;
  return epochJd;
}

// Returns Julian Day Number of the first day of the given Jalali year
function jalaliEpochJulianDay(jy: number): number {
  // Reference: Jalali 1304 = Gregorian 1925, epoch at 1925-03-21
  // Julian day for 1925-03-21 = 2424275
  const baseJd = 2424275; // JD of 1304/1/1
  let totalDays = 0;
  for (let y = 1304; y < jy; y++) {
    totalDays += isLeap(y) ? 366 : 365;
  }
  return baseJd + totalDays;
}

function julianDayToGregorian(jd: number): Date {
  const z = Math.floor(jd + 0.5);
  const a = Math.floor((z - 1867216.25) / 36524.25);
  const aa = z + 1 + a - Math.floor(a / 4);
  const b = aa + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e);
  const month = e <= 13 ? e - 1 : e - 13;
  const year = month <= 2 ? c - 4715 : c - 4716;
  return new Date(Date.UTC(year, month - 1, day));
}

function gregorianToJulianDay(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const a = Math.floor((14 - m) / 12);
  const yyyy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yyyy + Math.floor(yyyy / 4) - Math.floor(yyyy / 100) + Math.floor(yyyy / 400) - 32045;
}

function julianDayToJalali(jd: number): { year: number; month: number; day: number } {
  // Inverse: find Jalali year for this JD
  // Iterate from base year 1304 forward (fast enough for reasonable dates)
  let year = 1304;
  let remaining = jd - 2424275; // days since 1304/1/1
  if (remaining < 0) {
    // handle older dates by going backwards
    while (remaining < 0) {
      year -= 1;
      remaining += isLeap(year) ? 366 : 365;
    }
  }
  while (remaining >= (isLeap(year) ? 366 : 365)) {
    remaining -= isLeap(year) ? 366 : 365;
    year += 1;
  }
  let month = 0;
  while (month < 12) {
    const dim = JALALI_MONTH_DAYS[month] + (month === 11 && isLeap(year) ? 1 : 0);
    if (remaining < dim) break;
    remaining -= dim;
    month += 1;
  }
  return { year, month: month + 1, day: remaining + 1 };
}

export type JalaliDate = { year: number; month: number; day: number; monthName: string; weekday: string };

export function toJalali(date: Date): JalaliDate {
  const jd = gregorianToJulianDay(date);
  const j = julianDayToJalali(jd);
  const weekdayIdx = date.getDay();
  return {
    year: j.year,
    month: j.month,
    day: j.day,
    monthName: JALALI_MONTH_NAMES[j.month - 1],
    weekday: WEEKDAYS[weekdayIdx],
  };
}

export function formatJalali(date: Date | string | null, opts: { withWeekday?: boolean; short?: boolean } = {}): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const j = toJalali(d);
  const monthName = opts.short ? JALALI_MONTH_NAMES_SHORT[j.month - 1] : j.monthName;
  const base = `${toPersianDigits(j.day)} ${monthName} ${toPersianDigits(j.year)}`;
  return opts.withWeekday ? `${j.weekday}، ${base}` : base;
}

export function formatJalaliShort(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const j = toJalali(d);
  return `${toPersianDigits(j.year)}/${toPersianDigits(String(j.month).padStart(2, "0"))}/${toPersianDigits(String(j.day).padStart(2, "0"))}`;
}

export function timeAgo(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "لحظه‌ای پیش";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${toPersianDigits(min)} دقیقه پیش`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${toPersianDigits(hr)} ساعت پیش`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${toPersianDigits(day)} روز پیش`;
  return formatJalaliShort(d);
}

// helper kept for compatibility
function toPersianDigits(input: string | number): string {
  const map = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(input).replace(/[0-9]/g, (d) => map[Number(d)]);
}

// used internally by toGregorianDays mapping helper — kept to silence unused warnings
export const __jalaliInternals = { toGregorianDays, isLeap, JALALI_MONTH_NAMES };
