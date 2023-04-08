import bigInt, { BigInteger } from 'big-integer';
import { isValidPat, prefixes, suffixes } from './hoon';
import { chunk, splitAt } from './utils';

/**
 * Convert a number to a @q-encoded string.
 *
 * @param  {String, Number, BN}  arg
 * @return  {String}
 */
export function patq(arg: string | number | BigInteger) {
  const bn = bigInt(arg as any);
  const buf = Buffer.from(bn.toArray(256).value);
  return buf2patq(buf);
}

/**
 * Convert a Buffer into a @q-encoded string.
 *
 * @param  {Buffer}  buf
 * @return  {String}
 */
function buf2patq(buf: Buffer): string {
  const chunked =
    buf.length % 2 !== 0 && buf.length > 1
      ? [[buf[0]]].concat(chunk(Array.from(buf.slice(1)), 2))
      : chunk(Array.from(buf), 2);

  const prefixName = (byts: number[]) =>
    byts[1] === undefined
      ? prefixes[0] + suffixes[byts[0]]
      : prefixes[byts[0]] + suffixes[byts[1]];

  const name = (byts: number[]) =>
    byts[1] === undefined
      ? suffixes[byts[0]]
      : prefixes[byts[0]] + suffixes[byts[1]];

  const alg = (pair: number[]) =>
    pair.length % 2 !== 0 && chunked.length > 1 ? prefixName(pair) : name(pair);

  return chunked.reduce(
    (acc, elem) => acc + (acc === '~' ? '' : '-') + alg(elem),
    '~'
  );
}

/**
 * Convert a hex-encoded string to a @q-encoded string.
 *
 * Note that this preserves leading zero bytes.
 *
 * @param  {String}  hex
 * @return  {String}
 */
export function hex2patq(arg: string): string {
  const hex = arg.length % 2 !== 0 ? arg.padStart(arg.length + 1, '0') : arg;

  const buf = Buffer.from(hex, 'hex');
  return buf2patq(buf);
}

/**
 * Convert a @q-encoded string to a hex-encoded string.
 *
 * Note that this preserves leading zero bytes.
 *
 * @param  {String}  name @q
 * @return  {String}
 */
export function patq2hex(name: string): string {
  if (isValidPat(name) === false) {
    throw new Error('patq2hex: not a valid @q');
  }
  const chunks = name.slice(1).split('-');
  const dec2hex = (dec: number) => dec.toString(16).padStart(2, '0');

  const splat = chunks.map(chunk => {
    let syls = splitAt(3, chunk);
    return syls[1] === ''
      ? dec2hex(suffixes.indexOf(syls[0]))
      : dec2hex(prefixes.indexOf(syls[0])) + dec2hex(suffixes.indexOf(syls[1]));
  });

  return name.length === 0 ? '00' : splat.join('');
}

/**
 * Convert a @q-encoded string to a bignum.
 *
 * @param  {String}  name @q
 * @return  {BigInteger}
 */
export const patq2bn = (name: string): BigInteger => bigInt(patq2hex(name), 16);

/**
 * Convert a @q-encoded string to a decimal-encoded string.
 *
 * @param  {String}  name @q
 * @return  {String}
 */
export function patq2dec(name: string): string {
  let bn: BigInteger;
  try {
    bn = patq2bn(name);
  } catch (_) {
    throw new Error('patq2dec: not a valid @q');
  }
  return bn.toString();
}

/**
 * Validate a @q string.
 *
 * @param  {String}  str a string
 * @return  {boolean}
 */
export const isValidPatq = (str: string): boolean =>
  isValidPat(str) && eqPatq(str, patq(patq2dec(str)));

/**
 * Remove all leading zero bytes from a sliceable value.
 * @param  {String}
 * @return  {String}
 */
const removeLeadingZeroBytes = (str: string): string =>
  str.slice(0, 2) === '00' ? removeLeadingZeroBytes(str.slice(2)) : str;

/**
 * Equality comparison, modulo leading zero bytes.
 * @param  {String}
 * @param  {String}
 * @return  {Bool}
 */
const eqModLeadingZeroBytes = (s: string, t: string): boolean =>
  removeLeadingZeroBytes(s) === removeLeadingZeroBytes(t);

/**
 * Equality comparison on @q values.
 * @param  {String}  p a @q-encoded string
 * @param  {String}  q a @q-encoded string
 * @return  {Bool}
 */
export function eqPatq(p: string, q: string): boolean {
  let phex;
  try {
    phex = patq2hex(p);
  } catch (_) {
    throw new Error('eqPatq: not a valid @q');
  }

  let qhex;
  try {
    qhex = patq2hex(q);
  } catch (_) {
    throw new Error('eqPatq: not a valid @q');
  }

  return eqModLeadingZeroBytes(phex, qhex);
}
