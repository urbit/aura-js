import { aura } from '../src/types';
import { tryParse as parse, decodeString, nuck, regex } from '../src/parse';
import { INTEGER_AURAS, INTEGER_TESTS,
         IPV4_TESTS, IPV6_TESTS,
         FLOAT_16_TESTS, FLOAT_32_TESTS, FLOAT_64_TESTS, FLOAT_128_TESTS,
         PHONETIC_AURAS, PHONETIC_TESTS,
         DATE_AURAS, DATE_TESTS,
         TIME_AURAS, TIME_TESTS,
         TEXT_AURAS, TEXT_TESTS,
         CHAR_AURAS, CHAR_TESTS,
       } from './data/atoms';

//TODO  test for parse failures: leading zeroes, date out of range, etc
//TODO  test for non-standard-but-accepted cases: leading 0 in hex chars, weird dates, etc.

describe('limited auras', () => {
  describe(`@n parsing`, () => {
    it('parses', () => {
      const res = parse('n', '~');
      expect(res).toEqual(0n);
    });
  });
  describe(`@f parsing`, () => {
    it('parses', () => {
      const yea = parse('f', '.y');
      expect(yea).toEqual(0n);
      const nay = parse('f', '.n');
      expect(nay).toEqual(1n);
    });
  });
});

function testAuras(desc: string, auras: aura[], tests: { n: bigint }[]) {
  describe(`${desc} auras`, () => {
    auras.map((a) => {
      describe(`@${a} parsing`, () => {
        tests.map((test) => {
          // @ts-ignore we know this is sane/safe
          const str = test[a];
          describe(str, () => {
            it('matches regex', () => {
              expect(regex[a].test(str)).toEqual(true);
            });
            it('parses', () => {
              const res = parse(a, str);
              expect(res).toEqual(test.n);
            });
          });
        });
      });
    });
  });
}

//NOTE  we add additional tests to the data:
//      parsing must be liberal and accept formats
//      which the renderer would never produce
const OUR_DATE_TESTS: {
  n: bigint,
  da: string
}[] = [
  ...DATE_TESTS,
  { 'n': 170141183328369385600900416699944140800n,
    'da': '~0.1.1'
  },
  { 'n': 170141184492712641901540060096049971200n,
    'da': '~2000.2.31'
  },
  { 'n': 170141184492615892916284358229892268032n,
    'da': '~2000.1.1..7.7.7'
  },
  { 'n': 170141184492615892916284358229892268032n,
    'da': '~2000.1.1..007.007.007'
  },
  { 'n': 170141184492622106013428863442102517760n,
    'da': '~2000.1.1..99.99.99..abcd'
  },
  { 'n': 170141184492616163050404573632566132736n,
    'da': '~2000.1.1..11.11.11..0000'
  },
  { 'n': 170141184492616163062707000439658774528n,
    'da': '~2000.1.1..11.11.11..aabb.0000'
  }
];
const OUR_TIME_TESTS: {
  n: bigint,
  dr: string
}[] = [
  ...TIME_TESTS,
  { 'n': 9979688543876867424256n,
    'dr': '~m1.m5.s1.m3'
  },
  { 'n': 18446744073709551616n,
    'dr': '~s1..0000'
  },
  { 'n': 18446744073709551616n,
    'dr': '~s1..0000.0000'
  },
  { 'n': 18446744073709551616n,
    'dr': '~d0.h0.s1.m0'
  },
  { 'n': 69059795211765323057332224n,
    'dr': '~d1.h999.m999.s999'
  },
]

