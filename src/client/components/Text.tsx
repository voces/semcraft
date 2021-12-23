import { h, JSX } from "preact";

const dropShadows: string[] = [];
const getDropShadow = (num: number) =>
  dropShadows[num] ??
    (dropShadows[num] = Array(num).fill("drop-shadow(0 0 1px black)")
      .join(" "));

export const Text = (
  { children, style, dropShadow, ...props }:
    & JSX.HTMLAttributes<HTMLSpanElement>
    & {
      dropShadow: number;
    },
) => (
  <span
    style={{
      filter: getDropShadow(dropShadow),
      ...(typeof style === "object" ? style : undefined),
    }}
    {...props}
  >
    {children}
  </span>
);
