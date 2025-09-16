import {
  isValidPat,
  patp2syls,
  suffixes,
  prefixes,
  met,
  end,
  rsh,
} from './hoon';
import ob from './hoon/ob';

//NOTE  the logic in this file has not yet been updated for the latest broader
//      aura-js implementation style. but We Make It Work™.

/**
 * Convert a hex-encoded string to a @p-encoded string.
 *
 * @param  {String}  hex
 * @return  {String}
 */
export function hex2patp(hex: string): string {
  if (hex === null) {
    throw new Error('hex2patp: null input');
  }
  return patp(BigInt('0x'+hex));
}

/**
 * Convert a @p-encoded string to a hex-encoded string.
 *
 * @param  {String}  name @p
 * @return  {String}
 */
export function patp2hex(name: string): string {
  if (isValidPat(name) === false) {
    throw new Error('patp2hex: not a valid @p');
  }
  const syls = patp2syls(name);

  const syl2bin = (idx: number) => idx.toString(2).padStart(8, '0');

  const addr = syls.reduce(
    (acc, syl, idx) =>
      idx % 2 !== 0 || syls.length === 1
        ? acc + syl2bin(suffixes.indexOf(syl))
        : acc + syl2bin(prefixes.indexOf(syl)),
    ''
  );

  const bn = BigInt('0b'+addr);
  const hex = ob.fynd(bn).toString(16);
  return hex.length % 2 !== 0 ? hex.padStart(hex.length + 1, '0') : hex;
}

/**
 * Convert a @p-encoded string to a bignum.
 *
 * @param  {String}  name @p
 * @return  {bigint}
 */
export function patp2bn(name: string): bigint {
  return BigInt('0x'+patp2hex(name));
}

/**
 * Convert a @p-encoded string to a decimal-encoded string.
 *
 * @param  {String}  name @p
 * @return  {String}
 */
export function patp2dec(name: string): string {
  let bn: bigint;
  try {
    bn = patp2bn(name);
  } catch (_) {
    throw new Error('patp2dec: not a valid @p');
  }
  return bn.toString();
}

/**
 * Determine the ship class of a @p value.
 *
 * @param  {String}  @p
 * @return  {String}
 */
export function clan(who: string): string {
  let name: bigint;
  try {
    name = patp2bn(who);
  } catch (_) {
    throw new Error('clan: not a valid @p');
  }

  const wid = met(3n, name);
  return wid <= 1n
    ? 'galaxy'
    : wid === 2n
    ? 'star'
    : wid <= 4n
    ? 'planet'
    : wid <= 8n
    ? 'moon'
    : 'comet';
}

/**
 * Determine the parent of a @p value.
 *
 * @param  {String}  @p
 * @return  {String}
 */
export function sein(name: string): string {
  let who: bigint;
  try {
    who = patp2bn(name);
  } catch (_) {
    throw new Error('sein: not a valid @p');
  }

  let mir: string;
  try {
    mir = clan(name);
  } catch (_) {
    throw new Error('sein: not a valid @p');
  }

  const res =
    mir === 'galaxy'
      ? who
      : mir === 'star'
      ? end(3n, 1n, who)
      : mir === 'planet'
      ? end(4n, 1n, who)
      : mir === 'moon'
      ? end(5n, 1n, who)
      : 0n;
  return patp(res);
}

/**
 * Validate a @p string.
 *
 * @param  {String}  str a string
 * @return  {boolean}
 */
export function isValidPatp(str: string): boolean {
  return isValidPat(str) && str === patp(patp2dec(str));
}

/**
 * Convert a number to a @p-encoded string.
 *
 * @param  {String, Number, bigint}  arg
 * @return  {String}
 */
export function patp(arg: string | number | bigint) {
  if (arg === null) {
    throw new Error('patp: null input');
  }
  const n = BigInt(arg);

  const sxz = ob.fein(n);
  const dyy = met(4n, sxz);

  function loop(tsxz: bigint, timp: bigint, trep: string): string {
    const log = end(4n, 1n, tsxz);
    const pre = prefixes[Number(rsh(3n, 1n, log))];
    const suf = suffixes[Number(end(3n, 1n, log))];
    const etc = (timp % 4n) === 0n ? ((timp === 0n) ? '' : '--') : '-';

    const res = pre + suf + etc + trep;

    return timp === dyy ? trep : loop(BigInt(rsh(4n, 1n, tsxz).toString()), timp + 1n, res);
  }

  const dyx = BigInt(met(3n, sxz).toString());

  return (
    '~' + (dyx <= 1n ? suffixes[Number(sxz)] : loop(BigInt(sxz.toString()), 0n, ''))
  );
}

/**
 * Ensure @p is sigged.
 *
 * @param  {String}  str a string
 * @return  {String}
 */
export function preSig(ship: string): string {
  if (!ship) {
    return '';
  }

  if (ship.trim().startsWith('~')) {
    return ship.trim();
  }

  return '~'.concat(ship.trim());
}

/**
 * Remove sig from @p
 *
 * @param  {String}  str a string
 * @return  {String}
 */
export function deSig(ship: string): string {
  if (!ship) {
    return '';
  }

  return ship.replace('~', '');
}

/**
 * Trim @p to short form
 *
 * @param  {String}  str a string
 * @return  {String}
 */
export function cite(ship: string): string | null {
  if (!ship) {
    return null;
  }

  const patp = deSig(ship);

  // comet
  if (patp.length === 56) {
    return preSig(patp.slice(0, 6) + '_' + patp.slice(50, 56));
  }

  // moon
  if (patp.length === 27) {
    return preSig(patp.slice(14, 20) + '^' + patp.slice(21, 27));
  }

  return preSig(patp);
}
