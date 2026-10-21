import { useClerk, useUser } from "@clerk/expo";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { getAuthErrorMessage } from "@/lib/auth";

const SafeAreaView = styled(RNSafeAreaView);

export default function SettingsScreen() {
  const { user } = useUser();
  const clerk = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const emailAddress = user?.primaryEmailAddress?.emailAddress;
  const displayName =
    user?.fullName ??
    user?.username ??
    emailAddress?.split("@")[0] ??
    "Your account";

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setSignOutError(null);

    try {
      await clerk.signOut();
    } catch (error) {
      setIsSigningOut(false);
      setSignOutError(
        getAuthErrorMessage(error, "You couldn't be signed out. Please try again."),
      );
      return;
    }

    setIsSigningOut(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="flex-1">
        <Text className="mb-6 text-3xl font-sans-bold text-primary">Settings</Text>
        <View className="rounded-3xl border border-border bg-card p-5">
          <Text className="text-sm font-sans-semibold text-muted-foreground">
            ACCOUNT
          </Text>
          <Text className="mt-3 text-xl font-sans-bold text-primary">
            {displayName || "Your account"}
          </Text>
          {emailAddress ? (
            <Text className="mt-1 text-base font-sans-regular text-muted-foreground">
              {emailAddress}
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
            className="mt-6 items-center rounded-2xl bg-primary py-4"
            disabled={isSigningOut}
            onPress={() =>
              Alert.alert("Sign out?", "You'll need to sign in again to access your account.", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Sign out",
                  style: "destructive",
                  onPress: () => void handleSignOut(),
                },
              ])
            }
          >
            <Text className="font-sans-bold text-base text-white">
              {isSigningOut ? "Signing out…" : "Sign out"}
            </Text>
          </Pressable>
          {signOutError ? (
            <Text accessibilityRole="alert" className="mt-3 text-sm font-sans-medium text-destructive">
              {signOutError}
            </Text>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
