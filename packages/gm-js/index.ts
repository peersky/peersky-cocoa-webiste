import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
const API = process.env.GM_API ?? "http://localhost:8000";

const http = async (config: AxiosRequestConfig<any>, noAuth = false) => {
  const token = localStorage.getItem("EEAToken");
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
}): Promise<AxiosResponse<string, any>> => {
  // const _query = query.queryKey.length >= 1 ? query.queryKey[1] : undefined;
  return http({
    method: "GET",
    url: `${API}/player/salt/`,
    params: { gameId, turn },
  });
};
