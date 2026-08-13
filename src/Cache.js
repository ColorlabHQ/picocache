import TagSet from "./TagSet.js";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const STORAGE_TYPES = ["local", "session"];

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
  expire: 0,

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
};

class Cache {
  #cache;

  #config;

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

    /**
     * 获取存储驱动
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

  /**
   * 保存缓存
   */
  set(key, value, expire = null) {
    /**
     * null:
     * 使用默认过期时间
     *
     * 0:
     * 永不过期
     */
    const ttl = expire ?? this.#config.expire;

    const cacheValue = {
      value,

      /**
       * 0代表永久
       */
      expire: ttl === 0 ? 0 : Date.now() + ttl * 1000,
    };

    try {
      this.#cache.setItem(this.#getKey(key), this.#config.serialize(cacheValue));

      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * 判断缓存是否存在
   *
   * 同时检查过期
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * 获取缓存
   */
  get(key, defaultValue = null) {
    const raw = this.#cache.getItem(this.#getKey(key));

    if (raw !== null) {
      try {
        const cacheValue = this.#config.deserialize(raw);

        /**
         * 永不过期
         */
        if (cacheValue.expire === 0 || cacheValue.expire > Date.now()) {
          return cacheValue.value;
        }

        /**
         * 删除过期缓存
         */
        this.delete(key);
      } catch (_error) {}
    }

    return isFunction(defaultValue) ? defaultValue() : defaultValue;
  }

  /**
   * 删除缓存
   */
  delete(key) {
    const realKey = this.#getKey(key);

    if (this.#cache.getItem(realKey) === null) {
      return false;
    }

    this.#cache.removeItem(realKey);

    return true;
  }

  /**
   * 清理当前 namespace 缓存
   */
  clear() {
    const prefix = this.#config.prefix;

    for (const key of Object.keys(this.#cache)) {
      if (key.startsWith(prefix)) {
        this.#cache.removeItem(key);
      }
    }

    return true;
  }

  /**
   * 缓存不存在时计算并保存
   */
  remember(key, value, expire = null) {
    if (this.has(key)) {
      return this.get(key);
    }

    const result = isFunction(value) ? value() : value;

    this.set(key, result, expire);

    return result;
  }

  /**
   * 缓存不存在时计算并永久保存
   */
  rememberForever(key, value) {
    return this.remember(key, value, 0);
  }

  /**
   * 自增
   */
  inc(key, step = 1) {
    const value = this.get(key);

    if (!isNumber(value)) {
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
    return this.inc(key, -step);
  }

  /**
   * 标签缓存
   */
  tag(tag) {
    return new TagSet(tag, this);
  }

  /**
   * 获取后删除
   */
  pull(key, defaultValue = null) {
    const value = this.get(key, defaultValue);

    this.delete(key);

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
   * Tag内部使用
   */
  getTagItems(tag) {
    return this.get(tag, []);
  }
}

function isFunction(value) {
  return typeof value === "function";
}

function isNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1);
}

export default Cache;
