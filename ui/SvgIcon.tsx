import { CSSProperties, FC } from "react";

export type SvgIconComp<T = {}> = FC<SvgIconProps & T>;

export type SvgIconProps = {
  viewBox?: string;
  d?: string | string[];
  size?: number;
  className?: string;
  style?: CSSProperties;
};

export function SvgIcon({
  viewBox = "0 0 24 24",
  d,
  size,
  className,
  style,
}: SvgIconProps) {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth={0}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      style={{ height: size || "1em", width: size || "1em", ...style }}
      className={className}
    >
      {d ? (
        typeof d === "string" ? (
          <path d={d}></path>
        ) : (
          d.map((d, i) => <path key={i} d={d}></path>)
        )
      ) : null}
    </svg>
  );
}
