import { useEffect, useState } from "react";
import { SkipOverIcon } from "@/ui/icons/SkipOverIcon";
import { PencilIcon } from "@/ui/icons/PencilIcon";
import { RoundIconActionButton } from "@/components/RoundIconActionButton";
import { FlowerIcon } from "@/ui/icons/FlowerIcon";
import { useAsync } from "@/lib/useAsync";
import { randomFromArray } from "@/lib/randomFromArray";
import { Kinks } from "@/lib/kinks";
import { useRefCallback } from "@/lib/useRefCallback";
import { CloseIcon } from "@/ui/icons/CloseIcon";

export function useSuggestionBox() {
  const [isOpen, setIsOpen] = useState(false);

  const [kink, setKink] = useState(() => {
    return randomFromArray(Kinks);
  });

  const animating = useAsync(async () => {
    await new Promise((r) => setTimeout(r, 300));
    return true;
  });

  useEffect(() => {
    animating.mutate();
  }, [animating.mutate]);

  const next = useRefCallback(() => {
    setKink(randomFromArray(Kinks));
    animating.mutate();
  });

  const open = useRefCallback(() => {
    setIsOpen(true);
  });

  const ui = isOpen && (
    <div className="animate-success relative mt-6 bg-purple-600 bg-opacity-40 p-4 rounded-2xl mx-4 shadow-lg">
      <div className="text-center font-display text-purple-900">
        How do you feel about...
      </div>
      <div className="mt-1 flex justify-center">
        {animating.isLoading ? (
          <FlowerIcon
            key={animating.id}
            size={32}
            className="text-pink-500 animate-growAndSpin"
          />
        ) : (
          <div className="bg-pink-500 bg-opaity-30 text-center text-2xl leading-[1] text-white font-medium rounded-lg py-1 px-2">
            {kink}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-row text-purple-900">
        <div className="basis-1/2 flex justify-center">
          <RoundIconActionButton Icon={PencilIcon} label="Write in" />
        </div>

        <div className="basis-1/2 flex justify-center">
          <RoundIconActionButton
            Icon={SkipOverIcon}
            label="Next suggestion"
            onClick={next}
          />
        </div>
      </div>

      <div className="mt-6 text-xs text-purple-900 text-opacity-60">
        Click in your map to place this suggested kink. Not interested in this
        kink? That's also data, add it to your map :)
      </div>

      <button
        type="button"
        className="p-1 absolute top-[6px] right-[6px] focus:bg-black focus:bg-opacity-10 transition-transform active:scale-90 rounded-full"
        onClick={() => setIsOpen(false)}
      >
        <CloseIcon size={24} className="text-purple-900" />
      </button>
    </div>
  );

  return { isOpen, ui, kink, next, open };
}
