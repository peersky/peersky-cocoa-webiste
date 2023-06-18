import {
  getPlayerSalt,
  relayProposal,
  getGameMasterAddress,
} from "@daocoacoa/gm-js";
import { useMutation, useQuery } from "react-query";
import queryCacheProps from "./hookCommon";

export const useGameMasterBackend = ({
  turn,
  gameId,
}: {
  turn?: string;
  gameId?: string;
}) => {
  const authToken = sessionStorage.getItem("EEAToken");
  const playerSaltQuery = useQuery(
    ["GMBackend", "PlayerSalt", turn, gameId],
    () =>
      getPlayerSalt({ turn: turn ?? "0", gameId: gameId ?? "0" }).then(
        (r) => r.data
      ),
    {
      ...queryCacheProps,
      enabled: !!turn && !!gameId && !!authToken,
    }
  );
  const gmAddressQuery = useQuery(
    ["GMBackend", "gmAddress"],
    () => getGameMasterAddress().then((r) => r.data),
    {
      ...queryCacheProps,
    }
  );

  const submitProposalMutation = useMutation(
    async ({
      signature,
      proposal,
    }: {
      signature: string;
      proposal: string;
    }) => {
      if (!gameId) throw new Error("No GameId");
      if (!turn) throw new Error("turn number");
      relayProposal({ turn, gameId })({ signature, proposal });
    }
  );
  return { playerSaltQuery, submitProposalMutation, gmAddressQuery };
};

export default useGameMasterBackend;
