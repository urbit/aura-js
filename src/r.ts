export type precision = 'h' | 's' | 'd' | 'q' | precisionBits;
type precisionBits = { w: number, p: number, l: string };

//  str: @r* format string including its leading . and ~s
export function parseR(per: precision, str: string): bigint {
  per = getPrecision(per);
  return parse(str.slice(per.l.length), per.w, per.p);
}

export function renderR(per: precision, r: bigint): string {
  per = getPrecision(per);
  return per.l + rCo(deconstruct(r, BigInt(per.w), BigInt(per.p)));
}

//
//  helpers
//

function getPrecision(per: precision): precisionBits {
  if (per === 'h') return { w:  5, p:  10, l: '.~~'  }; else
  if (per === 's') return { w:  8, p:  23, l: '.'    }; else
  if (per === 'd') return { w: 11, p:  52, l: '.~'   }; else
  if (per === 'q') return { w: 15, p: 112, l: '.~~~' }; else
  return per;
}

function bitMask(bits: bigint): bigint {
  return (2n ** bits) - 1n;
}

//
//  parsing and construction
//

//  str: @r* format string with its leading . and ~ stripped off
//  w:   exponent bits
//  p:   mantissa bits
function parse(str: string, w: number, p: number): bigint {
  if (str === 'nan')  return makeNaN(w, p);
  if (str === 'inf')  return makeInf(true, w, p);
  if (str === '-inf') return makeInf(false, w, p);
  let i = 0;
  let sign = true;
  if (str[i] === '-') {
    sign = false;
    i++;
  }
  let int = '';
  while (str[i] !== '.' && str[i] !== 'e' && str[i] !== undefined) {
    int += str[i++];
  }
  if (str[i] === '.') i++;
  let fra = '';
  while (str[i] !== 'e' && str[i] !== undefined) {
    fra += str[i++];
  }
  if (str[i] === 'e') i++;
  let expSign = true;
  if (str[i] === '-') {
    expSign = false;
    i++;
  }
  let exp = '';
  while (str[i] !== undefined) {
    exp += str[i++];
  }
  return BigInt('0b' + makeFloat(w, p, sign, int, fra, expSign, Number(exp)));
}

function makeNaN(w: number, p: number): bigint {
  return bitMask(BigInt(w + 1)) << BigInt(p - 1);
}

function makeInf(s: boolean, w: number, p: number): bigint {
  return bitMask(BigInt(s ? w : w + 1)) << BigInt(p);
}

//  turn into representation without exponent
function makeFloat(w: number, p: number, sign: boolean, intPart: string, floatPart: string, expSign: boolean, exp: number) {
  if (exp !== 0) {
    if (expSign) {
      intPart = intPart + floatPart.padEnd(exp, '0').slice(0, exp);
      floatPart = floatPart.slice(exp);
    } else {
      floatPart = intPart.padStart(exp, '0').slice(-exp) + floatPart;
      intPart = intPart.slice(0, -exp);
    }
  }
  return construct(p, w, sign, BigInt(intPart), BigInt(floatPart.length), BigInt(floatPart));
}

