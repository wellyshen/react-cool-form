import isFieldElement from "../isFieldElement";

describe("isFieldElement", () => {
  it("should work correctly", () => {
    expect(isFieldElement(document.createElement("div"))).toBeFalsy();
    expect(isFieldElement(document.createElement("input"))).toBeTruthy();
    expect(isFieldElement(document.createElement("textarea"))).toBeTruthy();
    expect(isFieldElement(document.createElement("select"))).toBeTruthy();
  });
});
