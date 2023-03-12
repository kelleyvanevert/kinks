import { SvgIconProps } from "@/ui/SvgIcon";
import { FC } from "react";

type Props = {
  Icon: FC<SvgIconProps>;
  label: string;
  onClick?: () => void;
};

export function RoundIconActionButton({ Icon, label, onClick }: Props) {
  return (
    <button
      type="button"
      className="min-w-[88px] text-center flex flex-col items-center transition-transform active:scale-95 group py-[2px]"
      onClick={() => onClick?.()}
    >
      <div className="rounded-full p-[10px] border border-black border-opacity-10 group-focus:border-current group-focus:outline outline-current">
        <Icon size={24} />
      </div>
      <div className="text-xs mt-1 px-1 font-medium">{label}</div>
    </button>
  );
}
