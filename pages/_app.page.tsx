import { AppProps } from "next/app";
import { ProvideModalRoot } from "@/ui/modalroot";
import { Hydrate } from "react-query";

import "../global.css";
import { useState } from "react";
import { ApiClient, ApiClientProvider } from "@/lib/ApiClient";

export default function MyApp({ Component, pageProps }: AppProps) {
  const [client] = useState(() => {
    return new ApiClient();
  });

  return (
    <ApiClientProvider client={client}>
      <Hydrate state={pageProps.dehydratedState}>
        <ProvideModalRoot>
          <Component {...pageProps} />
        </ProvideModalRoot>
      </Hydrate>
    </ApiClientProvider>
  );
}
