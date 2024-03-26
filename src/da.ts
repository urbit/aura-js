
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

export function year(det: Dat) {
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

  let sec = BigInt(det.time.second)
    + (DAY_YO * day)
    + (HOR_YO * BigInt(det.time.hour))
    + (MIT_YO * BigInt(det.time.minute));

  let ms = det.time.ms;
  let fac = 0n;
  let muc = 3;
  while (ms.length !== 0) {
    const [first, ...rest] = ms;
    fac = fac + (first << BigInt(16 * muc));
    ms = rest;
    muc -= 1;
  }

  return fac | (sec << 64n);
}

/**
 * Given a string formatted as a @da, returns a bigint representing the urbit date.
 *
 * @return  {string}      x  The formatted @da
 * @return  {bigint}      x  The urbit date as bigint
 */
export function parseDa(x: string): bigint {
  const [date, time, ms] = x.split('..');
  const [yer, month, day] = date.slice(1).split('.');
  const [hour, minute, sec] = time.split('.');
  const millis = ms.split('.').map((m) => BigInt('0x'+m));

  return year({
    pos: true,
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

function yell(x: bigint): Tarp {
  let sec = x >> 64n;
  const milliMask = BigInt('0xffffffffffffffff');
  const millis = milliMask & x;
  const ms = millis
    .toString(16)
    .match(/.{1,4}/g)!
    .filter((x) => x !== '0000')
    .map((x) => BigInt('0x'+x));
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

/**
 * Given a bigint representing an urbit date, returns a string formatted as a proper @da.
 *
 * @param   {bigint}      x  The urbit date as bigint
 * @return  {string}         The formatted @da
 */
export function formatDa(x: bigint | string) {
  if (typeof x === 'string') {
    x = BigInt(x);
  }
  const { year, month, time } = yore(x);

  return `~${year}.${month}.${time.day}..${time.hour}.${time.minute}.${
    time.second
  }..${time.ms.map((x) => x.toString(16).padStart(4, '0')).join('.')}`;
}

/**
 * Given a bigint representing an urbit date, returns a unix timestamp.
 *
 * @param   {bigint}      da  The urbit date
 * @return  {number}          The unix timestamp
 */
export function daToUnix(da: bigint): number {
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
 * @param   {number}      unix  The unix timestamp
 * @return  {bigint}            The urbit date
 */
export function unixToDa(unix: number): bigint {
  const timeSinceEpoch = BigInt(unix) * DA_SECOND / 1000n;
  return DA_UNIX_EPOCH + timeSinceEpoch;
}
