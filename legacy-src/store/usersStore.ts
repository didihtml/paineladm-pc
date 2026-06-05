import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserFormData } from "@/types/user";

interface UsersStore {
  users: User[];
  addUser: (data: UserFormData) => void;
  updateUser: (id: string, data: UserFormData) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
  getUserByAccessCode: (codigoAcesso: string) => User | undefined;
}

export const useUsersStore = create<UsersStore>()(
  persist(
    (set, get) => ({
      users: [],

      addUser: (data) => {
        const user: User = {
          ...data,
          id: crypto.randomUUID(),
          criadoEm: new Date().toISOString(),
        };
        set((state) => ({ users: [...state.users, user] }));
      },

      updateUser: (id, data) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
        }));
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }));
      },

      getUserById: (id) => {
        return get().users.find((u) => u.id === id);
      },

      getUserByAccessCode: (codigoAcesso) => {
        return get().users.find((u) => u.codigoAcesso === codigoAcesso);
      },
    }),
    { name: "painel-puc-users" },
  ),
);
