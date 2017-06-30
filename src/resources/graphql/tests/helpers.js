export function deleteKeysFrom(keys, ...objs) {
  return keys.forEach(k => objs.forEach(obj => delete obj[k]))
}
