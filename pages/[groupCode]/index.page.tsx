import { useRef, useState } from "react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import cx from "classnames";
import { KinkMap } from "@/components/KinkMap";
import { useApiQuery } from "@/lib/ApiClient";
import { GetGroup, KinkStat } from "@/lib/methods";
import { KinkStatBox } from "./[code]/KinkStatBox";
import { ThreeDotsIcon } from "@/ui/icons/ThreeDotsIcon";

type Props = {
  groupCode: string;
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  return {
    props: {
      groupCode: String(context.params?.groupCode),
    },
  };
};

export default function GroupPage({ groupCode }: Props) {
  const getGroup = useApiQuery(GetGroup, {
    groupCode,
  });

  const [selectedKinkStat, setSelectedKinkStat] = useState<
    KinkStat & { x: number; y: number }
  >();

  const mapRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-gray-100 grow">
      <div className="max-w-[500px] mx-auto">
        <div className="flex items-center px-3 py-2 font-display text-sm">
          <Link href="/" className="block text-emerald-700">
            Kinks with friends
          </Link>
          <span className="ml-1 mr-2">{`/`}</span>
        </div>

        <div className="mt-4 px-4">
          <h1 className="font-display text-center text-3xl">
            Kinks of{" "}
            <span className="text-emerald-600 bg-emerald-700 bg-opacity-20 px-1 inline-block">
              {groupCode}
            </span>
          </h1>
          <div className="mt-2 text-gray-500 text-sm text-center leading-tight">
            So far,{" "}
            {getGroup.data?.numParticipants === 0 ? (
              <>
                <span className="font-bold text-black">no one</span> has
              </>
            ) : getGroup.data?.numParticipants === 1 ? (
              <>
                <span className="font-bold text-black">1 person</span> has
              </>
            ) : (
              <>
                <span className="font-bold text-black">
                  {getGroup.data?.numParticipants ?? "?"} people
                </span>{" "}
                have
              </>
            )}{" "}
            contributed their kinks to this group's dataset.
          </div>
          <div className="mt-2 mb-4 text-gray-500 text-sm text-center leading-tight">
            The map below shows their average attitudes towards kinks. Their
            personal data remains anonymous.
          </div>
        </div>

        <KinkMap
          mapRef={mapRef}
          kinkItems={getGroup.data?.kinks}
          enableSelection
          showLabels
          onSelect={setSelectedKinkStat}
        >
          {!getGroup.data && (
            <div className="absolute inset-0 flex justify-center items-center p-10">
              <ThreeDotsIcon size={28} className="animate-spin" />
            </div>
          )}

          {getGroup.data && !getGroup.data.kinks && (
            <div className="absolute inset-0 flex justify-center items-center p-10">
              <div className="text-lg text-center leading-snug">
                <span className="bg-white bg-opacity-60">
                  Not enough participants have entered data in this group yet.
                  <br />
                  <br />
                  Data will be shown when at least 4 people have participated.
                </span>
              </div>
            </div>
          )}

          <div
            className={cx(
              "pointer-events-none touch-none absolute inset-0 bg-pink-500 rounded transition-opacity",
              selectedKinkStat ? "opacity-80" : "opacity-0"
            )}
          ></div>

          {selectedKinkStat && (
            <div
              key="edit"
              style={{
                touchAction: "none",
                pointerEvents: "none",
                position: "absolute",
                left: selectedKinkStat.x,
                top: selectedKinkStat.y,
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

        {selectedKinkStat ? (
          <KinkStatBox
            stat={selectedKinkStat}
            onDismiss={() => setSelectedKinkStat(undefined)}
          />
        ) : (
          <div className="animate-success relative mt-6 bg-gray-200 p-4 rounded-2xl mx-4">
            <div className="text-gray-500 text-sm text-center leading-tight">
              Want to add your data to this group? Choose an anonymous code and
              enter this URL into your browser:
            </div>
            <div className="text-center mt-3 font-medium">
              https://kinks.klve.nl/{groupCode}/
              <span className="bg-pink-500 italic text-white px-1">code</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
