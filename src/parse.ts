//  parse: deserialize from atom literal strings
//
//    atom literal parsing from hoon 137 (and earlier).
//    stdlib arm names are included for ease of cross-referencing.
//
//TODO  unsupported auras: @dr, @uc

import { aura, dime, coin } from './types';

import { parseDa, parseDr } from './d';
import { parseValidP, regexP } from './p';
import { parseValidQ } from './q';
import { parseR, precision } from './r';

function integerRegex(a: string, b: string, c: string, d: number, e: boolean = false): RegExp {
  const pre = d === 0 ? b       : `${b}${c}{0,${d-1}}`;
  const aft = d === 0 ? `${c}*` : `(\\.${c}{${d}})*`;
  return new RegExp(`^${e ? '\\-\\-?' : ''}${a}(0|${pre}${aft})$`);
}

function floatRegex(a: number): RegExp {
  return new RegExp(`^\\.~{${a}}(nan|\\-?(inf|(0|[1-9][0-9]*)(\\.[0-9]+)?(e\\-?(0|[1-9][0-9]*))?))$`);
}

//TODO  rewrite with eye towards capturing groups?
export const regex: { [key in aura]: RegExp } = {
  'c':   /^~\-((~[0-9a-fA-F]+\.)|(~[~\.])|[0-9a-z\-\._])*$/,
  'da':  /^~(0|[1-9][0-9]*)\-?\.([1-9]|1[0-2])\.([1-9]|[1-3][0-9])(\.\.([0-9]+)\.([0-9]+)\.([0-9]+)(\.(\.[0-9a-f]{4})+)?)?$/,
  'dr':  /^~((d|h|m|s)(0|[1-9][0-9]*))(\.(d|h|m|s)(0|[1-9][0-9]*))*(\.(\.[0-9a-f]{4})+)?$/,  //TODO  first ? to * mb
  'f':   /^\.(y|n)$/,
  'if':  /^(\.(0|[1-9][0-9]{0,2})){4}$/,
  'is':  /^(\.(0|[1-9a-fA-F][0-9a-fA-F]{0,3})){8}$/,
  'n':   /^~$/,
  'p':   regexP,  //NOTE  matches shape but not syllables
  'q':   /^\.~(([a-z]{3}|[a-z]{6})(\-[a-z]{6})*)$/,  //NOTE  matches shape but not syllables
  'rd':  floatRegex(1),
  'rh':  floatRegex(2),
  'rq':  floatRegex(3),
  'rs':  floatRegex(0),
  'sb':  integerRegex('0b', '1', '[01]', 4, true),
  'sd':  integerRegex('', '[1-9]', '[0-9]', 3, true),
  'si':  integerRegex('0i', '[1-9]', '[0-9]', 0, true),
  'sv':  integerRegex('0v', '[1-9a-v]', '[0-9a-v]', 5, true),
  'sw':  integerRegex('0w', '[1-9a-zA-Z~-]', '[0-9a-zA-Z~-]', 5, true),
  'sx':  integerRegex('0x', '[1-9a-f]', '[0-9a-f]', 4, true),
  't':   /^~~((~[0-9a-fA-F]+\.)|(~[~\.])|[0-9a-z\-\._])*$/,
  'ta':  /^~\.[0-9a-z\-\.~_]*$/,
  'tas': /^[a-z][a-z0-9\-]*$/,
  'ub':  integerRegex('0b', '1', '[01]', 4),
  'ud':  integerRegex('', '[1-9]', '[0-9]', 3),
  'ui':  integerRegex('0i', '[1-9]', '[0-9]', 0),
  'uv':  integerRegex('0v', '[1-9a-v]', '[0-9a-v]', 5),
  'uw':  integerRegex('0w', '[1-9a-zA-Z~-]', '[0-9a-zA-Z~-]', 5),
  'ux':  integerRegex('0x', '[1-9a-f]', '[0-9a-f]', 4),
};

//  parse(): slav()
//  slav(): slaw() but throwing on failure
//
export const parse = slav;
export default parse;
export function slav(aura: aura, str: string): bigint {
  const out = slaw(aura, str);
  if (!out) {
    throw new Error('slav: failed to parse @' + aura + ' from string: ' + str);
  }
  return out;
}

//  tryParse(): slaw()
//  slaw(): parse string as specific aura, null if that fails
//
export const tryParse = slaw;
export function slaw(aura: aura, str: string): bigint | null {
  //  if the aura has a regex, test with that first
  //TODO  does double work with checks in nuck?
  //
  if (aura in regex && !regex[aura as aura].test(str)) {
    return null;
  }
  //  proceed into parsing the string into a coin,
  //  producing a result if the aura matches
  //
  //TODO  further short-circuit based on aura?
  const coin = nuck(str);
  if (coin && coin.type === 'dime' && coin.aura === aura) {
    return coin.atom;
  } else {
    return null;
  }
}

