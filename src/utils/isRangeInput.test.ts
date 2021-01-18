import isRangeInput from "./isRangeInput";

describe("isRangeInput", () => {
  it("should work correctly", () => {
    const input = document.createElement("input");
    expect(isRangeInput(input)).toBeFalsy();
    input.type = "range";
    expect(isRangeInput(input)).toBeTruthy();
  });
});
