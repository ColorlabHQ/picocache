import TagSet from "./TagSet.js";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const STORAGE_TYPES = ["local", "session"];
const MESSAGE_TTL_INVALID = "ttl must be a non-negative integer";
const MISSING = Symbol();
const TTL_MISSING = -1;
export const TTL_FOREVER = 0;

/**
 * 默认缓存配置
 */
const Default = {
  /**
   * 存储类型
   *
   * local:
   *   localStorage
   *
   * session:
   *   sessionStorage
   */
  type: "local",

  /**
   * 默认过期时间
   *
   * 单位:
   * 秒
   *
   * 0:
   * 永不过期
   */
  ttl: TTL_FOREVER,

  /**
   * key 前缀
   *
   * 用于隔离不同应用缓存
   */
  prefix: "",

  /**
   * 序列化
   */
  serialize(value) {
    return encoder.encode(JSON.stringify(value)).toBase64();
  },

  /**
   * 反序列化
   */
  deserialize(value) {
    return JSON.parse(decoder.decode(Uint8Array.fromBase64(value)));
  },

  /**
   * 获取缓存失败后是否强制删除
   */
  failDelete: true,
};

class Cache {
  #cache;

  #config;

  /**
   * 当前 namespace 下有效缓存数量
   */
  get length() {
    return this.keys().length;
  }

  constructor(config = {}) {
    this.#config = {
      ...Default,
      ...config,
    };

    if (!STORAGE_TYPES.includes(this.#config.type)) {
      throw new TypeError(
        `Unsupported cache storage type "${this.#config.type}". ` +
          `Expected one of: ${STORAGE_TYPES.join(", ")}`,
      );
    }

    if (!isNonNegativeInteger(this.#config.ttl)) {
      throw new TypeError(MESSAGE_TTL_INVALID);
    }

    /**
     * 获取 Storage
     */
    this.#cache = window[`${this.#config.type}Storage`];
  }

  /**
   * 创建新的缓存实例
   */
  create(config = {}) {
    return new Cache(config);
  }

  /**
   * 获取原生 Storage 对象
   */
  handler() {
    return this.#cache;
  }

  /**
   * 生成真实key
   */
  #getKey(key) {
    return `${this.#config.prefix}${key}`;
  }

  #getItem(key) {
    return this.#cache.getItem(this.#getKey(key));
  }

  #setItem(key, value) {
    return this.#cache.setItem(this.#getKey(key), this.#config.serialize(value));
  }

  #removeItem(key) {
    this.#cache.removeItem(this.#getKey(key));
  }

  /**
   * 获取原始缓存值
   */
  #getCacheValue(key) {
    const raw = this.#getItem(key);

    if (raw === null) {
      return MISSING;
    }

    let cacheValue;

    try {
      cacheValue = this.#config.deserialize(raw);
    } catch (_error) {
      if (this.#config.failDelete) this.remove(key);
      return MISSING;
    }

    const { expire } = cacheValue;

    /**
     * 永不过期或未过期
     */
    if (expire === TTL_FOREVER || expire > Date.now()) {
      return cacheValue;
    }

    /**
     * 正常过期，直接删除
     */
    this.remove(key);

    return MISSING;
  }

  /**
   * 判断缓存是否存在
   *
   * 同时检查过期
   */
  has(key) {
    return this.#getCacheValue(key) !== MISSING;
  }

  /**
   * 获取缓存
   */
  get(key, defaultValue = null) {
    const cacheValue = this.#getCacheValue(key);

    if (cacheValue !== MISSING) {
      return cacheValue.value;
    }

    return valueOrCall(defaultValue);
  }

  /**
   * 保存缓存
   */
  set(key, value, ttl = TTL_FOREVER) {
    if (!isNonNegativeInteger(ttl)) {
      throw new TypeError(MESSAGE_TTL_INVALID);
    }

    try {
      const cacheValue = {
        value,
        expire: ttl === TTL_FOREVER ? TTL_FOREVER : Date.now() + ttl * 1000,
      };

      this.#setItem(key, cacheValue);

      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * 删除缓存
   */
  remove(key) {
    this.#removeItem(key);

    return true;
  }

  /**
   * 清理当前 namespace 缓存
   */
  clear() {
    for (const key of this.keys()) {
      this.remove(key);
    }

    return true;
  }

  /**
   * 缓存不存在时计算并保存
   */
  remember(key, value, ttl = TTL_FOREVER) {
    const cacheValue = this.#getCacheValue(key);

    if (cacheValue !== MISSING) {
      return cacheValue.value;
    }

    const result = valueOrCall(value);

    this.set(key, result, ttl);

    return result;
  }

  /**
   * 自增
   */
  inc(key, step = 1) {
    if (!isInteger(step)) {
      throw new TypeError("increment step must be an integer");
    }

    const value = this.get(key);

    if (!isInteger(value)) {
      throw new Error(`Unsupported operand types: ${getType(value)} + int`);
    }

    const result = value + step;

    if (!this.set(key, result)) {
      throw new Error("Failed to save incremented cache value");
    }

    return result;
  }

  /**
   * 自减
   */
  dec(key, step = 1) {
    if (!isInteger(step)) {
      throw new TypeError("decrement step must be an integer");
    }

    return this.inc(key, -step);
  }

  /**
   * 标签缓存
   */
  tag(tag) {
    return new TagSet(tag, this);
  }

  /**
   * 获取标签的缓存标识列表
   */
  getTagItems(tag) {
    return this.get(tag, []);
  }

  /**
   * 获取后删除
   */
  pull(key, defaultValue = null) {
    const value = this.get(key, defaultValue);

    this.remove(key);

    return value;
  }

  /**
   * 数组追加缓存
   */
  push(key, value) {
    let list = this.get(key, []);

    if (!Array.isArray(list)) {
      throw new Error("only array cache can be push");
    }

    list.push(value);

    /**
     * 最大保存1000条
     */
    if (list.length > 1000) {
      list.shift();
    }

    /**
     * 简单去重
     */
    list = [...new Set(list)];

    this.set(key, list);
  }

  /**
   * 切换存储驱动
   */
  store(type) {
    return new Cache({
      ...this.#config,
      type,
    });
  }

  /**
   * 获取缓存剩余有效时间
   *
   * 返回值：
   *   -1：缓存不存在
   *    0：永久缓存
   *   >0：剩余有效时间，单位为秒
   */
  ttl(key) {
    const cacheValue = this.#getCacheValue(key);

    if (cacheValue === MISSING) {
      return TTL_MISSING;
    }

    if (cacheValue.expire === TTL_FOREVER) {
      return TTL_FOREVER;
    }

    return Math.ceil((cacheValue.expire - Date.now()) / 1000);
  }

  many(keys) {
    const result = Object.create(null);
    for (const key of keys) {
      result[key] = this.get(key);
    }
    return result;
  }

  setMany(values, ttl = TTL_FOREVER) {
    let success = true;

    for (const [key, value] of Object.entries(values)) {
      if (!this.set(key, value, ttl)) {
        success = false;
      }
    }

    return success;
  }

  /**
   * 获取当前 namespace 下所有有效缓存 key
   */
  keys() {
    const prefix = this.#config.prefix;
    const keys = [];

    for (const key of Object.keys(this.#cache)) {
      if (key.startsWith(prefix)) {
        keys.push(key.slice(prefix.length));
      }
    }
    return keys;
  }
}

function isInteger(value) {
  return Number.isInteger(value);
}

function isNonNegativeInteger(value) {
  return isInteger(value) && value >= 0;
}

function valueOrCall(value) {
  return typeof value === "function" ? value() : value;
}

function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1);
}

export default Cache;