export function valid(aura: aura, str: string): boolean {
  return slaw(aura, str) !== null;
}

//  nuck(): parse string into coin, or null if that fails
//
export function nuck(str: string): coin | null {
  if (str === '') return null;

  //  narrow options down by the first character, before doing regex tests
  //  and trying to parse for real
  //
  const c = str[0];
  if (c >= 'a' && c <= 'z') {  //  "sym"
    if (regex['tas'].test(str)) {
      return { type: 'dime', aura: 'tas', atom: stringToCord(str) };
    } else {
      return null;
    }
  } else
  if (c >= '0' && c <= '9') {  //  "bisk"
    const dim = bisk(str);
    if (!dim) {
      return null;
    } else {
      return { type: 'dime', ...dim };
    }
  } else
  if (c === '-') {  //  "tash"
    let pos = true;
    if (str[1] == '-') {
      str = str.slice(2);
    } else {
      str = str.slice(1);
      pos = false;
    }
    const dim = bisk(str);
    if (dim) {
      // `@s`?:(pos (mul 2 b) ?:(=(0 b) 0 +((mul 2 (dec b)))))
      if (pos) {
        dim.atom = 2n * dim.atom;
      } else if (dim.atom !== 0n) {
        dim.atom = 1n + (2n * (dim.atom - 1n));
      }
      //NOTE  assumes bisk always returns u* auras
      return { type: 'dime', aura: dim.aura.replace('u', 's') as aura, atom: dim.atom };
    } else {
      return null;
    }
  } else
  if (c === '.') {  //  "perd", "zust"
    //NOTE  doesn't match stdlib parsing order, but they're easy early-outs
    if (str === '.y') {
      return { type: 'dime', aura: 'f', atom: 0n };
    } else
    if (str === '.n') {
      return { type: 'dime', aura: 'f', atom: 1n };
    } else
    //REVIEW  entering the branch this way assumes regexes for sequentially-tested auras don't overlap...
    //        going down the list of options this way matches hoon parser behavior the closest, but is slow for the "miss" case.
    //        could be optimized by hard-returning if the regex fails for cases where the lead char is unique.
    //        should probably run some perf tests
    if (regex['is'].test(str)) {
      const value = str.slice(1).split('.').reduce((a, v) => a + v.padStart(4, '0'), '');
      return { type: 'dime', aura: 'is', atom: BigInt('0x'+value) };
    } else
    if (regex['if'].test(str)) {
      const value = str.slice(1).split('.').reduce((a, v, i) => (a + (BigInt(v) << BigInt(8 * (3 - i)))), 0n);
      return { type: 'dime', aura: 'if', atom: value };
    } else
    if ( ( str[1] === '~' &&
           (regex['rd'].test(str) || regex['rh'].test(str) || regex['rq'].test(str)) )
      || regex['rs'].test(str) ) {  //  "royl"
      let precision = 0;
      while (str[precision+1] === '~') precision++;
      let aura: aura;
      switch (precision) {
        case 0: aura = 'rs'; break;
        case 1: aura = 'rd'; break;
        case 2: aura = 'rh'; break;
        case 3: aura = 'rq'; break;
        default: throw new Error('parsing invalid @r*');
      }
      return { type: 'dime', aura, atom: parseR(aura[1] as precision, str) };
    } else
    if (str[1] === '~' && regex['q'].test(str)) {
      const num = parseValidQ(str);
      if (num === null) return null;
      return { type: 'dime', aura: 'q', atom: num };
    } else
    if (str[1] === '_' && /^\.(_([0-9a-zA-Z\-\.]|~\-|~~)+)*__$/.test(str)) {  //  "nusk"
      const coins = str.slice(1, -2).split('_').slice(1).map((s): coin | null => {
        //NOTE  real +wick produces null for strings w/ other ~ chars,
        //      but the regex above already excludes those
        s = s.replaceAll('~-', '_').replaceAll('~~', '~');  //  "wick"
        return nuck(s);
      });
      if (coins.some(c => c === null)) {
        return null;
      } else {
        return { type: 'many', list: coins as coin[] };
      }
    }
    return null;
  } else
  if (c === '~') {
    if (str === '~') {
      return { type: 'dime', aura: 'n', atom: 0n }
    } else {  //  "twid"
      if (regex['da'].test(str)) {
        return { type: 'dime', aura: 'da', atom: parseDa(str) };
      } else
      if (regex['dr'].test(str)) {
        return { type: 'dime', aura: 'dr', atom: parseDr(str) };
      } else
      if (regex['p'].test(str)) {
        //NOTE  this still does the regex check twice...
        const res = parseValidP(str);
        if (res === null) return null;
        return { type: 'dime', aura: 'p', atom: res };
      } else
      //TODO  test if these single-character checks affect performance or no,
      //      or if we want to move them further up, etc.
      if (str[1] === '.' && regex['ta'].test(str)) {
        return { type: 'dime', aura: 'ta', atom: stringToCord(str.slice(2)) };
      } else
      if (str[1] === '~' && regex['t'].test(str)) {
        return { type: 'dime', aura: 't', atom: stringToCord(decodeString(str.slice(2))) };
      } else
      if (str[1] === '-' && regex['c'].test(str)) {
        //TODO  cheeky! this doesn't support the full range of inputs that the
        //      hoon stdlib supports, but should work for all sane inputs.
        //      no guarantees about behavior for insane inputs...
        if (/^~\-~[0-9a-f]+\.$/.test(str)) {
          return { type: 'dime', aura: 'c', atom: BigInt('0x' + str.slice(3, -1)) };
        }
        return { type: 'dime', aura: 'c', atom: stringToCord(decodeString(str.slice(2))) };
      }
    }
    if ((str[1] === '0') && /^~0[0-9a-v]+$/.test(str)) {
      return { type: 'blob', jam: slurp(5, UV_ALPHABET, str.slice(2)) };
    }
    return null;
  }
  return null;
}