//NOTE  modified from an encodeFloat() written by by Jonas Raoni Soares Silva,
//      made to operate on (big)integers, without using js's float logic.
//      http://jsfromhell.com/classes/binary-parser
//      (yes, this code is vaguely deranged. but it works!)
function construct(precisionBits: number, exponentBits: number,
                   sign: boolean, intPart: bigint, floatDits: bigint, floatPart: bigint) {
  //REVIEW  when do we trigger this?
  //        inputs representing nrs too large for exponentBits?
  //        inputs with precision we can't match?
  //        add tests for those cases! should match stdlib result.
  function exceed(x: string) {
    console.warn(x);
    return 1;
  }

  const bias = 2**(exponentBits - 1) - 1,
    minExp = -bias + 1,
    maxExp = bias,
    minUnnormExp = minExp - precisionBits,
    len = 2 * bias + 1 + precisionBits + 3,
    bin = new Array(len),
    denom = 10n ** floatDits;
  var exp = 0,
    signal = !sign,
    i, lastBit, rounded, j, result, n;
  //  zero-initialize the bit-array
  for (i = len; i; bin[--i] = 0);
  //  integral into bits
  for (i = bias + 2; intPart && i; bin[--i] = intPart & 1n, intPart = intPart >> 1n);
  //  fractional into bits
  for (i = bias + 1; floatPart > 0n && (i < len); (bin[++i] = (((floatPart *= 2n) >= denom) ? 1 : 0)) && (floatPart = floatPart - denom));
  //  walk cursor (i) to first 1-bit.
  for (i = -1; ++i < len && !bin[i];);
  //  round if needed
  if (bin[(lastBit = precisionBits - 1 + (i = (exp = bias + 1 - i) >= minExp && exp <= maxExp ? i + 1 : bias + 1 - (exp = minExp - 1))) + 1]) {
    if (!(rounded = bin[lastBit]))
      for (j = lastBit + 2; !rounded && j < len; rounded = bin[j++]);
    for (j = lastBit + 1; rounded && --j >= 0; (bin[j] = (!bin[j] ? 1 : 0) - 0) && (rounded = 0));
  }
  //  walk cursor (i) to first/next(??) 1-bit
  for (i = i - 2 < 0 ? -1 : i - 3; ++i < len && !bin[i];);

  //  set exponent, throwing on under- and overflows
  (exp = bias + 1 - i) >= minExp && exp <= maxExp ? ++i : exp < minExp &&
    (exp != bias + 1 - len && exp < minUnnormExp && exceed('r.construct underflow'), i = bias + 1 - (exp = minExp - 1));
  intPart && (exceed(intPart ? 'r.construct overflow' : 'r.construct'),
    exp = maxExp + 1, i = bias + 2);
  //  exponent into bits
  for (n = Math.abs(exp + bias), j = exponentBits + 1, result = ''; --j; result = (n & 1) + result, n = n >>= 1);
  //  final serialization: sign + exponent + mantissa
  return (signal ? '1' : '0') + result + bin.slice(i, i + precisionBits).join('');
};

//
//  deconstruction and rendering
//

type dn = { t: 'd', s: boolean, e: number, a: string }
        | { t: 'i', s: boolean }
        | { t: 'n' };

//NOTE  not _exactly_ like +r-co due to dragon4() outExponent semantics.
//      if we copy +r-co logic exactly we off-by-one all over the place.
function rCo(a: dn): string {
  if (a.t === 'n') return 'nan';
  if (a.t === 'i') return a.s ? 'inf' : '-inf';
  let e: number;
  if ((a.e - 4) > 0) {  //  12000 -> 12e3 e>+2
    e = 1;
  } else
  if ((a.e + 2) < 0) {  //  0.001 -> 1e-3 e<-2
    e = 1;
  } else {  //  1.234e2 -> '.'@3 -> 123 .4
    e = a.e + 1;
    a.e = 0;
  }
  return (a.s ? '' : '-')
       + edCo(e, a.a)
       + ((a.e === 0) ? '' : ('e' + a.e.toString()));
}

function edCo(exp: number, int: string): string {
  const dig: number = Math.abs(exp);
  if (exp <= 0) {
    return '0.' + (''.padEnd(dig, '0')) + int;
  } else {
    const len = int.length;
    if (dig >= len) return int + ''.padEnd((dig - len), '0');
    return int.slice(0, dig) + '.' + int.slice(dig);
  }
}

//NOTE  the deconstruct() and dragon4() below are ported from Ryan Juckett's
//      PrintFloat32() and Dragon4() respectively. its general structure is
//      copied one-to-one and comments are preserved, but we got to drop some
//      logic due to having access to native bigints. see his post series for
//      a good walkthrough of the underlying algorithm and its implementation,
//      as well as pointers to additional references.
//      https://www.ryanjuckett.com/printing-floating-point-numbers/
//      we only use one of the cutoff modes, but have maintained support for
//      the others for completeness' sake.

