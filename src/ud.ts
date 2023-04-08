import bigInt, { BigInteger } from 'big-integer';
import { chunk } from './utils';

/**
 * Given a string representing a @ud, returns a bigint
 *
 * @param   {string}      ud  the number as @ud
 * @return  {BigInteger}      the number as bigint
 */
export function parseUd(ud: string): BigInteger {
  return bigInt(ud.replace(/\./g, ''));
}

/**
 * Given a bigint representing a @ud, returns a proper @ud as string
 *
 * @param  {BigInteger} ud  the number as bigint
 * @return {string}         the number as @ud
 */
export function formatUd(ud: BigInteger): string {
  const transform = chunk(
    ud
      .toString()
      .split('')
      .reverse(),
    3
  )
    .map(group => group.reverse().join(''))
    .reverse()
    .join('.');
  return transform.replace(/^[0\.]+/g, '');
}
