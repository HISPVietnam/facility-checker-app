function hasChanged(obj1, obj2, ignoreKeys = []) {
  for (const key of Object.keys(obj1)) {
    if (ignoreKeys.includes(key)) continue;

    const val1 = obj1[key];
    const val2 = obj2[key];

    if (val1 && val1 !== val2) {
      return true;
    }
  }
  return false;
}

export { hasChanged };
