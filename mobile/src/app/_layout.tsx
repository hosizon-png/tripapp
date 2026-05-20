import "../global.css";

import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useAuthStore } from "@/stores/authStore";
import { setOnUnauthorized } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { Colors } from "@/lib/constants";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: 1,
    },
  },
});

const asyncPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "QUERY_CACHE",
});

const NavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background,
  },
};

const NavDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.background,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { setUser, logout } = useAuthStore();

  // Inject luxury fonts for web
  useEffect(() => {
    if (typeof document !== "undefined" && !document.getElementById("luxury-fonts")) {
      const link = document.createElement("link");
      link.id = "luxury-fonts";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => logout());

    async function checkAuth() {
      const token = await getAccessToken();
      if (!token) {
        useAuthStore.getState().setLoading(false);
        return;
      }
      try {
        // TODO: call /api/auth/me to validate and get user
        useAuthStore.getState().setLoading(false);
      } catch {
        useAuthStore.getState().setLoading(false);
      }
    }
    checkAuth();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: asyncPersister }}
      >
        <ThemeProvider
          value={colorScheme === "dark" ? NavDarkTheme : NavTheme}
        >
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="post/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/login" options={{ presentation: "modal", headerShown: false }} />
            <Stack.Screen name="(auth)/register" options={{ presentation: "modal", headerShown: false }} />
            <Stack.Screen
              name="trips/new"
              options={{ presentation: "modal", headerShown: true, title: "新建行程" }}
            />
            <Stack.Screen
              name="subscription/index"
              options={{ presentation: "modal", headerShown: true, title: "订阅管理" }}
            />
          </Stack>
        </ThemeProvider>
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}
