/**
 * Given a string formatted as a `@da`, returns a bigint representing the urbit date.
 *
 * @param   {string}  x  The formatted `@da`
 * @return  {bigint}     The urbit date as bigint
 */
export function parseDa(x: string): bigint {
  let pos = true;
  let [date, time, ms] = x.split('..');
  time = time || '0.0.0';
  ms = ms || '0000';
  let [yer, month, day] = date.slice(1).split('.');
  if (yer.at(-1) === '-') {
    yer = yer.slice(0, -1);
    pos = false;
  }
  const [hour, minute, sec] = time.split('.');
  const millis = ms.split('.').map((m) => BigInt('0x' + m));

  return year({
    pos: pos,
    year: BigInt(yer),
    month: BigInt(month),
    time: {
      day: BigInt(day),
      hour: BigInt(hour),
      minute: BigInt(minute),
      second: BigInt(sec),
      ms: millis,
    },
  });
}

export function parseDr(x: string): bigint {
  const rop: Tarp = { day: 0n, hour: 0n, minute: 0n, second: 0n, ms: [] };
  x = x.slice(1);  //  strip ~
  let [time, ms] = x.split('..');
  ms = ms || '0000';
  rop.ms = ms.split('.').map((m) => BigInt('0x' + m));
  time.split('.').forEach((a) => {
    switch (a[0]) {
      case 'd': rop.day    += BigInt(a.slice(1)); break;
      case 'h': rop.hour   += BigInt(a.slice(1)); break;
      case 'm': rop.minute += BigInt(a.slice(1)); break;
      case 's': rop.second += BigInt(a.slice(1)); break;
      default: throw new Error('bad dr: ' + x);
    }
  });
  ms = ms || '0000';
  return yule(rop);
}

/**
 * Given a bigint representing an urbit date, returns a string formatted as a proper `@da`.
 *
 * @param   {bigint}  x  The urbit date as bigint
 * @return  {string}     The formatted `@da`
 */
export function renderDa(x: bigint): string {
  const { pos, year, month, time } = yore(x);
  let out = `~${year}${pos ? '' : '-'}.${month}.${time.day}`;
  if (time.hour !== 0n || time.minute !== 0n || time.second !== 0n || time.ms.length !== 0) {
    out = out + `..${time.hour.toString().padStart(2, '0')}.${time.minute.toString().padStart(2, '0')}.${time.second.toString().padStart(2, '0')}`
    if (time.ms.length !== 0) {
      out = out + `..${time.ms.map((x) => x.toString(16).padStart(4, '0')).join('.')}`;
    }
  }
  return out;
}

export function renderDr(x: bigint): string {
  if (x === 0n) return '~s0';
  const { day, hour, minute, second, ms } = yell(x);
  let out: string[] = [];
  if (day    !== 0n) out.push('d' + day.toString());
  if (hour   !== 0n) out.push('h' + hour.toString());
  if (minute !== 0n) out.push('m' + minute.toString());
  if (second !== 0n) out.push('s' + second.toString());
  if (ms.length !== 0) {
    if (out.length === 0) out.push('s0');
    out.push('.' + ms.map((x) => x.toString(16).padStart(4, '0')).join('.'));
  }
  return '~' + out.join('.');
}

/**
 * Given a bigint representing an urbit date, returns a unix timestamp.
 *
 * @param   {bigint}  da  The urbit date
 * @return  {number}      The unix timestamp
 */
export function toUnix(da: bigint): number {
  // ported from +time:enjs:format in hoon.hoon
  const offset = DA_SECOND / 2000n;
  const epochAdjusted = offset + (da - DA_UNIX_EPOCH);

  return Math.round(
    Number(epochAdjusted * 1000n / DA_SECOND)
  );
}

/**
 * Given a unix timestamp, returns a bigint representing an urbit date
 *
 * @param   {number}  unix  The unix timestamp
 * @return  {bigint}        The urbit date
 */
export function fromUnix(unix: number): bigint {
  const timeSinceEpoch = BigInt(unix) * DA_SECOND / 1000n;
  return DA_UNIX_EPOCH + timeSinceEpoch;
}

//
//  internals
//

interface Dat {
  pos: boolean;
  year: bigint;
  month: bigint;
  time: Tarp;
}

interface Tarp {
  day: bigint;
  hour: bigint;
  minute: bigint;
  second: bigint;
  ms: bigint[];
}

