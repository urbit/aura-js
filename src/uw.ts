import { chunkFromRight } from './utils';

const uwAlphabet =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-~';

export function parseUw(x: string) {
  let res = 0n;
  x = x.slice(2);
  while (x !== '') {
    if (x[0] !== '.') {
      res = (res << 6n) + BigInt(uwAlphabet.indexOf(x[0]));
    }
    x = x.slice(1);
  }
  return res;
}

export function formatUw(x: bigint | string) {
  if (typeof x === 'string') {
    x = BigInt(x);
  }
  let res = '';
  while (x !== 0n) {
    let nextSix = Number(BigInt.asUintN(6, x));
    res = uwAlphabet[nextSix] + res;
    x = x >> 6n;
  }
  return `0w${chunkFromRight(res, 5).join('.')}`;
}
