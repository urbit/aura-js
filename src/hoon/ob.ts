import { muk } from './muk';

// ++  ob
//
// See arvo/sys/hoon.hoon.

// a PRF for j in { 0, .., 3 }
const F = (j: number, arg: bigint): bigint => {
  const raku = [0xb76d5eed, 0xee281300, 0x85bcae01, 0x4b387af7];

  return muk(raku[j], arg);
};

/**
 * Conceal structure v3.
 *
 * @param {String, Number, bigint} pyn
 * @return  {bigint}
 */
const fein = (arg: bigint): bigint => {
  const loop = (pyn: bigint): bigint => {
    const lo = pyn & 0xffffffffn;
    const hi = pyn & 0xffffffff00000000n;

    return (pyn >= 0x10000n) && (pyn <= 0xffffffffn)
      ? (0x10000n + feis(pyn - 0x10000n))
      : (pyn >= 0x100000000n) && (pyn <= 0xffffffffffffffffn)
      ? (hi | loop(lo))
      : pyn;
  };

  return loop(arg);
};

/**
 * Restore structure v3.
 *
 * @param  {String, Number, bigint}  cry
 * @return  {bigint}
 */
const fynd = (arg: bigint): bigint => {
  const loop = (cry: bigint): bigint => {
    const lo = cry & 0xffffffffn;
    const hi = cry & 0xffffffff00000000n;

    return (cry >= 0x10000n) && (cry <= 0xffffffffn)
      ? (0x10000n + tail(cry - 0x10000n))
      : (cry >= 0x100000000n) && (cry <= 0xffffffffffffffffn)
      ? (hi | loop(lo))
      : cry;
  };

  return loop(BigInt(arg));
};

/**
 * Generalised Feistel cipher.
 *
 * See: Black and Rogaway (2002), "Ciphers with arbitrary finite domains."
 *
 * Note that this has been adjusted from the reference paper in order to
 * support some legacy behaviour.
 *
 * @param  {String, Number, bigint}
 * @return  {BN}
 */
const feis = (arg: bigint) =>
  Fe(4, 65535n, 65536n, 0xffffffffn, F, arg);

const Fe = (
  r: number,
  a: bigint,
  b: bigint,
  k: bigint,
  f: typeof F,
  m: bigint
) => {
  const c = fe(r, a, b, f, m);
  return (c < k) ? c : fe(r, a, b, f, c);
};

const fe = (
  r: number,
  a: bigint,
  b: bigint,
  f: typeof F,
  m: bigint
) => {
  const loop = (j: number, ell: bigint, arr: bigint): bigint => {
    if (j > r) {
      return r % 2 !== 0
        ? (a * arr) + ell
        : arr === a
        ? (a * arr) + ell
        : (a * ell) + arr;
    } else {
      const eff = BigInt(f(j - 1, arr).toString());

      const tmp = j % 2 !== 0 ? ((ell + eff) % a) : ((ell + eff) % b);

      return loop(j + 1, arr, tmp);
    }
  };

  const L = m % a;
  const R = m / a;

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
 * @param {bigint}  arg
 * @return  {bigint}
 */
const tail = (arg: bigint) =>
  Fen(4, 65535n, 65536n, 0xffffffffn, F, arg);

const Fen: typeof Fe = (r, a, b, k, f, m) => {
  const c = fen(r, a, b, f, m);
  return (c < k) ? c : fen(r, a, b, f, c);
};

const fen: typeof fe = (r, a, b, f, m) => {
  const loop = (j: number, ell: bigint, arr: bigint): bigint => {
    if (j < 1) {
      return (a * arr) + ell;
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
          ? ((arr + a) - (eff % a)) % a
          : ((arr + b) - (eff % b)) % b;

      return loop(j - 1, tmp, ell);
    }
  };

  const ahh = r % 2 !== 0 ? (m / a) : (m % a);

  const ale = r % 2 !== 0 ? (m % a) : (m / a);

  const L = ale === a ? ahh : ale;

  const R = ale === a ? ale : ahh;

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