const DA_UNIX_EPOCH = BigInt('170141184475152167957503069145530368000'); // `@ud` ~1970.1.1

const DA_SECOND = BigInt('18446744073709551616'); // `@ud` ~s1

const EPOCH = BigInt('292277024400');

function isLeapYear(year: bigint) {
  return (year % 4n) === 0n
      && (year % 100n) !== 0n
      || (year % 400n) === 0n;
}
const MOH_YO = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MOY_YO = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const DAY_YO = 86400n;
const HOR_YO = 3600n;
const MIT_YO = 60n;
const ERA_YO = 146097n;
const CET_YO = 36524n;

function year(det: Dat) {
  const yer = det.pos
    ? EPOCH + (BigInt(det.year))
    : EPOCH - (BigInt(det.year) - 1n);
  const day = (() => {
    let cah = isLeapYear(yer) ? MOY_YO : MOH_YO;
    let d = det.time.day - 1n;
    let m = det.month - 1n;
    while (m !== 0n) {
      const [first, ...rest] = cah;
      d = d + BigInt(first);
      m = m - 1n;
      cah = rest;
    }
    let loop: boolean = true;
    let y = yer;
    while (loop == true) {
      if ((y % 4n) !== 0n) {
        y = y - 1n;
        d = d + (isLeapYear(y) ? 366n : 365n);
      } else if ((y % 100n) !== 0n) {
        y = y - 4n;
        d = d + (isLeapYear(y) ? 1461n : 1460n);
      } else if ((y % 400n) !== 0n) {
        y = y - 100n;
        d = d + (isLeapYear(y) ? 36525n : 36524n);
      } else {
        let eras = y / 400n;
        d = d + (eras * (4n * 36524n + 1n));
        loop = false;
      }
    }
    return d;
  })();

  det.time.day = day;
  return yule(det.time);
}

function yule(rip: Tarp): bigint {
  let sec = rip.second
    + (DAY_YO * rip.day)
    + (HOR_YO * rip.hour)
    + (MIT_YO * rip.minute);

  let ms = rip.ms;
  let fac = 0n;
  let muc = 3n;
  while (ms.length !== 0) {
    const [first, ...rest] = ms;
    fac = fac + (first << (16n * muc));
    ms = rest;
    muc -= 1n;
  }

  return fac | (sec << 64n);
}

function yell(x: bigint): Tarp {
  let sec = x >> 64n;
  const milliMask = BigInt('0xffffffffffffffff');
  const millis = milliMask & x;
  const ms = millis
    .toString(16).padStart(16, '0')
    .match(/.{4}/g)!
    .map((x) => BigInt('0x'+x));
  while (ms.at(-1) === 0n) {
    ms.pop();
  }
  let day = sec / DAY_YO;
  sec = sec % DAY_YO;
  let hor = sec / HOR_YO;
  sec = sec % HOR_YO;
  let mit = sec / MIT_YO;
  sec = sec % MIT_YO;

  return {
    ms,
    day,
    minute: mit,
    hour: hor,
    second: sec,
  };
}

function yall(day: bigint): [bigint, bigint, bigint] {
  let era = 0n;
  let cet = 0n;
  let lep = false;
  era = day / ERA_YO;
  day = day % ERA_YO;
  if (day < (CET_YO + 1n)) {
    lep = true;
  } else {
    lep = false;
    cet = 1n;
    day = day - (CET_YO + 1n);
    cet = cet + (day / CET_YO);
    day = day % CET_YO;
  }
  let yer = (era * 400n) + (cet * 100n);
  let loop = true;
  while (loop == true) {
    let dis = lep ? 366n : 365n;
    if (!(day < dis)) {
      yer = yer + 1n;
      day = day - dis;
      lep = (yer % 4n) === 0n;
    } else {
      loop = false;
      let inner = true;
      let mot = 0n;
      while (inner) {
        let cah = lep ? MOY_YO : MOH_YO;
        let zis = BigInt(cah[Number(mot)]);
        if (day < zis) {
          return [yer, mot + 1n, day + 1n];
        }
        mot = mot + 1n;
        day = day - zis;
      }
    }
  }
  return [0n, 0n, 0n];
}

function yore(x: bigint): Dat {
  const time = yell(x);
  const [y, month, d] = yall(time.day);
  time.day = d;
  const pos = y > EPOCH;
  const year = pos ? y - EPOCH : EPOCH + 1n - y;

  return {
    pos,
    year,
    month,
    time,
  };
}
