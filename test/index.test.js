import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import cache from "../src/index.js";

describe("cachedd", () => {
  let originalSetItem;

  beforeEach(() => {
    cache.clear(); // 每个测试前清空缓存
    vi.useFakeTimers(); // 使用假的计时器
    originalSetItem = Storage.prototype.setItem;
  });

  afterEach(() => {
    Storage.prototype.setItem = originalSetItem;
    vi.restoreAllMocks();
  });

  it("设置缓存", () => {
    cache.set("name", "jack");
    expect(cache.get("name")).toBe("jack");
  });

  it("缓存结构被破坏时不应该报错", () => {
    localStorage.setItem("foo", "test");

    expect(() => {
      cache.get("foo");
    }).not.throw();
  });

  it("设置缓存-支持过期时间", () => {
    cache.set("name", "jack", 1);
    expect(cache.get("name")).toBe("jack");

    // 前进 1001 毫秒，模拟过期
    vi.advanceTimersByTime(1001);
    // 再次读取，应返回 null（已过期并删除）
    expect(cache.get("name")).toBe(null);
  });

  // it("触发 setItem 抛出异常并覆盖 catch", () => {
  //   // 模拟 setItem 抛出异常
  //   vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
  //     throw new Error("模拟 setItem 失败");
  //   });

  //   const result = cache.set("testKey", "testValue");

  //   expect(result).toBe(false);
  // });

  it("缓存自增", () => {
    cache.set("count", 1);
    expect(cache.inc("count")).toBe(2);

    //应该抛出非数字类型的错误
    cache.set("count", "hello");
    expect(() => cache.inc("count")).toThrowError("Unsupported operand types: String + int");
  });

  it("缓存自减", () => {
    cache.set("count", 4);
    expect(cache.dec("count", 3)).toBe(1);
  });

  it("缓存获取支持默认值", () => {
    expect(cache.get("name")).toBe(null);
    expect(cache.get("name", "default")).toBe("default");
    expect(typeof cache.get("name", () => "fn")).toBe("string");
  });

  it("push:针对数组的情况追加数据", () => {
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

  it("删除数据", () => {
    cache.set("name", "hello");
    cache.delete("name");
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

  it("切换缓存类型", () => {
    const local = cache.store("local");
    const session = cache.store("session");

    local.set("name", "local");
    session.set("name", "session");

    expect(local.get("name")).toBe("local");
    expect(session.get("name")).toBe("session");
  });

  it("create 创建自定义实例", () => {
    const newStore = cache.create({ prefix: "my_", expire: 2 });
    newStore.set("key", "val");
    expect(localStorage.getItem("my_key")).toContain("val");
  });

  it("助手函数调用方式", () => {
    cache("x", "y", 100);
    expect(cache("x")).toBe("y");

    cache("x", null);
    expect(cache("x")).toBe(null);

    expect(cache()).toBeInstanceOf(Object);
  });

  it("获取缓存对象实例", () => {
    const storage = cache.handler();
    expect(storage).toBeInstanceOf(Object);
  });
});
