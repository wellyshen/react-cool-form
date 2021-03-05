import unset from "./unset";

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

  it("should do nothing if path is empty", () => {
    expect(unset({ foo: "🍎" }, "")).toEqual({ foo: "🍎" });
  });

  it("should unset value by keys", () => {
    expect(unset({}, "foo.a.b")).toEqual({});
    expect(unset({ foo: undefined }, "foo")).toEqual({});
    expect(unset(other, "foo")).toEqual(other);
    expect(unset({ foo: "🍎", ...other }, "foo")).toEqual(other);
    expect(unset({ foo: {}, ...other }, "foo")).toEqual(other);
    expect(unset({ foo: [], ...other }, "foo")).toEqual(other);
    expect(unset({ foo: { a: {} }, ...other }, "foo.a")).toEqual(other);
    expect(unset({ foo: { a: [] }, ...other }, "foo.a")).toEqual(other);
    expect(unset({ foo: { a: "🍎" }, ...other }, "foo.a")).toEqual(other);
    expect(
      unset(
        { foo: { a: "🍎", b: undefined, c: null, d: false, e: "" }, ...other },
        "foo.a"
      )
    ).toEqual({
      foo: { b: undefined, c: null, d: false, e: "" },
      ...other,
    });
    expect(unset({ foo: { a: "🍎", b: "🍋" }, ...other }, "foo.a")).toEqual({
      foo: { b: "🍋" },
      ...other,
    });
    expect(unset({ foo: { a: { b: "🍎", ...other } } }, "foo.a.b")).toEqual({
      foo: { a: other },
    });
  });

  it("should unset value by indexes", () => {
    expect(unset({ foo: [undefined] }, "foo.0")).toEqual({});
    expect(unset({ foo: { a: [undefined] } }, "foo.a.0")).toEqual({});
    expect(unset(other, "foo.0")).toEqual(other);
    expect(unset({ foo: "🍎", ...other }, "foo.0")).toEqual({
      foo: "🍎",
      ...other,
    });
    expect(unset({ foo: {}, ...other }, "foo.0")).toEqual(other);
    expect(unset({ foo: [], ...other }, "foo.0")).toEqual(other);
    expect(unset({ foo: ["🍎"], ...other }, "foo.0")).toEqual(other);
    expect(
      unset({ foo: ["🍎", undefined, null, false, ""], ...other }, "foo.0")
    ).toEqual({
      foo: [undefined, null, false, ""],
      ...other,
    });
    expect(unset({ foo: ["🍋", "🍎"], ...other }, "foo.1")).toEqual({
      foo: ["🍋"],
      ...other,
    });
    expect(unset({ foo: [["🍎"]], ...other }, "foo.0.0")).toEqual(other);
    expect(unset({ foo: [["🍎"], ["🍋"]], ...other }, "foo.0.0")).toEqual({
      foo: [["🍋"]],
      ...other,
    });
    expect(unset({ foo: [["🍋", "🍎"], ["🥝"]], ...other }, "foo.0.1")).toEqual(
      {
        foo: [["🍋"], ["🥝"]],
        ...other,
      }
    );

    expect(unset({ foo: [undefined] }, "foo[0]")).toEqual({});
    expect(unset({ foo: { a: [undefined] } }, "foo.a[0]")).toEqual({});
    expect(unset(other, "foo[0]")).toEqual(other);
    expect(unset({ foo: "🍎", ...other }, "foo[0]")).toEqual({
      foo: "🍎",
      ...other,
    });
    expect(unset({ foo: {}, ...other }, "foo[0]")).toEqual(other);
    expect(unset({ foo: [], ...other }, "foo[0]")).toEqual(other);
    expect(unset({ foo: ["🍎"], ...other }, "foo[0]")).toEqual(other);
    expect(
      unset({ foo: ["🍎", undefined, null, false, ""], ...other }, "foo[0]")
    ).toEqual({
      foo: [undefined, null, false, ""],
      ...other,
    });
    expect(unset({ foo: ["🍋", "🍎"], ...other }, "foo[1]")).toEqual({
      foo: ["🍋"],
      ...other,
    });
    expect(unset({ foo: [["🍎"]], ...other }, "foo[0][0]")).toEqual(other);
    expect(unset({ foo: [["🍎"], ["🍋"]], ...other }, "foo[0][0]")).toEqual({
      foo: [["🍋"]],
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
      unset({ foo: { a: [{ b: { c: ["🍎"] } }] } }, "foo.a[0].b.c.0")
    ).toEqual({});
    expect(
      unset({ foo: { a: { b: [{ c: ["🍎"] }] } }, bar: "🍋" }, "foo.a.b[0].c.0")
    ).toEqual({ bar: "🍋" });
    expect(
      unset({ foo: { a: { b: ["🍋", ["🍎", "🥝"]] } } }, "foo.a.b.1[0]")
    ).toEqual({ foo: { a: { b: ["🍋", ["🥝"]] } } });
    expect(
      unset(
        { foo: [{ a: ["🍋", "🍎", false, null, ""], ...other }] },
        "foo.0.a[1]"
      )
    ).toEqual({
      foo: [{ a: ["🍋", false, null, ""], ...other }],
    });
    expect(
      unset(
        { foo: { a: ["🍋", { b: [{ c: "🥝" }, "🍎"] }] }, ...other },
        "foo.a[1].b.0.c"
      )
    ).toEqual({ foo: { a: ["🍋", { b: ["🍎"] }] }, ...other });
    expect(
      unset({ foo: ["🍋", { a: [[{ b: "🍎" }]], ...other }] }, "foo.1.a[0].0.b")
    ).toEqual({ foo: ["🍋", other] });
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
