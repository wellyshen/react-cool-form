import getUid from "./getUid";

describe("getUid", () => {
  it("should work correctly", () => {
    // @ts-expect-error
    window.crypto = { getRandomValues: () => new Array(16).fill(0) };
    expect(getUid()).toBe("00000000-0000-4000-8000-000000000000");
  });
});
