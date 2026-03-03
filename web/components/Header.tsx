import { useLocation } from "preact-iso";
import { Anchor } from "./Anchor";
import { usePreventNavigation } from "../context/TransferLock";

export function Header() {
  const { url } = useLocation();
  const { isActive } = usePreventNavigation();

  return (
    <header>
      <nav>
        <Anchor
          preventNavigation={isActive ? "Transfer in progress" : null}
          href="/"
          className={url === "/" ? "active" : ""}
        >
          Home
        </Anchor>
        <Anchor
          preventNavigation={isActive ? "Transfer in progress" : null}
          href="/about"
          className={url === "/about" ? "active" : ""}
        >
          About
        </Anchor>
      </nav>
    </header>
  );
}
