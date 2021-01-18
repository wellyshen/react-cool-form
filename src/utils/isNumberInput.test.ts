import isNumberInput from "./isNumberInput";

describe("isNumberInput", () => {
  it("should work correctly", () => {
    const input = document.createElement("input");
    expect(isNumberInput(input)).toBeFalsy();
    input.type = "number";
    expect(isNumberInput(input)).toBeTruthy();
  });
});
