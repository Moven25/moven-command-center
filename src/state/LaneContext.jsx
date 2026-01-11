import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const LaneCtx = createContext(null);

const STORAGE_KEY = "lanesync_active_lane_v1";

export function LaneProvider({ children }) {
  const [activeLane, setActiveLaneState] = useState(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const setActiveLane = (lane) => {
    setActiveLaneState(lane);
  };

  useEffect(() => {
    try {
      if (activeLane) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(activeLane));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [activeLane]);

  const value = useMemo(() => ({ activeLane, setActiveLane }), [activeLane]);

  return <LaneCtx.Provider value={value}>{children}</LaneCtx.Provider>;
}

export function useLane() {
  const ctx = useContext(LaneCtx);
  if (!ctx) throw new Error("useLane must be used inside <LaneProvider />");
  return ctx;
}
