import { useRef, useState, useEffect } from "react";
import { useRefCallback } from "./useRefCallback";

export type Status = "idle" | "loading" | "success" | "error";

export type Fn<Data = unknown, Args extends any[] = unknown[]> = (
  ...args: Args
) => Promise<Data>;

export type UseAsyncOptions<Data = unknown, Args extends any[] = unknown[]> = {
  // onMutate?: (args: Args) => Promise<undefined> | undefined;
  onSuccess?: (data: Data, args: Args) => Promise<unknown> | void;
  onError?: (error: unknown, args: Args) => Promise<unknown> | void;
  onSettled?: (
    data: Data | undefined,
    error: unknown | null,
    args: Args
  ) => Promise<unknown> | void;
};

type AsyncState<Data, Args> = {
  status: Status;
  data: undefined | Data;
  error: null | unknown;
  args: undefined | Args;
};

export type UseAsyncResult<
  Data = unknown,
  Args extends any[] = unknown[]
> = AsyncState<Data, Args> & {
  id: string | number;
  isError: boolean;
  isIdle: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  mutate: (...args: Args) => void;
  mutateAsync: (...args: Args) => Promise<Data>;
  reset: () => void;
};

/**
 * A hook that helps tracking the state of an asynchronous action, such as making an API call, waiting for an animation.
 *
 * ### API at a glance:
 *
 * ```tsx
 * const action = useAsync(async (someArg) => {
 *   // perform some async action
 * }, optionalOptions);
 * ```
 * - `action.status` - either "idle" (hasn't been called yet, or reset), "loading", "success", or "error"
 * - `action.data` - the (latest) result of the async function, e.g. helpful for API calls
 * - `action.error` - any error that was thrown during the latest call
 * - `action.{isIdle,isLoading,isError,isSuccess}` helpers to check the current status
 * - `action.mutate` - trigger the action, but don't bubble a thrown error or wait on the result (instead, use `action.{data,error,isLoading}` to track the action's status)
 * - `action.mutateAsync` - trigger the action, and get a promise back that throws/returns just like the async action itself. (But you can also still use `action.{data,error,isLoading}`)
 * - `action.args` - the arguments that were passed to the latest invocation of the action (if it has been called yet)
 * - `action.reset` - reset the action to its original idle state
 * - `optionalOptions.onSuccess` - called after successful invocation of the action. Not really necessary of course, you can just inline this code in the async action itself
 * - `optionalOptions.onError` - called with the thrown error if the async action throws
 * - `optionalOptions.onSettled` - called when the async action either resolves or rejects
 *
 * ### Typical example usage:
 *
 * ```tsx
 * const login = useAsync(async (email: string, password: string) => {
 *   const res = await fetch("/login", { ... });
 *   // ...
 *   navigation.navigate("/dashboard");
 * });
 *
 * return (
 *    // ...
 *    <Button
 *      disabled={login.isLoading}
 *      onClick={() => login.mutate(email, password)}
 *    >
 *      Log in
 *    </Button>
 *    // ...
 *    {login.error && <Text>{login.error.message}</Text>}
 *    // ...
 * );
 * ```
 *
 * - See also https://usehooks.com/useAsync/
 */
export function useAsync<Data = unknown, Args extends any[] = unknown[]>(
  fn: Fn<Data, Args>,
  options: UseAsyncOptions<Data, Args> = {}
): UseAsyncResult<Data, Args> {
  // Edge-case handling: if the component using this hook is unmounted before an action settles, we don't want to update local state unnecessarily (React will complain and it could theoretically also cause bugs)
  const isMounted = useIsMounted();

  // Edge-casey: if the async action a second time, before the previous one ends, the previous invocation should be considered stale, and only the result of the latest call should be propagated
  const latestCall = useRef({
    id: 0,
  });

  // Always use the latest version of the callback and the options (so we don't have to hassle about stale data or dependency arrays)
  const _fn = useRef(fn);
  const latestOptions = useRef(options);
  _fn.current = fn;
  latestOptions.current = options;

  const [state, setState] = useState<AsyncState<Data, Args>>(() => {
    return {
      status: "idle",
      data: undefined,
      error: null,
      args: undefined,
    };
  });

  // `mutateAsync` just wraps the async callback with state tracking operations, and staleness checks, but otherwise keeps its behavior the same (i.e. throwing behavior)
  const mutateAsync = useRefCallback((...args: Args) => {
    const { id } = (latestCall.current = {
      id: latestCall.current.id + 1,
    });

    setState({
      status: "loading",
      data: undefined,
      error: undefined,
      args,
    });

    return _fn
      .current(...args)
      .then(async (data) => {
        if (isMounted.current && latestCall.current.id === id) {
          const error = null;
          setState({
            status: "success",
            data,
            error,
            args,
          });
          await options.onSuccess?.(data, args);
          await options.onSettled?.(data, error, args);
        }

        return data;
      })
      .catch(async (error) => {
        if (isMounted.current && latestCall.current.id === id) {
          const data = undefined;
          setState({
            status: "error",
            data,
            error,
            args,
          });
          await options.onError?.(error, args);
          await options.onSettled?.(data, error, args);
        }

        throw error;
      });
  });

  // `mutate` only kicks off the action, but doesn't itself wait or throw
  const mutate = useRefCallback((...args: Args) => {
    mutateAsync(...args).catch(() => {
      // noop
    });
  });

  const reset = useRefCallback(() => {
    latestCall.current = {
      id: latestCall.current.id + 1,
    };

    setState({
      status: "idle",
      data: undefined,
      error: null,
      args: undefined,
    });
  });

  return {
    ...state,
    id: latestCall.current.id,

    isError: state.status === "error",
    isIdle: state.status === "idle",
    isLoading: state.status === "loading",
    isSuccess: state.status === "success",

    mutateAsync,
    mutate,
    reset,
  };
}

function useIsMounted(): { current: boolean } {
  const isMounted = useRef<boolean>(false);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
}
