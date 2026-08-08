import { beforeEach, afterEach, describe, expect, it } from "vitest";
import datasetConfig from "../src/index";

describe("datasetConfig", () => {
  let element;
  let element3;
  let element2;

  beforeEach(() => {
    document.body.innerHTML = `
      <div
        data-toggle="plugin"
        data-touch-delay="300"
        data-app-position.z-index.background-color="300"
        data-position.x="100"
        data-position.y="200"
        data-draggable="true"
        data-agree="false"
        data-direction="horizontal"
        data-app-max-items="5"
        data-app-scrolltop-offset="200"
        data-app-scrolltop-duration="500"
        data-app-other-something="should-ignore"
        data-options='{"a":1,"b":[2,3]}'
        data-rect='[2,3]'
        data-config.foo.bar="hello"
        data-on-init="init"
        data-test="null"
      ></div>

      <div
        id="element2"
        data-app-scroll-offset="100"
        data-app-scrolltop-offset="200"
        data-app-lazy="true"
      ></div>

      <div
        id="element3"
        data-toggle="plugin"
        data-config.foo.bar="hello"
        data-config.foo.enable="true"
        data-config.foo.delay="3000"
        data-config.bar.count="42"
        data-on-init="init"
      ></div>
    `;

    window.init = () => "hello";

    element = document.querySelector("[data-toggle]");
    element3 = document.querySelector("#element3");
    element2 = document.querySelector("#element2");
  });

  afterEach(() => {
    delete window.init;
  });

  it("默认解析", () => {
    expect(datasetConfig(element)).toEqual({
      toggle: "plugin",
      touchDelay: 300,
      appPosition: {
        zIndex: {
          backgroundColor: 300,
        },
      },
      appScrolltopDuration: 500,
      appScrolltopOffset: 200,
      position: {
        x: 100,
        y: 200,
      },
      draggable: true,
      agree: false,
      direction: "horizontal",
      appMaxItems: 5,
      appOtherSomething: "should-ignore",
      rect: [2, 3],
      options: {
        a: 1,
        b: [2, 3],
      },
      config: {
        foo: {
          bar: "hello",
        },
      },
      test: null,
      onInit: window.init,
    });
  });

  it("prefix：一级前缀", () => {
    expect(
      datasetConfig(element, {
        prefix: "app",
      }),
    ).toEqual({
      position: {
        zIndex: {
          backgroundColor: 300,
        },
      },
      scrolltopDuration: 500,
      scrolltopOffset: 200,
      maxItems: 5,
      otherSomething: "should-ignore",
    });
  });

  it("prefix：支持 kebab-case", () => {
    expect(
      datasetConfig(element, {
        prefix: "app-scrolltop",
      }),
    ).toEqual({
      offset: 200,
      duration: 500,
    });
  });

  it("prefix：支持 camelCase", () => {
    expect(
      datasetConfig(element, {
        prefix: "appScrolltop",
      }),
    ).toEqual({
      offset: 200,
      duration: 500,
    });
  });

  it("prefix：不存在", () => {
    expect(
      datasetConfig(element, {
        prefix: "abc",
      }),
    ).toEqual({});
  });

  it("excludeKeys：一级", () => {
    expect(
      datasetConfig(element, {
        excludeKeys: ["touchDelay"],
      }),
    ).toEqual({
      toggle: "plugin",
      appPosition: {
        zIndex: {
          backgroundColor: 300,
        },
      },
      test: null,
      appScrolltopDuration: 500,
      appScrolltopOffset: 200,
      position: {
        x: 100,
        y: 200,
      },
      draggable: true,
      agree: false,
      direction: "horizontal",
      appMaxItems: 5,
      appOtherSomething: "should-ignore",
      rect: [2, 3],
      options: {
        a: 1,
        b: [2, 3],
      },
      config: {
        foo: {
          bar: "hello",
        },
      },
      onInit: window.init,
    });
  });

  it("excludeKeys：深层属性", () => {
    expect(
      datasetConfig(element3, {
        excludeKeys: ["config.foo.delay"],
      }),
    ).toEqual({
      toggle: "plugin",
      config: {
        foo: {
          bar: "hello",
          enable: true,
        },
        bar: {
          count: 42,
        },
      },
      onInit: window.init,
    });
  });

  it("excludeKeys：整个对象", () => {
    expect(
      datasetConfig(element3, {
        excludeKeys: ["config.foo"],
      }),
    ).toEqual({
      toggle: "plugin",
      config: {
        bar: {
          count: 42,
        },
      },
      onInit: window.init,
    });
  });

  it("excludeKeys：支持 kebab-case", () => {
    element.setAttribute("data-foo-bar", "100");

    expect(
      datasetConfig(element, {
        excludeKeys: ["foo-bar"],
      }),
    ).not.toHaveProperty("fooBar");
  });

  it("parseFunction:false", () => {
    expect(
      datasetConfig(element, {
        parseFunction: false,
      }).onInit,
    ).toBe("init");
  });

  it("解析 Number", () => {
    element.setAttribute("data-a", "123");
    element.setAttribute("data-b", "-5");
    element.setAttribute("data-c", "3.14");

    expect(datasetConfig(element)).toMatchObject({
      a: 123,
      b: -5,
      c: 3.14,
    });
  });

  it("解析 Boolean", () => {
    element.setAttribute("data-a", "true");
    element.setAttribute("data-b", "false");

    expect(datasetConfig(element)).toMatchObject({
      a: true,
      b: false,
    });
  });

  it("解析 JSON Object", () => {
    element.setAttribute("data-a", '{"x":1}');

    expect(datasetConfig(element).a).toEqual({
      x: 1,
    });
  });

  it("解析 JSON Array", () => {
    element.setAttribute("data-a", "[1,2,3]");

    expect(datasetConfig(element).a).toEqual([1, 2, 3]);
  });

  it("非法 JSON 返回原字符串", () => {
    element.setAttribute("data-a", "{foo}");

    expect(datasetConfig(element).a).toBe("{foo}");
  });

  it("普通字符串保持不变", () => {
    element.setAttribute("data-a", "hello");

    expect(datasetConfig(element).a).toBe("hello");
  });

  it("空字符串保持为空", () => {
    element.setAttribute("data-a", "");

    expect(datasetConfig(element).a).toBe("");
  });

  it("prefix 不应错误匹配相似前缀", () => {
    expect(
      datasetConfig(element2, {
        prefix: "app-scroll",
      }),
    ).toEqual({
      offset: 100,
    });
  });

  it("prefix 完全等于属性名时不应匹配", () => {
    expect(
      datasetConfig(element2, {
        prefix: "appLazy",
      }),
    ).toEqual({});
  });
});
