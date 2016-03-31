'use strict';

export function normalizeUsername(u) {
  if (u) {
    return u.toLowerCase().replace(/^_+/, '').replace(/_+$/, '').replace(/[^0-9a-z_]/g, '');
  } else {
    return u;
  }
}

export function normalizeUsernameWhileTyping(u) {
  // This is different from `normalizeUsername` because we want to allow underscores at the beginning and
  // the end here because otherwise, it's annoying and hard to type in a username with any underscores in it
  return u.toLowerCase().replace(/[^0-9a-z_]/g, '');
}
