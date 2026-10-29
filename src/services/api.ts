import axios, { AxiosResponse } from 'axios';
import Constants from 'expo-constants';

// json-server runs on the same computer as the Expo dev server, so its IP address
// is taken from the dev server's host URI (e.g. "192.168.1.20:8081").
// Start json-server with:
// `npx json-server --watch db.json --port 3333 --host 0.0.0.0 -m ./node_modules/json-server-auth`
//
// To access your server online without running json-server locally,
// you can set your baseURL to:
// `https://my-json-server.typicode.com/<your-github-username>/<your-github-repo>`
//
// To use `my-json-server`, make sure your `db.json` is located at the repo root.
const devServerIp = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';

const api = axios.create({
    baseURL: `http://${devServerIp}:3333`,
});

export const authenticateUser = (email: string, password: string): Promise<AxiosResponse> => {
    return api.post(`/login`, { email, password });
};
