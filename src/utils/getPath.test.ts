import getPath from "./getPath";

describe("getPath", () => {
  it("should work correctly", () => {
    expect(getPath("foo")).toBe("values.foo");
    expect(getPath("values.foo")).toBe("values.foo");
    expect(getPath("touched.foo")).toBe("touched.foo");
    expect(getPath("errors.foo")).toBe("errors.foo");
    expect(getPath("dirty.foo")).toBe("dirty.foo");
    expect(getPath("isDirty")).toBe("isDirty");
    expect(getPath("isValid")).toBe("isValid");
    expect(getPath("isSubmitting")).toBe("isSubmitting");
    expect(getPath("isSubmitted")).toBe("isSubmitted");
    expect(getPath("submitCount")).toBe("submitCount");
  });
});
