import { useLayoutEffect } from "react";

import useIsoLayoutEffect from "./useIsoLayoutEffect";

describe("useIsoLayoutEffect", () => {
  it('should be "useLayoutEffect" in client-side', () => {
    expect(useIsoLayoutEffect).toBe(useLayoutEffect);
  });
});
