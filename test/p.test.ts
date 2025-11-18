import {
  kind,
  sein,
  isValidP,
  cite,
} from '../src/p';

describe('@p', () => {
  describe('clan/sein', () => {
    it('clan/kind works as expected', () => {
      expect(kind('~zod')).toEqual('galaxy');
      expect(kind('~fes')).toEqual('galaxy');
      expect(kind('~marzod')).toEqual('star');
      expect(kind('~fassec')).toEqual('star');
      expect(kind('~dacsem-fipwex')).toEqual('planet');
      expect(kind('~fidnum-rosbyt')).toEqual('planet');
      expect(kind('~doznec-bannux-nopfen')).toEqual('moon');
      expect(kind('~dozryt--wolmep-racmyl-padpeg-mocryp')).toEqual('comet');
    });

    it('clan throws on invalid input', () => {
      let input = () => kind('~zord');
      expect(input).toThrow();
      input = () => kind('zod');
      expect(input).toThrow();
      input = () => kind('~nid-tomdun');
      expect(input).toThrow();
      input = () => kind(null as any);
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
      expect(sein('~sampel-sampel-sampel-sampel--sampel-sampel-sansym-ribnux')).toEqual('~ribnux');
    });

    it('sein throws on invalid input', () => {
      let input = () => sein('~zord');
      expect(input).toThrow();
      input = () => sein('zod');
      expect(input).toThrow();
      input = () => sein('~nid-tomdun');
      expect(input).toThrow();
    });
  });

  describe('isValidP', () => {
    it('isValidP returns true for valid @p values', () => {
      expect(isValidP('~zod')).toEqual(true);
      expect(isValidP('~marzod')).toEqual(true);
      expect(isValidP('~nidsut-tomdun')).toEqual(true);
    });

    it('isValidP returns false for invalid @p values', () => {
      expect(isValidP('')).toEqual(false);
      expect(isValidP('~')).toEqual(false);
      expect(isValidP('~hu')).toEqual(false);
      expect(isValidP('~what')).toEqual(false);
      expect(isValidP('sudnit-duntom')).toEqual(false);
    });
  });

  describe('cite', () => {
    it('cite shortens moons', () => {
      expect(cite('~mister-mister-nocsyx-lassul')).toEqual('~nocsyx^lassul');
      expect(cite('~binzod-dozzod-nocsyx-lassul')).toEqual('~nocsyx^lassul');
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
    });

    it('cite always returns sigged values', () => {
      expect(cite('~zod')?.at(0)).toEqual('~');
      expect(cite('~zod')).toEqual('~zod');
    });
  });
});
