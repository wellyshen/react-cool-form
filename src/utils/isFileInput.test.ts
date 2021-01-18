import isFileInput from "./isFileInput";

describe("isFileInput", () => {
  it("should work correctly", () => {
    const input = document.createElement("input");
    expect(isFileInput(input)).toBeFalsy();
    input.type = "file";
    expect(isFileInput(input)).toBeTruthy();
  });
});
