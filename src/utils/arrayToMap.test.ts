import arrayToMap from "./arrayToMap";

describe("arrayToMap", () => {
  it("should work correctly", () => {
    expect(arrayToMap(["🍎", "🍋", "🥝"])).toEqual({
      "🍎": true,
      "🍋": true,
      "🥝": true,
    });
  });
});
