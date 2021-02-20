import { get, set, remove } from "./shared";

describe("shared", () => {
  it("should work correctly", () => {
    expect(get("test")).toBeUndefined();
    const methods = { method: "🍎" };
    // @ts-expect-error
    set("test", methods);
    expect(get("test")).toEqual(methods);
    remove("test");
    expect(get("test")).toBeUndefined();
  });
});
