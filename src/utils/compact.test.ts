import compact from "./compact";

describe("compact", () => {
  it("should work correctly", () => {
    expect(compact([true, "0", 1, [], {}])).toEqual([true, "0", 1, [], {}]);
    expect(compact([undefined, null, false, NaN, "", 0])).toEqual([]);
  });
});
