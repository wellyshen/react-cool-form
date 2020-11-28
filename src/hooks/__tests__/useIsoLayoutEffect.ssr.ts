/**
 * @jest-environment node
 */

import { useEffect } from "react";

import useIsoLayoutEffect from "../useIsoLayoutEffect";

describe("useIsoLayoutEffect", () => {
  it('should be "useEffect" in server-side', () => {
    expect(useIsoLayoutEffect).toBe(useEffect);
  });
});
