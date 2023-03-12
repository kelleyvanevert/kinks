import {
  memo,
  useContext,
  createContext,
  useRef,
  ReactNode,
  RefObject,
} from "react";
import { createPortal } from "react-dom";

const ModalRootContext = createContext<null | RefObject<HTMLDivElement>>(null);

export const ProvideModalRoot = memo(
  ({ children }: { children?: ReactNode }) => {
    const ref = useRef<HTMLDivElement>(null);

    return (
      <ModalRootContext.Provider value={ref}>
        {children}
        <div ref={ref} />
      </ModalRootContext.Provider>
    );
  }
);

export function ModalPortal({ children = null }: { children?: ReactNode }) {
  const ref = useContext(ModalRootContext);
  if (!ref || !ref.current) {
    return null; // will not happen
  }

  return createPortal(children, ref.current);
}
