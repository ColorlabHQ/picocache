import TagSet from "./TagSet.js";

/**
 * 默认缓存配置
 */
const Default = {
  /**
   * 缓存驱动类型
   * local: localStorage
   * session: sessionStorage
   */
  type: "local",
  /**
   * 默认过期时间
   * 单位：秒
   * 0 表示永不过期
   */
  expire: 0,
  /**
   * key 前缀
   */
  prefix: "",
  /**
   * 序列化方法
   */
  serialize: JSON.stringify,
  /**
   * 反序列化方法
   */
  deserialize: JSON.parse,
};

class Cache {
  #cache;
  #config;

  constructor(config = {}) {
    this.#config = {
      ...Default,
      ...config,
    };

    this.#cache = window[`${this.#config.type}Storage`];
  }

  create(config = {}) {
    return new Cache(config);
  }

  handler() {
    return this.#cache;
  }

  #getKey(key) {
    return `${this.#config.prefix}${key}`;
  }

  set(key, value, expire = null) {
    const cacheValue = {
      value,
      expire:
        expire || this.#config.expire !== 0
          ? Date.now() + (expire || this.#config.expire) * 1000
          : 0,
    };
    try {
      this.#cache.setItem(this.#getKey(key), this.#config.serialize(cacheValue));

      return true;
    } catch (_error) {
      return false;
    }
  }

  has(key) {
    return this.#cache.getItem(this.#getKey(key)) !== null;
  }

  get(key, defaultValue = null) {
    const cacheValue = this.#cache.getItem(this.#getKey(key));
    if (cacheValue) {
      try {
        const parsedValue = this.#config.deserialize(cacheValue);
        if (parsedValue.expire === 0 || parsedValue.expire >= Date.now()) {
          return parsedValue.value;
        }
        this.delete(key);
      } catch (_error) {}
      return null;
    } else {
      if (isFunction(defaultValue)) {
        return Reflect.apply(defaultValue, null, []);
      }
      return defaultValue;
    }
  }

  delete(key) {
    if (!this.has(key)) {
      return false;
    }
    this.#cache.removeItem(this.#getKey(key));
    return true;
  }

  clear() {
    this.#cache.clear();
    return true;
  }

  remember(key, value, expire = null) {
    const cachedValue = this.get(key);
    if (cachedValue !== null) {
      return cachedValue;
    }

    if (isFunction(value)) {
      //允许第二个参数是一个函数
      const computedValue = value();
      this.set(key, computedValue, expire);
      return computedValue;
    }
    this.set(key, value, expire);
    return value;
  }

  inc(key, step = 1) {
    const cachedValue = this.get(key);

    if (!isNumber(cachedValue)) {
      throw new Error(`Unsupported operand types: ${getType(cachedValue)} + int`);
    }
    this.set(key, cachedValue + step);
    //再查询返回出来
    return this.get(key);
  }

  dec(key, step = 1) {
    return this.inc(key, -step);
  }

  tag(tag) {
    return new TagSet(tag, this);
  }

  pull(key, defaultValue = null) {
    const value = this.get(key, defaultValue);
    this.delete(key);
    return value;
  }

  push(key, value) {
    let item = this.get(key, []);

    if (!Array.isArray(item)) {
      throw new Error(`only array cache can be push`);
    }

    item.push(value);

    if (item.length > 1000) {
      item.shift(); // 删除最旧的
    }

    // 去重（保留第一次出现的顺序）
    item = [...new Set(item)];

    this.set(key, item);
  }

  store(type) {
    return new Cache({
      type,
      expire: this.#config.expire,
      prefix: this.#config.prefix,
      serialize: this.#config.serialize,
      deserialize: this.#config.deserialize,
    });
  }

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
