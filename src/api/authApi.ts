import {
  USE_MOCK_API,
  apiClient,
  setToken,
  clearToken,
  getToken,
  getRefreshToken,
  setRefreshToken,
  clearRefreshToken,
} from "./client";
import { mockUser } from "./mock/data";
import type { AuthResponse, User } from "@/types";

const MOCK_TOKEN = "demo.jwt.token";
const DEFAULT_CURRENCY = "INR";

interface BackendUser {
  id: string;
  name: string;
  email: string;
}

interface BackendAuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
}

function toUser(backendUser: BackendUser): User {
  return { ...backendUser, currency: DEFAULT_CURRENCY };
}

async function loginReal(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<BackendAuthResponse>("/auth/login", { email, password });
  setToken(data.accessToken);
  setRefreshToken(data.refreshToken);
  const { data: me } = await apiClient.get<BackendUser>("/auth/me");
  return { token: data.accessToken, user: toUser(me) };
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 400));
      if (password.length < 6) {
        throw new Error("Invalid email or password.");
      }
      const response: AuthResponse = { token: MOCK_TOKEN, user: { ...mockUser, email } };
      setToken(response.token);
      return response;
    }
    return loginReal(email, password);
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 400));
      const response: AuthResponse = { token: MOCK_TOKEN, user: { ...mockUser, name, email } };
      setToken(response.token);
      return response;
    }
    // Registration only creates the account; it doesn't issue tokens, so log in right after.
    await apiClient.post<BackendUser>("/auth/register", { name, email, password });
    return loginReal(email, password);
  },

  async me(): Promise<User> {
    if (USE_MOCK_API) {
      if (!getToken()) throw new Error("Not authenticated");
      return mockUser;
    }
    const { data } = await apiClient.get<BackendUser>("/auth/me");
    return toUser(data);
  },

  logout(): void {
    if (!USE_MOCK_API) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        void apiClient.post("/auth/logout", { refreshToken }).catch(() => undefined);
      }
    }
    clearToken();
    clearRefreshToken();
  },
};
