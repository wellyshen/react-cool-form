import isCheckboxInput from "./isCheckboxInput";

describe("isCheckboxInput", () => {
  it("should work correctly", () => {
    const input = document.createElement("input");
    expect(isCheckboxInput(input)).toBeFalsy();
    input.type = "checkbox";
    expect(isCheckboxInput(input)).toBeTruthy();
  });
});
