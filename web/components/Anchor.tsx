import type { ComponentProps } from "react";

type Props = ComponentProps<"a"> & {
  preventNavigation?: string | null;
};

export function Anchor({ preventNavigation, children, ...rest }: Props) {
  if (preventNavigation) {
    return (
      <a
        {...rest}
        style={{ pointerEvents: "none" }}
        onMouseDown={(ev) => {
          ev.preventDefault();
          // this sometimes does not work???
          alert(preventNavigation);
        }}
      >
        {children}
      </a>
    );
  }

  return <a {...rest}>{children}</a>;
}
