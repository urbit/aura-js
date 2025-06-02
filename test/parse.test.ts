import { parse, aura } from '../src/parse';

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

//TODO  test for parse failures: leading zeroes, date out of range, etc
//TODO  test for non-standard-but-accepted cases: leading 0 in hex chars, weird dates, etc.

function testAuras(desc: string, auras: aura[], tests: { n: bigint }[]) {
  describe(`${desc} auras`, () => {
    auras.map((a) => {
      describe(`@${a} parsing`, () => {
        tests.map((test) => {
          // @ts-ignore we know this is sane/safe
          describe(test[a], () => {
            it('parses', () => {
              // @ts-ignore we know this is sane/safe
              const res = parse(a, test[a]);
              expect(res).toEqual(test.n);
            })
          });
        });
      });
    });
  });
}

const INTEGER_AURAS: aura[] = [ 'ub', 'ud', 'ui', 'uv', 'uw', 'ux' ];
const INTEGER_TESTS: {
  n:  bigint,
  ub: string,
  ud: string,
  ui: string,
  uv: string,
  uw: string,
  ux: string,
}[] = [
  { 'n':  0n,
    'ub': '0b0',
    'ud': '0',
    'ui': '0i0',
    'uv': '0v0',
    'uw': '0w0',
    'ux': '0x0',
  },
  { 'n':  7n,
    'ub': '0b111',
    'ud': '7',
    'ui': '0i7',
    'uv': '0v7',
    'uw': '0w7',
    'ux': '0x7',
  },
  { 'n':  5n,
    'ub': '0b101',
    'ud': '5',
    'ui': '0i5',
    'uv': '0v5',
    'uw': '0w5',
    'ux': '0x5',
  },
  { 'n':  4n,
    'ub': '0b100',
    'ud': '4',
    'ui': '0i4',
    'uv': '0v4',
    'uw': '0w4',
    'ux': '0x4',
  },
  { 'n':  171n,
    'ub': '0b1010.1011',
    'ud': '171',
    'ui': '0i171',
    'uv': '0v5b',
    'uw': '0w2H',
    'ux': '0xab',
  },
  { 'n':  53n,
    'ub': '0b11.0101',
    'ud': '53',
    'ui': '0i53',
    'uv': '0v1l',
    'uw': '0wR',
    'ux': '0x35',
  },
  { 'n':  77n,
    'ub': '0b100.1101',
    'ud': '77',
    'ui': '0i77',
    'uv': '0v2d',
    'uw': '0w1d',
    'ux': '0x4d',
  },
  { 'n':  64491n,
    'ub': '0b1111.1011.1110.1011',
    'ud': '64.491',
    'ui': '0i64491',
    'uv': '0v1uvb',
    'uw': '0wfLH',
    'ux': '0xfbeb',
  },
  { 'n':  51765n,
    'ub': '0b1100.1010.0011.0101',
    'ud': '51.765',
    'ui': '0i51765',
    'uv': '0v1ihl',
    'uw': '0wcER',
    'ux': '0xca35',
  },
  { 'n':  46444n,
    'ub': '0b1011.0101.0110.1100',
    'ud': '46.444',
    'ui': '0i46444',
    'uv': '0v1dbc',
    'uw': '0wblI',
    'ux': '0xb56c',
  },
  { 'n':  384265565n,
    'ub': '0b1.0110.1110.0111.0110.1101.0101.1101',
    'ud': '384.265.565',
    'ui': '0i384265565',
    'uv': '0vb.eerat',
    'uw': '0wmVSRt',
    'ux': '0x16e7.6d5d',
  },
  { 'n':  2456897374n,
    'ub': '0b1001.0010.0111.0001.0100.0111.0101.1110',
    'ud': '2.456.897.374',
    'ui': '0i2456897374',
    'uv': '0v29.72hqu',
    'uw': '0w2.isktu',
    'ux': '0x9271.475e',
  },
  { 'n':  38583115n,
    'ub': '0b10.0100.1100.1011.1011.0100.1011',
    'ud': '38.583.115',
    'ui': '0i38583115',
    'uv': '0v1.4peqb',
    'uw': '0w2jbJb',
    'ux': '0x24c.bb4b',
  },
  { 'n':  13604104043154737885n,
    'ub': '0b1011.1100.1100.1011.0111.1100.1000.1100.1011.0011.1011.0001.1000.1010.1101.1101',
    'ud': '13.604.104.043.154.737.885',
    'ui': '0i13604104043154737885',
    'uv': '0vbpi.rship.r32mt',
    'uw': '0wb.Pbv8O.PIoHt',
    'ux': '0xbccb.7c8c.b3b1.8add',
  },
  { 'n':  18441444580797368868n,
    'ub': '0b1111.1111.1110.1101.0010.1100.0010.0011.1010.0111.0111.1010.1100.1010.0010.0100',
    'ud': '18.441.444.580.797.368.868',
    'ui': '0i18441444580797368868',
    'uv': '0vfvr.9c4ej.nlih4',
    'uw': '0wf.~Jb2e.DuIEA',
    'ux': '0xffed.2c23.a77a.ca24',
  },
  { 'n':  7643844662312245512n,
    'ub': '0b110.1010.0001.0100.0110.0100.0011.1000.1011.0111.0110.0011.0001.1001.0000.1000',
    'ud': '7.643.844.662.312.245.512',
    'ui': '0i7643844662312245512',
    'uv': '0v6k5.3472r.m6688',
    'uw': '0w6.Ekp3y.ToNA8',
    'ux': '0x6a14.6438.b763.1908',
  },
  { 'n':  293389376720547819362821033486028091527n,
    'ub': '0b1101.1100.1011.1000.1011.1101.0001.0100.1101.0100.1111.1101.1011.1110.0011.0111.1001.0011.1100.0000.1000.1110.0100.1000.0111.0011.1010.1111.1011.0000.1000.0111',
    'ud': '293.389.376.720.547.819.362.821.033.486.028.091.527',
    'ui': '0i293389376720547819362821033486028091527',
    'uv': '0v6.sn2uh.9l7tn.orp7g.4e91p.qvc47',
    'uw': '0w3s.KbQkR.fS-dV.f0zAx.PHX27',
    'ux': '0xdcb8.bd14.d4fd.be37.93c0.8e48.73af.b087',
  },
  { 'n':  11826418988767709295206418976840492314n,
    'ub': '0b1000.1110.0101.1010.1111.0111.1001.0110.1100.1000.1101.1010.0001.1100.0011.1111.0000.1011.0001.0001.1010.0111.0011.1111.0001.1101.0110.0010.0101.0001.1010',
    'ud': '11.826.418.988.767.709.295.206.418.976.840.492.314',
    'ui': '0i11826418988767709295206418976840492314',
    'uv': '0v8smnn.ir4dk.71v1c.8qefo.tc98q',
    'uw': '0w8.VqZVr.8SxM~.2N6Df.NRykq',
    'ux': '0x8e5.af79.6c8d.a1c3.f0b1.1a73.f1d6.251a',
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
    'da': '~0.1.1'
  },
  { 'n': 170141183328369385600900416699944140800n,
    'da': '~1-.1.1'
  },
  { 'n': 170213050367437966468743593413155225600n,
    'da': '~123456789.12.12'
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
  { 'n': 170141184492616163050404761352701739008n,
    'da': '~2000.1.1..11.11.11..0000.aabb'
  },
  { 'n': 170141184492616163062707000439658774528n,
    'da': '~2000.1.1..11.11.11..aabb.0000'
  },
  { 'n': 170141184492615487727406687186543706111n,
    'da': '~2000.1.1..1.1.1..aabb.ccdd.eeff.ffff'
  }
];
testAuras('phonetic', DATE_AURAS, DATE_TESTS);


