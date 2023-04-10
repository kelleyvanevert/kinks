import { useRef, useState } from "react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import cx from "classnames";
import { useSuggestionBox } from "./SuggestionBox";
import { interpolate } from "@/lib/interpolate";
import { useDrag } from "@/lib/useDrag";
import { ExplainerBox } from "./ExplainerBox";
import { useApiMutation, useApiQuery } from "@/lib/ApiClient";
import { Entry, GetParticipant, UpsertEntry } from "@/lib/methods";
import { EntryBox } from "./EntryBox";
import { KinkMap } from "@/components/KinkMap";
import { ThreeDotsIcon } from "@/ui/icons/ThreeDotsIcon";
import { TransferBox } from "./TransferBox";

type Props = {
  groupCode: string;
  code: string;
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  return {
    props: {
      groupCode: String(context.params?.groupCode),
      code: String(context.params?.code),
    },
  };
};

export default function ParticipantPage({ groupCode, code }: Props) {
  const getParticipant = useApiQuery(GetParticipant, {
    groupCode,
    code,
  });

  const [inTransferMode, setInTransferMode] = useState(false);

  const sugg = useSuggestionBox({
    exclude: getParticipant.data?.entries.map((e) => e.kink),
  });
  const inSuggestionMode = sugg.isOpen;
  const [numJustPlaced, setNumJustPlaced] = useState(0);

  const mapRef = useRef<HTMLDivElement>(null);

  const [selectedEntry, setSelectedEntry] = useState<
    Entry & { x: number; y: number }
  >();

  const { touchAt: moveTo } = useDrag(mapRef, {
    disabled: !selectedEntry,
    padding: KinkMap.MapPad,
  });

  const enterTransferMode = () => {
    setSelectedEntry(undefined);
    setNumJustPlaced(0);
    setInTransferMode(true);
  };

  const enterSuggestionMode = () => {
    setSelectedEntry(undefined);
    setNumJustPlaced(0);
    sugg.open();
  };

  const upsertEntry = useApiMutation(UpsertEntry);

  const { touchAt } = useDrag(mapRef, {
    disabled: !inSuggestionMode || !sugg.kink,
    padding: KinkMap.MapPad,
    async onFinish(pos, rect) {
      if (!sugg) return;

      const taboo = Math.round(
        interpolate(
          pos.x,
          [KinkMap.MapPad, rect.width - KinkMap.MapPad],
          [0, 100],
          "clamp"
        )
      );

      const interest = Math.round(
        100 -
          interpolate(
            pos.y,
            [KinkMap.MapPad, rect.height - KinkMap.MapPad],
            [0, 100],
            "clamp"
          )
      );

      await upsertEntry.mutateAsync({
        input: {
          group_code: groupCode,
          code,
          kink: sugg.kink,
          taboo,
          interest,
        },
      });

      sugg.next();
      setNumJustPlaced((n) => n + 1);
    },
  });

  return (
    <div className="bg-gray-100 grow pb-10">
      <div className="max-w-[500px] mx-auto">
        <div className="flex items-center px-3 py-2 font-display text-sm">
          <Link href="/" className="block text-emerald-700">
            Kinks with friends
          </Link>
          <span className="ml-1 mr-2">{`/`}</span>
          <Link href={`/${groupCode}`} className="block text-emerald-700">
            {groupCode}
          </Link>
          <span className="ml-1 mr-2">{`/`}</span>
        </div>

        <div className="mt-4 px-4">
          <h1 className="font-display text-center text-3xl">Your kinkmap</h1>
        </div>

        <KinkMap
          mapRef={mapRef}
          kinkItems={getParticipant.data?.entries}
          enableSelection={!inSuggestionMode}
          showLabels={!inSuggestionMode}
          onSelect={setSelectedEntry}
        >
          {!getParticipant.data && (
            <div className="absolute inset-0 flex justify-center items-center p-10">
              <ThreeDotsIcon size={28} className="animate-spin" />
            </div>
          )}

          <div
            className={cx(
              "pointer-events-none touch-none absolute inset-0 rounded transition-opacity flex justify-center items-center p-10",
              !inSuggestionMode || touchAt ? "opacity-0" : "opacity-100"
            )}
          >
            <div className="text-xl text-center leading-snug">
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
                  width: KinkMap.EditDotSize,
                  height: KinkMap.EditDotSize,
                  marginTop: -KinkMap.EditDotSize / 2,
                  marginLeft: -KinkMap.EditDotSize / 2,
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
                  width: KinkMap.EditDotSize,
                  height: KinkMap.EditDotSize,
                  marginTop: -KinkMap.EditDotSize / 2,
                  marginLeft: -KinkMap.EditDotSize / 2,
                }}
                className="animate-zoom bg-pink-500 rounded-full border-white border-[4px] shadow-lg"
              ></div>
            </div>
          )}
        </KinkMap>

        {inTransferMode ? (
          <TransferBox
            code={code}
            groupCode={groupCode}
            onClose={() => setInTransferMode(false)}
          />
        ) : sugg.isOpen ? (
          sugg.render()
        ) : selectedEntry ? (
          <EntryBox
            entry={selectedEntry}
            onDismiss={() => setSelectedEntry(undefined)}
          />
        ) : (
          <ExplainerBox
            onAskForSuggestions={enterSuggestionMode}
            onEnterTransferMode={enterTransferMode}
          />
        )}
      </div>
    </div>
  );
}
