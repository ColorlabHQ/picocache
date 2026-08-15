# picocache

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-048754?logo=buymeacoffee)](https://www.lujiahao.com/sponsor)
[![npm version](https://img.shields.io/npm/v/picocache)](https://www.npmjs.com/package/picocache)
[![Test](https://img.shields.io/github/actions/workflow/status/ColorlabHQ/picocache/tests.yml?label=Test&logo=github&style=flat-square&branch=main)](https://github.com/ColorlabHQ/picocache/actions/workflows/tests.yml)
[![bundle size](https://deno.bundlejs.com/?q=picocache&badge=detailed)](https://bundlejs.com/?q=picocache)
[![codecov](https://codecov.io/github/ColorlabHQ/picocache/graph/badge.svg?token=YR846BMB6Y)](https://codecov.io/github/ColorlabHQ/picocache)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/ColorlabHQ/picocache/blob/main/LICENSE)
[![Changelog](https://img.shields.io/badge/changelog-%F0%9F%93%9D-blue)](https://github.com/ColorlabHQ/picocache/blob/main/CHANGELOG.md)
---

简体中文 | [English](./README.en.md)

简化浏览器存储 API，让 localStorage 和 sessionStorage 使用更加便捷。

## 特性

- 🪶 轻量、零依赖
- 🧪 大量测试
- 📦 极小体积（brotli ≤ 2KB）
- 🧰 提供语义化、易用的缓存操作 API
- 🔄 自动序列化数据（默认使用 JSON.stringify / JSON.parse）
- 🛠️ 支持自定义序列化和反序列化方法
- 🔑 支持自定义缓存前缀
- 🔒 默认使用 Base64 编码存储，避免缓存数据直接以明文形式存在
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

> [!NOTE]
> CDN 版本会自动注册全局变量 `picocache`。

## 快速开始

## 基本用法

```js
import cache from "picocache";

cache.set("name", "jack"); // 设置缓存
cache.set("name", "jack", 3600); // 设置缓存,3600秒过期

cache.get("name"); // 获取缓存数据
cache.remove("name"); // 删除缓存数据

cache("name", "jack"); // 设置缓存
cache("name", "jack", 3600); // 设置缓存数据,3600秒后过期
cache("name"); // 获取缓存数据
cache("name", null); // 删除缓存数据

const instance = cache(); // 获取当前缓存实例
```

### 创建自定义缓存对象实例

```js
import cache from "picocache";

const myCache = cache.create({ type: "session", prefix: "my_", ttl: 10 }); // 创建自己的缓存实例

// 还是相同方式调用方法
myCache.set("name", "value", 3600);
```

<a id="options"></a>

## 选项

| 参数          | 类型       | 默认值    | 描述                                   |
| ------------- | ---------- | --------- | -------------------------------------- |
| `type`        | `string`   | `"local"` | 缓存类型，可选 `local` 或 `session`    |
| `ttl`         | `number`   | `0`       | 缓存有效期，单位为秒。`0` 表示永久缓存 |
| `prefix`      | `string`   | `""`      | 缓存键前缀                             |
| `serialize`   | `function` | -         | 缓存数据序列化方法                     |
| `deserialize` | `function` | -         | 缓存数据反序列化方法                   |
| `failDelete`  | `boolean`  | `true`    | 获取缓存失败后是否强制删除             |

## API

### 设置缓存

```js
cache.set("name", value);
// 缓存在3600秒之后过期
cache.set("name", value, 3600);
```

如果设置成功返回`true` ，否则返回`false`。

### 计数器增减操作

对于计数器类型的缓存数据，可以使用 `inc` 和 `dec` 方法执行自增和自减操作。

```js
cache.set("views", 100);

// 增加 1
cache.inc("views");

// 增加 10
cache.inc("views", 10);

// 减少 1
cache.dec("views");

// 减少 10
cache.dec("views", 10);
```

`inc` 和 `dec` 主要用于维护计数器类型的数据，例如：

- 页面访问次数
- 功能使用次数
- 提示 / 引导展示次数
- 用户操作累计次数
- 失败重试次数

> [!WARNING]
> `inc` 和 `dec` 用于整数计数器操作，仅支持整数类型的缓存值，且步进值必须为整数。

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

支持传入函数作为默认值：

```js
cache.get("name", () => {
  return generateName();
});
```

当缓存不存在时，函数会被调用，并使用返回值作为默认值。

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
cache.remove("name");
```

### 获取并删除缓存

```js
cache.pull("name");
```

如果`name`值不存在，则返回`null`，支持指定默认值:

```js
cache.pull("name", "");
```

### 清空缓存

```js
cache.clear();
```

### 不存在则写入缓存数据后返回

如果 `theme` 缓存数据不存在，则会设置 `dark` 为当前主题:

```js
const theme = cache.remember("theme", "dark");

console.log(theme);
// "dark"
```

第二个参数也可以传入函数：

```js
cache.remember("theme", () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
);
```

第三个参数用于设置缓存 `TTL`，单位为秒：

```js
cache.remember("token", () => crypto.randomUUID(), 3600);
```

### 缓存标签

支持给缓存数据打标签：

```js
cache.tag('tag')->set('name1','value1');
cache.tag('tag')->set('name2','value2');

// 清除 tag 标签的缓存数据
cache.tag('tag')->clear();
```

缓存标签不会改变缓存的读取操作：

```js
cache.get("name1"); // "value1"
```

并支持同时指定多个缓存标签操作:

```js
cache.tag(['tag1', 'tag2'])->set('name1', 'value1');
cache.tag(['tag1', 'tag2'])->set('name2', 'value2');

// 清除多个标签的缓存数据
cache.tag(['tag1','tag2'])->clear();
```

可以追加某个缓存标识到标签:

```js
cache.tag('tag')->append('name3');
```

获取标签的缓存标识列表:

```js
cache.getTagItems("tag");
```

### 批量获取缓存

使用 `many()` 可以一次获取多个缓存：

```js
cache.set("name", "jack");
cache.set("age", 18);

cache.many(["name", "age", "email"]);

// {
//   name: "jack",
//   age: 18,
//   email: null
// }
```

不存在的缓存会返回默认值 `null`。

### 批量设置缓存

使用 `setMany()` 可以一次写入多个缓存：

```js
cache.setMany({
  name: "jack",
  age: 18,
  active: true,
});
```

也可以统一设置 `TTL`：

```js
cache.setMany(
  {
    token: "xxxx",
    user: {
      id: 1,
    },
  },
  3600,
);
```

返回 `true` 表示所有缓存写入成功；返回 `false` 表示至少一个缓存写入失败。

### 查看剩余有效时间

可以使用 `ttl()` 查看缓存剩余时间：

```js
cache.set("token", "abc", 3600);

cache.ttl("token");
// 3600
```

| 返回值 | 说明                 |
| ------ | -------------------- |
| `-1`   | 缓存不存在或已经过期 |
| `0`    | 永久缓存             |
| `>0`   | 剩余有效时间（秒）   |

### 获取缓存数量

可以通过 `length` 获取当前缓存实例中的有效缓存数量。

```js
cache.set("name", "jack");
cache.set("age", 18);

console.log(cache.length);
// 2
```

### 获取所有缓存 Key

可以通过 `keys()` 获取当前缓存实例中的所有有效缓存键。

```js
cache.set("name", "jack");
cache.set("age", 18);

cache.keys();
// ["name", "age"]
```

### 获取底层存储对象

如果需要访问 `picocache` 使用的原生存储对象，可以通过 `handler()` 方法获取。

```js
const storage = cache.handler();

// 调用原生 Storage API
storage.getItem("key");
storage.setItem("key", "value");
storage.removeItem("key");
```

`handler()` 返回当前实例对应的原生 `Storage` 对象，例如 `localStorage` 或 `sessionStorage`。

### 切换缓存类型

没有指定缓存类型的话，默认是[选项](#options) `type` 的默认值，可以动态切换:

```js
// 使用 localStorage 缓存
cache.set('name','value',3600);
cache.get('name');

// 使用 sessionStorage 缓存
cache.store('sesson')->set('name','value',3600);
cache.store('sesson')->get('name');

// 切换到 localStorage 缓存
cache.store('local')->set('name','value',3600);
cache.store('local')->get('name');
```

### 自定义序列化和反序列化方法

`picocache` 默认会对缓存数据进行 `Base64` 编码，你可以通过 `serialize` 和 `deserialize` 覆盖默认行为。

例如，直接使用 JSON：

```js
const myCache = cache.create({
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});
```

JSON 足以满足大多数缓存场景，但它只能处理有限的 JavaScript 数据类型。如果需要缓存 `Date`、`Map`、`Set` 等更复杂的数据，可以自行接入其他序列化方案。

例如，可以使用 [structured-clone-es](https://github.com/antfu-collective/structured-clone-es) 等库扩展可序列化的数据类型:

```js
import cache from "picocache";
import { stringify, parse } from "structured-clone-es";

const myCache = cache.create({
  serialize: stringify,
  deserialize: parse,
});

myCache.set("data", {
  createdAt: new Date(),
  tags: new Set(["js", "cache"]),
  metadata: new Map([
    ["version", 1],
    ["author", "admin"],
  ]),
});

const data = myCache.get("data");

console.log(data.createdAt instanceof Date);
// true

console.log(data.tags instanceof Set);
// true

console.log(data.metadata instanceof Map);
// true
```

## 鸣谢

- [ThinkPHP](https://doc.thinkphp.cn/v8_0/caches.html)
- [Laravel](https://www.laravel.wiki/en/cache)

该代码库的 API 设计灵感来源于 以上 PHP 框架的缓存组件。
