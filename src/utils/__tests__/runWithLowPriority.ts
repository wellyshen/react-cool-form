import runWithLowPriority from "../runWithLowPriority";

jest.useFakeTimers();

describe("runWithLowPriority", () => {
  it("should work correctly", () => {
    const fn = jest.fn();
    runWithLowPriority(fn);
    jest.runAllTimers();
    expect(fn).toHaveBeenCalled();
  });
});
