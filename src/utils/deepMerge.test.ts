import deepMerge from "./deepMerge";

describe("deepMerge", () => {
  it("should merge different types of values correctly", () => {
    let target: any = { foo: { bar: [] } };
    let override: any = { foo: { bar: {} } };
    expect(deepMerge(target, override)).toEqual(override);
    target = { foo: { bar: {} } };
    override = { foo: { bar: [] } };
    expect(deepMerge(target, override)).toEqual(override);
    override = { foo: { bar: null } };
    expect(deepMerge(target, override)).toEqual(override);
    override = { foo: { bar: undefined } };
    expect(deepMerge(target, override)).toEqual(override);
    override = { foo: { bar: true } };
    expect(deepMerge(target, override)).toEqual(override);
    override = { foo: { bar: "" } };
    expect(deepMerge(target, override)).toEqual(override);
    override = { foo: { bar: 1 } };
    expect(deepMerge(target, override)).toEqual(override);
    override = { foo: { bar: new Date() } };
    expect(deepMerge(target, override)).toEqual(override);
  });

  it("should merge dates correctly", () => {
    const override = { foo: { bar: new Date("2021-01-09") } };
    expect(deepMerge({ foo: { bar: new Date() } }, override)).toEqual(override);
  });

  it("should merge objects correctly", () => {
    let target: any = { foo: { bar: {} } };
    let override: any = { foo: { bar: { a: "🍎" } } };
    expect(deepMerge(target, override)).toEqual(override);
    target = { foo: { bar: { a: "🍋" } } };
    override = { foo: { bar: { a: "🍎" } } };
    expect(deepMerge(target, override)).toEqual(override);
    override = { foo: { bar: { b: "🍎" } } };
    expect(deepMerge(target, override)).toEqual({
      foo: { bar: { a: "🍋", b: "🍎" } },
    });
  });

  it("should merge arrays correctly", () => {
    let target: any = { foo: { bar: [] } };
    let override: any = { foo: { bar: ["🍎"] } };
    expect(deepMerge(target, override)).toEqual(override);
    target = { foo: { bar: ["🍋"] } };
    override = { foo: { bar: ["🍎"] } };
    expect(deepMerge(target, override)).toEqual({ foo: { bar: ["🍋", "🍎"] } });
    target = { foo: { bar: [{}] } };
    override = { foo: { bar: [[]] } };
    expect(deepMerge(target, override)).toEqual({ foo: { bar: [{}, []] } });
    target = { foo: { bar: [{ a: "🍋" }] } };
    override = { foo: { bar: [{ a: "🍎" }] } };
    expect(deepMerge(target, override)).toEqual({
      foo: { bar: [{ a: "🍋" }, { a: "🍎" }] },
    });
    target = { foo: { bar: [["🍋"]] } };
    override = { foo: { bar: [["🍎"]] } };
    expect(deepMerge(target, override)).toEqual({
      foo: { bar: [["🍋"], ["🍎"]] },
    });
  });
});
