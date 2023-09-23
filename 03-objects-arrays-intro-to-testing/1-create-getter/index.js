/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const keys = path.split(".");

  return (obj) => {
    let result;

    for (const key of keys) {
      if (obj === null || typeof obj !== "object") return;

      obj = result = obj[key];
    }

    return result;
  };
}