//  bisk(): parse string into dime of integer aura, or null if that fails
//
function bisk(str: string): dime | null {
  switch (str.slice(0, 2)) {
    case '0b':  //  "bay"
      if (regex['ub'].test(str)) {
        return { aura: 'ub', atom: BigInt(str.replaceAll('.', '')) };
      } else {
        return null;
      }

    case '0c':  //  "fim"
      //TODO  support base58check
      console.log('aura-js: @uc parsing unsupported (bisk)');
      return null;

    case '0i':  //  "dim"
      if (regex['ui'].test(str)) {
        return { aura: 'ui', atom: BigInt(str.slice(2)) }
      } else {
        return null;
      }

    case '0x':  //  "hex"
      if (regex['ux'].test(str)) {
        return { aura: 'ux', atom: BigInt(str.replaceAll('.', '')) };
      } else {
        return null;
      }

    case '0v':  //  "viz"
      if (regex['uv'].test(str)) {
        return { aura: 'uv', atom: slurp(5, UV_ALPHABET, str.slice(2)) };
      } else {
        return null;
      }

    case '0w':  //  "wiz"
      if (regex['uw'].test(str)) {
        return { aura: 'uw', atom: slurp(6, UW_ALPHABET, str.slice(2)) };
      } else {
        return null;
      }

    default:  //  "dem"
      if (regex['ud'].test(str)) {
        return { aura: 'ud', atom: BigInt(str.replaceAll('.', '')) }
      } else {
        return null;
      }
  }
}

//  decodeString(): decode string from @ta-safe format
//
//    using logic from +woad.
//    for example, '~.some.~43.hars~21.' becomes 'some Chars!'
//    assumes
//
export function decodeString(str: string): string {
  let out = '';
  let i = 0;
  while (i < str.length) {
    switch (str[i]) {
      case '.':
        out = out + ' ';
        i++; continue;
      case '~':
        switch (str[++i]) {
          case '~':
            out = out + '~';
            i++; continue;
          case '.':
            out = out + '.';
            i++; continue;
          default:
            let char: number = 0;
            do {
              char = (char << 4) | Number.parseInt(str[i++], 16);
            } while (str[i] !== '.')
            out = out + String.fromCodePoint(char);
            i++; continue;
        }
      default:
        out = out + str[i++];
        continue;
    }
  }
  return out;
}

function stringToCord(str: string): bigint {
  return bytesToBigint(new TextEncoder().encode(str));
}

const UW_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-~';
const UV_ALPHABET = '0123456789abcdefghijklmnopqrstuv';
function slurp(bits: number, alphabet: string, str: string): bigint {
  let out = 0n;
  const bbits = BigInt(bits);
  while (str !== '') {
    if (str[0] !== '.') {
      out = (out << bbits) + BigInt(alphabet.indexOf(str[0]));
    }
    str = str.slice(1);
  }
  return out;
}

//REVIEW  should the reversal happen here or at callsites? depends on what endianness is idiomatic to js?
function bytesToBigint(bytes: Uint8Array): bigint {
  if (bytes.length === 0) return 0n;
  //  if we have node's Buffer available, use it, it's wicked fast.
  //  otherwise, constructing the hex string "by hand" and instantiating
  //  a bigint from that is the fastest thing we can do.
  //
  if (typeof Buffer !== 'undefined')
    return BigInt('0x' + Buffer.from(bytes.reverse()).toString('hex'));
  let byt: number,
    parts: string[] = [];
  for (var i = bytes.length - 1; i >= 0; --i) {
    byt = bytes[i];
    parts.push(byt < 16 ? "0" + byt.toString(16) : byt.toString(16));
  }
  const num = BigInt('0x' + parts.join(''));
  return num;
}
