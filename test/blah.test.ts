import { formatDa, parseDa } from '../src';
import bigInt, { BigInteger } from 'big-integer';

const DA_PAIRS: [string, BigInteger][] = [
  [
    '~2022.5.2..15.50.20..b4cb',
    bigInt('170141184505617087925707667943685357568'),
  ],
  [
    '~2022.5.2..18.52.34..8166.240c.0635.b423',
    bigInt('170141184505617289618704043249403016227'),
  ],
];
describe('@da', () => {
  DA_PAIRS.map(([da, integer], idx) => {
    describe(`case ${idx}`, () => {
      it('parses', () => {
        const res = parseDa(da);
        const diff = integer.minus(res);
        expect(diff.eq(bigInt.zero)).toBe(true);
      });
      it('formats', () => {
        const res = formatDa(integer);
        expect(res).toEqual(da);
      });
    });
  });
});
