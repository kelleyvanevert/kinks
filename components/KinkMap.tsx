import { ReactNode, RefObject, useEffect, useMemo } from "react";
import cx from "classnames";
import { interpolate } from "@/lib/interpolate";
import { useBoundingClientRect } from "@/lib/useBoundingClientRect";
import { useRefCallback } from "@/lib/useRefCallback";

type KinkItem = {
  taboo: number;
  interest: number;
  kink: string;
};

type Props<K> = {
  mapRef: RefObject<HTMLDivElement>;
  kinkItems?: K[];
  enableSelection?: boolean;
  onSelect?: (item: K & { x: number; y: number }) => void;
  showLabels?: boolean;
  children?: ReactNode;
};

export function KinkMap<K extends KinkItem>({
  mapRef,
  kinkItems,
  enableSelection,
  onSelect,
  showLabels,
  children,
}: Props<K>) {
  const rect = useBoundingClientRect(mapRef);

  const _onSelect = useRefCallback(onSelect);

  // This is not necessary for the displaying the map, because we can just use percentages for that -- but for click-detection, I'd like to combine a max click offset in pixels + nearest dot detection (for if there's many in the same area), and then is necessary
  const positionedKinkItems = useMemo(() => {
    if (!rect) return;

    return kinkItems?.map((item) => {
      return {
        ...item,
        x: interpolate(
          item.taboo,
          [0, 100],
          [KinkMap.MapPad, rect.width - KinkMap.MapPad]
        ),
        y: interpolate(
          item.interest,
          [0, 100],
          [rect.height - KinkMap.MapPad, KinkMap.MapPad]
        ),
      };
    });
  }, [rect, KinkMap.MapPad, kinkItems]);

  useEffect(() => {
    if (!rect || !positionedKinkItems || !enableSelection) return;

    const onClick = (e: MouseEvent) => {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxDist = 30;

      const entry = positionedKinkItems
        .map<[K & { x: number; y: number }, number]>((entry) => {
          const dist = Math.abs(entry.x - x) + Math.abs(entry.y - y);
          return [entry, dist];
        })
        .filter((t) => t[1] < maxDist)
        .sort((s, t) => s[1] - t[1])[0]?.[0];

      _onSelect(entry);
    };

    mapRef.current?.addEventListener("click", onClick);
    return () => mapRef.current?.removeEventListener("click", onClick);
  }, [rect, positionedKinkItems, enableSelection, _onSelect]);

  return (
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
          Interest <span style={{ position: "relative", bottom: -3 }}>→</span>
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
        ref={mapRef}
        className="bg-white rounded absolute top-[12px] right-[12px] left-[30px] bottom-[30px] shadow-lg overflow-hidden select-none"
      >
        {positionedKinkItems?.map((item) => {
          return (
            <div
              key={item.kink}
              style={{
                position: "absolute",
                left: item.x,
                top: item.y,
              }}
            >
              <div
                style={{
                  width: KinkMap.DotSize,
                  height: KinkMap.DotSize,
                  marginLeft: -KinkMap.DotSize / 2,
                  marginBlock: -KinkMap.DotSize / 2,
                }}
                className="bg-blue-400 rounded-full transition-all"
              ></div>
              <div
                className={cx(
                  "absolute whitespace-nowrap text-[10px] leading-[14px] select-none text-gray-500 transition-all",
                  showLabels
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-1"
                )}
                style={{
                  top: KinkMap.DotSize / 2,
                  left: -20,
                }}
              >
                {item.kink}
              </div>
            </div>
          );
        })}

        {children}
      </div>
    </div>
  );
}

KinkMap.MapPad = 8;
KinkMap.DotSize = 6;
KinkMap.EditDotSize = 20;
