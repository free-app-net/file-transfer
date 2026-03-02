import { createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";

interface PreventNavigationContext {
  isActive: boolean;
  message: string;
  activate: (msg: string) => void;
  deactivate: () => void;
}

const PreventNavigationContext = createContext<PreventNavigationContext | null>(
  null,
);

export function PreventNavigationProvider({
  children,
}: {
  children: ComponentChildren;
}) {
  const [message, setMessage] = useState("");
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent): string => {
      event.preventDefault();
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isActive, message]);

  const activate = (msg: string) => {
    setMessage(msg);
    setIsActive(true);
  };

  const deactivate = () => {
    setMessage("");
    setIsActive(false);
  };

  return (
    <PreventNavigationContext.Provider
      value={{ isActive, message, activate, deactivate }}
    >
      {children}
    </PreventNavigationContext.Provider>
  );
}

export function usePreventNavigation(): PreventNavigationContext {
  const ctx = useContext(PreventNavigationContext);
  if (!ctx)
    throw new Error(
      "usePreventNavigation must be used within a PreventNavigationProvider",
    );
  return ctx;
}