//  deconstruct(): binary float to $dn structure (+drg:ff)
function deconstruct(float: bigint, exponentBits: bigint, precisionBits: bigint): dn {
  //  deconstruct the value into its components
  const mantissaMask = bitMask(precisionBits);
  const exponentMask = bitMask(exponentBits);
  const floatMantissa: bigint = float & mantissaMask;
  const floatExponent: bigint = (float >> BigInt(precisionBits)) & exponentMask;
  const sign: boolean = ((float >> BigInt(exponentBits + precisionBits)) & 1n) === 0n;

  //  transform the components into the values they represent
  let mantissa: bigint, exponent: bigint, mantissaHighBitIdx: number, unequalMargins: boolean;
  if (floatExponent === exponentMask) {  //  specials
    if (floatMantissa === 0n)
      return { t: 'i', s: sign };  //  infinity
    return { t: 'n' };  //  nan
  } else
  if (floatExponent !== 0n) {  //  normalized
    //  the floating point equation is:
    //    value = (1 + mantissa/2^23) * 2 ^ (exponent-127)
    //  we convert the integer equation by factoring a 2^23 out of the exponent
    //    value = (1 + mantissa/2^23) * 2^23 * 2 ^ (exponent-127-23)
    //    value = (2^23 + mantissa) * 2 ^ (exponent-127-23)
    //  because of the implied 1 in front of the mantissa we have 24 bits of precision
    //    m = (2^23 + mantissa)
    //    e = (exponent-127-23)
    mantissa = (1n << BigInt(precisionBits)) | floatMantissa;
    exponent = floatExponent - ((2n**(exponentBits-1n))-1n) - precisionBits;
    mantissaHighBitIdx = Number(precisionBits);
    unequalMargins = (floatExponent !== 1n) && (floatMantissa === 0n);
  } else {  //  denormalized
    //  the floating point equation is:
    //    value = (mantissa/2^23) * 2 ^ (1-127)
    //  we convert the integer equation by factoring a 2^23 out of the exponent
    //    value = (mantissa/2^23) * 2^23 * 2 ^ (1-127-23)
    //    value = mantissa * 2 ^ (1-127-23)
    //  we have up to 23 bits of precision
    //    m = (mantissa)
    //    e = (1-127-23)
    mantissa = floatMantissa;
    exponent = 1n - ((2n**(exponentBits-1n))-1n) - precisionBits;
    mantissaHighBitIdx = mantissa.toString(2).length - 1;  //  poor man's log2
    unequalMargins = false;
  }

  const buf = (2n**precisionBits).toString(10).length + 1;
  const res = dragon4(mantissa, Number(exponent), mantissaHighBitIdx, unequalMargins, 'unique', 0, buf);
  return { t: 'd', s: sign, e: res.outExponent, a: res.digits };
}

