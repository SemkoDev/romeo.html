import { romeo } from 'romeo.lib';
import { toast } from 'react-toastify';

let romeoInstance = null;

export async function login(
  username,
  password,
  onChange,
  restoreString = null
) {
  if (romeoInstance) {
    await romeoInstance.terminate();
  }
  romeoInstance = new romeo.Romeo({
    username,
    password,
    onChange
  });
  return await romeoInstance.init(restoreString);
}

export async function logout(returnBackup = false) {
  if (!romeoInstance) {
    return null;
  }
  return await romeoInstance.terminate(returnBackup);
}

export function get() {
  return romeoInstance;
}

export function showInfo(message, time = 3000, typeStr = 'info') {
  const type =
    typeStr === 'warning'
      ? toast.TYPE.WARNING
      : typeStr === 'error'
        ? toast.TYPE.ERROR
        : typeStr === 'success' ? toast.TYPE.SUCCESS : toast.TYPE.INFO;
  toast(message, {
    type,
    className: {
      //opacity: '0.7',
      top: '60px'
      //right: '-10px'
    },
    autoClose: time
  });
}

export function linkToCurrentPage() {
  const romeo = get();
  const currentPage = romeo.pages.getCurrent();
  const currentPageNumber = currentPage ? currentPage.opts.index + 1 : null;
  return currentPageNumber ? `/page/${currentPageNumber}` : null;
}

export function isCurrentIndex(index) {
  const romeo = get();
  const currentPage = romeo.pages.getCurrent();
  return currentPage ? currentPage.opts.index === index : false;
}

export function isPageTooBig(page) {
  const addresses = Object.values(page.page.addresses);
  return (
    addresses.length > 50 ||
    addresses
      .map(a => Object.values(a.transactions))
      .reduce((t, i) => t.concat(i), []).length > 300
  );
}

export function wasSpent(address) {
  const romeo = get();
  return new Promise(resolve => {
    let resolved = false;
    romeo.iota.api.ext.getSpent(
      [address],
      (e, r) => {
        if (!!(r && r[0])) {
          resolved = true;
          resolve(true);
        }
      },
      (e, r) => {
        if (resolved) {
          return;
        }
        if (e) {
          throw e;
        }
        resolve(!!(r && r[0]));
      }
    );
  });
}

const URL_MATCHES = {
  '\\/page\\/(\\d+)$': 'Page $1',
  '\\/page\\/(\\d+)/transfer': 'Send a new transfer',
  '\\/page\\/(\\d+)/address/(.+)$': 'Address $2'
};

export function findRouteName(name) {
  const key = Object.keys(URL_MATCHES).find(k => name.match(k));
  if (!key) return;
  let value = URL_MATCHES[key];
  const match = name.match(key);
  [1, 2, 3, 4, 5].forEach(i => (value = value.replace(`\$${i}`, match[i])));
  return value;
}
