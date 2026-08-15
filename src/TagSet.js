import { TTL_FOREVER } from "./Cache";

/**
 *  标签集合
 */
class TagSet {
  #tag;
  #cache;

  constructor(tag, cache) {
    // 标签的缓存Key
    this.#tag = Array.isArray(tag) ? tag : [tag];

    // 缓存句柄
    this.#cache = cache;
  }

  set(key, value, ttl = TTL_FOREVER) {
    this.append(key);
    return this.#cache.set(key, value, ttl);
  }

  append(key) {
    for (const tag of this.#tag) {
      // 读取标签
      const tagItems = this.#cache.getTagItems(tag);

      // 判断标签是否在数组里,不再就直接加入
      if (!tagItems.includes(key)) {
        // 加入数组
        tagItems.push(key);

        // 重新设置回去
        this.#cache.set(tag, tagItems);
      }
    }
    return null;
  }

  clear() {
    for (const tag of this.#tag) {
      const tagItems = this.#cache.getTagItems(tag);

      // 分别遍历删除所有的缓存
      for (const cacheKey of tagItems) {
        this.#cache.remove(cacheKey);
      }
      // 再删除标签本身
      this.#cache.remove(tag);
    }
    return true;
  }
}

export default TagSet;
