import { isValidPat, prefixes, suffixes } from './hoon';
import { chunk, splitAt } from './utils';  //TODO  inline

//TODO  investigate whether native UintArrays are more portable
//      than node Buffers

/**
 * Convert a number to a @q-encoded string.
 *
 * @param  {String, Number, bigint}  arg
 * @return  {String}
 */
export function renderQ(num: bigint): string {
  //NOTE  stupid hack to work around bad node Buffer spec
  const hex = num.toString(16);
  const lex = hex.length;
  const buf = Buffer.from(hex.padStart(lex+lex%2, '0'), 'hex');
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
    (acc, elem) => acc + (acc === '.~' ? '' : '-') + alg(elem),
    '.~'
  );
}

/**
 * Convert a @q-encoded string to a bigint
 *
 * @param  {String}  name @q
 * @return  {String}
 */
export function parseQ(str: string): bigint {
  const chunks = str.slice(2).split('-');
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

  return BigInt('0x' + (str.length === 0 ? '00' : splat.join('')));
}

export function parseValidQ(str: string): bigint | null {
  try {
    const num = parseQ(str);
    return num;
  } catch (e) {
    return null;
  }
}

/**
 * Validate a @q string.
 *
 * @param  {String}  str a string
 * @return  {boolean}
 */
export function isValidQ(str: string): boolean {
  if (str === '') return false;
  try {
    parseQ(str);
    return true;
  } catch (e) {
    return false;
  }
};
