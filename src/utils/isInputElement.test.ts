import isInputElement from "./isInputElement";

describe("isInputElement", () => {
  it("should work correctly", () => {
    expect(isInputElement(document.createElement("div"))).toBeFalsy();
    expect(isInputElement(document.createElement("input"))).toBeTruthy();
  });
});
