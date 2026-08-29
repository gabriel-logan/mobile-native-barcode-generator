import {useEffect, useState} from 'react';

export default function useGeneratedImage(
  generate: (value: string, width: number, height: number) => Promise<string>,
  value: string,
  width: number,
  height: number,
) {
  const [uri, setUri] = useState<string>();
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    let active = true;

    setUri(undefined);
    setError(undefined);

    generate(value, width, height)
      .then(result => {
        if (active) {
          setUri(result);
        }
      })
      .catch(reason => {
        if (active) {
          setError(reason);
        }
      });

    return () => {
      active = false;
    };
  }, [generate, height, value, width]);

  if (error !== undefined) {
    throw error;
  }

  return uri;
}
