import bigInt, { BigInteger } from 'big-integer';
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

const zero = bigInt(0);
const one = bigInt(1);
const two = bigInt(2);
const three = bigInt(3);
const four = bigInt(4);
const five = bigInt(5);

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
  return patp(bigInt(hex, 16));
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

  const bn = bigInt(addr, 2);
  const hex = ob.fynd(bn).toString(16);
  return hex.length % 2 !== 0 ? hex.padStart(hex.length + 1, '0') : hex;
}

/**
 * Convert a @p-encoded string to a bignum.
 *
 * @param  {String}  name @p
 * @return  {BigInteger}
 */
export function patp2bn(name: string): BigInteger {
  return bigInt(patp2hex(name), 16);
}

/**
 * Convert a @p-encoded string to a decimal-encoded string.
 *
 * @param  {String}  name @p
 * @return  {String}
 */
export function patp2dec(name: string): string {
  let bn: BigInteger;
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
  let name: BigInteger;
  try {
    name = patp2bn(who);
  } catch (_) {
    throw new Error('clan: not a valid @p');
  }

  const wid = met(three, name);
  return wid.leq(one)
    ? 'galaxy'
    : wid.eq(two)
    ? 'star'
    : wid.leq(four)
    ? 'planet'
    : wid.leq(bigInt(8))
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
  let who: BigInteger;
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
      ? end(three, one, who)
      : mir === 'planet'
      ? end(four, one, who)
      : mir === 'moon'
      ? end(five, one, who)
      : zero;
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
 * @param  {String, Number, BN}  arg
 * @return  {String}
 */
export function patp(arg: string | number | BigInteger) {
  if (arg === null) {
    throw new Error('patp: null input');
  }
  const n = bigInt(arg as any);

  const sxz = ob.fein(n);
  const dyy = met(four, sxz);

  function loop(tsxz: BigInteger, timp: BigInteger, trep: string): string {
    const log = end(four, one, tsxz);
    const pre = prefixes[rsh(three, one, log).toJSNumber()];
    const suf = suffixes[end(three, one, log).toJSNumber()];
    const etc = timp.mod(four).eq(zero) ? (timp.eq(zero) ? '' : '--') : '-';

    const res = pre + suf + etc + trep;

    return timp.eq(dyy) ? trep : loop(rsh(four, one, tsxz), timp.add(one), res);
  }

  const dyx = met(three, sxz);

  return (
    '~' + (dyx.leq(one) ? suffixes[sxz.toJSNumber()] : loop(sxz, zero, ''))
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
