import { useState, type PropsWithChildren, type Ref } from "react";
import clsx from "clsx";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AuthShellProps = PropsWithChildren<{
  title: string;
}>;

export function AuthShell({ title, children }: AuthShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "flex-start",
          paddingHorizontal: 24,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 20,
        }}
      >
        <View className="auth-flow-content" style={{ gap: 12 }}>
          <View className="auth-flow-brand-row">
            <View className="auth-flow-brand-mark">
              <Text className="auth-flow-brand-symbol">$</Text>
            </View>
            <Text className="auth-flow-brand-label">SUBSCRIPTION TRACKER</Text>
          </View>

          <View className="auth-flow-heading-group" style={{ gap: 4 }}>
            <Text className="auth-flow-heading">{title}</Text>
          </View>

          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type AuthFieldProps = Omit<
  TextInputProps,
  "className" | "secureTextEntry" | "accessibilityLabel"
> & {
  label: string;
  error?: string | null;
  secureTextEntry?: boolean;
  inputRef?: Ref<TextInput>;
};

export function AuthField({
  label,
  error,
  secureTextEntry = false,
  inputRef,
  ...inputProps
}: AuthFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View className="auth-flow-field" style={{ gap: 4 }}>
      <Text className="auth-flow-label">{label}</Text>
      <View>
        <TextInput
          ref={inputRef}
          {...inputProps}
          accessibilityLabel={label}
          accessibilityHint={error ?? undefined}
          className={clsx(
            "auth-flow-input",
            error && "auth-flow-input-invalid",
            secureTextEntry && "pr-20",
          )}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          placeholderTextColor="#737373"
        />
        {secureTextEntry && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
            className="auth-flow-password-toggle"
            onPress={() => setIsPasswordVisible((visible) => !visible)}
            hitSlop={8}
          >
            <Text className="auth-flow-password-toggle-label">
              {isPasswordVisible ? "Hide" : "Show"}
            </Text>
          </Pressable>
        )}
      </View>
      {error ? <Text className="auth-flow-field-error">{error}</Text> : null}
    </View>
  );
}

type AuthButtonProps = {
  label: string;
  loading?: boolean;
  onPress: () => void;
};

export function AuthButton({
  label,
  loading = false,
  onPress,
}: AuthButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: loading, busy: loading }}
      className={clsx(
        "auth-flow-button",
        loading && "auth-flow-button-disabled",
      )}
      disabled={loading}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text className="auth-flow-button-label">{label}</Text>
      )}
    </Pressable>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <Text accessibilityRole="alert" className="auth-flow-form-error">
      {message}
    </Text>
  );
}
