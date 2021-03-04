import { get, set, remove } from "./shared";

describe("shared", () => {
  it.each(["form-1", undefined])("should work correctly", (id) => {
    expect(get(id)).toBeUndefined();
    const methods = { method: "🍎" };
    // @ts-expect-error
    set(id, methods);
    expect(get(id)).toEqual(methods);
    remove(id);
    expect(get(id)).toBeUndefined();
  });
});
