import unset from "../unset";

describe("unset", () => {
  const obj = { bar: "🍋" };

  it("should throw error when input is invalid", () => {
    expect(() => unset(null, "foo")).toThrow(TypeError);
    expect(() => unset(undefined, "foo")).toThrow(TypeError);
    expect(() => unset(true, "foo")).toThrow(TypeError);
    expect(() => unset("", "foo")).toThrow(TypeError);
    expect(() => unset(1, "foo")).toThrow(TypeError);
    expect(() => unset([], "foo")).toThrow(TypeError);
    expect(() => unset(() => null, "foo")).toThrow(TypeError);
  });

  it("should unset value by keys", () => {
    expect(unset({ foo: undefined }, "foo")).toStrictEqual({});
    expect(unset({ foo: { a: undefined } }, "foo.a")).toStrictEqual({
      foo: {},
    });
    expect(unset({ ...obj }, "foo")).toEqual({ ...obj });
    expect(unset({ foo: "🍎", ...obj }, "foo")).toEqual({ ...obj });
    expect(unset({ foo: {}, ...obj }, "foo")).toEqual({ ...obj });
    expect(unset({ foo: [], ...obj }, "foo")).toEqual({ ...obj });
    expect(unset({ foo: { a: "🍎" }, ...obj }, "foo.a")).toEqual({
      foo: {},
      ...obj,
    });
    expect(unset({ foo: { a: { b: "🍎", ...obj } } }, "foo.a.b")).toEqual({
      foo: { a: { ...obj } },
    });

    const special = { foo: { "\\": { a: "🍎" } } };
    expect(unset(special, "foo.\\.a")).toEqual(special);
  });

  it("should unset value by indexes", () => {
    expect(unset({ foo: [undefined] }, "foo.0")).toStrictEqual({ foo: [,] });
    expect(unset({ foo: { a: [undefined] } }, "foo.a.0")).toStrictEqual({
      foo: { a: [,] },
    });
    expect(unset({ ...obj }, "foo.0")).toEqual({ ...obj });
    expect(unset({ foo: "🍎", ...obj }, "foo.0")).toEqual({
      foo: "🍎",
      ...obj,
    });
    expect(unset({ foo: {}, ...obj }, "foo.0")).toEqual({
      foo: {},
      ...obj,
    });
    expect(unset({ foo: ["🍎"], ...obj }, "foo.0")).toEqual({
      foo: [,],
      ...obj,
    });
    expect(unset({ foo: ["🍋", "🍎"], ...obj }, "foo.1")).toEqual({
      foo: ["🍋", ,],
      ...obj,
    });
    expect(unset({ foo: [["🍎"], ["🍋"]], ...obj }, "foo.0.0")).toEqual({
      foo: [[,], ["🍋"]],
      ...obj,
    });
    expect(unset({ foo: [["🍋", "🍎"], ["🥝"]], ...obj }, "foo.0.1")).toEqual({
      foo: [["🍋", ,], ["🥝"]],
      ...obj,
    });

    expect(unset({ foo: [undefined] }, "foo[0]")).toStrictEqual({ foo: [,] });
    expect(unset({ foo: { a: [undefined] } }, "foo.a[0]")).toStrictEqual({
      foo: { a: [,] },
    });
    expect(unset({ ...obj }, "foo[0]")).toEqual({ ...obj });
    expect(unset({ foo: "🍎", ...obj }, "foo[0]")).toEqual({
      foo: "🍎",
      ...obj,
    });
    expect(unset({ foo: {}, ...obj }, "foo[0]")).toEqual({
      foo: {},
      ...obj,
    });
    expect(unset({ foo: ["🍎"], ...obj }, "foo[0]")).toEqual({
      foo: [,],
      ...obj,
    });
    expect(unset({ foo: ["🍋", "🍎"], ...obj }, "foo[1]")).toEqual({
      foo: ["🍋", ,],
      ...obj,
    });
    expect(unset({ foo: [["🍎"], ["🍋"]], ...obj }, "foo[0][0]")).toEqual({
      foo: [[,], ["🍋"]],
      ...obj,
    });
    expect(unset({ foo: [["🍋", "🍎"], ["🥝"]], ...obj }, "foo[0][1]")).toEqual(
      {
        foo: [["🍋", ,], ["🥝"]],
        ...obj,
      }
    );
  });

  it("should unset value by mixed", () => {
    expect(
      unset({ foo: { a: { b: ["🍋", ["🍎", "🥝"]] } } }, "foo.a.b.1[0]")
    ).toEqual({ foo: { a: { b: ["🍋", [, "🥝"]] } } });
    expect(unset({ foo: [{ a: ["🍋", "🍎"], ...obj }] }, "foo.0.a[1]")).toEqual(
      {
        foo: [{ a: ["🍋", ,], ...obj }],
      }
    );
    expect(
      unset({ foo: { a: ["🍋", { b: ["🍎", "🥝"] }] }, ...obj }, "foo.a[1].b.0")
    ).toEqual({ foo: { a: ["🍋", { b: [, "🥝"] }] }, ...obj });
    expect(
      unset({ foo: ["🍋", { a: [[{ b: "🍎" }]], ...obj }] }, "foo.1.a[0].0.b")
    ).toEqual({ foo: ["🍋", { a: [[{}]], ...obj }] });
  });

  it("should unset value with mutable way", () => {
    const obj = { foo: "🍋" };
    unset(obj, "foo");
    expect(obj).toEqual({});
  });

  it("should unset value with immutable way", () => {
    const obj = { foo: "🍋" };
    unset(obj, "foo");
    expect(obj).toEqual(obj);
  });
});
