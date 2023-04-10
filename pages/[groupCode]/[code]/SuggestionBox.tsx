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

type Props = {
  exclude?: string[];
};

export function useSuggestionBox({ exclude }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const [writeMode, setWriteMode] = useState(false);

  const [kink, setKink] = useState(() => {
    return randomFromArray(Kinks, exclude);
  });

  const animating = useAsync(async () => {
    await new Promise((r) => setTimeout(r, 300));
    return true;
  });

  useEffect(() => {
    animating.mutate();
  }, [animating.mutate]);

  const next = useRefCallback(() => {
    if (writeMode) {
      setKink("");
    } else {
      setKink(randomFromArray(Kinks, exclude));
      animating.mutate();
    }
  });

  const open = useRefCallback(() => {
    setIsOpen(true);
  });

  const render = () => {
    return (
      isOpen && (
        <div className="animate-success relative mt-6 bg-purple-600 bg-opacity-40 p-4 rounded-2xl mx-4 shadow-lg">
          <div className="text-center font-display text-purple-900">
            How do you feel about...
          </div>
          {writeMode ? (
            <div className="mt-2">
              <input
                className="outline-none w-full bg-pink-500 bg-opaity-30 rounded-lg px-3 py-1 text-center text-2xl leading-[1] text-white font-medium placeholder:text-white placeholder:text-opacity-30"
                placeholder="enter kink"
                autoFocus
                value={kink}
                onChange={(e) =>
                  setKink(
                    e.target.value
                      .replace(/[A-Z]/g, (m) => m.toLowerCase())
                      .replace(/[^a-z- ()]/, "")
                  )
                }
              />
              <div className="mt-6 text-xs text-purple-900 text-opacity-60">
                Write in any kink you want. (We won't kinkshame!) Also feel free
                to write in a kink that you specifically aren't interested in.
              </div>
            </div>
          ) : (
            <div>
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
                  <RoundIconActionButton
                    Icon={PencilIcon}
                    label="Write in"
                    onClick={() => {
                      setKink("");
                      setWriteMode(true);
                    }}
                  />
                </div>

                <div className="basis-1/2 flex justify-center">
                  <RoundIconActionButton
                    Icon={SkipOverIcon}
                    label="Next suggestion"
                    onClick={next}
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            className="p-1 absolute top-[6px] right-[6px] focus:bg-black focus:bg-opacity-10 transition-transform active:scale-90 rounded-full"
            onClick={() => {
              if (writeMode) {
                setWriteMode(false);
                setTimeout(() => next(), 0);
              } else {
                setIsOpen(false);
              }
            }}
          >
            <CloseIcon size={24} className="text-purple-900" />
          </button>
        </div>
      )
    );
  };

  return { isOpen, render, kink, next, open };
}
