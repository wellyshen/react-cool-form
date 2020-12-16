import isMultipleSelect from "../isMultipleSelect";

describe("isMultipleSelect", () => {
  it("should work correctly", () => {
    const select = document.createElement("select");
    expect(isMultipleSelect(select)).toBeFalsy();
    select.multiple = true;
    expect(isMultipleSelect(select)).toBeTruthy();
  });
});
