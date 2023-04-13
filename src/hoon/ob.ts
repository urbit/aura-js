import bigInt, { BigInteger } from 'big-integer';
import { muk } from './muk';

// ++  ob
//
// See arvo/sys/hoon.hoon.

const ux_1_0000 = bigInt('10000', 16);
const ux_ffff_ffff = bigInt('ffffffff', 16);
const ux_1_0000_0000 = bigInt('100000000', 16);
const ux_ffff_ffff_ffff_ffff = bigInt('ffffffffffffffff', 16);
const ux_ffff_ffff_0000_0000 = bigInt('ffffffff00000000', 16);

const u_65535 = bigInt('65535');
const u_65536 = bigInt('65536');

// a PRF for j in { 0, .., 3 }
const F = (j: number, arg: BigInteger) => {
  const raku = [0xb76d5eed, 0xee281300, 0x85bcae01, 0x4b387af7];

  return muk(raku[j], arg);
};

/**
 * Conceal structure v3.
 *
 * @param {String, Number, BigInteger} pyn
 * @return  {BigInteger}
 */
const fein = (arg: any): BigInteger => {
  const loop = (pyn: BigInteger): BigInteger => {
    const lo = pyn.and(ux_ffff_ffff);
    const hi = pyn.and(ux_ffff_ffff_0000_0000);

    return pyn.geq(ux_1_0000) && pyn.leq(ux_ffff_ffff)
      ? ux_1_0000.add(feis(pyn.subtract(ux_1_0000)))
      : pyn.geq(ux_1_0000_0000) && pyn.leq(ux_ffff_ffff_ffff_ffff)
      ? hi.or(loop(lo))
      : pyn;
  };

  return loop(bigInt(arg));
};

/**
 * Restore structure v3.
 *
 * @param  {String, Number, BigInteger}  cry
 * @return  {BN}
 */
const fynd = (arg: any) => {
  const loop = (cry: BigInteger): BigInteger => {
    const lo = cry.and(ux_ffff_ffff);
    const hi = cry.and(ux_ffff_ffff_0000_0000);

    return cry.geq(ux_1_0000) && cry.leq(ux_ffff_ffff)
      ? ux_1_0000.add(tail(cry.subtract(ux_1_0000)))
      : cry.geq(ux_1_0000_0000) && cry.leq(ux_ffff_ffff_ffff_ffff)
      ? hi.or(loop(lo))
      : cry;
  };

  return loop(bigInt(arg));
};

/**
 * Generalised Feistel cipher.
 *
 * See: Black and Rogaway (2002), "Ciphers with arbitrary finite domains."
 *
 * Note that this has been adjusted from the reference paper in order to
 * support some legacy behaviour.
 *
 * @param  {String, Number, BigInteger}
 * @return  {BN}
 */
const feis = (arg: any) =>
  Fe(4, u_65535, u_65536, ux_ffff_ffff, F, bigInt(arg));

const Fe = (
  r: number,
  a: BigInteger,
  b: BigInteger,
  k: BigInteger,
  f: typeof F,
  m: BigInteger
) => {
  const c = fe(r, a, b, f, m);
  return c.lt(k) ? c : fe(r, a, b, f, c);
};

const fe = (
  r: number,
  a: BigInteger,
  b: BigInteger,
  f: typeof F,
  m: BigInteger
) => {
  const loop = (j: number, ell: BigInteger, arr: BigInteger): BigInteger => {
    if (j > r) {
      return r % 2 !== 0
        ? a.multiply(arr).add(ell)
        : arr.eq(a)
        ? a.multiply(arr).add(ell)
        : a.multiply(ell).add(arr);
    } else {
      const eff = f(j - 1, arr);

      const tmp = j % 2 !== 0 ? ell.add(eff).mod(a) : ell.add(eff).mod(b);

      return loop(j + 1, arr, tmp);
    }
  };

  const L = m.mod(a);
  const R = m.divide(a);

  return loop(1, L, R);
};

/**
 * Reverse 'feis'.
 *
 * See: Black and Rogaway (2002), "Ciphers with arbitrary finite domains."
 *
 * Note that this has been adjusted from the reference paper in order to
 * support some legacy behaviour.
 *
 * @param {Number, String, BN}  arg
 * @return  {BN}
 */
const tail = (arg: any) =>
  Fen(4, u_65535, u_65536, ux_ffff_ffff, F, bigInt(arg));

const Fen: typeof Fe = (r, a, b, k, f, m) => {
  const c = fen(r, a, b, f, m);
  return c.lt(k) ? c : fen(r, a, b, f, c);
};

const fen: typeof fe = (r, a, b, f, m) => {
  const loop = (j: number, ell: BigInteger, arr: BigInteger): BigInteger => {
    if (j < 1) {
      return a.multiply(arr).add(ell);
    } else {
      const eff = f(j - 1, ell);

      // NB (jtobin):
      //
      // Slight deviation from B&R (2002) here to prevent negative values.  We
      // add 'a' or 'b' to arr as appropriate and reduce 'eff' modulo the same
      // number before performing subtraction.
      //
      const tmp =
        j % 2 !== 0
          ? arr.add(a).subtract(eff.mod(a)).mod(a)
          : arr.add(b).subtract(eff.mod(b)).mod(b);

      return loop(j - 1, tmp, ell);
    }
  };

  const ahh = r % 2 !== 0 ? m.divide(a) : m.mod(a);

  const ale = r % 2 !== 0 ? m.mod(a) : m.divide(a);

  const L = ale.eq(a) ? ahh : ale;

  const R = ale.eq(a) ? ale : ahh;

  return loop(r, L, R);
};

export default {
  F,

  fe,
  Fe,
  feis,
  fein,

  fen,
  Fen,
  tail,
  fynd,
};
