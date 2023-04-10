import { FC } from "react";
import { SvgIconProps } from "@/ui/SvgIcon";
import cx from "classnames";

type Props = {
  Icon: FC<SvgIconProps>;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
};

export function Button({ Icon, label, onClick, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "font-medium flex items-center rounded border border-black border-opacity-20 px-3 py-1 transition-transform",
        disabled && "opacity-60 scale-95 bg-black bg-opacity-5",
        !disabled && "active:scale-95 focus:bg-black focus:bg-opacity-5"
      )}
    >
      <Icon className="mr-1" />
      {label}
    </button>
  );
}
