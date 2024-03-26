import { chunk } from './utils';

/**
 * Given a string representing a @ud, returns a bigint
 *
 * @param   {string}      ud  the number as @ud
 * @return  {bigint}          the number as bigint
 */
export function parseUd(ud: string): bigint {
  return BigInt(ud.replace(/\./g, ''));
}

/**
 * Given a bigint representing a @ud, returns a proper @ud as string
 *
 * @param  {bigint}     ud  the number as bigint
 * @return {string}         the number as @ud
 */
export function formatUd(ud: bigint): string {
  const transform = chunk(ud.toString().split('').reverse(), 3)
    .map((group) => group.reverse().join(''))
    .reverse()
    .join('.');
  return transform.replace(/^[0\.]+/g, '');
}
