import unset from "./unset";

describe("unset", () => {
  const other = { bar: "🍋" };

  it("should throw error when input is invalid", () => {
    expect(() => unset(null, "foo")).toThrow(TypeError);
    expect(() => unset(undefined, "foo")).toThrow(TypeError);
    expect(() => unset(NaN, "foo")).toThrow(TypeError);
    expect(() => unset(true, "foo")).toThrow(TypeError);
    expect(() => unset("", "foo")).toThrow(TypeError);
    expect(() => unset(1, "foo")).toThrow(TypeError);
    expect(() => unset([], "foo")).toThrow(TypeError);
    expect(() => unset(new Date(), "foo")).toThrow(TypeError);
    expect(() => unset(() => null, "foo")).toThrow(TypeError);
  });

  it("should do nothing if path is empty", () => {
    expect(unset({ foo: "🍎" }, "")).toEqual({ foo: "🍎" });
  });

  it("should unset value by keys", () => {
    expect(unset({ foo: undefined }, "foo")).toEqual({});
    expect(unset(other, "foo")).toEqual(other);
    expect(unset({ foo: {}, ...other }, "foo")).toEqual(other);
    expect(unset({ foo: [], ...other }, "foo")).toEqual(other);
    expect(unset({ foo: "🍎", ...other }, "foo")).toEqual(other);
    expect(unset({ foo: { a: "🍎" }, ...other }, "foo.a")).toEqual(other);
    expect(unset({ foo: { a: "🍎", b: "🍋" }, ...other }, "foo.a")).toEqual({
      foo: { b: "🍋" },
      ...other,
    });
    expect(
      unset(
        { foo: { a: "🍎", b: undefined, c: null, d: false, e: "" }, ...other },
        "foo.a"
      )
    ).toEqual({
      foo: { b: undefined, c: null, d: false, e: "" },
      ...other,
    });
    expect(unset({ foo: { a: { b: "🍎", ...other } } }, "foo.a.b")).toEqual({
      foo: { a: other },
    });
  });

  it("should unset value by indexes", () => {
    expect(unset({ foo: [undefined] }, "foo.0")).toEqual({});
    expect(unset(other, "foo.0")).toEqual(other);
    expect(unset({ foo: {}, ...other }, "foo.0")).toEqual(other);
    expect(unset({ foo: [], ...other }, "foo.0")).toEqual(other);
    expect(unset({ foo: "🍎", ...other }, "foo.0")).toEqual({
      foo: "🍎",
      ...other,
    });
    expect(unset({ foo: ["🍎"], ...other }, "foo.0")).toEqual(other);
    expect(unset({ foo: ["🍎", "🍋"], ...other }, "foo.1")).toEqual({
      foo: ["🍎"],
      ...other,
    });
    expect(unset({ foo: ["🍎", "🍋"], ...other }, "foo.0")).toEqual({
      foo: [, "🍋"],
      ...other,
    });
    expect(unset({ foo: ["🍎", undefined], ...other }, "foo.0")).toEqual(other);
    expect(unset({ foo: [undefined, "🍎"], ...other }, "foo.1")).toEqual(other);
    expect(
      unset(
        {
          foo: [null, false, "", {}, [], undefined, "🍎"],
          ...other,
        },
        "foo.6"
      )
    ).toEqual({
      foo: [null, false, "", {}, []],
      ...other,
    });
    expect(
      unset(
        {
          foo: [null, false, "", {}, [], undefined, "🍎", "🍋"],
          ...other,
        },
        "foo.6"
      )
    ).toEqual({
      foo: [null, false, "", {}, [], undefined, , "🍋"],
      ...other,
    });
    expect(unset({ foo: [["🍎"]], ...other }, "foo.0.0")).toEqual(other);
    expect(unset({ foo: [["🍎"], ["🍋"]], ...other }, "foo.1.0")).toEqual({
      foo: [["🍎"]],
      ...other,
    });
    expect(unset({ foo: [["🍋", "🍎"], ["🥝"]], ...other }, "foo.0.1")).toEqual(
      {
        foo: [["🍋"], ["🥝"]],
        ...other,
      }
    );

    expect(unset({ foo: [undefined] }, "foo[0]")).toEqual({});
    expect(unset(other, "foo[0]")).toEqual(other);
    expect(unset({ foo: {}, ...other }, "foo[0]")).toEqual(other);
    expect(unset({ foo: [], ...other }, "foo[0]")).toEqual(other);
    expect(unset({ foo: "🍎", ...other }, "foo[0]")).toEqual({
      foo: "🍎",
      ...other,
    });
    expect(unset({ foo: ["🍎"], ...other }, "foo[0]")).toEqual(other);
    expect(unset({ foo: ["🍎", "🍋"], ...other }, "foo[1]")).toEqual({
      foo: ["🍎"],
      ...other,
    });
    expect(unset({ foo: ["🍎", "🍋"], ...other }, "foo[0]")).toEqual({
      foo: [, "🍋"],
      ...other,
    });
    expect(unset({ foo: ["🍎", undefined], ...other }, "foo[0]")).toEqual(
      other
    );
    expect(unset({ foo: [undefined, "🍎"], ...other }, "foo[1]")).toEqual(
      other
    );
    expect(
      unset(
        {
          foo: [null, false, "", {}, [], undefined, "🍎"],
          ...other,
        },
        "foo[6]"
      )
    ).toEqual({
      foo: [null, false, "", {}, []],
      ...other,
    });
    expect(
      unset(
        {
          foo: [null, false, "", {}, [], undefined, "🍎", "🍋"],
          ...other,
        },
        "foo[6]"
      )
    ).toEqual({
      foo: [null, false, "", {}, [], undefined, , "🍋"],
      ...other,
    });
    expect(unset({ foo: [["🍎"]], ...other }, "foo[0][0]")).toEqual(other);
    expect(unset({ foo: [["🍎"], ["🍋"]], ...other }, "foo[1][0]")).toEqual({
      foo: [["🍎"]],
      ...other,
    });
    expect(
      unset({ foo: [["🍋", "🍎"], ["🥝"]], ...other }, "foo[0][1]")
    ).toEqual({
      foo: [["🍋"], ["🥝"]],
      ...other,
    });
  });

  it("should unset value by mixed", () => {
    expect(
      unset(
        { foo: [{ a: [{ b: [undefined, { c: "🍎" }] }] }] },
        "foo.0.a[0].b.1.c"
      )
    ).toEqual({});
    expect(
      unset({ foo: { a: { b: ["🍋", ["🥝", "🍎"]] } } }, "foo.a.b.1[0]")
    ).toEqual({ foo: { a: { b: ["🍋", [, "🍎"]] } } });
    expect(
      unset(
        {
          foo: [
            { a: ["🍋", false, {}, [], undefined, "🍎", null, ""], ...other },
          ],
        },
        "foo[0].a.5"
      )
    ).toEqual({
      foo: [{ a: ["🍋", false, {}, [], undefined, , null, ""], ...other }],
    });
    expect(
      unset(
        { foo: { a: ["🍋", { b: [{ c: "🍎" }, { d: "🥝" }] }] }, ...other },
        "foo.a.1.b[0].c"
      )
    ).toEqual({ foo: { a: ["🍋", { b: [, { d: "🥝" }] }] }, ...other });
    expect(
      unset(
        { foo: ["🍋", { a: ["🥝", [[{ b: "🍎" }, undefined]]], ...other }] },
        "foo.1.a[1].0[0].b"
      )
    ).toEqual({ foo: ["🍋", { a: ["🥝"], ...other }] });
    expect(
      unset(
        { foo: [{ a: [{ b: [{ c: [undefined, "🍎"] }] }] }] },
        "foo[0].a.0.b[0].c.1"
      )
    ).toEqual({});
    expect(
      unset(
        {
          foo: [{ a: [{ b: [{ c: [undefined, "🍎"] }] }], ...other }],
        },
        "foo[0].a.0.b[0].c.1"
      )
    ).toEqual({ foo: [other] });
  });

  it("should unset value with mutable way", () => {
    const target = { foo: { a: { b: "🍋" } } };
    unset(target, "foo.a");
    expect(target).toEqual({});
  });

  it("should unset value with immutable way", () => {
    const target = { foo: { a: { b: "🍋" } } };
    unset(target, "foo.a", true);
    expect(target).toEqual({ foo: { a: { b: "🍋" } } });
  });
});
