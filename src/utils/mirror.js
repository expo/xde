/**
 * @flow
 */

export function mirror<T: { [key: string]: null }>(keyObj: T): $ObjMapi<T, <V>(v: V) => V> {
  return Object.keys(keyObj).reduce((mirror, key) => {
    mirror[key] = key;
    return mirror;
  }, Object.create(null));
}
