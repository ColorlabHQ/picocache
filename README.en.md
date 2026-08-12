# picocache

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-048754?logo=buymeacoffee)](https://www.lujiahao.com/sponsor)
[![npm version](https://img.shields.io/npm/v/picocache)](https://www.npmjs.com/package/picocache)
[![Test](https://img.shields.io/github/actions/workflow/status/ColorlabHQ/picocache/tests.yml?label=Test&logo=github&style=flat-square&branch=main)](https://github.com/ColorlabHQ/picocache/actions/workflows/tests.yml)
[![bundle size](https://deno.bundlejs.com/?q=picocache&badge=detailed)](https://bundlejs.com/?q=picocache)
[![codecov](https://codecov.io/github/ColorlabHQ/picocache/graph/badge.svg?token=YR846BMB6Y)](https://codecov.io/github/ColorlabHQ/picocache)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/ColorlabHQ/picocache/blob/main/LICENSE)
[![Changelog](https://img.shields.io/badge/changelog-%F0%9F%93%9D-blue)](https://github.com/ColorlabHQ/picocache/blob/main/CHANGELOG.md)
---

English | [简体中文](./README.md)

Simplify browser storage APIs to make localStorage and sessionStorage easier to use.

## Features

- 🚀 Lightweight, zero dependencies
- 📦 Tiny size (minified + brotli ≤ 1KB)
- ✨ Simple and unified cache API
- 💾 Supports localStorage / sessionStorage
- ⏱️ Supports TTL cache expiration management
- 🏷️ Supports cache tags for grouping and batch clearing
- 🧩 Supports creating multiple independent cache instances

## Installation

### npm

```bash
npm install picocache
```

### CDN

```html
<script src="https://unpkg.com/picocache@latest/dist/picocache.min.js"></script>
```

## Quick Start

## Basic Usage

```js
import cache from "picocache";

cache.set("name", "jack"); // Set cache
cache.set("name", "jack", 3600); // Set cache, expires in 3600 seconds

cache.get("name"); // Get cached data
cache.delete("name"); // Delete cached data

cache("name", "jack"); // Set cache
cache("name", "jack", 3600); // Set cached data, expires in 3600 seconds
cache("name"); // Get cached data
cache("name", null); // Delete cached data

const instance = cache(); // Get the current cache instance
```

### Creating a Custom Cache Instance

```js
import cache from "picocache";

const myCache = cache.create({ type: "session", prefix: "my_", expire: 10 }); // Create your own cache instance

// You can still call methods in the same way
myCache.set("name", "value", 3600);
```

<a id="options"></a>

## Options

| Parameter     | Type       | Default          | Description                                          |
| ------------- | ---------- | ---------------- | ---------------------------------------------------- |
| `type`        | `string`   | `"local"`        | Cache type, either `local` or `session`              |
| `expire`      | `number`   | `0`              | Cache lifetime in seconds. `0` means permanent cache |
| `prefix`      | `string`   | `""`             | Cache key prefix                                     |
| `serialize`   | `function` | `JSON.stringify` | Cache data serialization method                      |
| `deserialize` | `function` | `JSON.parse`     | Cache data deserialization method                    |

## API

### Set Cache

```js
cache.set("name", $value);
// Expires after 3600 seconds
cache.set("name", $value, 3600);
```

Returns `true` if set successfully, otherwise returns `false`.

### Increment

For numeric cache data, you can use the increment operation, for example:

```js
cache.set("name", 1);
// Increment name (step value 1)
cache.inc("name");
// Increment name (step value 3)
cache.inc("name", 3);
```

> [!WARNING]
> Only numeric or floating-point data can be incremented and decremented.

### Decrement

For numeric cache data, you can use the decrement operation, for example:

```js
// Decrement name (step value 1)
cache.dec("name");
// Decrement name (step value 3)
cache.dec("name", 3);
```

### Get Cache

You can get cache data using:

```js
cache.get("name");
```

If the `name` value does not exist, it returns `null` by default.

You can specify a default value, for example:

```js
cache.get("name", "");
```

This means if the `name` value does not exist, an empty string is returned.

It also supports passing a closure as the default value:

```js
cache.get("name", function () {
  // Dynamically return data
});
```

### Append Cache Data

If the cached data is an array, you can append data using the `push` method.

```js
cache.set("name", [1, 2, 3]);
cache.push("name", 4);
cache.push("name", 4);
cache.push("name", 4);
cache.push("name", 5);
cache.get("name"); // [1,2,3,4,5]
```

### Delete Cache

```js
cache.delete("name");
```

### Get and Delete Cache

```js
cache.pull("name");
```

If the `name` value does not exist, `null` is returned. A default value can be specified:

```js
cache.pull("name", "");
```

### Clear Cache

```js
cache.clear();
```

### Remember Cache

```js
cache.remember("start_time", Date.now());
```

If the `start_time` cache data does not exist, the cache data will be set to the current time.
The second parameter can be a closure to retrieve the cache data.

```js
cache.remember("start_time", function () {
  return Date.now();
});
```

The third parameter of the `remember` method can set the cache expiration time.

### Cache Tags

You can tag cache data, for example:

```js
cache.tag('tag')->set('name1','value1');
cache.tag('tag')->set('name2','value2');

// Clear cache data under the "tag" tag
cache.tag('tag')->clear();
```

Cache tags do not change cache read operations, so data can still be retrieved with:

```js
cache.get("name1");
```

It also supports specifying multiple cache tags at the same time:

```js
cache.tag(['tag1', 'tag2'])->set('name1', 'value1');
cache.tag(['tag1', 'tag2'])->set('name2', 'value2');

// Clear cache data for multiple tags
cache.tag(['tag1','tag2'])->clear();
```

You can append a cache key to a tag:

```js
cache.tag('tag')->append('name3');
```

Get the list of cache keys for a tag:

```js
cache.getTagItems("tag");
```

### Get Cache Handler

If you want to get the current underlying cache object, use the `handler()` method:

```js
// Original cache object
const localStorage = cache.handler();

// Then you can call the original methods of the cache object
localStorage.getItem("bgcolor");
```

### Switch Cache Type

If no cache type is specified, the default value of the [type](#options) option is used. It can be switched dynamically:

```js
// Use localStorage cache
cache.set('name','value',3600);
cache.get('name');

// Use sessionStorage cache
cache.store('sesson')->set('name','value',3600);
cache.store('sesson')->get('name');

// Switch to localStorage cache
cache.store('local')->set('name','value',3600);
cache.store('local')->get('name');
```

If you need to access the underlying storage object, you can use:

```js
const sessionStorage = cache.store('session')->handler();
```

## 🙏 Acknowledgements

The API design of this library is inspired by the [cache component](https://doc.thinkphp.cn/v8_0/caches.html) of the PHP framework [ThinkPHP](https://github.com/top-think/framework).
