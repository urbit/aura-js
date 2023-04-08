import bigInt, { BigInteger } from 'big-integer';

const zero = bigInt(0);
const one = bigInt(1);
const two = bigInt(2);

export const pre = `
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

export const suf = `
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

export const bex = (n: BigInteger) => two.pow(n);

export const rsh = (a: BigInteger, b: BigInteger, c: BigInteger) =>
  c.divide(bex(bex(a).multiply(b)));

export const met = (a: BigInteger, b: BigInteger, c = zero): BigInteger =>
  b.eq(zero) ? c : met(a, rsh(a, one, b), c.add(one));

export const end = (a: BigInteger, b: BigInteger, c: BigInteger) =>
  c.mod(bex(bex(a).multiply(b)));

export const patp2syls = (name: string): string[] =>
  name.replace(/[\^~-]/g, '').match(/.{1,3}/g) || [];

/**
 * Weakly check if a string is a valid @p or @q value.
 *
 * This is, at present, a pretty weak sanity check.  It doesn't confirm the
 * structure precisely (e.g. dashes), and for @q, it's required that q values
 * of (greater than one) odd bytelength have been zero-padded.  So, for
 * example, '~doznec-binwod' will be considered a valid @q, but '~nec-binwod'
 * will not.
 *
 * @param  {String}  name a @p or @q value
 * @return  {boolean}
 */
export function isValidPat(name: string): boolean {
  if (typeof name !== 'string') {
    throw new Error('isValidPat: non-string input');
  }

  const leadingTilde = name.slice(0, 1) === '~';

  if (leadingTilde === false || name.length < 4) {
    return false;
  } else {
    const syls = patp2syls(name);
    const wrongLength = syls.length % 2 !== 0 && syls.length !== 1;
    const sylsExist = syls.reduce(
      (acc, syl, index) =>
        acc &&
        (index % 2 !== 0 || syls.length === 1
          ? suffixes.includes(syl)
          : prefixes.includes(syl)),
      true
    );

    return !wrongLength && sylsExist;
  }
}
