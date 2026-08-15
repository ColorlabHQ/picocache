import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import Cache from "../src/Cache.js";
import cache from "../src/index.js";

describe("picocache", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("type 无效时抛出异常", () => {
    expect(() => {
      cache.create({
        type: "foo",
      });
    }).toThrow(
      new TypeError('Unsupported cache storage type "foo". Expected one of: local, session'),
    );
  });

  it("获取当前 namespace 缓存数量", () => {
    cache.set("a", 1);
    cache.set("b", 2);

    expect(cache.length).toBe(2);

    cache.remove("a");

    expect(cache.length).toBe(1);
  });

  it("创建实例时 ttl 配置必须是非负整数", () => {
    expect(() => {
      cache.create({
        ttl: -1,
      });
    }).toThrow(new TypeError("ttl must be a non-negative integer"));

    expect(() => {
      cache.create({
        ttl: "100",
      });
    }).toThrow(new TypeError("ttl must be a non-negative integer"));
  });

  it("反序列化失败时应该删除损坏缓存", () => {
    cache.set("foo", "bar");

    localStorage.setItem("foo", "invalid-data");

    expect(cache.get("foo")).toBe(null);

    // failDelete 默认 true
    expect(localStorage.getItem("foo")).toBeNull();
  });

  it("设置缓存 ttl 必须是非负整数", () => {
    expect(() => {
      cache.set("foo", "bar", -1);
    }).toThrow(new TypeError("ttl must be a non-negative integer"));

    expect(() => {
      cache.set("foo", "bar", "1");
    }).toThrow(new TypeError("ttl must be a non-negative integer"));
  });

  it("自增步长必须是整数", () => {
    cache.set("count", 1);

    expect(() => {
      cache.inc("count", 1.5);
    }).toThrow(new TypeError("increment step must be an integer"));

    expect(() => {
      cache.inc("count", "1");
    }).toThrow(new TypeError("increment step must be an integer"));
  });

  it("自减步长必须是整数", () => {
    cache.set("count", 10);

    expect(() => {
      cache.dec("count", 1.5);
    }).toThrow(new TypeError("decrement step must be an integer"));

    expect(() => {
      cache.dec("count", "1");
    }).toThrow(new TypeError("decrement step must be an integer"));
  });

  it("应支持本地存储和会话存储类型", () => {
    expect(() => {
      cache.create({ type: "local" });
    }).not.toThrow();

    expect(() => {
      cache.create({ type: "session" });
    }).not.toThrow();
  });

  it("设置缓存", () => {
    cache.set("name", "jack");
    expect(cache.get("name")).toBe("jack");
  });

  it("设置缓存支持过期时间", () => {
    cache.set("name", "jack", 1);
    expect(cache.get("name")).toBe("jack");

    // 前进 1001 毫秒，模拟过期
    vi.advanceTimersByTime(1001);
    // 再次读取，应返回 null 且 key 被删除
    expect(cache.get("name")).toBe(null);
    expect(cache.has("name")).toBe(false);
  });

  it("setItem 方法异常时设置缓存返回 false", async () => {
    vi.stubGlobal("localStorage", {
      setItem: vi.fn(() => {
        throw new Error("模拟 setItem 失败");
      }),
    });
    vi.resetModules();
    const { default: cache } = await import("../src/index.js");
    expect(cache.set("testKey", "testValue")).toBe(false);
  });

  it("缓存自增、自减", () => {
    cache.set("count", 1);

    expect(cache.inc("count")).toBe(2); // 默认步长为1
    expect(cache.inc("count", 5)).toBe(7); // 指定步长

    cache.set("count", 10);
    expect(cache.dec("count")).toBe(9);
    expect(cache.dec("count", 3)).toBe(6);
  });

  it("支持负数步长", () => {
    const cache = new Cache();

    cache.set("count", 10);

    expect(cache.inc("count", -3)).toBe(7);
    expect(cache.get("count")).toBe(7);
  });

  it("缓存自增、减时缓存不存在时应该抛出异常", () => {
    expect(() => cache.inc("count")).toThrow("Unsupported operand types: Null + int");
  });

  it("缓存自增、减时非数字抛出异常", () => {
    cache.set("count", "hello");
    expect(() => cache.inc("count")).toThrowError("Unsupported operand types: String + int");
  });

  it("缓存自增、减保存结果失败时应该抛出异常", () => {
    const cache = new Cache();
    cache.set("count", 10);

    vi.spyOn(cache, "set").mockReturnValue(false);

    expect(() => cache.inc("count")).toThrow("Failed to save incremented cache value");
  });

  it("获取缓存不存在值时支持默认值", () => {
    expect(cache.get("name")).toBe(null);
    expect(cache.get("name", "default")).toBe("default");
    expect(cache.get("name", () => "fn")).toBe("fn");
  });

  it("针对数组的情况追加数据", () => {
    cache.set("arr", [1, 2]);
    cache.push("arr", 3);
    cache.push("arr", 3);
    cache.push("arr", 4);
    // 获取不会重复的数据
    expect(cache.get("arr")).toEqual([1, 2, 3, 4]);

    // 非数组类型的数据异常
    cache.set("arr", "arr");
    expect(() => cache.push("arr", 3)).toThrowError("only array cache can be push");

    // 如果数组超过1000个项，则应删除最旧的项
    const key = "test-push-overflow";

    // 先设置一个包含 1000 项的缓存
    cache.set(
      key,
      Array.from({ length: 1000 }, (_, i) => i),
    );

    // push 第 1001 项
    cache.push(key, 1000);

    const result = cache.get(key);

    expect(result.length).toBe(1000); // 长度应该还是 1000
    expect(result[0]).toBe(1); // 最旧的 0 被移除了
    expect(result.includes(1000)).toBe(true); // 新添加的在里面
  });

  it("删除缓存", () => {
    cache.set("name", "hello");
    cache.remove("name");
    expect(cache.get("name")).toBe(null);
  });

  it("获取并删除缓存", () => {
    cache.set("name", "rose");
    expect(cache.pull("name")).toBe("rose");
    expect(cache.get("name")).toBe(null);
  });

  it("清空所有的缓存", () => {
    cache.set("name", "jack");
    cache.set("name2", "rose");

    cache.clear();

    expect(cache.get("name")).toBe(null);
    expect(cache.get("name2")).toBe(null);
  });

  it("不存在则写入缓存数据后返回", () => {
    const time = Date.now();
    const val = cache.remember("time", time);

    expect(val).toBe(time);
    expect(cache.get("time")).toBe(time);

    const val2 = cache.remember("time", 9999);
    expect(val2).toBe(time); // 不会覆盖

    // 支持函数
    cache.remember("fn", function () {
      return "fn";
    });
    expect(cache.get("fn")).toBe("fn");
  });

  it("tag 操作:set + clear + getTagItems", () => {
    cache.tag("group1").set("a", 1);
    cache.tag("group1").set("b", 2);
    cache.tag("group1").append("c");

    expect(cache.get("a")).toBe(1);
    expect(cache.getTagItems("group1")).toEqual(expect.arrayContaining(["a", "b", "c"]));

    cache.tag("group1").clear();
    expect(cache.get("a")).toBe(null);
    expect(cache.get("b")).toBe(null);
    expect(cache.get("c")).toBe(null);
  });

  it("支持多个标签同时操作", () => {
    cache.tag(["t1", "t2"]).set("k1", 123);
    cache.tag(["t1", "t2"]).set("k2", 456);
    expect(cache.get("k1")).toBe(123);

    cache.tag("t1").clear();
    expect(cache.get("k1")).toBe(null);
    expect(cache.get("k2")).toBe(null);
  });

  it("tag append 不应该重复添加相同的 key", () => {
    cache.tag("group1").append("a");
    cache.tag("group1").append("a");

    expect(cache.getTagItems("group1")).toEqual(["a"]);
  });

  it("切换缓存类型", () => {
    const local = cache.store("local");
    const session = cache.store("session");

    local.set("name", "local");
    session.set("name", "session");

    expect(local.get("name")).toBe("local");
    expect(session.get("name")).toBe("session");
  });

  it("create 创建自定义实例", () => {
    const newStore = cache.create({
      prefix: "my_",
    });

    newStore.set("key", "val");

    expect(newStore.get("key")).toBe("val");
  });

  it("create 应用自定义 prefix", () => {
    const newStore = cache.create({
      prefix: "my_",
    });

    newStore.set("key", "val");

    expect(localStorage.getItem("my_key")).not.toBeNull();
    expect(localStorage.getItem("key")).toBeNull();
  });

  it("默认使用 Base64 编码序列化缓存数据", () => {
    cache.set("key", "val");

    const raw = localStorage.getItem("key");

    expect(raw).not.toContain("val");
    expect(cache.get("key")).toBe("val");
  });

  it("助手函数调用方式", () => {
    cache("x", "y", 100);
    expect(cache("x")).toBe("y");

    cache("x", null);
    expect(cache("x")).toBe(null);

    expect(cache()).toBeInstanceOf(Cache);
  });

  it("获取缓存对象实例", () => {
    expect(cache.handler()).toBe(localStorage);

    // 支持切换时获取对应的缓存对象实例
    expect(cache.store("local").handler()).toBe(localStorage);
    expect(cache.store("session").handler()).toBe(sessionStorage);
  });

  it("prefix 为空时应该清理所有缓存", () => {
    const picocache = cache.create();

    picocache.set("user", "Tom");

    localStorage.setItem("other:user", "other");

    picocache.clear();

    expect(localStorage.length).toBe(0);
  });

  it("应该只清理当前 namespace 的缓存", () => {
    const picocache = cache.create({
      prefix: "app_",
    });

    picocache.set("user", { name: "Tom" });
    picocache.set("token", "123");

    localStorage.setItem("other_user", "other");
    localStorage.setItem("other_token", "456");

    picocache.clear();

    expect(localStorage.getItem("app_user")).toBeNull();
    expect(localStorage.getItem("app_token")).toBeNull();

    expect(localStorage.getItem("other_user")).toBe("other");
    expect(localStorage.getItem("other_token")).toBe("456");
  });

  it("supports undefined value", () => {
    cache.set("foo", undefined);

    expect(cache.has("foo")).toBe(true);
    expect(cache.get("foo")).toBeUndefined();
  });

  it("批量获取缓存", () => {
    cache.set("name", "jack");
    cache.set("age", 18);
    cache.set("theme", "dark");

    expect(cache.many(["name", "age", "theme"])).toEqual({
      name: "jack",
      age: 18,
      theme: "dark",
    });
  });

  it("批量获取缓存时不存在的 key 返回 null", () => {
    cache.set("name", "jack");

    expect(cache.many(["name", "age"])).toEqual({
      name: "jack",
      age: null,
    });
  });

  it("获取缓存剩余 ttl", () => {
    // 不存在
    expect(cache.ttl("missing")).toBe(-1);

    // 永不过期
    cache.set("forever", "value");

    expect(cache.ttl("forever")).toBe(0);

    // 过期时间
    cache.set("foo", "bar", 10);

    expect(cache.ttl("foo")).toBe(10);

    vi.advanceTimersByTime(3000);

    expect(cache.ttl("foo")).toBe(7);
  });

  it("批量设置缓存", () => {
    expect(
      cache.setMany({
        name: "jack",
        age: 18,
      }),
    ).toBe(true);

    expect(cache.get("name")).toBe("jack");
    expect(cache.get("age")).toBe(18);
  });

  it("length 应该只计算当前 namespace", () => {
    const appCache = cache.create({
      prefix: "app_",
    });

    appCache.set("a", 1);

    localStorage.setItem("other", "value");

    expect(appCache.length).toBe(1);
  });

  it("反序列化失败且 failDelete=false 时不应该删除缓存", () => {
    const cache = new Cache({
      failDelete: false,
    });

    cache.set("foo", "bar");

    localStorage.setItem("foo", "invalid-data");

    expect(cache.get("foo")).toBe(null);

    expect(localStorage.getItem("foo")).toBe("invalid-data");
  });

  it("批量设置缓存部分失败时应该返回 false", () => {
    const cache = new Cache();

    vi.spyOn(cache, "set").mockReturnValueOnce(true).mockReturnValueOnce(false);

    expect(
      cache.setMany({
        a: 1,
        b: 2,
      }),
    ).toBe(false);
  });
});
