import bigInt, { BigInteger } from 'big-integer';
import { chunkFromRight } from './utils';

const uvMask = bigInt(31);
const uvAlphabet = '0123456789abcdefghijklmnopqrstuv';

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
