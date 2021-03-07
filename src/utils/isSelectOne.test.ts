import isSelectOne from "./isSelectOne";

describe("isSelectOne", () => {
  it("should work correctly", () => {
    expect(isSelectOne(document.createElement("select"))).toBeTruthy();
  });
});