testAuras('integer', INTEGER_AURAS, INTEGER_TESTS);
testAuras('ipv4', ['if'], IPV4_TESTS);
testAuras('ipv6', ['is'], IPV6_TESTS);
testAuras('float16',  ['rh'], FLOAT_16_TESTS);
testAuras('float32',  ['rs'], FLOAT_32_TESTS);
testAuras('float64',  ['rd'], FLOAT_64_TESTS);
testAuras('float128', ['rq'], FLOAT_128_TESTS);
testAuras('phonetic', PHONETIC_AURAS, PHONETIC_TESTS);
testAuras('date', DATE_AURAS, OUR_DATE_TESTS);
testAuras('time', TIME_AURAS, OUR_TIME_TESTS);
testAuras('text', [ 't' ], TEXT_TESTS);
testAuras('chars', CHAR_AURAS, CHAR_TESTS);

describe('string decoding', () => {
  it('decodes', () => {
    expect(decodeString('a~62.c')).toEqual('abc');
    expect(decodeString('a~0a.c')).toEqual('a\nc');
    expect(decodeString('~2605.~1f920.yeehaw~1f468.~200d.~1f467.~200d.~1f466.')).toEqual('★🤠yeehaw👨‍👧‍👦');
  });
});

describe('blob parsing', () => {
  it('parses', () => {
    expect(nuck('~02')).toEqual({ type: 'blob', jam: 2n });
    expect(nuck('~097su1g7hk1')).toEqual({ type: 'blob', jam: 325350265702017n });
  });
});

describe('many parsing', () => {
  it('parses', () => {
    expect(nuck('.__')).toEqual({ type: 'many', list: [] });
    expect(
      nuck('._123__')
    ).toEqual(
      { type: 'many', list: [ { type: 'dime', aura: 'ud', atom: 123n }, ] }
    );
    expect(
      nuck('._~~~~a~~42.c_123_~~01hu32s3gu1_.~-1~-2~-~-__')
    ).toEqual({ type: 'many', list: [
      { type: 'dime', aura: 't', atom: 6505057n },
      { type: 'dime', aura: 'ud', atom: 123n },
      { type: 'blob', jam: 54910179722177n },
      { type: 'many', list: [
        { type: 'dime', aura: 'ud', atom: 1n },
        { type: 'dime', aura: 'ud', atom: 2n }
      ] }
    ] });
  });
});

describe('invalid syntax', () => {
  it('fails leading zeroes', () => {
    expect(nuck('00')).toEqual(null);
    expect(nuck('01')).toEqual(null);
    expect(nuck('0b01')).toEqual(null);
  });
  it('fails incomplete atoms', () => {
    expect(nuck('~0')).toEqual(null);
    expect(nuck('~2000.1')).toEqual(null);
  });
  it('fails unescaped characters', () =>{
    expect(nuck('~.aBc')).toEqual(null);
    expect(nuck('._~zod__')).toEqual(null);
    expect(nuck('.123__')).toEqual(null);
  });
  it('fails bogus dates', () => {
    expect(nuck('~2025.1.0')).toEqual(null);
    expect(nuck('~2025.13.1')).toEqual(null);
  });
  it('fails bogus @p or @q', () => {
    expect(nuck('~zad')).toEqual(null);
    expect(nuck('.~zad')).toEqual(null);
    expect(nuck('~zodbin')).toEqual(null);
    expect(nuck('~dozzod')).toEqual(null);
    expect(nuck('.~zodbin')).toEqual(null);
    expect(nuck('~funpal')).toEqual(null);
    expect(nuck('.~funpal')).toEqual(null);
    expect(nuck('~nidsut-dun')).toEqual(null);
    expect(nuck('.~nidsut-dun')).toEqual(null);
    expect(nuck('~mister--dister')).toEqual(null);
    expect(nuck('.~mister--dister')).toEqual(null);
  });
});

describe('oversized inputs', () => {
  it('parses oversized @if', () => {
    expect(parse('if', '.255.0.0.999')).toEqual(0xff0003e7n);
    expect(parse('if', '.255.0.1.999')).toEqual(0xff0004e7n);
    expect(parse('if', '.256.0.0.255')).toEqual(0x1000000ffn);
  });
});

//TODO  oversized floats
