import Cache from "./Cache.js";

const instance = new Cache();

function cache(...args) {
  if (args.length === 0) {
    return instance;
  }

  if (args.length === 1) {
    return instance.get(args[0]);
  }

  if (args.length === 2 && args[1] === null) {
    return instance.remove(args[0]);
  }

  return instance.set(...args);
}

for (const key of Object.getOwnPropertyNames(Cache.prototype)) {
  if (key === "constructor") {
    continue;
  }

  const descriptor = Object.getOwnPropertyDescriptor(Cache.prototype, key);

  if (typeof descriptor.value === "function") {
    cache[key] = instance[key].bind(instance);
    continue;
  }

  Object.defineProperty(cache, key, {
    configurable: true,
    enumerable: true,
    ...(descriptor.get && {
      get: () => descriptor.get.call(instance),
    }),
    // ...(descriptor.set && {
    //   set: (value) => descriptor.set.call(instance, value),
    // }),
  });
}

export default cache;
