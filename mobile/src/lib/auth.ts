import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const ACCESS_KEY = "auth_access_token";
const REFRESH_KEY = "auth_refresh_token";

let SecureStore: any = null;
try { SecureStore = require("expo-secure-store"); } catch {}

const isWeb = Platform.OS === "web";

async function getItem(key: string): Promise<string | null> {
  if (isWeb || !SecureStore) return AsyncStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}
async function setItem(key: string, value: string): Promise<void> {
  if (isWeb || !SecureStore) await AsyncStorage.setItem(key, value);
  else await SecureStore.setItemAsync(key, value);
}
async function deleteItem(key: string): Promise<void> {
  if (isWeb || !SecureStore) await AsyncStorage.removeItem(key);
  else await SecureStore.deleteItemAsync(key);
}

export async function getAccessToken(): Promise<string | null> { return getItem(ACCESS_KEY); }
export async function setAccessToken(token: string): Promise<void> { await setItem(ACCESS_KEY, token); }
export async function getRefreshToken(): Promise<string | null> { return getItem(REFRESH_KEY); }
export async function setRefreshToken(token: string): Promise<void> { await setItem(REFRESH_KEY, token); }
export async function clearTokens(): Promise<void> {
  await deleteItem(ACCESS_KEY);
  await deleteItem(REFRESH_KEY);
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem("onboarding_complete", "true");
}
export async function isOnboardingComplete(): Promise<boolean> {
  const val = await AsyncStorage.getItem("onboarding_complete");
  return val === "true";
}
