import { useApiMutation } from "@/lib/ApiClient";
import { KinkStat, RemoveEntry } from "@/lib/methods";
import { CloseIcon } from "@/ui/icons/CloseIcon";
import { SearchIcon } from "@/ui/icons/SearchIcon";
import { TrashIcon } from "@/ui/icons/TrashIcon";

type Props = {
  stat: KinkStat;
  onDismiss: () => void;
};

export function KinkStatBox({ stat, onDismiss }: Props) {
  const removeEntry = useApiMutation(RemoveEntry);

  return (
    <div className="animate-success relative mt-6 text-white bg-pink-500 p-4 rounded-2xl mx-4 shadow-lg">
      <div className="text-center text-2xl leading-[1] text-white font-medium px-6">
        {stat.kink}
      </div>
      <div className="mt-4 text-sm opacity-70">
        This is the average position of every participant's placement of this
        kink on their personal maps
      </div>

      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        <a
          rel="noopener noreferrer"
          target="_blank"
          href={`https://google.com/search?q=${encodeURIComponent(
            stat.kink + " sexual kink"
          )}`}
          className="font-medium flex items-center rounded border border-white border-opacity-50 px-3 py-1 transition-transform active:scale-95 focus:bg-black focus:bg-opacity-10 disabled:opacity-50"
        >
          <SearchIcon className="mr-1" />
          Google it
        </a>
      </div>

      <button
        type="button"
        className="p-1 absolute top-[6px] right-[6px] focus:bg-black focus:bg-opacity-10 transition-transform active:scale-90 rounded-full"
        onClick={onDismiss}
      >
        <CloseIcon size={24} className="text-white" />
      </button>
    </div>
  );
}
