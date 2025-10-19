import { aura, coin } from '../src/types';
import { render, rend } from '../src/render';
import { INTEGER_AURAS, INTEGER_TESTS,
         IPV4_TESTS, IPV6_TESTS,
         FLOAT_16_TESTS, FLOAT_32_TESTS, FLOAT_64_TESTS, FLOAT_128_TESTS,
         PHONETIC_AURAS, PHONETIC_TESTS,
         DATE_AURAS, DATE_TESTS,
         TEXT_AURAS, TEXT_TESTS,
         CHAR_AURAS, CHAR_TESTS,
       } from './data/atoms';

describe('limited auras', () => {
  describe(`@n rendering`, () => {
    it('renders', () => {
      const gud = render('n', 0n);
      expect(gud).toEqual('~');
      const bad = render('n', 1n);
      expect(bad).toEqual('~');
    });
  });
  describe(`@f rendering`, () => {
    it('renders', () => {
      const yea = render('f', 0n);
      expect(yea).toEqual('.y');
      const nay = render('f', 1n);
      expect(nay).toEqual('.n');
      const bad = render('f', 2n);
      expect(bad).toEqual('0x2');
    });
  });
});

function testAuras(desc: string, auras: aura[], tests: { n: bigint }[]) {
  describe(`${desc} auras`, () => {
    auras.map((a) => {
      describe(`@${a} rendering`, () => {
        tests.map((test) => {
          // @ts-ignore we know this is sane/safe
          describe(test[a], () => {
            it('renders', () => {
              const res = render(a, test.n);
              // @ts-ignore we know this is sane/safe
              expect(res).toEqual(test[a]);
            });
          });
        });
      });
    });
  });
}

testAuras('integer', INTEGER_AURAS, INTEGER_TESTS);
testAuras('ipv4', ['if'], IPV4_TESTS);
testAuras('ipv6', ['is'], IPV6_TESTS);
testAuras('float16',  ['rh'], FLOAT_16_TESTS);
testAuras('float32',  ['rs'], FLOAT_32_TESTS);
testAuras('float64',  ['rd'], FLOAT_64_TESTS);
testAuras('float128', ['rq'], FLOAT_128_TESTS);
testAuras('phonetic', PHONETIC_AURAS, PHONETIC_TESTS);
testAuras('date', DATE_AURAS, DATE_TESTS);
testAuras('text', TEXT_AURAS, TEXT_TESTS);
testAuras('chars', CHAR_AURAS, CHAR_TESTS);

const MANY_COINS: {
  coin: coin,
  out: string
}[] = [
  { coin: { type: 'many', list: [] },
    out: '.__'
  },
  { coin: { type: 'many', list: [ { type: 'many', list: [] } ] },
    out: '._.~-~-__'
  },
  { coin: { type: 'many', list: [ { type: 'dime', aura: 'p', atom: 0n }, { type: 'dime', aura: 'ux', atom: 0x1234abcdn } ] },
    out: '._~~zod_0x1234.abcd__'
  },
]
describe('%many coin rendering', () => {
  MANY_COINS.map((test) => {
    describe(test.out, () => {
      it('renders', () => {
        const res = rend(test.coin);
        expect(res).toEqual(test.out);
      });
    });
  });
});

describe('blob rendering', () => {
  it('parses', () => {
    expect(rend({ type: 'blob', jam: 2n })).toEqual('~02');
    expect(rend({ type: 'blob', jam: 325350265702017n })).toEqual('~097su1g7hk1');
  });
});

describe('oversized inputs', () => {
  it('truncates oversized @if', () => {
    expect(render('if', 0x1000000ffn)).toEqual('.0.0.0.255');
  });
  it('truncates oversized @is', () => {
    expect(render('is', 0xaaaaffff000000000000000000000000ffffn)).toEqual('.ffff.0.0.0.0.0.0.ffff');
  });
});
