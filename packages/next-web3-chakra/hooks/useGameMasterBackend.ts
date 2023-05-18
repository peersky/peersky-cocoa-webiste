import { getPlayerSalt } from "@daocoacoa/gm-js";
import { useQuery } from "react-query";
import queryCacheProps from "./hookCommon";

export const useGameMasterBackend = ({
  turn,
  gameId,
}: {
  turn?: string;
  gameId?: string;
}) => {
  const authToken = localStorage.getItem("EEAToken");
  const playerSaltQuery = useQuery(
    ["GMBackend", "PlayerSalt", turn, gameId],
    async () => getPlayerSalt({ turn: turn ?? "0", gameId: gameId ?? "0" }),
    {
      ...queryCacheProps,
      enabled: !!turn && !!gameId && !!authToken,
    }
  );

  return { playerSaltQuery };
};

export default useGameMasterBackend;
