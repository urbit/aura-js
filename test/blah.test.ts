import { formatDa, parseDa } from '../src';
import bigInt, { BigInteger } from 'big-integer';

const DA_PAIRS: [string, BigInteger][] = [
  [
    '~2022.5.2..15.50.20..b4cb',
    bigInt('170141184505617087925707667943685357568'),
  ],
];
describe('@da', () => {
  DA_PAIRS.map(([da, integer], idx) => {
    describe(`case ${idx}`, () => {
      it('parses', () => {
        const res = parseDa(da);
        const diff = integer.minus(res);
        console.log(diff.toString());
        expect(diff.eq(bigInt.zero)).toBe(true);
      });
      it('formats', () => {
        const res = formatDa(integer);
        expect(res).toEqual(da);
      });
    });
  });

  describe('case one', () => {});
});
