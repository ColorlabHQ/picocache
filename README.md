# picocache

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-048754?logo=buymeacoffee)](https://www.lujiahao.com/sponsor)
[![npm version](https://img.shields.io/npm/v/picocache)](https://www.npmjs.com/package/picocache)
[![Test](https://img.shields.io/github/actions/workflow/status/ColorlabHQ/picocache/tests.yml?label=Test&logo=github&style=flat-square&branch=main)](https://github.com/ColorlabHQ/picocache/actions/workflows/tests.yml)
[![bundle size](https://deno.bundlejs.com/?q=picocache&badge=detailed)](https://bundlejs.com/?q=picocache)
[![codecov](https://codecov.io/github/ColorlabHQ/picocache/graph/badge.svg?token=YR846BMB6Y)](https://codecov.io/github/ColorlabHQ/picocache)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/ColorlabHQ/picocache/blob/main/LICENSE)
[![Changelog](https://img.shields.io/badge/changelog-%F0%9F%93%9D-blue)](https://github.com/ColorlabHQ/picocache/blob/main/CHANGELOG.md)
---

简化浏览器存储 API，让 localStorage 和 sessionStorage 使用更加便捷。

## 特性

- 🚀 零依赖
- 📦 极小体积（minified + brotli ≤ 0.6KB）
- ✨ 简洁统一的缓存 API
- 💾 支持 localStorage / sessionStorage 多种存储驱动
- ⏱️ 支持 TTL 缓存过期管理
- 🏷️ 支持缓存标签，实现缓存分组与批量清理
- 🧩 支持创建多个独立缓存实例

## 安装

### npm

```bash
npm install picocache
```

### CDN

```html
<script src="https://unpkg.com/picocache@latest/dist/picocache.min.js"></script>
```

## 快速开始

## 基本用法

```js
import cache from "picocache";

cache.set("name", "jack"); // 设置缓存
cache.set("name", "jack", 3600); // 设置缓存,3600秒过期

cache.get("name"); //获取缓存数据
cache.delete("name"); //删除缓存数据
```

### 创建自定义缓存对象实例

```js
const myCache = cache.create({ type: "session", prefix: "my_", expire: 10 }); // 创建自己的缓存实例

// 还是相同方式调用方法
myCache.set("name", "value", 3600);
```

<a id="options"></a>

## 选项

| 参数          | 类型       | 默认值           | 描述                                   |
| ------------- | ---------- | ---------------- | -------------------------------------- |
| `type`        | `string`   | `"local"`        | 缓存类型，可选 `local` 或 `session`    |
| `expire`      | `number`   | `0`              | 缓存有效期，单位为秒。`0` 表示永久缓存 |
| `prefix`      | `string`   | `""`             | 缓存键前缀                             |
| `serialize`   | `function` | `JSON.stringify` | 缓存数据序列化方法                     |
| `deserialize` | `function` | `JSON.parse`     | 缓存数据反序列化方法                   |

## API

### 设置缓存

```js
cache.set("name", $value);
// 缓存在3600秒之后过期
cache.set("name", $value, 3600);
```

如果设置成功返回`true` ，否则返回`false`。

### 缓存自增

针对数值类型的缓存数据，可以使用自增操作，例如：

```js
cache.set("name", 1);
// name自增（步进值为1）
cache.inc("name");
// name自增（步进值为3）
cache.inc("name", 3);
```

> [!WARNING]
> 只能对数字或者浮点型数据进行自增和自减操作。

### 缓存自减

针对数值类型的缓存数据，可以使用自减操作，例如：

```js
// name自减（步进值为1）
cache.dec("name");
// name自减（步进值为3）
cache.dec("name", 3);
```

### 获取缓存

获取缓存数据可以使用：

```js
cache.get("name");
```

如果`name` 值不存在，则默认返回 `null` 。

支持指定默认值，例如：

```js
cache.get("name", "");
```

表示如果`name`值不存在，则返回空字符串。

支持传入闭包作为默认值获取

```js
cache.get("name", function () {
  // 动态返回数据
});
```

### 追加一个缓存数据

如果缓存数据是一个数组，可以通过`push`方法追加一个数据。

```js
cache.set("name", [1, 2, 3]);
cache.push("name", 4);
cache.push("name", 4);
cache.push("name", 4);
cache.push("name", 5);
cache.get("name"); // [1,2,3,4,5]
```

### 删除缓存

```js
cache.delete("name");
```

### 获取并删除缓存

```js
cache.pull("name");
```

如果`name`值不存在，则返回`null`，支持指定默认值

```js
cache.pull("name", "");
```

### 清空缓存

```js
cache.clear();
```

### 不存在则写入缓存数据后返回

```js
cache.remember("start_time", Date.now());
```

如果 start_time 缓存数据不存在，则会设置缓存数据为当前时间。
第二个参数可以使用闭包方法获取缓存数据。

```js
cache.remember("start_time", function () {
  return Date.now();
});
```

remember方法的第三个参数可以设置缓存的有效期。

### 缓存标签

支持给缓存数据打标签，例如：

```js
cache.tag('tag')->set('name1','value1');
cache.tag('tag')->set('name2','value2');

// 清除 tag 标签的缓存数据
cache.tag('tag')->clear();
```

缓存标签不会改变缓存的读取操作，所以获取方式依然是：

```js
cache.get("name1");
```

并支持同时指定多个缓存标签操作

```js
cache.tag(['tag1', 'tag2'])->set('name1', 'value1');
cache.tag(['tag1', 'tag2'])->set('name2', 'value2');

// 清除多个标签的缓存数据
cache.tag(['tag1','tag2'])->clear();
```

可以追加某个缓存标识到标签

```js
cache.tag('tag')->append('name3');
```

获取标签的缓存标识列表

```js
cache.getTagItems("tag");
```

### 获取缓存对象

如果你想获取当前的原始缓存对象可以通过`handler()`方法

```js
// 原始缓存对象
const localStorage = cache.handler();

// 然后您可以调用缓存对象中原本的方法
localStorage.getItem("bgcolor");
```

### 函数式调用

picocache 支持将缓存实例直接作为函数调用，提供更简洁的缓存操作方式。

```js
import cache from "picocache";

cache("name", "jack"); // 设置缓存
cache("name", "jack", 3600); // 设置缓存数据,3600秒后过期
cache("name"); // 获取缓存数据
cache("name", null); // 删除缓存数据

const instance = cache(); // 获取当前缓存实例
```

### 切换缓存类型

没有指定缓存类型的话，默认是[选项](#options) `type` 的默认值，可以动态切换

```js
// 使用 localStorage 缓存
cache.set('name','value',3600);
cache.get('name');

// 使用 sessionStorage 缓存
cache.store('sesson')->set('name','value',3600);
cache.store('sesson')->get('name');

// 切换到localStorage 缓存
cache.store('local')->set('name','value',3600);
cache.store('local')->get('name');
```

如果要返回当前缓存类型对象的句柄，可以使用

```js
// 获取 sessionStorage 原始对象
const sessionStorage = cache.store('session')->handler();
```

## 🙏 鸣谢

该代码库的 API 设计灵感来源于 PHP 框架 [ThinkPHP](https://github.com/top-think/framework) 的[缓存组件](https://doc.thinkphp.cn/v8_0/caches.html)。
