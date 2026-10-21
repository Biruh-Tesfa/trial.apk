import { useSignUp } from "@clerk/expo";
import { Link } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import {
  AuthButton,
  AuthError,
  AuthField,
  AuthShell,
} from "@/components/auth/AuthUI";
import { getAuthErrorMessage } from "@/lib/auth";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const isLoading = fetchStatus === "fetching";

  const handleSignUp = async () => {
    const normalizedEmail = emailAddress.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
      setFormError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setFormError("Choose a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("The passwords don't match.");
      return;
    }

    setFormError(null);
    try {
      const { error } = await signUp.password({
        emailAddress: normalizedEmail,
        password,
      });
      if (error) {
        setFormError(error.message);
        return;
      }

      const { error: sendError } =
        await signUp.verifications.sendEmailCode();
      if (sendError) {
        setFormError(sendError.message);
        return;
      }

      setIsVerifying(true);
    } catch (error) {
      setFormError(
        getAuthErrorMessage(error, "We couldn't create your account. Please try again."),
      );
    }
  };

  const handleVerify = async () => {
    if (code.trim().length !== 6) {
      setFormError("Enter the 6-digit code we sent to your email.");
      return;
    }

    setFormError(null);
    try {
      const { error } = await signUp.verifications.verifyEmailCode({
        code: code.trim(),
      });
      if (error) {
        setFormError(error.message);
        return;
      }

      if (signUp.status !== "complete") {
        setFormError("Your email is verified, but account setup needs another step.");
        return;
      }

      const { error: finalizeError } = await signUp.finalize();
      if (finalizeError) {
        setFormError(finalizeError.message);
      }
    } catch (error) {
      setFormError(
        getAuthErrorMessage(error, "That code couldn't be verified. Please try again."),
      );
    }
  };

  const handleResendCode = async () => {
    setFormError(null);
    try {
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) {
        setFormError(error.message);
      }
    } catch (error) {
      setFormError(
        getAuthErrorMessage(error, "We couldn't send another code. Please try again."),
      );
    }
  };

  return (
    <AuthShell title={isVerifying ? "Check your inbox" : "Create your account"}>
      <View className="auth-flow-form" style={{ gap: 10 }}>
        {isVerifying ? (
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
              onSubmitEditing={handleVerify}
              returnKeyType="go"
              textContentType="oneTimeCode"
              value={code}
            />
            <AuthError message={formError} />
            <AuthButton
              label="Verify email"
              loading={isLoading}
              onPress={() => void handleVerify()}
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
                setIsVerifying(false);
              }}
            >
              <Text className="auth-flow-footer-copy">Back to account details</Text>
            </Pressable>
          </>
        ) : (
          <>
            <AuthField
              autoCapitalize="none"
              autoComplete="email"
              error={errors.fields.emailAddress?.message}
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
              autoComplete="new-password"
              error={errors.fields.password?.message}
              inputRef={confirmPasswordRef}
              label="Password"
              onChangeText={(value) => {
                setPassword(value);
                setFormError(null);
              }}
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              returnKeyType="next"
              secureTextEntry
              textContentType="newPassword"
              value={password}
            />
            <AuthField
              autoComplete="new-password"
              label="Confirm password"
              onChangeText={(value) => {
                setConfirmPassword(value);
                setFormError(null);
              }}
              onSubmitEditing={handleSignUp}
              returnKeyType="go"
              secureTextEntry
              textContentType="newPassword"
              value={confirmPassword}
            />
            <AuthError message={formError} />
            <AuthButton
              label="Create account"
              loading={isLoading}
              onPress={() => void handleSignUp()}
            />
            <View className="auth-flow-footer">
              <Text className="auth-flow-footer-copy">Already have an account?</Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable accessibilityRole="link">
                  <Text className="auth-flow-link">Sign in</Text>
                </Pressable>
              </Link>
            </View>
          </>
        )}
      </View>
    </AuthShell>
  );
}
