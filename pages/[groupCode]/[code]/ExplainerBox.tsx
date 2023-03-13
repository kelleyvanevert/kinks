import { FilledCircledPlusIcon } from "@/ui/icons/FilledCircledPlusIcon";
import { useRouter } from "next/router";

type Props = {
  onAskForSuggestions: () => void;
};

export function ExplainerBox({ onAskForSuggestions }: Props) {
  const router = useRouter();

  return (
    <div className="animate-success relative mt-6 text-emerald-900 bg-emerald-600 bg-opacity-40 p-4 rounded-2xl mx-4 shadow-lg">
      <div className="text-sm">
        <span className="text-center font-display text-[16px]">
          This is your personal kinkmap.
        </span>{" "}
        <span className="opacity-70">
          Only you are able to see this map, via your unique code:
        </span>
      </div>
      <div className="text-center mx-auto font-mono font-bold">
        {router.query.code}
      </div>
      <div className="mt-4 text-sm opacity-70">
        Click the dots on your map to view or edit kinks you already added.
      </div>

      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        <button
          type="button"
          onClick={onAskForSuggestions}
          className="font-medium flex items-center rounded border border-emerald-800 px-3 py-1 transition-transform active:scale-95 focus:bg-emerald-800 focus:bg-opacity-10"
        >
          <FilledCircledPlusIcon className="mr-1" />
          Add new kinks
        </button>
      </div>
    </div>
  );
}
