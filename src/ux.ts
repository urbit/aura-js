import { dropWhile, chunk } from './utils';

/**
 * Given a string representing a @ux, returns a string in hex
 *
 * @param   {string}      ux  the number as @ux
 * @return  {string}          the number as hex
 */
export function parseUx(ux: string) {
  return ux.replace('0x', '').replace('.', '');
}

/**
 * Given a string representing hex, returns a proper @ux
 *
 * @param   {string}      hex  the number as hex
 * @return  {string}           the number as hex
 */
export const formatUx = (hex: string): string => {
  const nonZeroChars = dropWhile(hex.split(''), (y) => y === '0');
  const ux =
    chunk(nonZeroChars.reverse(), 4)
      .map((x) => {
        return x.reverse().join('');
      })
      .reverse()
      .join('.') || '0';

  return `0x${ux}`;
};
