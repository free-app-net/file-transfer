import { createContext } from "preact";
import { useContext, useEffect, useRef, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";

interface TransferLockContext {
  isActive: boolean;
  activate: () => void;
  deactivate: () => void;
}

const TransferLockContext = createContext<TransferLockContext | null>(null);

const UNLOAD_TEXT =
  "A transfer is in progress. Leaving this page will interrupt file sharing.";

export function TransferLockProvider({
  children,
}: {
  children: ComponentChildren;
}) {
  const [isActive, setIsActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const acriveRef = useRef(false);

  useEffect(() => {
    if (!isActive) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent): string => {
      event.preventDefault();
      return UNLOAD_TEXT;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    let wakeLockStopped = false;

    const acquireWakeLock = async () => {
      if (!("wakeLock" in navigator)) return;
      try {
        const wakeLock = await navigator.wakeLock.request("screen");
        if (wakeLockStopped) {
          wakeLock.release();
        } else {
          wakeLockRef.current = wakeLock;
        }
      } catch {
        // Its okay
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !wakeLockStopped) {
        acquireWakeLock();
      }
    };

    acquireWakeLock();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      wakeLockStopped = true;
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, [isActive]);

  const activate = () => {
    if (acriveRef.current) return;
    acriveRef.current = true;
    setIsActive(true);
  };

  const deactivate = () => {
    if (!acriveRef.current) return;
    acriveRef.current = false;
    setIsActive(false);
  };

  return (
    <TransferLockContext.Provider value={{ isActive, activate, deactivate }}>
      {children}
    </TransferLockContext.Provider>
  );
}

export function usePreventNavigation(): TransferLockContext {
  const ctx = useContext(TransferLockContext);
  if (!ctx)
    throw new Error(
      "usePreventNavigation must be used within a PreventNavigationProvider",
    );
  return ctx;
}
