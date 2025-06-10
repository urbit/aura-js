//  render: serialize into atom literal strings
//
//    atom literal rendering from hoon 137 (and earlier).
//    stdlib arm names are included for ease of cross-referencing.
//

import { formatDa } from "./da";
import { patp } from "./p";
import { patq } from "./q";
import { formatUw } from "./uw";

//TODO  unsupported auras: @r*, @if, @is
//TODO  unsupported coins: %blob, %many

//TODO  dedupe with parse
export type aura = 'c'
                 | 'da'
                 | 'dr'
                 | 'f'
                 | 'n'
                 | 'p'
                 | 'q'
                 | 'sb'
                 | 'sd'
                 | 'si'
                 | 'sv'
                 | 'sw'
                 | 'sx'
                 | 't'
                 | 'ta'
                 | 'tas'
                 | 'ub'
                 | 'ud'
                 | 'ui'
                 | 'uv'
                 | 'uw'
                 | 'ux';
export type dime = { aura: aura, atom: bigint }
export type coin = ({ type: 'dime' } & dime)
                 | { type: 'blob', noun: any }  //TODO  could do jam: bigint if we don't want nockjs dependency?
                 | { type: 'many', list: coin[] }

//  render(): scot()
//  scot(): render atom as specific aura
//
export const render = scot;
export default render;
export function scot(aura: aura, atom: bigint): string {
  return rend({ type: 'dime', aura, atom });
}

export function rend(coin: coin): string {
  switch (coin.type) {
    case 'blob':
      throw new Error('aura-js: %blob rendering unsupported'); //TODO

    case 'many':
      return '.' + coin.list.reduce((acc: string, item: coin) => {
        return acc + '_' + wack(rend(item));
      }, '') + '__';
      throw new Error('aura-js: %many rendering unsupported'); //TODO

    case 'dime':
      switch(coin.aura[0]) {
        case 'c':
          //  this short-circuits the (wood (tuft atom)) calls that
          //  hoon.hoon does, leaning on wood only for ascii characters,
          //  and going straight to encoded representation for anything else.
          //  (otherwise we'd need to stringify the utf-32 bytes, ouch.)
          if (coin.atom < 0x7fn)
            return '~-' + encodeString(String.fromCharCode(Number(coin.atom)));
          else
            return '~-~' + coin.atom.toString(16) + '.';
        case 'd':
          switch(coin.aura[1]) {
            case 'a':
              return formatDa(coin.atom);
            case 'r':
              throw new Error('aura-js: @dr rendering unsupported'); //TODO
            default:
              return zco(coin.atom);
          }
        case 'f':
          switch(coin.atom) {
            case 0n: return '.y';
            case 1n: return '.n';
            default: return zco(coin.atom);
          }
        case 'n':
          return '~';
        case 'i':
          switch(coin.aura[1]) {
            case 'f': throw new Error('aura-js: @if rendering unsupported'); //TODO
            case 's': throw new Error('aura-js: @is rendering unsupported'); //TODO
            default: return zco(coin.atom);
          }
        case 'p':
          return patp(coin.atom);
        case 'q':
          return '.' + patq(coin.atom);
        case 'r':
          switch(coin.aura[1]) {
            case 'd': throw new Error('aura-js: @rd rendering unsupported'); //TODO
            case 'h': throw new Error('aura-js: @rh rendering unsupported'); //TODO
            case 'q': throw new Error('aura-js: @rq rendering unsupported'); //TODO
            case 's': throw new Error('aura-js: @rs rendering unsupported'); //TODO
            default: return zco(coin.atom);
          }
        case 'u':
          switch(coin.aura[1]) {
            case 'c': throw new Error('aura-js: @uc rendering unsupported'); //TODO;
            case 'b': return '0b' + split(coin.atom.toString(2), 4);
            case 'i': return '0i' + dco(1, coin.atom);
            case 'x': return '0x' + split(coin.atom.toString(16), 4);
            case 'v': return '0v' + split(coin.atom.toString(32), 5);
            case 'w': return '0w' + split(blend(6, UW_ALPHABET, coin.atom), 5);
            default: return split(coin.atom.toString(10), 3);
          }
        case 's':
          const end = (coin.atom & 1n);
          coin.atom = end + (coin.atom >> 1n);
          coin.aura = coin.aura.replace('u', 's') as aura;
          return ((end === 0n) ? '--' : '-') + rend(coin);
        case 't':
          if (coin.aura[1] === 'a') {
            if (coin.aura[2] === 's') {
              return cordToString(coin.atom);
            } else {
              return '~.' + cordToString(coin.atom);
            }
          } else {
            return '~~' + encodeString(cordToString(coin.atom));
          }
        default:
          return zco(coin.atom);
      }
  }
}

