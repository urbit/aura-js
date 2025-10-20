import { aura } from '../src/types';
import { tryParse as parse } from "../src/parse";
import render from '../src/render';
import { webcrypto } from 'crypto';

//  tests per bit-size
const testCount = 50;

const simpleAuras: aura[] = [
  'c',
  'da',
  // 'dr', //TODO  unsupported
  // 'f',  //  limited legitimate values
  // 'if',  //  won't round-trip above "native" size limit
  // 'is',  //  won't round-trip above "native" size limit
  // 'n',  //  limited legitimate values
  'p',
  'q',
  // 'rh',  //  strict size limits, and NaN usually won't round-trip
  // 'rd',  //
  // 'rq',  //
  // 'rs',  //
  'sb',
  'sd',
  'si',
  'sv',
  'sw',
  'sx',
  // 't',    //  stdlib also crashes on rendering arbitrary bytes
  // 'ta',   //
  // 'tas',  //
  'ub',
  // 'uc', //TODO  unsupported
  'ud',
  'ui',
  'uv',
  'uw',
  'ux'
]

function fuzz(minBits: number, maxBits: number, auras: aura[], f: (n:bigint)=>bigint = (n)=>n) {
  describe(minBits + '—' + maxBits + '-bit values', () => {
    const tests: { [bits: number]: bigint[] } = {};
    for (let bits = minBits; bits <= maxBits; bits++) {
      const parts = Math.ceil(bits / 64);
      const src = bits <=  8 ? new Uint8Array(testCount)
                : bits <= 16 ? new Uint16Array(testCount)
                : bits <= 32 ? new Uint32Array(testCount)
                : bits <= 64 ? new BigUint64Array(testCount)
                : new BigUint64Array(testCount * parts);
      webcrypto.getRandomValues(src);
      const arr: bigint[] = [];
      if (bits <= 64) {
        src.forEach((n) => arr.push(f(BigInt(n))));
      } else {
        const mask = (1n << BigInt(bits % 64)) - 1n;
        for (let t = 0; t < testCount; t+=parts) {
          let num = (src[t] as bigint) & mask;
          for (let p = 1; p < parts; p++) {
            num = (num << 64n) | (src[t+p] as bigint);
          }
          arr.push(f(num));
        }
      }
      tests[bits] = arr;
    }
    auras.forEach((a) => {
      it(a + ' round-trips losslessly', () => {
        for (let bits = minBits; bits <= maxBits; bits++) {
          tests[bits].forEach((n) => {
            n = BigInt(n);
            expect(parse(a, render(a, n))).toEqual(n);
          });
        }
      });
    });
  });
}

fuzz( 1,  32, [...simpleAuras, 'if', 'is']);
fuzz(33,  64, [...simpleAuras, 'is']);
fuzz(65, 128, simpleAuras);

//  for floats, avoid NaNs, whose payload gets discarded during rendering,
//  and as such usually won't round-trip cleanly.
//  NaNs are encoded as "exponent bits all 1, non-zero significand",
//  so we hard-set one pseudo-random exponent bit to 0
function safeFloat(size: bigint, w: bigint, p: bigint) {
  const full = (1n << size) - 1n;
  const makemask = (n: bigint) => full ^ (1n << (p + (n % w)));
  return (n: bigint) => n & makemask(n);
}
//TODO  tests fail, off-by-one...
// fuzz(4,  16, ['rh'], safeFloat( 16n,  5n,  10n));
// fuzz(4,  32, ['rs'], safeFloat( 32n,  8n,  23n));
// fuzz(4,  64, ['rd'], safeFloat( 64n, 11n,  52n));
// fuzz(4, 128, ['rq'], safeFloat(128n, 15n, 112n));
