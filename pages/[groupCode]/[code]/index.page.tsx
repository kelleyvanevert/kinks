import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import cx from "classnames";
import { useSuggestionBox } from "./SuggestionBox";
import { constrain } from "@/lib/constrain";
import { interpolate } from "@/lib/interpolate";
import { useDrag } from "@/lib/useDrag";
import { ExplainerBox } from "./ExplainerBox";

type PageState = {
  mode: "suggestion";
};

const MapPad = 6;
const DotSize = 8;

export default function ParticipantPage() {
  const router = useRouter();

  // const [state, setState] = useState<PageState>({
  //   mode: "suggestion",
  // });

  const sugg = useSuggestionBox();

  const [kinks, setKinks] = useState(() => {
    return [
      {
        id: "bn8723",
        kink: "cunnilingus",
        interest: 50,
        taboo: 30,
      },
      {
        id: "dh123t",
        kink: "light bondage (receiving)",
        interest: 10,
        taboo: 23,
      },
      {
        id: "3489h2g",
        kink: "dragons",
        interest: 82,
        taboo: 12,
      },
    ];
  });

  const ref = useRef<HTMLDivElement>(null);
  const { touchAt } = useDrag(ref, {
    padding: MapPad,
    onFinish(pos, bounds) {
      if (!sugg) return;

      const taboo = interpolate(
        pos.x,
        [MapPad, bounds.width - MapPad],
        [0, 100],
        "clamp"
      );
      const interest =
        100 -
        interpolate(pos.y, [MapPad, bounds.height - MapPad], [0, 100], "clamp");

      setKinks((curr) => [
        ...curr,
        {
          id: "" + Math.random(),
          kink: sugg.kink,
          taboo,
          interest,
        },
      ]);

      sugg.next();
    },
  });

  return (
    <div className="bg-gray-100 grow">
      <div className="max-w-[500px] mx-auto">
        <div className="flex items-center px-3 py-2 font-display text-sm">
          <Link href="/" className="block">
            Kinks with friends
          </Link>
          <span className="mx-1">{`>`}</span>
          <Link href="/" className="block text-pink-500">
            {router.query.groupCode}
          </Link>
          <span className="mx-1">{`>`}</span>
        </div>

        <div className="mt-4 px-4">
          <h1 className="font-display text-center text-3xl">Your kinkmap</h1>
          {/* <div className="text-gray-500 text-sm text-center leading-tight">
            Select kinks and place them on your map.
          </div> */}
        </div>

        <div className="aspect-square w-full relative touch-none">
          <div
            className="select-none origin-bottom-left absolute bottom-0 left-0 right-0 h-[30px]"
            style={{ transform: `rotate(-90deg) translate(0, 30px)` }}
          >
            <div className="absolute inset-0 pl-[30px] pr-[12px] flex justify-between text-gray-400 text-xs leading-[30px]">
              <div>not for me</div>
              <div>love this!</div>
            </div>
            <div className="absolute inset-0 pl-[30px] pr-[12px] font-display text-xl text-center leading-[30px]">
              Interest{" "}
              <span style={{ position: "relative", bottom: -3 }}>→</span>
            </div>
          </div>
          <div className="select-none absolute bottom-0 left-0 right-0 h-[30px]">
            <div className="absolute inset-0 pl-[30px] pr-[12px] flex justify-between text-gray-400 text-xs leading-[30px]">
              <div>ordinary</div>
              <div>shameful</div>
            </div>
            <div className="absolute inset-0 pl-[30px] pr-[12px] font-display text-xl text-center leading-[30px]">
              Taboo <span style={{ position: "relative", bottom: -3 }}>→</span>
            </div>
          </div>

          <div
            ref={ref}
            className="bg-white rounded absolute top-[12px] right-[12px] left-[30px] bottom-[30px] shadow-lg border"
          >
            <div
              style={{
                position: "absolute",
                top: MapPad,
                left: MapPad,
                right: MapPad,
                bottom: MapPad,
                pointerEvents: "none",
              }}
            >
              {kinks.map((entry) => {
                return (
                  <div
                    key={entry.id}
                    style={{
                      width: DotSize,
                      height: DotSize,
                      position: "absolute",
                      left: `${entry.taboo}%`,
                      bottom: `${entry.interest}%`,
                      marginLeft: -DotSize / 2,
                      marginBlock: -DotSize / 2,
                    }}
                    className="bg-black rounded-full"
                  ></div>
                );
              })}
            </div>

            <div
              className={cx(
                "pointer-events-none touch-none absolute inset-[-1px] bg-pink-500 border border-pink-700 rounded transition-opacity",
                touchAt ? "opacity-80" : "opacity-0"
              )}
            ></div>

            {touchAt && (
              <div
                style={{
                  touchAction: "none",
                  pointerEvents: "none",
                  position: "absolute",
                  left: touchAt.x,
                  top: touchAt.y,
                }}
              >
                <div
                  style={{ width: 20, height: 20 }}
                  className="bg-pink-500 rounded-full border-white border-[4px] shadow-lg ml-[-12px] mt-[-12px]"
                ></div>
              </div>
            )}
          </div>
        </div>

        {sugg.isOpen ? (
          sugg.ui
        ) : (
          <ExplainerBox onAskForSuggestions={sugg.open} />
        )}
      </div>
    </div>
  );
}
