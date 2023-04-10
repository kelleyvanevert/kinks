import request from "graphql-request";
import { ReactNode, createContext, useContext } from "react";
import {
  QueryClient,
  QueryClientProvider,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "react-query";
export { gql } from "graphql-request";

export type LooseMaybe<T> = number | false | T | null | undefined;

export type ApiQueryDef<Data = any, Variables = {}> = {
  queryAlias?: string;
  query: () => string;
  // For convenience, o directly access the (single) query data from the data object
  extractData?: string | ((data: any, variables: Variables) => Data);
  isMutation?: boolean;
  invalidation?: (client: ApiClient, data: Data, variables: Variables) => void;

  // react-query options to be passed through
  staleTime?: number;
  refetchOnMount?: boolean;
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
};

export function getQueryDefKey(def: string | ApiQueryDef<any, any>) {
  if (typeof def === "string") {
    return def;
  }

  return def.queryAlias || def.query();
}

export class ApiClient {
  queryClient = new QueryClient();

  async executeQuery<Data = any, Variables = {}>(
    def: ApiQueryDef<Data, Variables>,
    variables: Variables
  ) {
    const responseData = await request("/api/graphql", def.query(), {
      ...(variables as any),
    }).catch((err: any) => {
      if (err && "response" in err) {
        throw err.response;
      }
    });

    const data =
      typeof def.extractData === "string"
        ? (responseData as any)[def.extractData]
        : def.extractData
        ? def.extractData(responseData, variables)
        : responseData;

    if (def.invalidation) {
      def.invalidation(this, data, variables);
    }

    return data;
  }

  async invalidate<R, P>(
    def: string | ApiQueryDef<R, P> | [ApiQueryDef<R, P>, P]
  ) {
    const key: any =
      typeof def === "string"
        ? def
        : Array.isArray(def)
        ? [getQueryDefKey((def as any)[0]), (def as any)[1]]
        : getQueryDefKey(def);

    await this.queryClient.invalidateQueries(key);
  }

  updateCache<R, P>(
    def: string | ApiQueryDef<R, P> | [ApiQueryDef<R, P>, P],
    dataOrUpdater: R | undefined | ((oldData: R, params: P) => R | undefined)
  ) {
    const key: any =
      typeof def === "string"
        ? def
        : Array.isArray(def)
        ? [getQueryDefKey((def as any)[0]), (def as any)[1]]
        : getQueryDefKey(def);

    this.queryClient
      .getQueryCache()
      .findAll(key)
      .forEach((q) => {
        if (q.state.status === "success") {
          q.setData((currentData: any) => {
            if (!currentData) return currentData;

            if (typeof dataOrUpdater === "function") {
              return (dataOrUpdater as Function)(currentData, q.queryKey[1]);
            } else {
              return dataOrUpdater;
            }
          });
        }
      });
  }
}

const ApiClientContext = createContext<ApiClient | null>(null);

export function ApiClientProvider({
  client,
  children,
}: {
  client: ApiClient;
  children?: ReactNode;
}) {
  return (
    <ApiClientContext.Provider value={client}>
      <QueryClientProvider client={client.queryClient}>
        {children}
      </QueryClientProvider>
    </ApiClientContext.Provider>
  );
}

export function useApiClient() {
  const client = useContext(ApiClientContext);
  if (!client) {
    throw new Error("Must wrap with <ApiClientProvider>");
  }

  return client;
}

export function useApiQuery<
  Data = any,
  Variables extends Record<string, any> = {}
>(def: ApiQueryDef<Data, Variables>, variables: LooseMaybe<Variables>) {
  const client = useApiClient();

  // Not sure why, but react-query has become draconian about its booleans...
  const extraOptions: UseQueryOptions<Data> = {};
  if (def.refetchOnMount) {
    extraOptions.refetchOnMount = def.refetchOnMount;
  }
  if (def.refetchOnWindowFocus) {
    extraOptions.refetchOnWindowFocus = def.refetchOnWindowFocus;
  }
  if (def.refetchInterval) {
    extraOptions.refetchInterval = def.refetchInterval;
  }
  if (def.staleTime) {
    extraOptions.staleTime = def.staleTime;
  }

  return useQuery<Data>({
    queryKey: [def.queryAlias ?? def.query(), variables],
    async queryFn() {
      if (!variables || typeof variables !== "object") {
        console.warn("should not happen: query fn execute w/o variables");
        return null;
      }

      if (def.isMutation) {
        console.warn("You shouldn't perform a mutation in useApiQuery hook");
      }

      return await client.executeQuery(def, variables);
    },
    keepPreviousData: Boolean(variables),
    enabled: Boolean(variables),
    ...extraOptions,
    suspense: false,
  });
}

export function useApiMutation<
  Data = any,
  Variables extends Record<string, any> = {}
>(def: ApiQueryDef<Data, Variables>) {
  const client = useApiClient();

  return useMutation<Data, unknown, Variables, unknown>({
    // really just for the devtools, and for `useApiIsMutating`
    mutationKey: getQueryDefKey(def),
    async mutationFn(variables: Variables) {
      if (!def.isMutation) {
        console.warn("You shouldn't perform a query in useApiMutation hook");
      }

      return await client.executeQuery(def, variables);
    },
    // ...options,
  });
}
