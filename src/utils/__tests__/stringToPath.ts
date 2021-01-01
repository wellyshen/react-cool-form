import stringToPath from "../stringToPath";

describe("stringToPath", () => {
  it("should throw error if input isn't a string", () => {
    // @ts-expect-error
    expect(() => stringToPath(["foo", "bar"])).toThrow(TypeError);
  });

  it("should return empty array when input is empty string", () => {
    expect(stringToPath("")).toEqual([]);
  });

  it("should split on dots", () => {
    expect(stringToPath("foo")).toEqual(["foo"]);
    expect(stringToPath("foo.bar")).toEqual(["foo", "bar"]);
    expect(stringToPath("foo.bar.baz")).toEqual(["foo", "bar", "baz"]);

    expect(stringToPath("0")).toEqual(["0"]);
    expect(stringToPath("0.1")).toEqual(["0", "1"]);
    expect(stringToPath("0.1.2")).toEqual(["0", "1", "2"]);

    expect(stringToPath("foo.0")).toEqual(["foo", "0"]);
    expect(stringToPath("foo.0.bar")).toEqual(["foo", "0", "bar"]);
    expect(stringToPath("foo.0.bar.1")).toEqual(["foo", "0", "bar", "1"]);
  });

  it("should split on brackets", () => {
    expect(stringToPath("[0]")).toEqual(["0"]);
    expect(stringToPath("[0][1]")).toEqual(["0", "1"]);
    expect(stringToPath("[0][1][2]")).toEqual(["0", "1", "2"]);
  });

  it("should split on mixed", () => {
    expect(stringToPath("foo[0]")).toEqual(["foo", "0"]);
    expect(stringToPath("foo[0].bar[1]")).toEqual(["foo", "0", "bar", "1"]);
    expect(stringToPath("foo[0][1][2].bar[4][5].baz[6]")).toEqual([
      "foo",
      "0",
      "1",
      "2",
      "bar",
      "4",
      "5",
      "baz",
      "6",
    ]);
  });
});
