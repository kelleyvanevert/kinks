import { AppProps } from "next/app";
import { ProvideModalRoot } from "@/ui/modalroot";

import "../global.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ProvideModalRoot>
      <Component {...pageProps} />
    </ProvideModalRoot>
  );
}
