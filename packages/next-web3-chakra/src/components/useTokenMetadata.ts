import { useQuery } from "react-query";

export const useTokenMetadata = ({ tokenURI }: { tokenURI: string }) => {
  const metadata = useQuery(
    ["TokenMetadata", tokenURI],
    () => fetch(tokenURI).then((res) => res.json()),
    {
      onSuccess: () => {},
    }
  );

  return {
    metadata,
  };
};