function aco(atom: bigint): string {
  return dco(1, atom);
}

function dco(lent: number, atom: bigint): string {
  return atom.toString(10).padStart(lent, '0');
}

function vco(lent: number, atom: bigint): string {
  return atom.toString(32).padStart(lent, '0');
}

function xco(lent: number, atom: bigint): string {
  return atom.toString(16).padStart(lent, '0');
}

function yco(atom: bigint): string {
  return dco(2, atom);
}

function zco(atom: bigint): string {
  return '0x' + xco(1, atom);
}

function wack(str: string) {
  return str.replaceAll('~', '~~').replaceAll('_', '~-');
}

//  encodeString(): encode string into @ta-safe format
//
//    using logic from +wood.
//    for example, 'some Chars!' becomes '~.some.~43.hars~21.'
//    this is url-safe encoding for arbitrary strings.
//
export function encodeString(string: string) {
  let out = '';
  for (let i = 0; i < string.length; i += 1) {
    const char = string[i];
    let add = '';
    switch (char) {
      case ' ':
        add = '.';
        break;
      case '.':
        add = '~.';
        break;
      case '~':
        add = '~~';
        break;
      default: {
        const codePoint = string.codePointAt(i);
        if (!codePoint) break;
        //  js strings are encoded in UTF-16, so 16 bits per character.
        //  codePointAt() reads a _codepoint_ at a character index, and may
        //  consume up to two js string characters to do so, in the case of
        //  16 bit surrogate pseudo-characters. here we detect that case, so
        //  we can advance the cursor to skip past the additional character.
        if (codePoint > 0xffff) i += 1;
        if (
          (codePoint >= 97 && codePoint <= 122) || // a-z
          (codePoint >= 48 && codePoint <= 57) || // 0-9
          char === '-'
        ) {
          add = char;
        } else {
          add = `~${codePoint.toString(16)}.`;
        }
      }
    }
    out += add;
  }
  return out;
}

const UW_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-~';
function blend(bits: number, alphabet: string, atom: bigint): string {
  if (atom === 0n) return alphabet[0];
  let out = '';
  const bbits = BigInt(bits);
  while (atom !== 0n) {
    out = alphabet[Number(BigInt.asUintN(bits, atom))] + out;
    atom = atom >> bbits;
  }
  return out;
}

function split(str: string, group: number): string {
  //  insert '.' every $group characters counting from the end,
  //  while avoiding putting a leading dot at the start
  return str.replace(new RegExp(`(?=(?:.{${group}})+$)(?!^)`, 'g'), '.');
}

function cordToString(atom: bigint): string {
  return new TextDecoder('utf-8').decode(atomToByteArray(atom).reverse());
};

//NOTE  from nockjs' bigIntToByteArray
//REVIEW  original produced [0] for 0n... probably not correct in our contexts!
function atomToByteArray(atom: bigint): Uint8Array {
  if (atom === 0n) return new Uint8Array(0);
  const hexString = atom.toString(16);
  const paddedHexString = hexString.length % 2 === 0 ? hexString : '0' + hexString;
  const arrayLength = paddedHexString.length / 2;
  const int8Array = new Uint8Array(arrayLength);
  for (let i = 0; i < paddedHexString.length; i += 2) {
    const hexSubstring = paddedHexString.slice(i, i + 2);
    const signedInt = (parseInt(hexSubstring, 16) << 24) >> 24;
    int8Array[(i / 2)] = signedInt;
  }
  return int8Array;
}
