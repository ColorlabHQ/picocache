export type CacheType = "local" | "session";

/**
 * 永不过期。
 *
 * 等价于 ttl = 0。
 */
export declare const TTL_FOREVER: 0;

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
   * 默认过期时间。
   *
   * 单位：秒
   *
   * 0 表示永不过期。
   *
   * @default 0
   */
  ttl?: number;

  /**
   * 缓存 key 前缀。
   *
   * 用于隔离不同应用缓存。
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

  /**
   * 获取缓存失败后是否自动删除异常数据。
   *
   * @default true
   */
  failDelete?: boolean;
}

/**
 * 标签缓存集合。
 */
export interface TagSet {
  /**
   * 设置缓存并加入当前标签。
   */
  set<T = unknown>(key: string, value: T, ttl?: number): boolean;

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
   * 当前 namespace 下有效缓存数量。
   */
  readonly length: number;

  /**
   * 创建新的缓存实例。
   */
  create(config?: CacheConfig): Cache;

  /**
   * 获取原生 Storage 对象。
   */
  handler(): Storage;

  /**
   * 判断缓存是否存在。
   *
   * 同时检查缓存是否过期。
   */
  has(key: string): boolean;

  /**
   * 获取缓存。
   *
   * 如果缓存不存在，则返回默认值。
   */
  get<T = unknown>(key: string, defaultValue?: T | (() => T)): T | null;

  /**
   * 保存缓存。
   */
  set<T = unknown>(key: string, value: T, ttl?: number): boolean;

  /**
   * 删除缓存。
   */
  remove(key: string): boolean;

  /**
   * 清理当前 namespace 下所有缓存。
   */
  clear(): boolean;

  /**
   * 缓存不存在时计算并保存。
   */
  remember<T>(key: string, value: T | (() => T), ttl?: number): T;

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
   * 获取标签关联的缓存 key。
   *
   * 内部供 TagSet 使用。
   */
  getTagItems(tag: string): string[];

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
   * 获取缓存剩余有效时间。
   *
   * 返回：
   *
   * -1: 不存在
   * 0: 永不过期
   * >0: 剩余秒数
   */
  ttl(key: string): number;

  /**
   * 批量获取缓存。
   */
  many<T = unknown>(keys: string[]): Record<string, T | null>;

  /**
   * 批量设置缓存。
   */
  setMany<T = unknown>(values: Record<string, T>, ttl?: number): boolean;

  /**
   * 获取当前 namespace 下所有有效缓存 key。
   */
  keys(): string[];
}

/**
 * 默认缓存实例函数。
 *
 * 支持：
 *
 * cache()
 * cache(key)
 * cache(key, value)
 * cache(key, null)
 *
 * 等函数调用方式。
 */
export interface CacheFunction extends Cache {
  /**
   * 返回默认 Cache 实例。
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
  <T = unknown>(key: string, value: T, ttl?: number): boolean;
}

/**
 * 默认缓存实例。
 */
declare const cache: CacheFunction;

export default cache;
