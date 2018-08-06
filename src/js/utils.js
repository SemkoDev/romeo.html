export function formatIOTAAmount(amount) {
  if (typeof amount !== 'integer') {
    amount = parseInt(amount, 10);
  }

  let units = '';
  let negative = '';
  let afterComma = '';
  let beforeComma = '';
  let hidden = '';
  let afterCommaDigits = 0;

  if (amount < 0) {
    amount = Math.abs(amount);
    negative = '-';
  }

  /*
  1 Kiota = 10³ iota = 1,000 iota
  1 Miota = 10⁶ iota = 1,000,000 iota
  1 Giota = 10⁹ iota = 1,000,000,000 iota
  1 Tiota = 10¹² iota = 1,000,000,000,000 iota
  1 Piota = 10¹⁵ iota = 1,000,000,000,000,000 iota
  */

  if (amount >= 1000000000000000) {
    units = 'P';
    afterCommaDigits = 15;
  } else if (amount >= 1000000000000) {
    units = 'T';
    afterCommaDigits = 12;
  } else if (amount >= 1000000000) {
    units = 'G';
    afterCommaDigits = 9;
  } else if (amount >= 1000000) {
    units = 'M';
    afterCommaDigits = 6;
  } else {
    units = '';
    afterCommaDigits = 0;
  }

  amount = amount.toString();

  const digits = amount.split('').reverse();

  for (let i = 0; i < afterCommaDigits; i++) {
    afterComma = digits[i] + afterComma;
  }

  if (/^0*$/.test(afterComma)) {
    afterComma = '';
  }

  let j = 0;

  for (let i = afterCommaDigits; i < digits.length; i++) {
    if (j > 0 && j % 3 === 0) {
      beforeComma = "'" + beforeComma;
    }
    beforeComma = digits[i] + beforeComma;
    j++;
  }

  if (afterComma.length > 1) {
    hidden = afterComma.substring(1).replace(/0+$/, '');
    afterComma = afterComma[0];
  }

  const short =
    units +
    negative +
    beforeComma +
    (afterComma ? '.' + afterComma : '') +
    (hidden ? '+' : '');
  const long = hidden ? short.replace('+', hidden) : '';

  return { short, long };
}
