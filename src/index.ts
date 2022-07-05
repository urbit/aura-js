import bigInt, { BigInteger } from 'big-integer';

interface Dat {
  pos: boolean;
  year: BigInteger;
  month: BigInteger;
  time: Tarp;
}

interface Tarp {
  day: BigInteger;
  hour: BigInteger;
  minute: BigInteger;
  second: BigInteger;
  ms: BigInteger[];
}

const EPOCH = bigInt('292277024400');
const zero = bigInt.zero;

function isLeapYear(year: BigInteger) {
  return year.mod(4).eq(zero) && (year.mod(100).neq(0) || year.mod(400).eq(0));
}
const MOH_YO = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MOY_YO = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const DAY_YO = bigInt(86400);
const HOR_YO = bigInt(3600);
const MIT_YO = bigInt(60);
const ERA_YO = bigInt(146097);
const CET_YO = bigInt(36524);

export function year(det: Dat) {
  const yer = det.pos
    ? EPOCH.add(bigInt(det.year))
    : EPOCH.subtract(bigInt(det.year).prev());
  const day = (() => {
    let cah = isLeapYear(yer) ? MOY_YO : MOH_YO;
    let d = det.time.day.prev();
    let m = det.month.prev();
    while (m.neq(0)) {
      const [first, ...rest] = cah;
      d = d.add(bigInt(first));
      m = m.prev();
      cah = rest;
    }
    let loop: boolean = true;
    let y = yer;
    while (loop == true) {
      if (y.mod(4).neq(zero)) {
        y = y.minus(1);
        d = d.add(isLeapYear(y) ? 366 : 365);
      } else if (y.mod(100).neq(zero)) {
        y = y.minus(bigInt(4));
        d = d.add(isLeapYear(y) ? 1461 : 1460);
      } else if (y.mod(400).neq(zero)) {
        y = y.minus(bigInt(100));
        d = d.add(isLeapYear(y) ? 36525 : 36524);
      } else {
        let eras = y.divide(bigInt(400));
        d = d.add(
          eras.multiply(
            bigInt(4)
              .multiply(bigInt(36524))
              .next()
          )
        );
        loop = false;
      }
    }
    return d;
  })();

  let sec = bigInt(det.time.second)
    .add(DAY_YO.multiply(day))
    .add(HOR_YO.multiply(bigInt(det.time.hour)))
    .add(MIT_YO.multiply(bigInt(det.time.minute)));

  let ms = det.time.ms;
  let fac = bigInt.zero;
  let muc = 3;
  while (ms.length !== 0) {
    const [first, ...rest] = ms;
    fac = fac.add(first.shiftLeft(bigInt(16 * muc)));
    ms = rest;
    muc -= 1;
  }

  return fac.or(sec.shiftLeft(64));
}

export function parseDa(x: string): BigInteger {
  const [date, time, ms] = x.split('..');
  const [yer, month, day] = date.slice(1).split('.');
  const [hour, minute, sec] = time.split('.');
  const millis = ms.split('.').map(m => bigInt(m, 16));

  return year({
    pos: true,
    year: bigInt(yer, 10),
    month: bigInt(month, 10),
    time: {
      day: bigInt(day, 10),
      hour: bigInt(hour, 10),
      minute: bigInt(minute, 10),
      second: bigInt(sec, 10),
      ms: millis,
    },
  });
}

function yell(x: BigInteger): Tarp {
  let sec = x.shiftRight(64);
  const milliMask = bigInt('ffffffffffffffff', 16);
  const millis = milliMask.and(x);
  const ms = millis
    .toString(16)
    .match(/.{1,4}/g)!
    .filter(x => x !== '0000')
    .map(x => bigInt(x, 16));
  let day = sec.divide(DAY_YO);
  sec = sec.mod(DAY_YO);
  let hor = sec.divide(HOR_YO);
  sec = sec.mod(HOR_YO);
  let mit = sec.divide(MIT_YO);
  sec = sec.mod(MIT_YO);

  return {
    ms,
    day,
    minute: mit,
    hour: hor,
    second: sec,
  };
}

