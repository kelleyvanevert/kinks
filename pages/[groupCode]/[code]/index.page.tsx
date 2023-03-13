import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import cx from "classnames";
import { useSuggestionBox } from "./SuggestionBox";
import { interpolate } from "@/lib/interpolate";
import { useDrag } from "@/lib/useDrag";
import { ExplainerBox } from "./ExplainerBox";
import { useBoundingClientRect } from "@/lib/useBoundingClientRect";
import { useApiMutation, useApiQuery } from "@/lib/ApiClient";
import { Entry, GetParticipant, UpsertEntry } from "@/lib/methods";
import { EntryBox } from "./EntryBox";

const MapPad = 8;
const DotSize = 6;
const EditDotSize = 20;

export default function ParticipantPage() {
  const router = useRouter();

  const getParticipant = useApiQuery(
    GetParticipant,
    router.isReady && {
      groupCode: String(router.query.groupCode),
      code: String(router.query.code),
    }
  );

  const sugg = useSuggestionBox({
    exclude: getParticipant.data?.entries.map((e) => e.kink),
  });
  const inSuggestionMode = sugg.isOpen;
  const [numJustPlaced, setNumJustPlaced] = useState(0);

  const ref = useRef<HTMLDivElement>(null);

  const [selectedEntry, setSelectedEntry] = useState<
    Entry & { x: number; y: number }
  >();

  const inFocusMode = inSuggestionMode || !!selectedEntry;

  const { touchAt: moveTo } = useDrag(ref, {
    disabled: !selectedEntry,
    padding: MapPad,
  });

  const enterSuggestionMode = () => {
    setSelectedEntry(undefined);
    setNumJustPlaced(0);
    sugg.open();
  };

  const upsertEntry = useApiMutation(UpsertEntry);

  const { touchAt } = useDrag(ref, {
    disabled: !inSuggestionMode,
    padding: MapPad,
    async onFinish(pos, rect) {
      if (!sugg) return;

      const taboo = Math.round(
        interpolate(pos.x, [MapPad, rect.width - MapPad], [0, 100], "clamp")
      );

      const interest = Math.round(
        100 -
          interpolate(pos.y, [MapPad, rect.height - MapPad], [0, 100], "clamp")
      );

      await upsertEntry.mutateAsync({
        input: {
          group_code: String(router.query.groupCode),
          code: String(router.query.code),
          kink: sugg.kink,
          taboo,
          interest,
        },
      });

      // setKinks((curr) => [
      //   ...curr,
      //   {
      //     id: "" + Math.random(),
      //     kink: sugg.kink,
      //     taboo,
      //     interest,
      //   },
      // ]);

      sugg.next();
      setNumJustPlaced((n) => n + 1);
    },
  });

  const rect = useBoundingClientRect(ref);

  // This is not necessary for the displaying the map, because we can just use percentages for that -- but for click-detection, I'd like to combine a max click offset in pixels + nearest dot detection (for if there's many in the same area), and then is necessary
  const positionedEntries = useMemo(() => {
    if (!rect) return;

    return getParticipant.data?.entries.map((entry) => {
      return {
        ...entry,
        x: interpolate(entry.taboo, [0, 100], [MapPad, rect.width - MapPad]),
        y: interpolate(
          entry.interest,
          [0, 100],
          [rect.height - MapPad, MapPad]
        ),
      };
    });
  }, [rect, getParticipant.data]);

  useEffect(() => {
    if (!rect || !positionedEntries || inSuggestionMode) return;

    const onClick = (e: MouseEvent) => {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxDist = 30;

      const entry = positionedEntries
        .map<[Entry & { x: number; y: number }, number]>((entry) => {
          const dist = Math.abs(entry.x - x) + Math.abs(entry.y - y);
          return [entry, dist];
        })
        .filter((t) => t[1] < maxDist)
        .sort((s, t) => s[1] - t[1])[0]?.[0];

      setSelectedEntry(entry);
    };

    ref.current?.addEventListener("click", onClick);
    return () => ref.current?.removeEventListener("click", onClick);
  }, [rect, positionedEntries, inSuggestionMode, setSelectedEntry]);

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
            className="bg-white rounded absolute top-[12px] right-[12px] left-[30px] bottom-[30px] shadow-lg overflow-hidden select-none"
          >
            <div>
              {positionedEntries?.map((entry) => {
                return (
                  <div
                    key={entry.uuid}
                    style={{
                      position: "absolute",
                      left: entry.x,
                      top: entry.y,
                    }}
                  >
                    <div
                      style={{
                        width: DotSize,
                        height: DotSize,
                        marginLeft: -DotSize / 2,
                        marginBlock: -DotSize / 2,
                      }}
                      className="bg-blue-400 rounded-full transition-all"
                    ></div>
                    <div
                      className={cx(
                        "absolute whitespace-nowrap text-[10px] leading-[14px] select-none text-gray-500 transition-all",
                        inSuggestionMode
                          ? "opacity-0 translate-y-1"
                          : "opacity-100 translate-y-0"
                      )}
                      style={{
                        top: DotSize / 2,
                        left: -20,
                      }}
                    >
                      {entry.kink}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className={cx(
                "pointer-events-none touch-none absolute inset-0 rounded transition-opacity flex justify-center items-center p-10",
                !inSuggestionMode || touchAt ? "opacity-0" : "opacity-100"
              )}
            >
              <div className="text-xl text-center">
                <span className="bg-white bg-opacity-60">
                  {numJustPlaced === 0 ? (
                    "Select a spot on your map to place the kink"
                  ) : numJustPlaced === 1 ? (
                    <span>
                      Excellent!
                      <br />
                      And what about this one?
                    </span>
                  ) : numJustPlaced === 2 ? (
                    "The more kinks the better :)"
                  ) : numJustPlaced === 3 ? (
                    "Data data data!"
                  ) : null}
                </span>
              </div>
            </div>

            <div
              className={cx(
                "pointer-events-none touch-none absolute inset-0 bg-pink-500 rounded transition-opacity",
                touchAt
                  ? "opacity-80"
                  : selectedEntry
                  ? "opacity-80"
                  : "opacity-0"
              )}
            ></div>

            {touchAt && (
              <div
                key="add"
                style={{
                  touchAction: "none",
                  pointerEvents: "none",
                  position: "absolute",
                  left: touchAt.x,
                  top: touchAt.y,
                }}
              >
                <div
                  style={{
                    width: EditDotSize,
                    height: EditDotSize,
                    marginTop: -EditDotSize / 2,
                    marginLeft: -EditDotSize / 2,
                  }}
                  className="bg-pink-500 rounded-full border-white border-[4px] shadow-lg"
                ></div>
              </div>
            )}

            {selectedEntry && (
              <div
                key="edit"
                style={{
                  touchAction: "none",
                  pointerEvents: "none",
                  position: "absolute",
                  left: selectedEntry.x,
                  top: selectedEntry.y,
                }}
              >
                <div
                  style={{
                    width: EditDotSize,
                    height: EditDotSize,
                    marginTop: -EditDotSize / 2,
                    marginLeft: -EditDotSize / 2,
                  }}
                  className="animate-zoom bg-pink-500 rounded-full border-white border-[4px] shadow-lg"
                ></div>
              </div>
            )}
          </div>
        </div>

        {sugg.isOpen ? (
          sugg.render()
        ) : selectedEntry ? (
          <EntryBox
            entry={selectedEntry}
            onDismiss={() => setSelectedEntry(undefined)}
          />
        ) : (
          <ExplainerBox onAskForSuggestions={enterSuggestionMode} />
        )}
      </div>
    </div>
  );
}
