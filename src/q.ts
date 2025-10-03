import { isValidPat, prefixes, suffixes } from './hoon';
import { chunk, splitAt } from './utils';

//NOTE  the logic in this file has not yet been updated for the latest broader
//      aura-js implementation style. but We Make It Work™.

//TODO  investigate whether native UintArrays are more portable
//      than node Buffers

/**
 * Convert a number to a @q-encoded string.
 *
 * @param  {String, Number, bigint}  arg
 * @return  {String}
 */
export function patq(arg: string | number | bigint) {
  const bn = BigInt(arg);
  //NOTE  stupid hack to work around bad node Buffer spec
  const hex = bn.toString(16);
  const lex = hex.length;
  const buf = Buffer.from(hex.padStart(lex+lex%2, '0'), 'hex');
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
      ? suffixes[byts[0]]
      : prefixes[byts[0]] + suffixes[byts[1]];  //TODO  this branch unused

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
  const chunks = name.slice(1).split('-');
  const dec2hex = (dec: number) => {
    if (dec < 0) throw new Error('malformed @q');
    return dec.toString(16).padStart(2, '0');
  }

  const splat = chunks.map((chunk, i) => {
    let syls = splitAt(3, chunk);
    return (syls[1] === '' && i === 0)  //  singles only at the start
      ? dec2hex(suffixes.indexOf(syls[0]))
      : dec2hex(prefixes.indexOf(syls[0])) + dec2hex(suffixes.indexOf(syls[1]));
  });

  return name.length === 0 ? '00' : splat.join('');
}

/**
 * Convert a @q-encoded string to a bignum.
 *
 * @param  {String}  name @q
 * @return  {bigint}
 */
export const patq2bn = (name: string): bigint => BigInt('0x'+patq2hex(name));

/**
 * Convert a @q-encoded string to a decimal-encoded string.
 *
 * @param  {String}  name @q
 * @return  {String}
 */
export function patq2dec(name: string): string {
  let bn: bigint;
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
export const isValidPatq = (str: string): boolean => {
  if (str === '') return false;
  try { return eqPatq(str, patq(patq2dec(str))); } catch (e) { return false; }
};

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
