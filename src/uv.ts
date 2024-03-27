import { chunkFromRight } from './utils';

const uvAlphabet = '0123456789abcdefghijklmnopqrstuv';

export function parseUv(x: string) {
  let res = 0n;  //TODO  0n
  x = x.slice(2);
  while (x !== '') {
    if (x[0] !== '.') {
      res = (res << 5n) + BigInt(uvAlphabet.indexOf(x[0]));
    }
    x = x.slice(1);
  }
  return res;
}

export function formatUv(x: bigint | string) {
  if (typeof x === 'string') {
    x = BigInt(x);
  }
  let res = '';
  while (x !== 0n) {
    let nextFive = Number(BigInt.asUintN(5, x));
    res = uvAlphabet[nextFive] + res;
    x = x >> 5n;
  }
  return `0v${chunkFromRight(res, 5).join('.')}`;
}
