import isSelectMultiple from "./isSelectMultiple";

describe("isSelectMultiple", () => {
  it("should work correctly", () => {
    const select = document.createElement("select");
    expect(isSelectMultiple(select)).toBeFalsy();
    select.multiple = true;
    expect(isSelectMultiple(select)).toBeTruthy();
  });
});
