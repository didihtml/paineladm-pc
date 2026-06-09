import { create } from "zustand";
import type { User, UserFormData } from "@/types/user";
import { apiFetch } from "@/utils/api";

interface UsersStore {
  users: User[];
  isLoading: boolean;
  hasLoaded: boolean;
  fetchUsers: () => Promise<void>;
  addUser: (data: UserFormData) => Promise<boolean>;
  updateUser: (id: string, data: UserFormData) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  getUserById: (id: string) => User | undefined;
  fetchUserByAccessCode: (codigoAcesso: string) => Promise<User | undefined>;
}

async function parseJson<T>(response: Response) {
  return (await response.json()) as T;
}

export const useUsersStore = create<UsersStore>((set, get) => ({
  users: [],
  isLoading: false,
  hasLoaded: false,

  fetchUsers: async () => {
    set({ isLoading: true });

    try {
      const response = await apiFetch("/api/legacy/cards");
      if (!response.ok) {
        throw new Error("Não foi possível carregar as carteirinhas.");
      }

      const users = await parseJson<User[]>(response);
      set({ users, isLoading: false, hasLoaded: true });
    } catch {
      set({ users: [], isLoading: false, hasLoaded: true });
    }
  },

  addUser: async (data) => {
    const response = await apiFetch("/api/legacy/cards", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return false;
    }

    const result = await parseJson<{ user: User }>(response);
    set((state) => ({ users: [result.user, ...state.users] }));
    return true;
  },

  updateUser: async (id, data) => {
    const response = await apiFetch(`/api/legacy/cards/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return false;
    }

    const result = await parseJson<{ user: User }>(response);
    set((state) => ({
      users: state.users.map((user) => (user.id === id ? result.user : user)),
    }));
    return true;
  },

  deleteUser: async (id) => {
    const response = await apiFetch(`/api/legacy/cards/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return false;
    }

    set((state) => ({ users: state.users.filter((user) => user.id !== id) }));
    return true;
  },

  getUserById: (id) => get().users.find((user) => user.id === id),

  fetchUserByAccessCode: async (codigoAcesso) => {
    const response = await apiFetch(
      `/api/legacy/cards/access/${encodeURIComponent(codigoAcesso)}`,
    );

    if (!response.ok) {
      return undefined;
    }

    const result = await parseJson<{ user: User }>(response);
    return result.user;
  },
}));
