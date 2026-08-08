/**
 * 默认参数
 */
const DEFAULT = {
  prefix: "",
  parseFunction: true,
  excludeKeys: [],
};

/**
 * 解析元素上的 data-* 属性
 *
 * @param {HTMLElement} element
 * @param {Object} options
 * @param {string} [options.prefix]
 * @param {boolean} [options.parseFunction]
 * @param {string[]} [options.excludeKeys]
 * @returns {Record<string, unknown>}
 */
export default function datasetConfig(element, options = {}) {
  const opts = {
    ...DEFAULT,
    ...options,
  };

  // prefix 支持：
  // app
  // app-scrolltop
  // appScrolltop
  const prefix = normalizePrefix(opts.prefix);
  const prefixLength = prefix.length;

  // 提前转换，避免重复 split / camelCase
  const excludePaths = opts.excludeKeys.map(normalizePath);

  const data = {};

  for (const key in element.dataset) {
    const value = element.dataset[key];

    let realKey;

    if (prefix) {
      if (!matchPrefix(key, prefix)) continue;

      realKey = pascalToCamel(key.slice(prefixLength));
    } else {
      realKey = key;
    }

    const path = normalizePath(realKey);

    if (isExcluded(path, excludePaths)) {
      continue;
    }

    setDeepProperty(data, path, parseValue(value, opts.parseFunction));
  }

  return data;
}

/**
 * 是否排除
 */
function isExcluded(targetPath, excludePaths) {
  return excludePaths.some((excludePath) => {
    if (excludePath.length > targetPath.length) {
      return false;
    }

    return excludePath.every((part, i) => part === targetPath[i]);
  });
}

/**
 * 算法：先遍历所有父节点，最后再赋值
 * 设置深层对象
 */
function setDeepProperty(obj, keys, value) {
  const lastKey = keys.at(-1);
  const parents = keys.slice(0, -1);

  let current = obj;

  for (const key of parents) {
    if (!Object.hasOwn(current, key) || typeof current[key] !== "object" || current[key] === null) {
      current[key] = {};
    }

    current = current[key];
  }

  current[lastKey] = value;
}

/**
 * 解析值
 */
function parseValue(value, parseFunction) {
  if (parseFunction) {
    const fn = Reflect.get(window, value);

    if (typeof fn === "function") {
      return fn;
    }
  }

  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;

  if (value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }

  if (
    (value.startsWith("{") && value.endsWith("}")) ||
    (value.startsWith("[") && value.endsWith("]"))
  ) {
    try {
      return JSON.parse(value);
    } catch {}
  }

  return value;
}

/**
 * 将路径统一转换成数组
 *
 * config.foo-delay
 * =>
 * ["config","fooDelay"]
 */
function normalizePath(path) {
  return kebabToCamel(path).split(".").map(pascalToCamel);
}

/**
 * prefix 支持：
 *
 * lts
 * lts-scrolltop
 * ltsScrolltop
 */
function normalizePrefix(prefix) {
  return kebabToCamel(prefix);
}

/**
 * kebab-case -> camelCase
 */
function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (_, p1) => p1.toUpperCase());
}

/**
 * Pascal -> camel
 */
function pascalToCamel(str) {
  return str ? str.charAt(0).toLowerCase() + str.slice(1) : "";
}

/**
 * 判断 dataset key 是否匹配指定 prefix
 *
 * 例如：
 *
 * key = appScrollOffset
 * prefix = appScroll
 * ✓ true
 *
 * key = appScrolltopOffset
 * prefix = appScroll
 * ✗ false
 *
 * key = appScroll
 * prefix = appScroll
 * ✓ true
 */
function matchPrefix(key, prefix) {
  if (!key.startsWith(prefix)) {
    return false;
  }

  const next = key[prefix.length];

  return next !== undefined && /[A-Z]/.test(next);
}
