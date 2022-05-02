import bigInt, { BigInteger } from 'big-integer';

interface Dat {
  pos: boolean;
  year: number;
  month: number;
  time: Tarp;
}

interface Tarp {
  day: number;
  hour: number;
  minute: number;
  second: number;
  ms: BigInteger[];
}

const EPOCH = bigInt('292.277.024.400'.replace('.', ''));
const zero = bigInt.zero;

function isLeapYear(year: BigInteger) {
  return year.mod(4) === zero && (year.mod(100).neq(0) || year.mod(400).eq(0));
}
const MOH_YO = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MOY_YO = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const DAY_YO = bigInt(86400);
const HOR_YO = bigInt(3600);
const MIT_YO = bigInt(60);

export function year(det: Dat) {
  const yer = det.pos
    ? EPOCH.add(bigInt(det.year))
    : EPOCH.subtract(bigInt(det.year).prev());
  const day = (() => {
    let cah = isLeapYear(yer) ? MOY_YO : MOH_YO;
    let d = bigInt(det.time.day);
    let m = det.month;
    while (m != 0) {
      const [first, ...rest] = cah;
      d.add(bigInt(first));
      m -= 1;
      cah = rest;
    }
    let loop: boolean = true;
    let y = yer;
    while (loop == true) {
      if (yer.mod(4).neq(zero)) {
        y = y.prev();
        d = d.add(isLeapYear(y) ? 366 : 365);
      } else if (yer.mod(100).neq(zero)) {
        y = y.minus(bigInt(4));
        d = d.add(isLeapYear(y) ? 1461 : 1460);
      } else if (yer.mod(400).neq(zero)) {
        y = y.minus(bigInt(400));
        d = d.add(isLeapYear(y) ? 36525 : 36524);
      } else {
        let foo = bigInt(4)
          .multiply(36524)
          .next();
        let newD = yer.divide(bigInt(400));
        let bar = newD.multiply(foo);
        d = d.add(bar);
        loop = false;
      }
    }
    return d;
  })();

  let sec = bigInt(det.time.second)
    .add(DAY_YO.multiply(day))
    .add(HOR_YO.multiply(bigInt(det.time.hour)))
    .add(MIT_YO.multiply(bigInt(det.time.hour)));

  let ms = det.time.ms;
  let fac = bigInt.zero;
  let muc = 4;
  while(ms.length !== 0) {
    const [first, ...rest] = ms;
    fac = fac.add(first.shiftLeft(bigInt(16*muc)))
    ms = rest;
    muc -= 1;
  }

  return fac.or(sec.shiftLeft(64));
}

export function parseDa(x: string): BigInteger {
  console.log(x);
  return bigInt.zero;
}

class Atom {
  constructor(private value: BigInteger) {
    this.value = value;
  }

  abs(): BigInteger {
    return this.value.abs();
  }

  add(x: BigInteger) {
    return this.value.add(x);
  }

  and(x: BigInteger) {
    return this.value.and(x);
  }

  bitLength() {
    return this.value.bitLength();
  }

  compare(x: BigInteger) {
    return this.value.compare(x);
  }

  compareAbs(x: BigInteger) {
    return this.value.compareAbs(x);
  }

  compareTo(x: BigInteger) {
    return this.value.compareTo(x);
  }

  divide(x: BigInteger) {
    return this.value.divide(x);
  }

  divmod(x: BigInteger) {
    return this.value.divmod(x);
  }

  eq = this.equals;

  equals(x: BigInteger) {
    return this.value.equals(x);
  }

  geq = this.greaterOrEquals;

  greater(x: BigInteger) {
    return this.value.greater(x);
  }

  greaterOrEquals(x: BigInteger) {
    return this.value.greaterOrEquals(x);
  }

  gt = this.greater;

  isDivisibleBy(x: BigInteger) {
    return this.value.isDivisibleBy(x);
  }

  isEven() {
    return this.value.isEven();
  }

  isNegative() {
    return this.value.isNegative();
  }

  isOdd() {
    return this.value.isOdd();
  }

  isPositive() {
    return this.value.isPositive();
  }

  isProbablePrime() {
    return this.value.isProbablePrime();
  }

  isPrime() {
    return this.value.isPrime();
  }

  isUnit() {
    return this.value.isUnit();
  }

  isZero() {
    return this.value.isZero();
  }

  leq = this.lesserOrEquals;

  lesser(x: BigInteger) {
    return this.value.lesser(x);
  }

  lesserOrEquals(x: BigInteger) {
    return this.value.lesserOrEquals(x);
  }

  lt = this.lesser;

  minus(x: BigInteger) {
    return this.value.minus(x);
  }

  mod(x: BigInteger) {
    return this.value.mod(x);
  }

  modInv(x: BigInteger) {
    return this.value.modInv(x);
  }

  modPow(exp: BigInteger, mod: BigInteger) {
    return this.value.modPow(exp, mod);
  }

  multiply(x: BigInteger) {
    return this.value.multiply(x);
  }

  negate() {
    return this.value.negate();
  }

  neq = this.notEquals;

  notEquals(x: BigInteger) {
    return this.value.notEquals(x);
  }

  next() {
    return this.value.next();
  }

  not() {
    return this.value.not();
  }

  or(x: BigInteger) {
    return this.value.or(x);
  }

  over = this.divide;

  plus = this.add;

  pow(x: BigInteger) {
    return this.value.pow(x);
  }

  prev() {
    return this.value.prev();
  }

  remainder = this.mod;

}

export default Atom;