//  dragon4(): binary float to decimal digits
//
//    like +drg:fl (but with slightly different outExponent semantics)
//
//    mantissa:           value significand
//    exponent:           value exponent in base 2
//    mantissaHighBitIdx: highest set mantissa bit index
//    hasUnequalMargins:  is the high margin twice the low margin
//    cutoffMode:         'unique' | 'totalLength' | 'fractionLength'
//    cutoffNumber:       cutoff parameter for the selected mode
//    bufferSize:         max output digits
//
//    digits:             printed digits
//    outExponent:        exponent of the first digit printed
//
function dragon4(
  mantissa: bigint,
  exponent: number,
  mantissaHighBitIdx: number,
  hasUnequalMargins: boolean,
  cutoffMode: 'unique' | 'totalLength' | 'fractionLength',
  cutoffNumber: number,
  bufferSize: number
): { digits: string, outExponent: number } {
  const bexponent = BigInt(exponent);
  let pCurDigit = 0;  //  pointer into output buffer (digit string index)
  let outBuffer = new Array(bufferSize).fill('0');
  let outExponent = 0;

  //  if mantissa is zero, output "0"
  if (mantissa === 0n) {
    outBuffer[0] = '0';
    outExponent = 0;
    return { digits: outBuffer.slice(0, 1).join(''), outExponent };
  }

  //  compute the initial state in integral form such that:
  //  value     = scaledValue / scale
  //  marginLow = scaledMarginLow / scale

  let scale: bigint;             //  positive scale applied to value and margin such
                                 //  that they can be represented as whole numbers
  let scaledValue: bigint;       //  scale * mantissa
  let scaledMarginLow: bigint;   //  scale * 0.5 * (distance between this floating-
                                 //  point number and its immediate lower value)

  //  for normalized IEEE floating point values, each time the exponent is
  //  incremented the margin also doubles. That creates a subset of transition
  //  numbers where the high margin is twice the size of the low margin.
  let scaledMarginHigh: bigint;

  if (hasUnequalMargins) {
    if (exponent > 0) {  //  no fractional component
      //  1. expand the input value by multiplying out the mantissa and exponent.
      //     this represents the input value in its whole number representation.
      //  2. apply an additional scale of 2 such that later comparisons against
      //     the margin values are simplified.
      //  3. set the margin value to the lowest mantissa bit's scale.

      scaledValue = 4n * mantissa;
      scaledValue <<= bexponent;              //  2 * 2 * mantissa*2^exponent
      scale = 4n;                             //  2 * 2 * 1
      scaledMarginLow = 1n << bexponent;      //  2 * 2^(exponent-1)
      scaledMarginHigh = 1n << bexponent+1n;  //  2 * 2 * 2^(exponent-1)
    } else {  //  fractional component
      //  in order to track the mantissa data as an integer, we store it as is
      //  with a large scale

      scaledValue = 4n * mantissa;  //  2 * 2 * mantissa
      scale = 1n << -bexponent+2n;  //  2 * 2 * 2^(-exponent)
      scaledMarginLow = 1n;         //  2 * 2^(-1)
      scaledMarginHigh = 2n;        //  2 * 2 * 2^(-1)
    }
  } else {
    if (exponent > 0) {  //  no fractional component
      //  1. expand the input value by multiplying out the mantissa and exponent.
      //     this represents the input value in its whole number representation.
      //  2. apply an additional scale of 2 such that later comparisons against
      //     the margin values are simplified.
      //  3. set the margin value to the lowest mantissa bit's scale.

      scaledValue = 2n * mantissa;
      scaledValue <<= bexponent;          //  2 * mantissa*2^exponent
      scale = 2n;                         //  2 * 1
      scaledMarginLow = 1n << bexponent;  //  2 * 2^(exponent-1)
      scaledMarginHigh = scaledMarginLow;
    } else {  //  fractional component
      //  in order to track the mantissa data as an integer, we store it as is
      //  with a large scale

      scaledValue = 2n * mantissa;          //  2 * mantissa
      scale = 1n << BigInt(-exponent + 1);  //  2 * 2^(-exponent)
      scaledMarginLow = 1n;                 //  2 * 2^(-1)
      scaledMarginHigh = scaledMarginLow;
    }
  }

  //  compute an estimate for digitExponent that will be correct or undershoot
  //  by one. this optimization is based on the paper "Printing Floating-Point
  //  Numbers Quickly and Accurately" by Burger and Dybvig.
  //  http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.72.4656&rep=rep1&type=pdf
  //  we perform an additional subtraction of 0.69 to increase the frequency of
  //  a failed estimate because that lets us take a faster branch in the code.
  //  0.69 is chosen because 0.69 + log10(2) is less than one by a reasonable
  //  epsilon that will account for any floating point error.

  //  we want to set digitExponent to floor(log10(v)) + 1
  //  v = mantissa*2^exponent
  //  log2(v) = log2(mantissa) + exponent;
  //  log10(v) = log2(v) * log10(2)
  //  floor(log2(v)) = mantissaHighBitIdx + exponent;
  //  log10(v) - log10(2) < (mantissaHighBitIdx + exponent) * log10(2) <= log10(v)
  //  log10(v) < (mantissaHighBitIdx + exponent) * log10(2) + log10(2) <= log10(v) + log10(2)
  //  floor( log10(v) ) < ceil( (mantissaHighBitIdx + exponent) * log10(2) ) <= floor( log10(v) ) + 1
  //NOTE  loses precision! wants a 64-bit float. but seems precise enough...
  const log10_2 = 0.30102999566398119521373889472449;
  let digitExponent = Math.ceil((mantissaHighBitIdx + exponent) * log10_2 - 0.69);

  //  if the digit exponent is smaller than the smallest desired digit for
  //  fractional cutoff, pull the digit back into legal range at which point we
  //  will round to the appropriate value.
  //  note that while our value for digitExponent is still an estimate, this is
  //  safe because it only increases the number. this will either correct
  //  digitExponent to an accurate value or it will clamp it above the accurate
  //  value.
  if (cutoffMode === 'fractionLength' && digitExponent <= -cutoffNumber) {
    digitExponent = -cutoffNumber + 1;
  }

  //  scale adjustment for digit exponent, divide value by 10^digitExponent
  if (digitExponent > 0) {
    //  the exponent is positive creating a division so we multiply up the scale
    scale *= BigInt(10) ** BigInt(digitExponent);
  } else if (digitExponent < 0) {
    //  the exponent is negative creating a multiplication so we multiply
    //  up the scaledValue, scaledMarginLow and scaledMarginHigh
    const pow10 = BigInt(10) ** BigInt(-digitExponent);
    scaledValue *= pow10;
    scaledMarginLow *= pow10;
    if (scaledMarginHigh !== scaledMarginLow) {
      scaledMarginHigh *= scaledMarginLow;
    }
  }

  //  if (value >= 1), our estimate for digitExponent was too low
  if (scaledValue >= scale) {
    //  the exponent estimate was incorrect. increment the exponent and don't
    //  perform the premultiply needed for the first loop iteration.
    digitExponent += 1;
  } else {
    //  the exponent estimate was correct. multiply larger by the output base
    //  to prepare for the first loop iteration.
    scaledValue *= 10n;
    scaledMarginLow *= 10n;
    if (scaledMarginHigh !== scaledMarginLow) scaledMarginHigh *= 10n;
  }

  //  compute the cutoff exponent (the exponent of the final digit to print).
  //  default to the maximum size of the output buffer.
  let cutoffExponent = digitExponent - bufferSize;
  if (cutoffMode === 'totalLength') {
    let desired = digitExponent - cutoffNumber;
    if (desired > cutoffExponent) cutoffExponent = desired;
  } else if (cutoffMode === 'fractionLength') {
    let desired = -cutoffNumber;
    if (desired > cutoffExponent) cutoffExponent = desired;
  }

  //  output the exponent of the first digit we will print
  outExponent = digitExponent - 1;

  //NOTE  thanks to native bigints, no bit block normalization needed

  //  these values are used to inspect why the print loop terminated so we can properly
  //  round the final digit.
  let low = false;      //  did the value get within marginLow distance from zero
  let high = false;     //  did the value get within marginHigh distance from one
  let outputDigit = 0;  //  current digit being output

  if (cutoffMode === 'unique') {
    //  for the unique cutoff mode, we will try to print until we have reached
    //  a level of precision that uniquely distinguishes this value from its
    //  neighbors. if we run out of space in the output buffer, we exit early.

    while (true) {
      digitExponent -= 1;

      //  extract the digit
      outputDigit = Number(scaledValue / scale);
      scaledValue = scaledValue % scale;

      //  update the high end of the value
      let scaledValueHigh = scaledValue + scaledMarginHigh;

      //  stop looping if we are far enough away from our neighboring values
      //  or if we have reached the cutoff digit
      low = scaledValue < scaledMarginLow;
      high = scaledValueHigh > scale;
      if (low || high || (digitExponent === cutoffExponent)) break;

      //  store the output digit
      outBuffer[pCurDigit] = String.fromCharCode('0'.charCodeAt(0) + outputDigit);
      pCurDigit += 1;

      //  mulitply larger by the output base
      scaledValue *= 10n;
      scaledMarginLow *= 10n;
      if (scaledMarginHigh !== scaledMarginLow) scaledMarginHigh *= 10n;
    }
  } else {
    //  for length based cutoff modes, we will try to print until we have
    //  exhausted all precision (i.e. all remaining digits are zeros) or until
    //  we reach the desired cutoff digit.

    low = false;
    high = false;
    while (true) {
      digitExponent -= 1;

      //  extract the digit
      outputDigit = Number(scaledValue / scale);
      scaledValue = scaledValue % scale;

      if (scaledValue === 0n || digitExponent === cutoffExponent) break;

      //  store the output digit
      outBuffer[pCurDigit] = String.fromCharCode('0'.charCodeAt(0) + outputDigit);
      pCurDigit += 1;

      //  multiply larger by the output base
      scaledValue *= 10n;
    }
  }

  //  round off the final digit.
  //  default to rounding down if value got too close to 0
  let roundDown = low;

  if (low === high) {  //  legal to round up and down
    //  round to the closest digit by comparing value with 0.5. to do this we
    //  need to convert the inequality to large integer values.
    //  compare( value, 0.5 )
    //  compare( scale * value, scale * 0.5 )
    //  compare( 2 * scale * value, scale )
    scaledValue *= 2n;
    let compare = scaledValue < scale ? -1
                : (scaledValue > scale ? 1 : 0);
    roundDown = compare < 0;
    //  if we are directly in the middle, round towards the even digit
    //  (i.e. IEEE rouding rules)
    if (compare === 0) roundDown = (outputDigit & 1) === 0;
  }

  //  print the rounded digit
  if (roundDown) {
    outBuffer[pCurDigit] = String.fromCharCode('0'.charCodeAt(0) + outputDigit);
    pCurDigit += 1;
  } else {
    //  handle rounding up
    if (outputDigit === 9) {
      //  find the first non-nine prior digit
      while (true) {
        if (pCurDigit === 0) {  //  first digit
          //  output 1 at the next highest exponent
          outBuffer[pCurDigit] = '1';
          pCurDigit += 1;
          outExponent += 1;
          break;
        }
        pCurDigit -= 1;
        if (outBuffer[pCurDigit] !== '9') {
          //  increment the digit
          outBuffer[pCurDigit] = String.fromCharCode(outBuffer[pCurDigit].charCodeAt(0) + 1);
          pCurDigit += 1;
          break;
        }
      }
    } else {
      //  values in the range [0,8] can perform a simple round up
      outBuffer[pCurDigit] = String.fromCharCode('0'.charCodeAt(0) + outputDigit + 1);
      pCurDigit += 1;
    }
  }

  //  trim trailing zeroes, produce output
  const digits = outBuffer.slice(0, pCurDigit).join('');
  return { digits, outExponent };
}
