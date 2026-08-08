# dataset-config

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-048754?logo=buymeacoffee)](https://www.lujiahao.com/sponsor)
[![npm version](https://img.shields.io/npm/v/dataset-config)](https://www.npmjs.com/package/dataset-config)
[![Test](https://img.shields.io/github/actions/workflow/status/ColorlabHQ/dataset-config/tests.yml?label=Test&logo=github&style=flat-square&branch=main)](https://github.com/ColorlabHQ/dataset-config/actions/workflows/tests.yml)
[![bundle size](https://deno.bundlejs.com/?q=dataset-config&badge=detailed)](https://bundlejs.com/?q=dataset-config)
[![codecov](https://codecov.io/github/ColorlabHQ/dataset-config/graph/badge.svg?token=YR846BMB6Y)](https://codecov.io/github/ColorlabHQ/dataset-config)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/ColorlabHQ/dataset-config/blob/main/LICENSE)
[![Changelog](https://img.shields.io/badge/changelog-%F0%9F%93%9D-blue)](https://github.com/ColorlabHQ/dataset-config/blob/main/CHANGELOG.md)
---

从 HTML `data-*` 属性中提取配置，并自动转换为 JavaScript 对象。

遵循浏览器原生 [`HTMLElement.dataset`](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/dataset) 规范，同时提供一些有用的额外[功能](#features)。

例如：

```html
<div data-toggle="tooltip" data-delay="300" data-placement="top"></div>
```

无需额外 JSON 配置：

```js
{
  toggle: "tooltip",
  delay: 300,
  placement: "top"
}
```

---

<a id="features"></a>

## 特性

- 🚀 零依赖
- 📦 极小体积（minified + brotli ≤ 0.6KB）
- ✅ 自动类型转换
- ✅ 点语法对象解析
- ✅ 前缀过滤
- ✅ 配置排除
- ✅ 全局函数解析

## Why dataset-config?

如果你正在开发一个支持 `data-*` 初始化的 JavaScript 插件，你通常需要处理：

- `dataset` 默认只能得到字符串
- `"true"`、`"300"` 需要手动转换类型
- JSON 配置需要手动解析
- `data-a.b.c` 需要转换成嵌套对象
- 多个插件之间需要处理配置隔离

于是每个插件都会重复编写类似的逻辑。

`dataset-config` 将这些通用能力集中处理：

例如：

```html
<div data-delay="300" data-position.x="100" data-position.y="200" data-draggable="true"></div>
```

自动转换为：

```js
{
  delay: 300,
  position: {
    x: 100,
    y: 200
  },
  draggable: true
}
```

让你的插件只关注业务逻辑：

```js
new Plugin(element, datasetConfig(element));
```

`dataset-config` 的目的：

把每个插件都会需要的 `data-*` 解析逻辑抽离成一个独立、小巧、可复用的基础库（类似于 [lilconfig](https://github.com/antonk52/lilconfig) 和 [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig) 对配置文件解析所做的事情），避免每个插件重复实现 data 属性解析。

## 安装

### npm

```bash
npm install dataset-config
```

### CDN

```html
<script src="https://unpkg.com/dataset-config@latest/dist/dataset-config.min.js"></script>
```

---

## 基础使用

HTML:

```html
<div id="demo" data-name="hello" data-count="10"></div>
```

JavaScript:

```js
import datasetConfig from "dataset-config";

const config = datasetConfig(document.querySelector("#demo"));

console.log(config);
```

结果：

```js
{
  name: "hello",
  count: 10
}
```

---

## 自动类型解析

dataset-config 会自动转换常见类型。

### Boolean

HTML:

```html
<div data-visible="true" data-disabled="false"></div>
```

结果：

```js
{
  visible: true,
  disabled: false
}
```

---

### Number

HTML:

```html
<div data-width="100" data-offset="-20" data-scale="1.5"></div>
```

结果：

```js
{
  width: 100,
  offset: -20,
  scale: 1.5
}
```

---

### JSON Object

HTML:

```html
<div data-user='{"name":"Tom"}'></div>
```

结果：

```js
{
  user: {
    name: "Tom";
  }
}
```

---

### JSON Array

HTML:

```html
<div data-items="[1,2,3]"></div>
```

结果：

```js
{
  items: [1, 2, 3];
}
```

---

### 非法 JSON

如果 JSON 解析失败，会保持原字符串：

HTML:

```html
<div data-value="{foo}"></div>
```

结果：

```js
{
  value: "{foo}";
}
```

---

### 点语法对象解析

支持使用 `.` 创建无限层级对象。

HTML:

```html
<div data-position.x="100" data-position.y="200"></div>
```

结果：

```js
{
  position: {
    x: 100,
    y: 200
  }
}
```

---

更深层：

HTML:

```html
<div data-style.color.primary="red"></div>
```

结果：

```js
{
  style: {
    color: {
      primary: "red";
    }
  }
}
```

---

### kebab-case 自动转换

HTML:

```html
<div data-scroll-top-offset="200"></div>
```

结果：

```js
{
  scrollTopOffset: 200;
}
```

等价于：

```js
element.dataset.scrollTopOffset;
```

---

### 前缀过滤 prefix

当页面存在多个插件时，可以使用 prefix 避免配置冲突。

HTML:

```html
<div data-app-scroll-offset="100" data-app-theme="dark" data-other-value="hello"></div>
```

代码：

```js
datasetConfig(element, {
  prefix: "app",
});
```

结果：

```js
{
  scrollOffset: 100,
  theme: "dark"
}
```

不会读取：

```html
data-other-value
```

---

### 支持 kebab-case prefix

以下两种写法等价：

```js
datasetConfig(element, {
  prefix: "app-scroll",
});
```

或者：

```js
datasetConfig(element, {
  prefix: "appScroll",
});
```

HTML:

```html
<div data-app-scroll-offset="100"></div>
```

结果：

```js
{
  offset: 100;
}
```

---

### 排除字段 excludeKeys

有时候希望读取大部分配置，但忽略某些字段。

HTML:

```html
<div data-delay="300" data-theme="dark"></div>
```

代码：

```js
datasetConfig(element, {
  excludeKeys: ["delay"],
});
```

结果：

```js
{
  theme: "dark";
}
```

---

### 支持深层排除

HTML:

```html
<div data-config.user.name="Tom" data-config.user.age="18"></div>
```

代码：

```js
datasetConfig(element, {
  excludeKeys: ["config.user.name"],
});
```

结果：

```js
{
  config: {
    user: {
      age: 18;
    }
  }
}
```

---

### 排除整个对象

```js
datasetConfig(element, {
  excludeKeys: ["config.user"],
});
```

结果：

```js
{
  config: {
  }
}
```

---

### 全局函数解析

默认情况下：

```js
parseFunction: true;
```

dataset-config 会尝试解析全局函数。

HTML:

```html
<div data-on-click="handleClick"></div>
```

JavaScript:

```js
window.handleClick = function () {
  console.log("clicked");
};
```

结果：

```js
{
  onClick: window.handleClick;
}
```

---

### 禁用函数解析

```js
datasetConfig(element, {
  parseFunction: false,
});
```

结果：

```js
{
  onClick: "handleClick";
}
```

---

## API

```js
datasetConfig(element, options);
```

参数：

| 参数          | 类型        | 默认值    | 说明             |
| ------------- | ----------- | --------- | ---------------- |
| element       | HTMLElement | -         | 需要解析的元素   |
| prefix        | string      | undefined | 只解析指定前缀   |
| parseFunction | boolean     | true      | 是否解析全局函数 |
| excludeKeys   | string[]    | []        | 排除字段         |
