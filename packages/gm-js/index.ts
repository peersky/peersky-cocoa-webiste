import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
const API = process.env.GM_API_SERVER ?? "http://localhost:8000";

const http = async (config: AxiosRequestConfig<any>, noAuth = false) => {
  const token = sessionStorage.getItem("EEAToken");
  const authorization =
    token && !noAuth ? { Authorization: `EEA ${token}` } : {};
  const defaultHeaders = config.headers ?? {};
  const options = {
    ...config,
    headers: {
      ...defaultHeaders,
      ...authorization,
    },
  };

  return axios(options);
};

export const getPlayerSalt = async ({
  turn,
  gameId,
}: {
  turn: string;
  gameId: string;
}): Promise<AxiosResponse<string>> => {
  return http({
    method: "GET",
    url: `${API}/player/salt/`,
    params: { gameId, turn },
  });
};

export const getGameMasterAddress = async () => {
  return http({
    method: "GET",
    url: `${API}/gm/address/`,
  });
};

export const relayProposal =
  ({ turn, gameId }: { turn: string; gameId: string }) =>
  async ({ proposal, signature }: { proposal: string; signature: string }) => {
    return http({
      method: "POST",
      url: `${API}/player/proposal/${gameId}/${turn}`,
      data: { proposal, signature },
    });
  };
