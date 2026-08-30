import { useEffect, useRef, useState } from "react";

function toError(reason: unknown) {
  return reason instanceof Error ? reason : new Error(String(reason));
}

export default function useGeneratedImage(
  generate: (value: string, width: number, height: number) => Promise<string>,
  validate: (value: string, width: number, height: number) => void,
  value: string,
  width: number,
  height: number,
  onError?: (error: Error) => void,
) {
  const [uri, setUri] = useState<string>();
  const [error, setError] = useState<Error>();

  // Held in a ref so that an inline `onError` arrow does not re-run the effect
  // below on every render.
  const latestOnError = useRef(onError);

  useEffect(() => {
    latestOnError.current = onError;
  });

  useEffect(() => {
    let active = true;

    setUri(undefined);
    setError(undefined);

    try {
      validate(value, width, height);

      generate(value, width, height)
        .then((result) => {
          if (active) {
            setUri(result);
          }
        })
        .catch((reason: unknown) => {
          if (active) {
            setError(toError(reason));
          }
        });
    } catch (reason) {
      setError(toError(reason));
    }

    return () => {
      active = false;
    };
  }, [generate, height, validate, value, width]);

  useEffect(() => {
    if (error !== undefined) {
      latestOnError.current?.(error);
    }
  }, [error]);

  if (onError === undefined) {
    // No handler: keep failing during render, where an error boundary catches
    // invalid input on the first pass. With a handler the caller has said it
    // will deal with the error itself, so the tree is left standing and the
    // component renders nothing instead.
    validate(value, width, height);

    if (error !== undefined) {
      throw error;
    }
  }

  return uri;
}
