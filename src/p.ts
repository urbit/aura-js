import ob from './hoon/ob';

export type rank = 'czar'   | 'king' | 'duke'   | 'earl' | 'pawn';
export type size = 'galaxy' | 'star' | 'planet' | 'moon' | 'comet';

//
//  main parsing & rendering
//

//NOTE  matches for shape, not syllables
export const regexP = /^~([a-z]{3}|([a-z]{6}(\-[a-z]{6}){0,3}(\-(\-[a-z]{6}){4})*))$/;

/**
 * Convert a valid `@p` literal string to a bigint.
 * Throws on malformed input.
 * @param  {String}  str  certified-sane `@p` literal string
 */
export function parseP(str: string): bigint {
  const syls = patp2syls(str);

  const syl2bin = (idx: number) => {
    return idx.toString(2).padStart(8, '0');  //NOTE  base16 isn't any faster
  }

  const addr = syls.reduce(
    (acc, syl, idx) =>
      idx % 2 !== 0 || syls.length === 1
        ? acc + syl2bin(suffixes.indexOf(syl))
        : acc + syl2bin(prefixes.indexOf(syl)),
    ''
  );

  const num = BigInt('0b' + addr);
  return ob.fynd(num);
}

/**
 * Convert a valid `@p` literal string to a bigint.
 * Returns null on malformed input.
 * @param  {String}  str  `@p` literal string
 */
export function parseValidP(str: string): bigint | null {
  if (!regexP.test(str) || !validSyllables(str)) return null;
  const res = parseP(str);
  return (str === renderP(res)) ? res : null;
}

/**
 * Convert a number to a @p-encoded string.
 * @param  {bigint}  num
 */
export function renderP(num: bigint): string {
  const sxz = ob.fein(num);
  const dyx = Math.ceil(sxz.toString(16).length / 2);
  const dyy = Math.ceil(sxz.toString(16).length / 4);

  function loop(tsxz: bigint, timp: number, trep: string): string {
    const log = tsxz & 0xFFFFn;
    const pre = prefixes[Number(log >> 8n)];
    const suf = suffixes[Number(log & 0xFFn)];
    const etc = (timp & 0b11) ? '-' : ((timp === 0) ? '' : '--');

    const res = pre + suf + etc + trep;

    return timp === dyy ? trep : loop(tsxz >> 16n, timp + 1, res);
  }

  return (
    '~' + (dyx <= 1 ? suffixes[Number(sxz)] : loop(sxz, 0, ''))
  );
}

//
//  utilities
//

/**
 * Validate a @p string.
 *
 * @param  {String}  str a string
 * @return  {boolean}
 */
export function isValidP(str: string): boolean {
  return regexP.test(str)               //  general structure
      && validSyllables(str)            //  valid syllables
      && str === renderP(parseP(str));  //  no leading zeroes
}

/**
 * Determine the `$rank` of a `@p` value or literal.
 * Throws on malformed input string.
 * @param   {String}  who  `@p` value or literal string
 */
export function clan(who: bigint | string): rank {
  let num: bigint;
  if (typeof who === 'bigint') num = who;
  else num = checkedParseP(who);

  return num <= 0xFFn
    ? 'czar'
    : num <= 0xFFFFn
    ? 'king'
    : num <= 0xFFFFFFFFn
    ? 'duke'
    : num <= 0xFFFFFFFFFFFFFFFFn
    ? 'earl'
    : 'pawn';
}

/**
 * Determine the "size" of a `@p` value or literal.
 * Throws on malformed input string.
 * @param   {String}  who  `@p` value or literal string
 */
export function kind(who: bigint | string): size {
  return rankToSize(clan(who));
}

export function rankToSize(rank: rank): size {
  switch (rank) {
    case 'czar': return 'galaxy';
    case 'king': return 'star';
    case 'duke': return 'planet';
    case 'earl': return 'moon';
    case 'pawn': return 'comet';
  }
}
export function sizeToRank(size: size): rank {
  switch (size) {
    case 'galaxy': return 'czar';
    case 'star':   return 'king';
    case 'planet': return 'duke';
    case 'moon':   return 'earl';
    case 'comet':  return 'pawn';
  }
}

/**
 * Determine the parent of a `@p` value.
 * Throws on malformed input string.
 * @param  {String | number}  who  `@p` value or literal string
 */
