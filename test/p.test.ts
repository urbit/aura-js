import jsc from 'jsverify';
import {
  patp,
  patp2hex,
  hex2patp,
  patp2dec,
  clan,
  sein,
  isValidPatp,
  preSig,
  deSig,
  cite,
} from '../src/p';

const patps = jsc.uint32.smap(
  (num) => patp(num),
  (pp) => parseInt(patp2dec(pp))
);

describe('@p', () => {
  it('patp2dec matches expected reference values', () => {
    expect(patp2dec('~zod')).toEqual('0');
    expect(patp2dec('~lex')).toEqual('200');
    expect(patp2dec('~binzod')).toEqual('512');
    expect(patp2dec('~samzod')).toEqual('1024');
    expect(patp2dec('~poldec-tonteg')).toEqual('9896704');
    expect(patp2dec('~nidsut-tomdun')).toEqual('15663360');
    expect(patp2dec('~morlyd-mogmev')).toEqual('3108299008');
    expect(patp2dec('~fipfes-morlyd')).toEqual('479733505');
  });

  it('patp matches expected reference values', () => {
    expect(patp('0')).toEqual('~zod');
    expect(patp('200')).toEqual('~lex');
    expect(patp('512')).toEqual('~binzod');
    expect(patp('1024')).toEqual('~samzod');
    expect(patp('9896704')).toEqual('~poldec-tonteg');
    expect(patp('15663360')).toEqual('~nidsut-tomdun');
    expect(patp('3108299008')).toEqual('~morlyd-mogmev');
    expect(patp('479733505')).toEqual('~fipfes-morlyd');
  });

  it('large patp values match expected reference values', () => {
    expect(
      hex2patp(
        '7468697320697320736f6d6520766572792068696768207175616c69747920656e74726f7079'
      )
    ).toEqual(
      '~divmes-davset-holdet--sallun-salpel-taswet-holtex--watmeb-tarlun-picdet-magmes--holter-dacruc-timdet-divtud--holwet-maldut-padpel-sivtud'
    );
  });

  it('patp throws on null input', () => {
    let input = () => patp(null as any);
    expect(input).toThrow();
  });

  it('hex2patp throws on null input', () => {
    let input = () => hex2patp(null as any);
    expect(input).toThrow();
  });

  it('patp2hex throws on invalid patp', () => {
    let input = () => patp2hex('nidsut-tomdun');
    expect(input).toThrow();
    input = () => patp2hex('~nidsut-tomdzn');
    expect(input).toThrow();
    input = () => patp2hex('~sut-tomdun');
    expect(input).toThrow();
    input = () => patp2hex('~nidsut-dun');
    expect(input).toThrow();
    input = () => patp2hex(null as any);
    expect(input).toThrow();
  });

  it('patp and patp2dec are inverses', () => {
    let iso0 = jsc.forall(
      jsc.uint32,
      (num) => parseInt(patp2dec(patp(num))) === num
    );

    let iso1 = jsc.forall(patps, (pp) => patp(patp2dec(pp)) === pp);

    jsc.assert(iso0);
    jsc.assert(iso1);
  });

  it('patp2hex and hex2patp are inverses', () => {
    let iso0 = jsc.forall(
      jsc.uint32,
      (num) => parseInt(patp2hex(hex2patp(num.toString(16))), 16) === num
    );

    let iso1 = jsc.forall(patps, (pp) => hex2patp(patp2hex(pp)) === pp);

    jsc.assert(iso0);
    jsc.assert(iso1);
  });

  describe('clan/sein', () => {
    it('clan works as expected', () => {
      expect(clan('~zod')).toEqual('galaxy');
      expect(clan('~fes')).toEqual('galaxy');
      expect(clan('~marzod')).toEqual('star');
      expect(clan('~fassec')).toEqual('star');
      expect(clan('~dacsem-fipwex')).toEqual('planet');
      expect(clan('~fidnum-rosbyt')).toEqual('planet');
      expect(clan('~doznec-bannux-nopfen')).toEqual('moon');
      expect(clan('~dozryt--wolmep-racmyl-padpeg-mocryp')).toEqual('comet');
    });

    it('clan throws on invalid input', () => {
      let input = () => clan('~zord');
      expect(input).toThrow();
      input = () => clan('zod');
      expect(input).toThrow();
      input = () => clan('~nid-tomdun');
      expect(input).toThrow();
      input = () => clan(null as any);
      expect(input).toThrow();
    });

    it('sein works as expected', () => {
      expect(sein('~zod')).toEqual('~zod');
      expect(sein('~nec')).toEqual('~nec');
      expect(sein('~rep')).toEqual('~rep');
      expect(sein('~marzod')).toEqual('~zod');
      expect(sein('~marnec')).toEqual('~nec');
      expect(sein('~fassec')).toEqual('~sec');
      expect(sein('~nidsut-tomdun')).toEqual('~marzod');
      expect(sein('~sansym-ribnux')).toEqual('~marnec');
    });

    it('sein throws on invalid input', () => {
      let input = () => sein('~zord');
      expect(input).toThrow();
      input = () => sein('zod');
      expect(input).toThrow();
      input = () => sein('~nid-tomdun');
      expect(input).toThrow();
      input = () => sein(null as any);
      expect(input).toThrow();
    });
  });

  describe('isValidPatp', () => {
    it('isValidPatp returns true for valid @p values', () => {
      expect(isValidPatp('~zod')).toEqual(true);
      expect(isValidPatp('~marzod')).toEqual(true);
      expect(isValidPatp('~nidsut-tomdun')).toEqual(true);
    });

    it('isValidPatp returns false for invalid @p values', () => {
      expect(isValidPatp('')).toEqual(false);
      expect(isValidPatp('~')).toEqual(false);
      expect(isValidPatp('~hu')).toEqual(false);
      expect(isValidPatp('~what')).toEqual(false);
      expect(isValidPatp('sudnit-duntom')).toEqual(false);
    });
  });

  describe('preSig', () => {
    it('preSig adds a sig if missing', () => {
      expect(preSig('nocsyx-lassul')).toEqual('~nocsyx-lassul');
    });

    it('preSig ignores sig if there already', () => {
      expect(preSig('~nocsyx-lassul')).toEqual('~nocsyx-lassul');
    });

    it('preSig ignores whitespace', () => {
      expect(preSig('   nocsyx-lassul')).toEqual('~nocsyx-lassul');
    });

    it('preSig ignores empty values safely', () => {
      expect(preSig(null as any)).toEqual('');
      expect(() => preSig(null as any)).not.toThrow();
    });
  });

  describe('deSig', () => {
    it('deSig removes the sig if present', () => {
      expect(deSig('~nocsyx-lassul')).toEqual('nocsyx-lassul');
    });

    it('deSig ignores if no sig', () => {
      expect(deSig('nocsyx-lassul')).toEqual('nocsyx-lassul');
    });

    it('deSig ignores empty values safely', () => {
      expect(deSig(null as any)).toEqual('');
      expect(() => deSig(null as any)).not.toThrow();
    });
  });

  describe('cite', () => {
    it('cite shortens moons', () => {
      expect(cite('~mister-mister-nocsyx-lassul')).toEqual('~nocsyx^lassul');
      expect(cite('~dozzod-dozzod-nocsyx-lassul')).toEqual('~nocsyx^lassul');
    });

    it('cite shortens comets', () => {
      expect(
        cite('~roldex-navmev-biltyp-maprem--rigper-lapled-binnum-binzod')
      ).toEqual('~roldex_binzod');
      expect(
        cite('~roldex-navmev-biltyp-dozzod--dozzod-lapled-binnum-binzod')
      ).toEqual('~roldex_binzod');
    });

    it("cite ignores @p's less than 27 chars", () => {
      expect(cite('~zod')).toEqual('~zod');
      expect(cite('~marzod')).toEqual('~marzod');
      expect(cite('~marzod-marzod')).toEqual('~marzod-marzod');
      expect(cite('~marzod-marzod-marzod')).toEqual('~marzod-marzod-marzod');
    });

    it('cite always returns sigged values', () => {
      expect(cite('~zod')?.at(0)).toEqual('~');
      expect(cite('~zod')).toEqual('~zod');
    });

    it('cite accepts unsigged values', () => {
      expect(cite('zod')).toEqual('~zod');
      expect(cite('mister-mister-nocsyx-lassul')).toEqual('~nocsyx^lassul');
      expect(
        cite('roldex-navmev-biltyp-dozzod--dozzod-lapled-binnum-binzod')
      ).toEqual('~roldex_binzod');
    });

    it('cite ignores empty values safely', () => {
      expect(cite(null as any)).toEqual(null);
      expect(() => cite(null as any)).not.toThrow();
    });
  });
});
