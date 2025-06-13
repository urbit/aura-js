import { render, aura, coin, rend } from '../src/render';

//  most test cases generated from snippets similar to the following:
//
//    =|  n=@ud
//    ^-  (list [n=@ui =@ub =@ud =@ui =@uv =@uw =@ux =@p =@q])
//    %-  zing
//    |-  ^-  (list (list [n=@ui =@ub =@ud =@ui =@uv =@uw =@ux =@p =@q]))
//    ?:  (gth n 5)  ~
//    :_  $(n +(n), eny (shaz +(eny)))
//    :-  [. . . . . . .]:(end 2^(bex n) eny)
//    =.  eny  (shaz eny)
//    :-  [. . . . . . .]:(end 2^(bex n) eny)
//    =.  eny  (shaz eny)
//    [. . . . . . .]~:(end 2^(bex n) eny)
//

describe('limited auras', () => {
  describe(`@n rendering`, () => {
    it('renders', () => {
      const gud = render('n', 0n);
      expect(gud).toEqual('~');
      const bad = render('n', 1n);
      expect(bad).toEqual('~');
    });
  });
  describe(`@f parsing`, () => {
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

const INTEGER_AURAS: aura[] = [
  'ub', 'ud', 'ui', 'uv', 'uw', 'ux',
  'sb', 'sd', 'si', 'sv', 'sw', 'sx'
];
const INTEGER_TESTS: {
  n:  bigint,
  ub: string,
  ud: string,
  ui: string,
  uv: string,
  uw: string,
  ux: string,
  sb: string,
  sd: string,
  si: string,
  sv: string,
  sw: string,
  sx: string,
}[] = [
  { 'n':  0n,
    'ub': '0b0',
    'ud': '0',
    'ui': '0i0',
    'uv': '0v0',
    'uw': '0w0',
    'ux': '0x0',
    'sb': '--0b0',
    'sd': '--0',
    'si': '--0i0',
    'sv': '--0v0',
    'sw': '--0w0',
    'sx': '--0x0',
  },
  { 'n':  7n,
    'ub': '0b111',
    'ud': '7',
    'ui': '0i7',
    'uv': '0v7',
    'uw': '0w7',
    'ux': '0x7',
    'sb': '-0b100',
    'sd': '-4',
    'si': '-0i4',
    'sv': '-0v4',
    'sw': '-0w4',
    'sx': '-0x4',
  },
  { 'n':  5n,
    'ub': '0b101',
    'ud': '5',
    'ui': '0i5',
    'uv': '0v5',
    'uw': '0w5',
    'ux': '0x5',
    'sb': '-0b11',
    'sd': '-3',
    'si': '-0i3',
    'sv': '-0v3',
    'sw': '-0w3',
    'sx': '-0x3',
  },
  { 'n':  4n,
    'ub': '0b100',
    'ud': '4',
    'ui': '0i4',
    'uv': '0v4',
    'uw': '0w4',
    'ux': '0x4',
    'sb': '--0b10',
    'sd': '--2',
    'si': '--0i2',
    'sv': '--0v2',
    'sw': '--0w2',
    'sx': '--0x2',
  },
  { 'n':  171n,
    'ub': '0b1010.1011',
    'ud': '171',
    'ui': '0i171',
    'uv': '0v5b',
    'uw': '0w2H',
    'ux': '0xab',
    'sb': '-0b101.0110',
    'sd': '-86',
    'si': '-0i86',
    'sv': '-0v2m',
    'sw': '-0w1m',
    'sx': '-0x56',
  },
  { 'n':  53n,
    'ub': '0b11.0101',
    'ud': '53',
    'ui': '0i53',
    'uv': '0v1l',
    'uw': '0wR',
    'ux': '0x35',
    'sb': '-0b1.1011',
    'sd': '-27',
    'si': '-0i27',
    'sv': '-0vr',
    'sw': '-0wr',
    'sx': '-0x1b',
  },
  { 'n':  77n,
    'ub': '0b100.1101',
    'ud': '77',
    'ui': '0i77',
    'uv': '0v2d',
    'uw': '0w1d',
    'ux': '0x4d',
    'sb': '-0b10.0111',
    'sd': '-39',
    'si': '-0i39',
    'sv': '-0v17',
    'sw': '-0wD',
    'sx': '-0x27',
  },
  { 'n':  64491n,
    'ub': '0b1111.1011.1110.1011',
    'ud': '64.491',
    'ui': '0i64491',
    'uv': '0v1uvb',
    'uw': '0wfLH',
    'ux': '0xfbeb',
    'sb': '-0b111.1101.1111.0110',
    'sd': '-32.246',
    'si': '-0i32246',
    'sv': '-0vvfm',
    'sw': '-0w7TS',
    'sx': '-0x7df6',
  },
  { 'n':  51765n,
    'ub': '0b1100.1010.0011.0101',
    'ud': '51.765',
    'ui': '0i51765',
    'uv': '0v1ihl',
    'uw': '0wcER',
    'ux': '0xca35',
    'sb': '-0b110.0101.0001.1011',
    'sd': '-25.883',
    'si': '-0i25883',
    'sv': '-0vp8r',
    'sw': '-0w6kr',
    'sx': '-0x651b',
  },
  { 'n':  46444n,
    'ub': '0b1011.0101.0110.1100',
    'ud': '46.444',
    'ui': '0i46444',
    'uv': '0v1dbc',
    'uw': '0wblI',
    'ux': '0xb56c',
    'sb': '--0b101.1010.1011.0110',
    'sd': '--23.222',
    'si': '--0i23222',
    'sv': '--0vmlm',
    'sw': '--0w5GS',
    'sx': '--0x5ab6',
  },
  { 'n':  384265565n,
    'ub': '0b1.0110.1110.0111.0110.1101.0101.1101',
    'ud': '384.265.565',
    'ui': '0i384265565',
    'uv': '0vb.eerat',
    'uw': '0wmVSRt',
    'ux': '0x16e7.6d5d',
    'sb': '-0b1011.0111.0011.1011.0110.1010.1111',
    'sd': '-192.132.783',
    'si': '-0i192132783',
    'sv': '-0v5.n7dlf',
    'sw': '-0wbsXqL',
    'sx': '-0xb73.b6af',
  },
  { 'n':  2456897374n,
    'ub': '0b1001.0010.0111.0001.0100.0111.0101.1110',
    'ud': '2.456.897.374',
    'ui': '0i2456897374',
    'uv': '0v29.72hqu',
    'uw': '0w2.isktu',
    'ux': '0x9271.475e',
    'sb': '--0b100.1001.0011.1000.1010.0011.1010.1111',
    'sd': '--1.228.448.687',
    'si': '--0i1228448687',
    'sv': '--0v14.jh8tf',
    'sw': '--0w1.9eaeL',
    'sx': '--0x4938.a3af',
  },
  { 'n':  38583115n,
    'ub': '0b10.0100.1100.1011.1011.0100.1011',
    'ud': '38.583.115',
    'ui': '0i38583115',
    'uv': '0v1.4peqb',
    'uw': '0w2jbJb',
    'ux': '0x24c.bb4b',
    'sb': '-0b1.0010.0110.0101.1101.1010.0110',
    'sd': '-19.291.558',
    'si': '-0i19291558',
    'sv': '-0vicnd6',
    'sw': '-0w19BSC',
    'sx': '-0x126.5da6',
  },
  { 'n':  13604104043154737885n,
    'ub': '0b1011.1100.1100.1011.0111.1100.1000.1100.1011.0011.1011.0001.1000.1010.1101.1101',
    'ud': '13.604.104.043.154.737.885',
    'ui': '0i13604104043154737885',
    'uv': '0vbpi.rship.r32mt',
    'uw': '0wb.Pbv8O.PIoHt',
    'ux': '0xbccb.7c8c.b3b1.8add',
    'sb': '-0b101.1110.0110.0101.1011.1110.0100.0110.0101.1001.1101.1000.1100.0101.0110.1111',
    'sd': '-6.802.052.021.577.368.943',
    'si': '-0i6802052021577368943',
    'sv': '-0v5sp.du8pc.thhbf',
    'sw': '-0w5.VBLAp.pSclL',
    'sx': '-0x5e65.be46.59d8.c56f',
  },
  { 'n':  18441444580797368868n,
    'ub': '0b1111.1111.1110.1101.0010.1100.0010.0011.1010.0111.0111.1010.1100.1010.0010.0100',
    'ud': '18.441.444.580.797.368.868',
    'ui': '0i18441444580797368868',
    'uv': '0vfvr.9c4ej.nlih4',
    'uw': '0wf.~Jb2e.DuIEA',
    'ux': '0xffed.2c23.a77a.ca24',
    'sb': '--0b111.1111.1111.0110.1001.0110.0001.0001.1101.0011.1011.1101.0110.0101.0001.0010',
    'sd': '--9.220.722.290.398.684.434',
    'si': '--0i9220722290398684434',
    'sv': '--0v7vt.km279.rqp8i',
    'sw': '--0w7.~SBx7.jLmki',
    'sx': '--0x7ff6.9611.d3bd.6512',
  },
  { 'n':  7643844662312245512n,
    'ub': '0b110.1010.0001.0100.0110.0100.0011.1000.1011.0111.0110.0011.0001.1001.0000.1000',
    'ud': '7.643.844.662.312.245.512',
    'ui': '0i7643844662312245512',
    'uv': '0v6k5.3472r.m6688',
    'uw': '0w6.Ekp3y.ToNA8',
    'ux': '0x6a14.6438.b763.1908',
    'sb': '--0b11.0101.0000.1010.0011.0010.0001.1100.0101.1011.1011.0001.1000.1100.1000.0100',
    'sd': '--3.821.922.331.156.122.756',
    'si': '--0i3821922331156122756',
    'sv': '--0v3a2.hi3hd.r3344',
    'sw': '--0w3.kacxN.rIoO4',
    'sx': '--0x350a.321c.5bb1.8c84',
  },
  { 'n':  293389376720547819362821033486028091527n,
    'ub': '0b1101.1100.1011.1000.1011.1101.0001.0100.1101.0100.1111.1101.1011.1110.0011.0111.1001.0011.1100.0000.1000.1110.0100.1000.0111.0011.1010.1111.1011.0000.1000.0111',
    'ud': '293.389.376.720.547.819.362.821.033.486.028.091.527',
    'ui': '0i293389376720547819362821033486028091527',
    'uv': '0v6.sn2uh.9l7tn.orp7g.4e91p.qvc47',
    'uw': '0w3s.KbQkR.fS-dV.f0zAx.PHX27',
    'ux': '0xdcb8.bd14.d4fd.be37.93c0.8e48.73af.b087',
    'sb': '-0b110.1110.0101.1100.0101.1110.1000.1010.0110.1010.0111.1110.1101.1111.0001.1011.1100.1001.1110.0000.0100.0111.0010.0100.0011.1001.1101.0111.1101.1000.0100.0100',
    'sd': '-146.694.688.360.273.909.681.410.516.743.014.045.764',
    'si': '-0i146694688360273909681410516743014045764',
    'sv': '-0v3.ebhf8.kqjur.sdsjo.274gs.tfm24',
    'sw': '-0w1K.n5Waq.DXv6Y.DwhOg.VRZx4',
    'sx': '-0x6e5c.5e8a.6a7e.df1b.c9e0.4724.39d7.d844',
  },
  { 'n':  11826418988767709295206418976840492314n,
    'ub': '0b1000.1110.0101.1010.1111.0111.1001.0110.1100.1000.1101.1010.0001.1100.0011.1111.0000.1011.0001.0001.1010.0111.0011.1111.0001.1101.0110.0010.0101.0001.1010',
    'ud': '11.826.418.988.767.709.295.206.418.976.840.492.314',
    'ui': '0i11826418988767709295206418976840492314',
    'uv': '0v8smnn.ir4dk.71v1c.8qefo.tc98q',
    'uw': '0w8.VqZVr.8SxM~.2N6Df.NRykq',
    'ux': '0x8e5.af79.6c8d.a1c3.f0b1.1a73.f1d6.251a',
    'sb': '--0b100.0111.0010.1101.0111.1011.1100.1011.0110.0100.0110.1101.0000.1110.0001.1111.1000.0101.1000.1000.1101.0011.1001.1111.1000.1110.1011.0001.0010.1000.1101',
    'sd': '--5.913.209.494.383.854.647.603.209.488.420.246.157',
    'si': '--0i5913209494383854647603209488420246157',
    'sv': '--0v4ebbr.pdi6q.3gvgm.4d77s.em4kd',
    'sw': '--0w4.sJuYJ.ArgUv.xozjD.UWNad',
    'sx': '--0x472.d7bc.b646.d0e1.f858.8d39.f8eb.128d',
  },
  { 'n':  75341289328899252391918368331716799250n,
    'ub': '0b11.1000.1010.1110.0011.0100.0101.1011.0011.0101.0100.1101.1100.0101.0101.1100.0100.0110.1001.0001.0011.0110.0100.0111.0111.1011.0010.1110.1010.1011.0001.0010',
    'ud': '75.341.289.328.899.252.391.918.368.331.716.799.250',
    'ui': '0i75341289328899252391918368331716799250',
    'uv': '0v1.oloq5.mdado.le4d4.9m8tt.itaoi',
    'uw': '0wU.Hzhrd.kT5n4.qhdAt.XbGIi',
    'ux': '0x38ae.345b.354d.c55c.4691.3647.7b2e.ab12',
  },
];
testAuras('integer', INTEGER_AURAS, INTEGER_TESTS);

//  test cases generated in similar fashion as the integer aura tests

const PHONETIC_AURAS: aura[] = [ 'p', 'q' ];
const PHONETIC_TESTS: {
  n: bigint,
  p: string,
  q: string
}[] = [
  { 'n': 7n,   'p': '~let', 'q': '.~let' },
  { 'n': 0n,   'p': '~zod', 'q': '.~zod' },
  { 'n': 8n,   'p': '~ful', 'q': '.~ful' },
  { 'n': 117n, 'p': '~deg', 'q': '.~deg' },
  { 'n': 83n,  'p': '~tev', 'q': '.~tev' },
  { 'n': 223n, 'p': '~lud', 'q': '.~lud' },
  { 'n': 39995n, 'p': '~hapwyc', 'q': '.~hapwyc' },
  { 'n': 50426n, 'p': '~mitrep', 'q': '.~mitrep' },
  { 'n': 11415n, 'p': '~torryx', 'q': '.~torryx' },
  { 'n': 1863930458n, 'p': '~mogteg-botfex', 'q': '.~ligput-motfus' },
  { 'n': 3284934632n, 'p': '~loplet-nosnyx', 'q': '.~fasryd-mirlyn' },
  { 'n': 3833668n,    'p': '~nidmes-samrut', 'q': '.~sef-palsub' },
  { 'n': 9260427482306755094n,
    'p': '~lasrum-pindyt-nimnym-fotmeg',
    'q': '.~lasrum-pindyt-tadtem-lodlup',
  },
  { 'n': 6363574354411289343n,
    'p': '~nopnet-rostem-navteb-fodbep',
    'q': '.~nopnet-rostem-nimfel-monfes',
  },
  { 'n': 17571387016818844998n,
    'p': '~namler-folwet-bictes-wormec',
    'q': '.~namler-folwet-samwet-sarrul',
  },
  { 'n': 241760151623976361741451001031931477015n,
    'p': '~dablys-minwed-mosreb-mictyn--nostyv-nimdul-hanbyl-bisdep',
    'q': '.~dablys-minwed-mosreb-mictyn-nostyv-nimdul-hanbyl-bisdep',
  },
  { 'n': 148310954517291502180858368907816435627n,
    'p': '~ligryn-lomnem-fintes-davsyr--pacdel-wolpex-ripdev-paldeb',
    'q': '.~ligryn-lomnem-fintes-davsyr-pacdel-wolpex-ripdev-paldeb',
  },
  { 'n': 97100713129464593177912155425728457718n,
    'p': '~tipwep-danner-minlyx-posned--mapmun-matlud-sitreb-balweg',
    'q': '.~tipwep-danner-minlyx-posned-mapmun-matlud-sitreb-balweg',
  },
  //  with zero bytes
  { 'n': 3833668n,
    'p': '~nidmes-samrut',
    'q': '.~sef-palsub'
  },
  { 'n': 319478973361751151n,
    'p': '~sampel-sampel-lacwyl-tirder',
    'q': '.~sampel-sampel-dozpel-sampel',
  },
  { 'n': 319478973354476655n,
    'p': '~sampel-sampel-dozzod-sampel',
    'q': '.~sampel-sampel-dozzod-sampel',
  },
];
testAuras('phonetic', PHONETIC_AURAS, PHONETIC_TESTS);

const DATE_AURAS: aura[] = [ 'da' ];
const DATE_TESTS: {
  n: bigint,
  da: string
}[] = [
  { 'n': 170141184492615420181573981275213004800n,
    'da': '~2000.1.1'
  },
  { 'n': 170141182164706681340023325049697075200n,
    'da': '~2000-.1.1'
  },
  { 'n': 170141183328369385600900416699944140800n,
    'da': '~1-.1.1'
  },
  { 'n': 170141183328369385600900416699944140800n,
    'da': '~1-.1.1'
  },
  { 'n': 170213050367437966468743593413155225600n,
    'da': '~123456789.12.12'
  },
  { 'n': 170141184507170056208381036660470579200n,
    'da': '~2025.1.1..01.00.00'
  },
  { 'n': 170141184492615892916284358229892268032n,
    'da': '~2000.1.1..07.07.07'
  },
  { 'n': 170141184492616163050404573632566132736n,
    'da': '~2000.1.1..11.11.11'
  },
  { 'n': 170141184492616163050404761352701739008n,
    'da': '~2000.1.1..11.11.11..0000.aabb'
  },
  { 'n': 170141184492616163062707000439658774528n,
    'da': '~2000.1.1..11.11.11..aabb'
  },
  { 'n': 170141184492615487727406687186543706111n,
    'da': '~2000.1.1..01.01.01..aabb.ccdd.eeff.ffff'
  }
];
testAuras('date', DATE_AURAS, DATE_TESTS);

const TEXT_AURAS: aura[] = [ 'tas', 'ta', 't' ];
const TEXT_TESTS: {
  n: bigint,
  tas: string,
  ta: string,
  t: string
}[] = [
  { n: 0n,
    tas: '',
    ta: '~.',
    t: '~~'
  },
  { n: 97n,
    tas: 'a',
    ta: '~.a',
    t: '~~a'
  },
  { n: 121404708502375659064812904n,
    tas: 'hello-world',
    ta: '~.hello-world',
    t: '~~hello-world'
  },
  { n: 10334410032597741434076685640n,
    tas: 'Hello World!',
    ta: '~.Hello World!',
    t: '~~~48.ello.~57.orld~21.'
  },
  { n: 294301677938177654314463611973797746852183254758760570046179940746240825570n,
    tas: '★🤠yeehaw👨‍👧‍👦',
    ta: '~.★🤠yeehaw👨‍👧‍👦',
    t: '~~~2605.~1f920.yeehaw~1f468.~200d.~1f467.~200d.~1f466.'
  }
];
testAuras('text', TEXT_AURAS, TEXT_TESTS);


const CHAR_AURAS: aura[] = [ 'c' ];
const CHAR_TESTS: { n: bigint, c: string }[] = [
  { n: 129312n, c: '~-~1f920.' },
  { n: 128104n, c: '~-~1f468.' },
  { n: 8205n, c: '~-~200d.' },
  { n: 128103n, c: '~-~1f467.' },
  { n: 8205n, c: '~-~200d.' },
  { n: 128102n, c: '~-~1f466.' },
  { n: 97n, c: '~-a' },
  { n: 33n, c: '~-~21.' },
  { n: 32n, c: '~-.' },
  { n: 126n, c: '~-~~' },
  { n: 46n, c: '~-~.' },
  { n: 1548n, c: '~-~60c.' },
  //  the cases below are deranged, because the input is deranged.
  //  @c represents utf-32 codepoints, so if you give it not-utf-32
  //  it will render bogus, drop bytes in the rendering, etc.
  //  we include them (disabled) here to indicate that we don't have 100%
  //  exact stdlib parity here, but in practice that shouldn't matter.
  // { n: 478560413032n, c: '~-~c6568.o' },  //  'hello'
  // { n: 36762444129640n, c: '~-~c6568.~216f.' }  //  'hello!'
];
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