export function sein(who: bigint): bigint;
export function sein(who: string): string;
export function sein(who: bigint | string): typeof who {
  let num: bigint;
  if (typeof who === 'bigint') num = who;
  else num = checkedParseP(who);

  let mir = clan(num);

  const res =
    mir === 'czar'
      ? num
      : mir === 'king'
      ? num & 0xFFn
      : mir === 'duke'
      ? num & 0xFFFFn
      : mir === 'earl'
      ? num & 0xFFFFFFFFn
      : num & 0xFFFFn;

  if (typeof who === 'bigint') return res;
  else return renderP(res);
}

/**
 * Render short-form ship name.
 * Throws on malformed input string.
 * @param  {String | number}  who  `@p` value or literal string
 */
export function cite(who: bigint | string): string {
  let num: bigint;
  if (typeof who === 'bigint') num = who;
  else num = checkedParseP(who);

  if (num <= 0xFFFFFFFFn) {
    return renderP(num);
  } else if (num <= 0xFFFFFFFFFFFFFFFFn) {
    return renderP(num & 0xFFFFFFFFn).replace('-', '^');
  } else {
    return renderP(BigInt('0x'+num.toString(16).slice(0,4))) + '_' + renderP(num & 0xFFFFn).slice(1);
  }
}

//
//  internals
//

function checkedParseP(str: string): bigint {
  if (!isValidP(str)) throw new Error('invalid @p literal: ' + str);
  return parseP(str);
}

const pre = `
dozmarbinwansamlitsighidfidlissogdirwacsabwissib\
rigsoldopmodfoglidhopdardorlorhodfolrintogsilmir\
holpaslacrovlivdalsatlibtabhanticpidtorbolfosdot\
losdilforpilramtirwintadbicdifrocwidbisdasmidlop\
rilnardapmolsanlocnovsitnidtipsicropwitnatpanmin\
ritpodmottamtolsavposnapnopsomfinfonbanmorworsip\
ronnorbotwicsocwatdolmagpicdavbidbaltimtasmallig\
sivtagpadsaldivdactansidfabtarmonranniswolmispal\
lasdismaprabtobrollatlonnodnavfignomnibpagsopral\
bilhaddocridmocpacravripfaltodtiltinhapmicfanpat\
taclabmogsimsonpinlomrictapfirhasbosbatpochactid\
havsaplindibhosdabbitbarracparloddosbortochilmac\
tomdigfilfasmithobharmighinradmashalraglagfadtop\
mophabnilnosmilfopfamdatnoldinhatnacrisfotribhoc\
nimlarfitwalrapsarnalmoslandondanladdovrivbacpol\
laptalpitnambonrostonfodponsovnocsorlavmatmipfip\
`;

const suf = `
zodnecbudwessevpersutletfulpensytdurwepserwylsun\
rypsyxdyrnuphebpeglupdepdysputlughecryttyvsydnex\
lunmeplutseppesdelsulpedtemledtulmetwenbynhexfeb\
pyldulhetmevruttylwydtepbesdexsefwycburderneppur\
rysrebdennutsubpetrulsynregtydsupsemwynrecmegnet\
secmulnymtevwebsummutnyxrextebfushepbenmuswyxsym\
selrucdecwexsyrwetdylmynmesdetbetbeltuxtugmyrpel\
syptermebsetdutdegtexsurfeltudnuxruxrenwytnubmed\
lytdusnebrumtynseglyxpunresredfunrevrefmectedrus\
bexlebduxrynnumpyxrygryxfeptyrtustyclegnemfermer\
tenlusnussyltecmexpubrymtucfyllepdebbermughuttun\
bylsudpemdevlurdefbusbeprunmelpexdytbyttyplevmyl\
wedducfurfexnulluclennerlexrupnedlecrydlydfenwel\
nydhusrelrudneshesfetdesretdunlernyrsebhulryllud\
remlysfynwerrycsugnysnyllyndyndemluxfedsedbecmun\
lyrtesmudnytbyrsenwegfyrmurtelreptegpecnelnevfes\
`;

export const prefixes = pre.match(/.{1,3}/g) as RegExpMatchArray;
export const suffixes = suf.match(/.{1,3}/g) as RegExpMatchArray;

function patp2syls(name: string): string[] {
  return name.replace(/[\^~-]/g, '').match(/.{1,3}/g) || [];
}

//  check if string contains valid syllables
function validSyllables(name: string): boolean {
  const syls = patp2syls(name);
  return !(syls.length % 2 !== 0 && syls.length !== 1)  // wrong length
      && syls.every((syl, index) =>  //  invalid syllables
           index % 2 !== 0 || syls.length === 1
           ? suffixes.includes(syl)
           : prefixes.includes(syl)
         );
}
