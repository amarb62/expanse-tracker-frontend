import { USE_MOCK_API, apiClient, setToken, clearToken, getToken } from "./client";
import { mockUser } from "./mock/data";
import type { AuthResponse, User } from "@/types";

const MOCK_TOKEN = "demo.jwt.token";

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
    const { data } = await apiClient.post<AuthResponse>("/auth/login", { email, password });
    setToken(data.token);
    return data;
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 400));
      const response: AuthResponse = { token: MOCK_TOKEN, user: { ...mockUser, name, email } };
      setToken(response.token);
      return response;
    }
    const { data } = await apiClient.post<AuthResponse>("/auth/register", {
      name,
      email,
      password,
    });
    setToken(data.token);
    return data;
  },

  async me(): Promise<User> {
    if (USE_MOCK_API) {
      if (!getToken()) throw new Error("Not authenticated");
      return mockUser;
    }
    const { data } = await apiClient.get<User>("/auth/me");
    return data;
  },

  logout(): void {
    clearToken();
  },
};
