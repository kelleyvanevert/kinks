import { useRouter } from "next/router";
import { Button } from "@/components/Button";
import { FilledCircledPlusIcon } from "@/ui/icons/FilledCircledPlusIcon";
import { TransferDataIcon } from "@/ui/icons/TransferDataIcon";

type Props = {
  onAskForSuggestions: () => void;
  onEnterTransferMode: () => void;
};

export function ExplainerBox({
  onAskForSuggestions,
  onEnterTransferMode,
}: Props) {
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
        <Button
          Icon={FilledCircledPlusIcon}
          onClick={onAskForSuggestions}
          label="Add new kinks"
        />

        <Button
          Icon={TransferDataIcon}
          onClick={onEnterTransferMode}
          label="Transfer data"
        />
      </div>
    </div>
  );
}
