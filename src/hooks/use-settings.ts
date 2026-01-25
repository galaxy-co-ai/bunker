"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Settings {
  theme?: string;
  default_model?: string;
  ollama_base_url?: string;
  anthropic_api_key?: string;
  openai_api_key?: string;
  context_include_docs?: string;
  context_include_sprint?: string;
  context_max_docs?: string;
}

export function useSettings() {
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery<Settings>({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetch("/api/settings");
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      return response.json();
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<Settings>) => {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error("Failed to update settings");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      // Also invalidate models since API key changes affect available models
      queryClient.invalidateQueries({ queryKey: ["models"] });
    },
  });

  return {
    settings: settings || {},
    isLoading,
    error,
    updateSettings,
  };
}

// Hook for a single setting
export function useSetting(key: keyof Settings) {
  const { settings, isLoading, updateSettings } = useSettings();

  const value = settings[key];

  const setValue = (newValue: string | null) => {
    updateSettings.mutate({ [key]: newValue });
  };

  return {
    value,
    isLoading,
    setValue,
    isUpdating: updateSettings.isPending,
  };
}
