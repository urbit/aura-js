import { isValidQ } from '../src/q';

describe('patq, etc.', () => {
  describe('isValidQ', () => {
    it('isValidQ returns true for valid @p values', () => {
      expect(isValidQ('.~zod')).toEqual(true);
      expect(isValidQ('.~marzod')).toEqual(true);
      expect(isValidQ('.~nidsut-tomdun')).toEqual(true);
      expect(isValidQ('.~dozzod-binwes-nidsut-tomdun')).toEqual(true);
    });

    it('isValidQ returns false for invalid @p values', () => {
      expect(isValidQ('')).toEqual(false);
      expect(isValidQ('.~')).toEqual(false);
      expect(isValidQ('.~hu')).toEqual(false);
      expect(isValidQ('.~what')).toEqual(false);
      expect(isValidQ('sudnit-duntom')).toEqual(false);
    });
  });
});
