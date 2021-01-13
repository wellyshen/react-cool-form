import unset from "../unset";

describe("unset", () => {
  const other = { bar: "🍋" };

  it("should throw error when input is invalid", () => {
    expect(() => unset(null, "foo")).toThrow(TypeError);
    expect(() => unset(undefined, "foo")).toThrow(TypeError);
    expect(() => unset(true, "foo")).toThrow(TypeError);
    expect(() => unset("", "foo")).toThrow(TypeError);
    expect(() => unset(1, "foo")).toThrow(TypeError);
    expect(() => unset([], "foo")).toThrow(TypeError);
    expect(() => unset(new Date(), "foo")).toThrow(TypeError);
    expect(() => unset(() => null, "foo")).toThrow(TypeError);
  });

  it("should unset value by keys", () => {
    expect(unset({}, "foo.a.b")).toEqual({});
    expect(unset({ foo: undefined }, "foo")).toStrictEqual({});
    expect(unset({ foo: { a: undefined } }, "foo.a")).toStrictEqual({
      foo: {},
    });
    expect(unset({ ...other }, "foo")).toEqual({ ...other });
    expect(unset({ foo: "🍎", ...other }, "foo")).toEqual({ ...other });
    expect(unset({ foo: {}, ...other }, "foo")).toEqual({ ...other });
    expect(unset({ foo: [], ...other }, "foo")).toEqual({ ...other });
    expect(unset({ foo: { a: "🍎" }, ...other }, "foo.a")).toEqual({
      foo: {},
      ...other,
    });
    expect(unset({ foo: { a: { b: "🍎", ...other } } }, "foo.a.b")).toEqual({
      foo: { a: { ...other } },
    });
  });

  it("should unset value by indexes", () => {
    expect(unset({ foo: [undefined] }, "foo.0")).toStrictEqual({ foo: [,] });
    expect(unset({ foo: { a: [undefined] } }, "foo.a.0")).toStrictEqual({
      foo: { a: [,] },
    });
    expect(unset({ ...other }, "foo.0")).toEqual({ ...other });
    expect(unset({ foo: "🍎", ...other }, "foo.0")).toEqual({
      foo: "🍎",
      ...other,
    });
    expect(unset({ foo: {}, ...other }, "foo.0")).toEqual({
      foo: {},
      ...other,
    });
    expect(unset({ foo: ["🍎"], ...other }, "foo.0")).toEqual({
      foo: [,],
      ...other,
    });
    expect(unset({ foo: ["🍋", "🍎"], ...other }, "foo.1")).toEqual({
      foo: ["🍋", ,],
      ...other,
    });
    expect(unset({ foo: [["🍎"], ["🍋"]], ...other }, "foo.0.0")).toEqual({
      foo: [[,], ["🍋"]],
      ...other,
    });
    expect(unset({ foo: [["🍋", "🍎"], ["🥝"]], ...other }, "foo.0.1")).toEqual(
      {
        foo: [["🍋", ,], ["🥝"]],
        ...other,
      }
    );

    expect(unset({ foo: [undefined] }, "foo[0]")).toStrictEqual({ foo: [,] });
    expect(unset({ foo: { a: [undefined] } }, "foo.a[0]")).toStrictEqual({
      foo: { a: [,] },
    });
    expect(unset({ ...other }, "foo[0]")).toEqual({ ...other });
    expect(unset({ foo: "🍎", ...other }, "foo[0]")).toEqual({
      foo: "🍎",
      ...other,
    });
    expect(unset({ foo: {}, ...other }, "foo[0]")).toEqual({
      foo: {},
      ...other,
    });
    expect(unset({ foo: ["🍎"], ...other }, "foo[0]")).toEqual({
      foo: [,],
      ...other,
    });
    expect(unset({ foo: ["🍋", "🍎"], ...other }, "foo[1]")).toEqual({
      foo: ["🍋", ,],
      ...other,
    });
    expect(unset({ foo: [["🍎"], ["🍋"]], ...other }, "foo[0][0]")).toEqual({
      foo: [[,], ["🍋"]],
      ...other,
    });
    expect(
      unset({ foo: [["🍋", "🍎"], ["🥝"]], ...other }, "foo[0][1]")
    ).toEqual({
      foo: [["🍋", ,], ["🥝"]],
      ...other,
    });
  });

  it("should unset value by mixed", () => {
    expect(
      unset({ foo: { a: { b: ["🍋", ["🍎", "🥝"]] } } }, "foo.a.b.1[0]")
    ).toEqual({ foo: { a: { b: ["🍋", [, "🥝"]] } } });
    expect(
      unset({ foo: [{ a: ["🍋", "🍎"], ...other }] }, "foo.0.a[1]")
    ).toEqual({
      foo: [{ a: ["🍋", ,], ...other }],
    });
    expect(
      unset(
        { foo: { a: ["🍋", { b: ["🍎", "🥝"] }] }, ...other },
        "foo.a[1].b.0"
      )
    ).toEqual({ foo: { a: ["🍋", { b: [, "🥝"] }] }, ...other });
    expect(
      unset({ foo: ["🍋", { a: [[{ b: "🍎" }]], ...other }] }, "foo.1.a[0].0.b")
    ).toEqual({ foo: ["🍋", { a: [[{}]], ...other }] });
  });

  it("should unset value with mutable way", () => {
    const target = { foo: { a: "🍋" } };
    unset(target, "foo.a");
    expect(target).toEqual({ foo: {} });
  });

  it("should unset value with immutable way", () => {
    const target = { foo: { a: "🍋" } };
    unset(target, "foo.a", true);
    expect(target).toEqual({ foo: { a: "🍋" } });
  });
});
