import cloneObject from "../cloneObject";

describe("cloneObject", () => {
  it("should throw error when target is an event", () => {
    expect(() => cloneObject(new Event("🍎"))).toThrow(Error);
  });

  it("should work correctly", () => {
    let target: any = {
      foo: undefined,
      bar: null,
      baz: true,
      qux: 1,
      quux: "🍎",
      quuz: ["🍎", ["🍎"]],
      corge: { foo: "🍎" },
      fred: new Date(),
      waldo: () => null,
    };
    expect(cloneObject(target)).toEqual(target);

    target = { foo: { bar: target } };
    expect(cloneObject(target)).toEqual(target);
  });
});
