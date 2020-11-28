import { useEffect, useLayoutEffect } from "react";

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export default useIsoLayoutEffect;
