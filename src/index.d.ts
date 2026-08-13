export type CacheType = "local" | "session";

/**
 * 缓存配置。
 */
export interface CacheConfig {
  /**
   * 存储类型。
   *
   * @default "local"
   */
  type?: CacheType;

  /**
   * 默认过期时间，单位为秒。
   *
   * 0 表示永不过期。
   *
   * @default 0
   */
  expire?: number;

  /**
   * 缓存 key 前缀。
   *
   * 用于隔离不同应用的缓存。
   *
   * @default ""
   */
  prefix?: string;

  /**
   * 序列化缓存数据。
   */
  serialize?: (value: unknown) => string;

  /**
   * 反序列化缓存数据。
   */
  deserialize?: (value: string) => unknown;
}

/**
 * 标签缓存集合。
 */
export interface TagSet {
  /**
   * 设置缓存并加入当前标签。
   */
  set<T = unknown>(key: string, value: T, expire?: number | null): boolean;

  /**
   * 将缓存 key 加入当前标签。
   */
  append(key: string): null;

  /**
   * 清理当前标签关联的所有缓存。
   */
  clear(): boolean;
}

/**
 * 缓存实例。
 */
export interface Cache {
  /**
   * 创建新的缓存实例。
   */
  create(config?: CacheConfig): Cache;

  /**
   * 获取原生 Storage 对象。
   */
  handler(): Storage;

  /**
   * 保存缓存。
   *
   * @param key 缓存 key
   * @param value 缓存值
   * @param expire 过期时间，单位为秒。
   *               null 表示使用默认过期时间。
   */
  set<T = unknown>(key: string, value: T, expire?: number | null): boolean;

  /**
   * 判断缓存是否存在。
   *
   * 同时检查缓存是否过期。
   */
  has(key: string): boolean;

  /**
   * 获取缓存。
   *
   * 如果缓存不存在，则返回 defaultValue。
   */
  get<T = unknown>(key: string, defaultValue?: T | (() => T)): T | null;

  /**
   * 删除缓存。
   */
  delete(key: string): boolean;

  /**
   * 清理当前 namespace 下的所有缓存。
   */
  clear(): boolean;

  /**
   * 缓存不存在时计算并保存。
   */
  remember<T>(key: string, value: T | (() => T), expire?: number | null): T;

  /**
   * 自增。
   */
  inc(key: string, step?: number): number;

  /**
   * 自减。
   */
  dec(key: string, step?: number): number;

  /**
   * 创建标签缓存集合。
   */
  tag(tag: string | string[]): TagSet;

  /**
   * 获取缓存后删除。
   */
  pull<T = unknown>(key: string, defaultValue?: T | (() => T)): T | null;

  /**
   * 向数组缓存追加数据。
   */
  push<T = unknown>(key: string, value: T): void;

  /**
   * 切换存储驱动。
   */
  store(type: CacheType): Cache;

  /**
   * 获取标签关联的缓存 key。
   *
   * 此方法主要供 TagSet 内部使用。
   */
  getTagItems<T = string>(tag: string): T[];
}

/**
 * 默认缓存实例。
 *
 * 同时支持函数调用和 Cache 实例方法。
 */
export interface CacheFunction extends Cache {
  /**
   * 不传参数时返回默认缓存实例。
   */
  (): Cache;

  /**
   * 获取缓存。
   */
  <T = unknown>(key: string): T | null;

  /**
   * 删除缓存。
   *
   * 对应：
   *
   * cache(key, null)
   */
  (key: string, value: null): boolean;

  /**
   * 保存缓存。
   */
  <T = unknown>(key: string, value: T, expire?: number | null): boolean;
}

/**
 * 默认缓存实例。
 */
declare const cache: CacheFunction;

export default cache;
