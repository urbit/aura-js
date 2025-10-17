import {
  isValidPat,
  patp2syls,
  suffixes,
  prefixes,
} from './hoon';
import ob from './hoon/ob';

//NOTE  matches for shape, not syllables
export const regexP = /^~([a-z]{3}|([a-z]{6}(\-[a-z]{6}){0,3}(\-(\-[a-z]{6}){4})*))$/;

/**
 * Convert a valid `@p` literal string to a bigint.
 * @param {String} str certified-sane `@p` literal string
 */
export function parseP(str: string, scramble: boolean = true): bigint {
  const syls = patp2syls(str);

  const syl2bin = (idx: number) => {
    return idx.toString(2).padStart(8, '0');  //NOTE  base16 isn't any faster
  }

  const addr = syls.reduce(
    (acc, syl, idx) =>
      idx % 2 !== 0 || syls.length === 1
        ? acc + syl2bin(suffixes.indexOf(syl))
        : acc + syl2bin(prefixes.indexOf(syl)),
    ''
  );

  const num = BigInt('0b' + addr);
  return scramble ? ob.fynd(num) : num;
}

function checkedParseP(str: string): bigint {
  if (!isValidP(str)) throw new Error('invalid @p literal: ' + str);
  return parseP(str);
}

export type size = 'galaxy' | 'star' | 'planet' | 'moon' | 'comet';
export type rank = 'czar' | 'king' | 'duke' | 'earl' | 'pawn';
/**
 * Determine the `$rank` of a `@p` value or literal.
 *
 * @param  {String}  @p
 * @return  {String}
 */
export function clan(who: bigint | string): rank {
  let num: bigint;
  if (typeof who === 'bigint') num = who;
  else num = checkedParseP(who);

  return num <= 0xFFn
    ? 'czar'
    : num <= 0xFFFFn
    ? 'king'
    : num <= 0xFFFFFFFFn
    ? 'duke'
    : num <= 0xFFFFFFFFFFFFFFFFn
    ? 'earl'
    : 'pawn';
}

export function kind(who: bigint | string): size {
  return rankToSize(clan(who));
}
export function rankToSize(rank: rank): size {
  switch (rank) {
    case 'czar': return 'galaxy';
    case 'king': return 'star';
    case 'duke': return 'planet';
    case 'earl': return 'moon';
    case 'pawn': return 'comet';
  }
}

/**
 * Determine the parent of a `@p` value. Throws on invalid string inputs.
 *
 * @param  {String | number} who `@p` value or literal string
 * @return  {String}
 */
export function sein(who: bigint): bigint;
export function sein(who: string): string;
export function sein(who: bigint | string): typeof who {
  let num: bigint;
  if (typeof who === 'bigint') num = who;
  else num = checkedParseP(who);

  let mir = clan(num);

  const res =
    mir === 'czar'
      ? num
      : mir === 'king'
      ? num & 0xFFn
      : mir === 'duke'
      ? num & 0xFFFFn
      : mir === 'earl'
      ? num & 0xFFFFFFFFn
      : num & 0xFFFFn;

  if (typeof who === 'bigint') return res;
  else return renderP(res);
}

/**
 * Validate a @p string.
 *
 * @param  {String}  str a string
 * @return  {boolean}
 */
export function isValidP(str: string): boolean {
  return regexP.test(str)               //  general structure
      && isValidPat(str)                //  valid syllables
      && str === renderP(parseP(str));  //  no leading zeroes  //TODO  can isValidPat check this?
}

export function parseValidP(str: string): bigint | null {
  if (!regexP.test(str) || !isValidPat(str)) return null;
  const res = parseP(str);
  return (str === renderP(res)) ? res : null;
}

/**
 * Convert a number to a @p-encoded string.
 *
 * @param {bigint} arg
 * @return  {String}
 */
export function renderP(arg: bigint, scramble: boolean = true) {
  const sxz = scramble ? ob.fein(arg) : arg;
  const dyx = Math.ceil(sxz.toString(16).length / 2);
  const dyy = Math.ceil(sxz.toString(16).length / 4);

  function loop(tsxz: bigint, timp: number, trep: string): string {
    const log = tsxz & 0xFFFFn;
    const pre = prefixes[Number(log >> 8n)];
    const suf = suffixes[Number(log & 0xFFn)];
    const etc = (timp & 0b11) ? '-' : ((timp === 0) ? '' : '--');

    const res = pre + suf + etc + trep;

    return timp === dyy ? trep : loop(tsxz >> 16n, timp + 1, res);
  }

  return (
    '~' + (dyx <= 1 ? suffixes[Number(sxz)] : loop(sxz, 0, ''))
  );
}

/**
 * Render short-form ship name. Throws on invalid string inputs.
 *
 * @param  {String | number} who `@p` value or literal string
 * @return  {String}
 */
export function cite(who: bigint | string): string {
  let num: bigint;
  if (typeof who === 'bigint') num = who;
  else num = checkedParseP(who);

  if (num <= 0xFFFFFFFFn) {
    return renderP(num);
  } else if (num <= 0xFFFFFFFFFFFFFFFFn) {
    return renderP(num & 0xFFFFFFFFn).replace('-', '^');
  } else {
    return renderP(BigInt('0x'+num.toString(16).slice(0,4))) + '_' + renderP(num & 0xFFFFn).slice(1);
  }
}
