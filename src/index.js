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
    return instance.delete(args[0]);
  }

  return instance.set(...args);
}

for (const key of Object.getOwnPropertyNames(Cache.prototype)) {
  if (key !== "constructor") {
    cache[key] = instance[key].bind(instance);
  }
}

export default cache;
