import isRadioInput from "./isRadioInput";

describe("isRadioInput", () => {
  it("should work correctly", () => {
    const input = document.createElement("input");
    expect(isRadioInput(input)).toBeFalsy();
    input.type = "radio";
    expect(isRadioInput(input)).toBeTruthy();
  });
});
