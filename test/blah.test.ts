import { formatDa, formatUw, parseDa } from '../src';
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
describe('@uw', () => {
  it('formats', () => {
    let num = bigInt(1234);
    let res = '0wji';
    expect(formatUw(num)).toBe(res);
  });
  it('formats two', () => {
    let num = bigInt(
      '9.729.869.760.580.312.915.057.700.420.931.106.632.029.212.932.045.019.789.366.559.593.013.069.886.734.510.969.807.231.346.927.570.172.527.456.683.282.759.587.841.913.712.910.138.850.310.449.267.827.527.286'
        .split('.')
        .join('')
    );
    let res =
      '0w2.VNFPq.zLWXr.mHG98.cOSaU.jD-HK.WOAEW.icKX-.-UOti.RrLxM.BEdKI.U8j~T.rgqLe.HuVVm.m5aDi.FcUj0.z-9H9.PWYVS';
    expect(formatUw(num)).toBe(res);
  });
});
