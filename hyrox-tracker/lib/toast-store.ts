"use client";

import { create } from "zustand";

export type ToastTone = "error" | "success" | "info";

export type ToastItem = {
  id: string;
  tone: ToastTone;
  message: string;
};

type ToastState = {
  items: ToastItem[];
  push: (tone: ToastTone, message: string) => void;
  dismiss: (id: string) => void;
};

const AUTO_DISMISS_MS = 5200;

function nextId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useToastStore = create<ToastState>((set, get) => ({
  items: [],
  push: (tone, message) => {
    const id = nextId();
    set((s) => ({ items: [...s.items, { id, tone, message }] }));
    window.setTimeout(() => {
      get().dismiss(id);
    }, AUTO_DISMISS_MS);
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));

export const appToast = {
  error: (message: string) => useToastStore.getState().push("error", message),
  success: (message: string) => useToastStore.getState().push("success", message),
  info: (message: string) => useToastStore.getState().push("info", message),
};
