import { useState } from "react";
import { useAsync } from "@/lib/useAsync";
import { CloseIcon } from "@/ui/icons/CloseIcon";
import { Button } from "@/components/Button";
import { TransferDataIcon } from "@/ui/icons/TransferDataIcon";
import { useApiClient, useApiMutation } from "@/lib/ApiClient";
import { TransferData } from "@/lib/methods";
import { getErrorMessage } from "@/lib/getErrorMessage";

type Props = {
  code: string;
  groupCode: string;
  onClose: () => void;
};

export function TransferBox({ code, groupCode, onClose }: Props) {
  const client = useApiClient();

  const [source, setSource] = useState("");

  const transferData = useAsync(async () => {
    const [source_group_code, source_code] = source
      .split("/")
      .map((s) => s.trim());
    if (!source_group_code || !source_code) {
      throw new Error(
        "Enter your group code + participant code with a slash in between, for example: somegroup/uh238gh"
      );
    }

    await client.executeQuery(TransferData, {
      input: {
        source_group_code,
        source_code,
        group_code: groupCode,
        code,
      },
    });

    onClose();
  });

  return (
    <div className="animate-success relative mt-6 bg-purple-600 bg-opacity-40 p-4 rounded-2xl mx-4 shadow-lg">
      <div className="text-center font-display text-purple-900">
        Transfer data from...
      </div>
      <div className="mt-2 text-purple-900">
        <input
          disabled={transferData.isLoading}
          className="outline-none w-full bg-pink-500 bg-opaity-30 rounded-lg px-3 py-1 text-center text-2xl leading-[1] text-white font-medium placeholder:text-white placeholder:text-opacity-30"
          placeholder="group/code"
          autoFocus
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        {transferData.error ? (
          <div className="mt-6 text-sm font-bold text-red-700">
            {getErrorMessage(transferData.error)}
          </div>
        ) : (
          <div className="mt-6 text-sm text-opacity-60">
            Enter the group name + "/" + your personal code, from which you want
            to transfer your data.
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          <Button
            disabled={transferData.isLoading}
            Icon={TransferDataIcon}
            onClick={transferData.mutate}
            label="Transfer data now"
          />
        </div>
      </div>

      <button
        type="button"
        className="p-1 absolute top-[6px] right-[6px] focus:bg-black focus:bg-opacity-10 transition-transform active:scale-90 rounded-full"
        onClick={onClose}
      >
        <CloseIcon size={24} className="text-purple-900" />
      </button>
    </div>
  );
}
