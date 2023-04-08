import jsc from 'jsverify';
import {
  patq,
  patq2hex,
  hex2patq,
  patq2dec,
  eqPatq,
  isValidPatq,
} from '../src';

const patqs = jsc.uint32.smap(
  num => patq(num),
  pq => parseInt(patq2dec(pq))
);

describe('patq, etc.', () => {
  it('patq2dec matches expected reference values', () => {
    expect(patq2dec('~zod')).toEqual('0');
    expect(patq2dec('~binzod')).toEqual('512');
    expect(patq2dec('~samzod')).toEqual('1024');
    expect(patq2dec('~poldec-tonteg')).toEqual('4016240379');
    expect(patq2dec('~nidsut-tomdun')).toEqual('1208402137');
  });

  it('patq matches expected reference values', () => {
    expect(patq('0')).toEqual('~zod');
    expect(patq('512')).toEqual('~binzod');
    expect(patq('1024')).toEqual('~samzod');
    expect(patq('4016240379')).toEqual('~poldec-tonteg');
    expect(patq('1208402137')).toEqual('~nidsut-tomdun');
  });

  it('large patq values match expected reference values', () => {
    expect(hex2patq('01010101010101010102')).toEqual(
      '~marnec-marnec-marnec-marnec-marbud'
    );
    expect(
      hex2patq(
        '6d7920617765736f6d65207572626974207469636b65742c206920616d20736f206c75636b79'
      )
    ).toEqual(
      '~tastud-holruc-sidwet-salpel-taswet-holdeg-paddec-davdut-holdut-davwex-balwet-divwen-holdet-holruc-taslun-salpel-holtux-dacwex-baltud'
    );
  });

  it('patq2hex throws on invalid patp', () => {
    let input = () => patq2hex('nidsut-tomdun');
    expect(input).toThrow();
    input = () => patq2hex('~nidsut-tomdzn');
    expect(input).toThrow();
    input = () => patq2hex('~sut-tomdun');
    expect(input).toThrow();
    input = () => patq2hex('~nidsut-dun');
    expect(input).toThrow();
    input = () => patq2hex(null as any);
    expect(input).toThrow();
  });

  it('patq and patq2dec are inverses', () => {
    let iso0 = jsc.forall(
      jsc.uint32,
      num => parseInt(patq2dec(patq(num))) === num
    );

    let iso1 = jsc.forall(patqs, pp => patq(patq2dec(pp)) === pp);

    jsc.assert(iso0);
    jsc.assert(iso1);
  });

  it('patq2hex and hex2patq are inverses', () => {
    let iso0 = jsc.forall(
      jsc.uint32,
      num => parseInt(patq2hex(hex2patq(num.toString(16))), 16) === num
    );

    let iso1 = jsc.forall(patqs, pp => hex2patq(patq2hex(pp)) === pp);

    jsc.assert(iso0);
    jsc.assert(iso1);
  });

  describe('eqPatq', () => {
    it('works as expected', () => {
      expect(eqPatq('~dozzod-dozzod', '~zod')).toEqual(true);
      expect(eqPatq('~dozzod-mardun', '~mardun')).toEqual(true);
      expect(eqPatq('~dozzod-mardun', '~mardun-dozzod')).toEqual(false);
    });
  });

  describe('isValidPatq', () => {
    it('isValidPatq returns true for valid @p values', () => {
      expect(isValidPatq('~zod')).toEqual(true);
      expect(isValidPatq('~marzod')).toEqual(true);
      expect(isValidPatq('~nidsut-tomdun')).toEqual(true);
      expect(isValidPatq('~dozzod-binwes-nidsut-tomdun')).toEqual(true);
    });

    it('isValidPatq returns false for invalid @p values', () => {
      expect(isValidPatq('')).toEqual(false);
      expect(isValidPatq('~')).toEqual(false);
      expect(isValidPatq('~hu')).toEqual(false);
      expect(isValidPatq('~what')).toEqual(false);
      expect(isValidPatq('sudnit-duntom')).toEqual(false);
    });
  });
});
