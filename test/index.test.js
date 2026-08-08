import { describe, expect, it } from "vitest";
import { hello } from "../src/index.js";

describe("hello", () => {
  it("returns a greeting", () => {
    expect(hello()).toBe("Hello, world!");
  });

  it("supports a custom name", () => {
    expect(hello("JavaScript")).toBe("Hello, JavaScript!");
  });
});
