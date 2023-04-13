import bigInt, { BigInteger } from 'big-integer';
import { chunkFromRight } from './utils';

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
