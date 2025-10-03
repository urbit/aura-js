import { aura } from '../src/types';
import { tryParse as parse } from "../src/parse";
import render from '../src/render';
import { webcrypto } from 'crypto';

const testCount = 500;

const auras: aura[] = [
  'c',
  'da',
  // 'dr', //TODO  unsupported
  // 'f',  //  limited legitimate values
  // 'n',  //  limited legitimate values
  'p',
  'q',
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
  'ud',
  'ui',
  'uv',
  'uw',
  'ux'
]

function fuzz(nom: string, arr: Uint8Array | Uint16Array | Uint32Array | BigUint64Array) {
  webcrypto.getRandomValues(arr);
  auras.forEach((a) => {
    describe(nom + ' @' + a, () => {
      it('round-trips losslessly', () => {
        arr.forEach((n) => {
          n = BigInt(n);
          expect(parse(a, render(a, n))).toEqual(n);
        });
      });
    });
  });
}

fuzz('8-bit', new Uint8Array(testCount));
fuzz('16-bit', new Uint16Array(testCount));
fuzz('32-bit', new Uint32Array(testCount));
fuzz('64-bit', new BigUint64Array(testCount));
