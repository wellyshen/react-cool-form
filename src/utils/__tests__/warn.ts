import warn from "../warn";

describe("warn", () => {
  it("should warn in development", () => {
    console.warn = jest.fn();
    // @ts-expect-error
    global.__DEV__ = true;

    warn("🍎", "🍋");
    expect(console.warn).toHaveBeenCalledWith("🍎", "🍋");
  });

  it("should not warn in production", () => {
    console.warn = jest.fn();
    // @ts-expect-error
    global.__DEV__ = false;

    warn("🍎", "🍋");
    expect(console.warn).not.toHaveBeenCalled();
  });
});
