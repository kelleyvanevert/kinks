import { RefObject, useEffect, useRef, useState } from "react";
import { constrain } from "./constrain";
import { useRefCallback } from "./useRefCallback";

type UseDragOptions = {
  padding?: number;
  onFinish?: (pos: { x: number; y: number }, bounds: DOMRect) => void;
};

export function useDrag(
  ref: RefObject<HTMLElement>,
  { padding = 0, onFinish }: UseDragOptions
) {
  const _onFinish = useRefCallback(onFinish);

  const isTouching = useRef<{
    identifier: number;
  }>();
  const [touchAt, setTouchAt] = useState<{
    x: number;
    y: number;
  }>();

  useEffect(() => {
    if (!ref.current) return;

    const _updatePos = (
      e: { clientX: number; clientY: number },
      complete: boolean
    ) => {
      const rect = ref.current!.getBoundingClientRect();
      const newTouchAt = {
        x: constrain(e.clientX - rect.left, [padding, rect.width - padding]),
        y: constrain(e.clientY - rect.top, [padding, rect.height - padding]),
      };

      if (complete) {
        _onFinish(newTouchAt, rect);
        setTouchAt(undefined);
      } else {
        setTouchAt(newTouchAt);
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (isTouching.current) return;

      const identifier = 0;
      isTouching.current = { identifier };

      _updatePos(e, false);

      const onMouseMove = (e: MouseEvent) => {
        if (!isTouching.current) return;

        _updatePos(e, false);
      };

      const onMouseUp = (e: MouseEvent) => {
        if (!isTouching.current) return;

        isTouching.current = undefined;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);

        _updatePos(e, true);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (isTouching.current) return;

      const touch = e.touches[0];
      const { identifier } = touch;
      isTouching.current = { identifier };
      _updatePos(touch, false);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isTouching.current) return;

      const continuedTouch = e.changedTouches.item(
        isTouching.current.identifier
      );
      if (!continuedTouch) return;

      _updatePos(continuedTouch, false);
    };

    const onTouchCancel = () => {
      isTouching.current = undefined;
      setTouchAt(undefined);
    };

    const onContextMenu = () => {
      isTouching.current = undefined;
      setTouchAt(undefined);
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!isTouching.current) return;

      const continuedTouch = e.changedTouches.item(
        isTouching.current.identifier
      );
      if (!continuedTouch) return;

      isTouching.current = undefined;

      _updatePos(continuedTouch, true);
    };

    // Having recognized at least 1 touch event, means that we're on a touch device, and we don't have to listen for mouse events. If we do keep listening, we can get into buggy behavior with double triggers. (I've run into this, because the order of the events is: touchstart -> touchend -> mousedown -> mouseup, so that it's easy to accidentally double trigger, even using a single shared state object.)
    const stopListeningForMouseEvents = () => {
      ref.current?.removeEventListener("mousedown", onMouseDown);
    };

    ref.current.addEventListener("mousedown", onMouseDown);
    ref.current.addEventListener("touchstart", stopListeningForMouseEvents);
    ref.current.addEventListener("touchstart", onTouchStart);
    ref.current.addEventListener("touchmove", onTouchMove);
    ref.current.addEventListener("touchcancel", onTouchCancel);
    ref.current.addEventListener("touchend", onTouchEnd);
    ref.current.addEventListener("contextmenu", onContextMenu);

    return () => {
      ref.current?.removeEventListener("mousedown", onMouseDown);
      ref.current?.removeEventListener(
        "touchstart",
        stopListeningForMouseEvents
      );
      ref.current?.removeEventListener("touchstart", onTouchStart);
      ref.current?.removeEventListener("touchmove", onTouchMove);
      ref.current?.removeEventListener("touchcancel", onTouchCancel);
      ref.current?.removeEventListener("touchend", onTouchEnd);
      ref.current?.removeEventListener("contextmenu", onContextMenu);
    };
  }, [_onFinish, padding]);

  return {
    touchAt,
  };
}
