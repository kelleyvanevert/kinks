import { useApiMutation } from "@/lib/ApiClient";
import { Entry, RemoveEntry } from "@/lib/methods";
import { CloseIcon } from "@/ui/icons/CloseIcon";
import { TrashIcon } from "@/ui/icons/TrashIcon";

type Props = {
  entry: Entry;
  onDismiss: () => void;
};

export function EntryBox({ entry, onDismiss }: Props) {
  const removeEntry = useApiMutation(RemoveEntry);

  return (
    <div className="animate-success relative mt-6 text-white bg-pink-500 p-4 rounded-2xl mx-4 shadow-lg">
      <div className="text-center text-2xl leading-[1] text-white font-medium px-6">
        {entry.kink}
      </div>
      <div className="mt-4 text-sm opacity-70">
        Feel free to drag this kink to another spot on your map if you like.
      </div>

      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        <button
          type="button"
          disabled={removeEntry.isLoading}
          onClick={async () => {
            await removeEntry.mutateAsync({
              input: {
                group_code: entry.groupCode,
                code: entry.code,
                kink: entry.kink,
              },
            });
            onDismiss();
          }}
          className="font-medium flex items-center rounded border border-white border-opacity-50 px-3 py-1 transition-transform active:scale-95 focus:bg-black focus:bg-opacity-10 disabled:opacity-50"
        >
          <TrashIcon className="mr-1" />
          Remove this kink
        </button>
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
