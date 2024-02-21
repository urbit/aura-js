/**
 * encode the string into @ta-safe format, using logic from +wood.
 * for example, 'some Chars!' becomes '~.some.~43.hars~21.'
 *
 * @param   {String} str  the string to encode
 * @returns {String}      the @ta encoded string
 */
export function encodeTa(str: string): string {
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    let add = '';
    switch (char) {
      case ' ':
        add = '.';
        break;
      case '.':
        add = '~.';
        break;
      case '~':
        add = '~~';
        break;
      default:
        const charCode = str.charCodeAt(i);
        if (
          (charCode >= 97 && charCode <= 122) || // a-z
          (charCode >= 48 && charCode <= 57) || // 0-9
          char === '-'
        ) {
          add = char;
        } else {
          // TODO behavior for unicode doesn't match +wood's,
          //     but we can probably get away with that for now.
          add = '~' + charCode.toString(16) + '.';
        }
    }
    out = out + add;
  }
  return '~.' + out;
}

/**
 * decode @ta string previously encoded. for example,
 * '~.some.~43.hars~21.' becomes 'some Chars!'
 *
 * @param   {String} str  the string to encode
 * @returns {String}      the @ta encoded string
 */
export function decodeTa(str: string): string {
  let out = '';
  let strip = str.replace('~.', '');

  while (strip.length > 0) {
    const space = strip.match(/^\./);
    if (space) {
      strip = strip.slice(1);
      out += ' ';
      continue;
    }

    const sig = strip.match(/^~~/);
    if (sig) {
      strip = strip.slice(2);
      out += '~';
      continue;
    }

    const period = strip.match(/^~\./);
    if (period) {
      strip = strip.slice(2);
      out += '.';
      continue;
    }

    const char = strip.match(/^~(\d{1,3})./);
    if (char) {
      strip = strip.replace(char[0], '');
      out += String.fromCharCode(parseInt(char[1], 16));
      continue;
    }

    const normal = strip.match(/^[\w\d-]+/);
    if (normal) {
      strip = strip.replace(normal[0], '');
      out += normal[0];
      continue;
    }

    throw new Error('Invalid @ta encoded string');
  }

  return out;
}