function yall(day: BigInteger): [BigInteger, BigInteger, BigInteger] {
  let era = zero;
  let cet = zero;
  let lep = false;
  era = day.divide(ERA_YO);
  day = day.mod(ERA_YO);
  if (day.lt(CET_YO.next())) {
    lep = true;
  } else {
    lep = false;
    cet = bigInt(1);
    day = day.minus(CET_YO.next());
    cet = cet.add(day.divide(CET_YO));
    day = day.mod(CET_YO);
  }
  let yer = era.multiply(400).add(cet.multiply(100));
  let loop = true;
  while (loop == true) {
    let dis = lep ? 366 : 365;
    if (!day.lt(dis)) {
      yer = yer.next();
      day = day.minus(dis);
      lep = yer.mod(4).eq(0);
    } else {
      loop = false;
      let inner = true;
      let mot = zero;
      while (inner) {
        let cah = lep ? MOY_YO : MOH_YO;
        let zis = cah[mot.toJSNumber()];
        if (day.lt(zis)) {
          return [yer, mot.next(), day.next()];
        }
        mot = mot.next();
        day = day.minus(zis);
      }
    }
  }
  return [zero, zero, zero];
}

function yore(x: BigInteger): Dat {
  const time = yell(x);
  const [y, month, d] = yall(time.day);
  time.day = d;
  const pos = y.gt(EPOCH);
  const year = pos ? y.minus(EPOCH) : EPOCH.minus(y).next();

  return {
    pos,
    year,
    month,
    time,
  };
}
export function formatDa(x: BigInteger | string) {
  if (typeof x === 'string') {
    x = bigInt(x);
  }
  const { year, month, time } = yore(x);

  return `~${year}.${month}.${time.day}..${time.hour}.${time.minute}.${
    time.second
  }..${time.ms.map(x => x.toString(16).padStart(4, '0')).join('.')}`;
}

function chunkFromRight(str: string, size: number) {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);

  for (
    let i = numChunks - 1, o = str.length;
    i >= 0;
    --i, o -= size
  ) {
    let start = o - size;
    let len = size;
    if(start < 0) {
      start = 0;
      len = o;
    }
    chunks[i] = str.substr(start, len);
  }

  return chunks;
}
const uvMask = bigInt(31);
const uvAlphabet =
  '0123456789abcdefghijklmnopqrstuv';

export function parseUv(x: string) {
  let res = bigInt(0);
  x = x.slice(2);
  while (x !== '') {
    if (x[0] !== '.') {
      res = res.shiftLeft(5).add(uvAlphabet.indexOf(x[0]));
    }
    x = x.slice(1);
  }
  return res;
}

export function formatUv(x: BigInteger | string) {
  if (typeof x === 'string') {
    x = bigInt(x);
  }
  let res = '';
  while (x.neq(bigInt.zero)) {
    let nextSix = x.and(uvMask).toJSNumber();
    res = uvAlphabet[nextSix] + res;
    x = x.shiftRight(5);
  }
  return `0v${chunkFromRight(res, 5).join('.')}`;
}

const uwMask = bigInt(63);
const uwAlphabet =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-~';

export function parseUw(x: string) {
  let res = bigInt(0);
  x = x.slice(2);
  while (x !== '') {
    if (x[0] !== '.') {
      res = res.shiftLeft(6).add(uwAlphabet.indexOf(x[0]));
    }
    x = x.slice(1);
  }
  return res;
}

export function formatUw(x: BigInteger | string) {
  if (typeof x === 'string') {
    x = bigInt(x);
  }
  let res = '';
  while (x.neq(bigInt.zero)) {
    let nextSix = x.and(uwMask).toJSNumber();
    res = uwAlphabet[nextSix] + res;
    x = x.shiftRight(6);
  }
  return `0w${chunkFromRight(res, 5).join('.')}`;
}
