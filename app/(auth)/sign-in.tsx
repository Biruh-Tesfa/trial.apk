import {
  AuthButton,
  AuthError,
  AuthField,
  AuthShell,
} from "@/components/auth/AuthUI";
import { getAuthErrorMessage } from "@/lib/auth";
import { posthogLogs } from "@/lib/posthog-logs";
import { useSignIn } from "@clerk/expo";
import { Link } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type SignInScreen =
  | "credentials"
  | "verification"
  | "reset-email"
  | "reset-code"
  | "new-password";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const posthog = usePostHog();
  const [screen, setScreen] = useState<SignInScreen>("credentials");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);
  const isLoading = fetchStatus === "fetching";

  const completeSignIn = async () => {
    if (signIn.status !== "complete") {
      setFormError("Your sign-in needs another step. Please try again.");
      return;
    }

    const { error } = await signIn.finalize();
    if (error) {
      setFormError(error.message);
      return;
    }

    posthog?.capture("user_signed_in", {
      authentication_method:
        screen === "verification"
          ? "email_mfa"
          : screen === "new-password"
            ? "password_reset"
            : "password",
    });
    posthogLogs.info("sign_in_completed", { flow: "authentication" });
  };

  const startEmailVerification = async () => {
    const emailCodeFactor = signIn.supportedSecondFactors.find(
      (factor) => factor.strategy === "email_code",
    );

    if (!emailCodeFactor) {
      setFormError(
        "This account requires a verification method that is not available here. Contact support to continue.",
      );
      return;
    }

    const { error } = await signIn.mfa.sendEmailCode();
    if (error) {
      setFormError(error.message);
      return;
    }

    setCode("");
    setFormError(null);
    setScreen("verification");
  };

  const handleSignIn = async () => {
    const normalizedEmail = emailAddress.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
      setFormError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setFormError("Enter your password to continue.");
      return;
    }

    setFormError(null);
    try {
      const { error } = await signIn.password({
        emailAddress: normalizedEmail,
        password,
      });
      if (error) {
        setFormError(error.message);
        return;
      }

      if (signIn.status === "complete") {
        await completeSignIn();
      } else if (
        signIn.status === "needs_second_factor" ||
        signIn.status === "needs_client_trust"
      ) {
        await startEmailVerification();
      } else {
        setFormError("We couldn't complete sign-in. Check your details and try again.");
      }
    } catch (error) {
      setFormError(
        getAuthErrorMessage(error, "Sign-in couldn't be completed. Please try again."),
      );
    }
  };

  const handleVerifyCode = async () => {
    if (code.trim().length !== 6) {
      setFormError("Enter the 6-digit code we sent to your email.");
      return;
    }

    setFormError(null);
    try {
      const { error } = await signIn.mfa.verifyEmailCode({ code: code.trim() });
      if (error) {
        setFormError(error.message);
        return;
      }

      await completeSignIn();
    } catch (error) {
      setFormError(
        getAuthErrorMessage(error, "That code couldn't be verified. Please try again."),
      );
    }
  };

  const handleSendResetCode = async () => {
    const normalizedEmail = emailAddress.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
      setFormError("Enter a valid email address so we can find your account.");
      return;
    }

    setFormError(null);
    try {
      const { error: createError } = await signIn.create({
        identifier: normalizedEmail,
      });
      if (createError) {
        setFormError(createError.message);
        return;
      }

      const { error: sendError } =
        await signIn.resetPasswordEmailCode.sendCode();
      if (sendError) {
        setFormError(sendError.message);
        return;
      }

      posthog?.capture("password_reset_requested");
      setCode("");
      setScreen("reset-code");
    } catch (error) {
      setFormError(
        getAuthErrorMessage(error, "We couldn't send a reset code. Please try again."),
      );
    }
  };

  const handleVerifyResetCode = async () => {
    if (code.trim().length !== 6) {
      setFormError("Enter the 6-digit code we sent to your email.");
      return;
    }

    setFormError(null);
    try {
      const { error } = await signIn.resetPasswordEmailCode.verifyCode({
        code: code.trim(),
      });
      if (error) {
        setFormError(error.message);
        return;
      }

      if (signIn.status === "needs_new_password") {
        setScreen("new-password");
      } else {
        setFormError("The code was accepted, but the reset flow is not ready yet.");
      }
    } catch (error) {
      setFormError(
        getAuthErrorMessage(error, "That code couldn't be verified. Please try again."),
      );
    }
  };

  const handleSetNewPassword = async () => {
    if (newPassword.length < 8) {
      setFormError("Choose a password with at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError("The passwords don't match.");
      return;
    }

    setFormError(null);
    try {
      const { error } = await signIn.resetPasswordEmailCode.submitPassword({
        password: newPassword,
        signOutOfOtherSessions: true,
      });
      if (error) {
        setFormError(error.message);
        return;
      }

      if (signIn.status === "complete") {
        await completeSignIn();
      } else if (
        signIn.status === "needs_second_factor" ||
        signIn.status === "needs_client_trust"
      ) {
        await startEmailVerification();
      } else {
        setFormError("We couldn't finish resetting your password. Please try again.");
      }
    } catch (error) {
      setFormError(
        getAuthErrorMessage(error, "Your password couldn't be updated. Please try again."),
      );
    }
  };

  const handleResendCode = async () => {
    setFormError(null);
    try {
      const { error } =
        screen === "verification"
          ? await signIn.mfa.sendEmailCode()
          : await signIn.resetPasswordEmailCode.sendCode();
      if (error) {
        setFormError(error.message);
      }
    } catch (error) {
      setFormError(
        getAuthErrorMessage(error, "We couldn't send another code. Please try again."),
      );
    }
  };

  const isCodeScreen = screen === "verification" || screen === "reset-code";
  const screenCopy: Record<SignInScreen, { title: string }> = {
    credentials: {
      title: "Welcome back",
    },
    verification: {
      title: "Check your inbox",
    },
    "reset-email": {
      title: "Reset your password",
    },
    "reset-code": {
      title: "Reset your password",
    },
    "new-password": {
      title: "Choose a new password",
    },
  };
  const { title } = screenCopy[screen];

  return (
    <AuthShell title={title}>
      <View className="auth-flow-form" style={{ gap: 10 }}>
        {screen === "credentials" && (
          <>
            <AuthField
              autoCapitalize="none"
              autoComplete="email"
              error={errors.fields.identifier?.message}
              inputRef={passwordRef}
              keyboardType="email-address"
              label="Email address"
              onChangeText={(value) => {
                setEmailAddress(value);
                setFormError(null);
              }}
              onSubmitEditing={() => passwordRef.current?.focus()}
              returnKeyType="next"
              textContentType="emailAddress"
              value={emailAddress}
            />
            <AuthField
              autoComplete="current-password"
              error={errors.fields.password?.message}
              label="Password"
              onChangeText={(value) => {
                setPassword(value);
                setFormError(null);
              }}
              onSubmitEditing={handleSignIn}
              returnKeyType="go"
              secureTextEntry
              textContentType="password"
              value={password}
            />
            <Pressable
              accessibilityRole="button"
              className="auth-flow-secondary-link"
              onPress={() => {
                setFormError(null);
                setScreen("reset-email");
              }}
            >
              <Text className="auth-flow-link">Forgot password?</Text>
            </Pressable>
            <AuthError message={formError} />
            <AuthButton
              label="Sign in"
              loading={isLoading}
              onPress={() => void handleSignIn()}
            />
            <View className="auth-flow-footer">
              <Text className="auth-flow-footer-copy">New here?</Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable accessibilityRole="link">
                  <Text className="auth-flow-link">Create an account</Text>
                </Pressable>
              </Link>
            </View>
          </>
        )}

        {isCodeScreen && (
          <>
            <AuthField
              autoComplete="one-time-code"
              error={errors.fields.code?.message}
              keyboardType="number-pad"
              label="6-digit code"
              maxLength={6}
              onChangeText={(value) => {
                setCode(value.replace(/\D/g, ""));
                setFormError(null);
              }}
              onSubmitEditing={
                screen === "verification" ? handleVerifyCode : handleVerifyResetCode
              }
              returnKeyType="go"
              textContentType="oneTimeCode"
              value={code}
            />
            <AuthError message={formError} />
            <AuthButton
              label={screen === "verification" ? "Verify and sign in" : "Verify code"}
              loading={isLoading}
              onPress={() =>
                void (screen === "verification"
                  ? handleVerifyCode()
                  : handleVerifyResetCode())
              }
            />
            <Pressable
              accessibilityRole="button"
              className="auth-flow-secondary-link"
              disabled={isLoading}
              onPress={() => void handleResendCode()}
            >
              <Text className="auth-flow-link">Send a new code</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="auth-flow-secondary-link"
              disabled={isLoading}
              onPress={() => {
                setFormError(null);
                setScreen("credentials");
              }}
            >
              <Text className="auth-flow-footer-copy">Back to sign in</Text>
            </Pressable>
          </>
        )}

        {screen === "reset-email" && (
          <View className="auth-flow-form">
            <AuthField
              autoCapitalize="none"
              autoComplete="email"
              error={errors.fields.identifier?.message}
              keyboardType="email-address"
              label="Email address"
              onChangeText={(value) => {
                setEmailAddress(value);
                setFormError(null);
              }}
              textContentType="emailAddress"
              value={emailAddress}
            />
            <AuthError message={formError} />
            <AuthButton
              label="Send reset code"
              loading={isLoading}
              onPress={() => void handleSendResetCode()}
            />
            <Pressable
              accessibilityRole="button"
              className="auth-flow-secondary-link"
              disabled={isLoading}
              onPress={() => {
                setFormError(null);
                setScreen("credentials");
              }}
            >
              <Text className="auth-flow-footer-copy">Back to sign in</Text>
            </Pressable>
          </View>
        )}

        {screen === "new-password" && (
          <>
            <AuthField
              autoComplete="new-password"
              error={errors.fields.password?.message}
              label="New password"
              onChangeText={(value) => {
                setNewPassword(value);
                setFormError(null);
              }}
              returnKeyType="next"
              secureTextEntry
              textContentType="newPassword"
              value={newPassword}
            />
            <AuthField
              autoComplete="new-password"
              label="Confirm new password"
              onChangeText={(value) => {
                setConfirmPassword(value);
                setFormError(null);
              }}
              onSubmitEditing={handleSetNewPassword}
              returnKeyType="go"
              secureTextEntry
              textContentType="newPassword"
              value={confirmPassword}
            />
            <AuthError message={formError} />
            <AuthButton
              label="Save new password"
              loading={isLoading}
              onPress={() => void handleSetNewPassword()}
            />
          </>
        )}
      </View>
    </AuthShell>
  );
}
