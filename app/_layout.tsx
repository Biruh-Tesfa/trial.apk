import "../global.css";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View, useColorScheme } from "react-native";
import { PostHogProvider } from "posthog-react-native";
import { posthog } from "@/lib/posthog";
SplashScreen.preventAutoHideAsync();

function getPublishableKey(): string {
  const key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      "Errorrr",
    );
  }
  return key;
}

const publishableKey = getPublishableKey();

function PostHogIdentity() {
  const { isLoaded, user } = useUser();
  const identifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !posthog) {
      return;
    }

    if (!user) {
      identifiedUserId.current = null;
      return;
    }

    if (identifiedUserId.current === user.id) {
      return;
    }

    const email = user.primaryEmailAddress?.emailAddress;
    const name = user.fullName;
    const username = user.username;

    posthog.identify(user.id, {
      $set: {
        ...(email ? { email } : {}),
        ...(name ? { name } : {}),
        ...(username ? { username } : {}),
      },
    });
    identifiedUserId.current = user.id;
  }, [isLoaded, user]);

  return null;
}

function AppNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  const isAuthenticated = isSignedIn === true;

  if (!isLoaded) {
    return (
      <View
        className="flex-1 items-center justify-center bg-background"
        style={{ backgroundColor: "#fff9e3" }}
      >
        <ActivityIndicator size="large" color="#081126" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="subscriptions/[id]" />
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'sans-regular': require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    'sans-bold': require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    'sans-medium': require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    'sans-semibold': require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    'sans-extrabold': require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    'sans-light': require("../assets/fonts/PlusJakartaSans-Light.ttf"),
  })
  useEffect(()=>{
    if(fontsLoaded){
      SplashScreen.hideAsync() 
    }
  },[fontsLoaded])

  const colorScheme = useColorScheme();  
  if(!fontsLoaded) return null 
  
  const app = (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ThemeProvider
        value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      >
        <PostHogIdentity />
        <AppNavigator />
        <AnimatedSplashOverlay />
      </ThemeProvider>
    </ClerkProvider>
  );

  return posthog ? <PostHogProvider client={posthog}>{app}</PostHogProvider> : app;
}