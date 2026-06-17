import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Apple, ArrowLeft, Check } from "lucide-react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/");
  };

  const handleSignIn = () => {
    router.push("/login");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.screen}>
            <LinearGradient
              colors={["#4A6CF7", "#1A2A6C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}
            >
              <View style={[styles.bubble, styles.bubbleLarge]} />
              <View style={[styles.bubble, styles.bubbleSmall]} />

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handleBack}
                style={styles.backButton}
              >
                <ArrowLeft color="#FFFFFF" size={21} strokeWidth={2.3} />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.card}>
              <Text style={styles.title}>Get Started</Text>

              <View style={styles.form}>
                <FormField
                  autoCapitalize="words"
                  label="Full Name"
                  placeholder="Enter Full Name"
                  textContentType="name"
                />
                <FormField
                  autoCapitalize="none"
                  keyboardType="email-address"
                  label="Email"
                  placeholder="Enter Email"
                  textContentType="emailAddress"
                />
                <FormField
                  label="Password"
                  placeholder="Enter Password"
                  secureTextEntry
                  textContentType="newPassword"
                />

                <Pressable
                  onPress={() => setAgreed((value) => !value)}
                  style={styles.agreementRow}
                >
                  <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
                    {agreed ? <Check color="#FFFFFF" size={13} strokeWidth={3} /> : null}
                  </View>
                  <Text style={styles.agreementText}>
                    I agree to the processing of{" "}
                    <Text style={styles.personalDataText}>Personal data</Text>
                  </Text>
                </Pressable>

                <TouchableOpacity activeOpacity={0.88} style={styles.signUpButton}>
                  <Text style={styles.signUpText}>Sign up</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.socialSection}>
                <View style={styles.dividerRow}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>Sign up with</Text>
                  <View style={styles.divider} />
                </View>

                <View style={styles.socialRow}>
                  <SocialButton color="#2563EB">
                    <Text style={[styles.socialLetter, { color: "#2563EB" }]}>f</Text>
                  </SocialButton>
                  <SocialButton color="#38A7F2">
                    <Text style={[styles.socialLetter, { color: "#38A7F2" }]}>t</Text>
                  </SocialButton>
                  <SocialButton color="#EF4444">
                    <Text style={[styles.socialLetter, { color: "#EF4444" }]}>G</Text>
                  </SocialButton>
                  <SocialButton color="#111827">
                    <Apple color="#111827" fill="#111827" size={25} strokeWidth={0} />
                  </SocialButton>
                </View>

                <Text style={styles.signInPrompt}>
                  Already have an account?{" "}
                  <Text onPress={handleSignIn} style={styles.signInLink}>
                    Sign in
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FormFieldProps = React.ComponentProps<typeof TextInput> & {
  label: string;
};

function FormField({ label, placeholder, ...inputProps }: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#C7CBD4"
        selectionColor="#4F46E5"
        style={styles.input}
        {...inputProps}
      />
    </View>
  );
}

function SocialButton({
  children,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <TouchableOpacity activeOpacity={0.75} style={styles.socialButton}>
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  screen: {
    flex: 1,
    minHeight: 760,
    backgroundColor: "#FFFFFF",
  },
  hero: {
    height: 275,
    overflow: "hidden",
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  bubble: {
    position: "absolute",
    borderRadius: 999,
  },
  bubbleLarge: {
    width: 168,
    height: 168,
    right: -26,
    top: -34,
    backgroundColor: "rgba(100, 140, 255, 0.32)",
  },
  bubbleSmall: {
    width: 112,
    height: 112,
    bottom: 30,
    left: -20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  backButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 5,
    minHeight: 40,
    paddingRight: 12,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    flex: 1,
    marginTop: -48,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 32,
    paddingBottom: 30,
    paddingTop: 36,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    color: "#1E1B4B",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 31,
    textAlign: "center",
  },
  form: {
    gap: 21,
  },
  field: {
    gap: 4,
  },
  label: {
    color: "#A3A8B3",
    fontSize: 20,
    fontWeight: "700",
  },
  input: {
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: StyleSheet.hairlineWidth,
    color: "#111827",
    fontSize: 14,
    minHeight: 38,
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  agreementRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    paddingTop: 4,
  },
  checkbox: {
    alignItems: "center",
    borderColor: "#D1D5DB",
    borderRadius: 4,
    borderWidth: 1,
    height: 17,
    justifyContent: "center",
    marginTop: 1,
    width: 17,
  },
  checkboxActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  agreementText: {
    color: "#6B7280",
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  personalDataText: {
    color: "#4F46E5",
    fontWeight: "700",
  },
  signUpButton: {
    alignItems: "center",
    backgroundColor: "#4F46E5",
    borderRadius: 13,
    justifyContent: "center",
    minHeight: 52,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 8,
  },
  signUpText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  socialSection: {
    marginTop: "auto",
    paddingTop: 35,
  },
  dividerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
  },
  divider: {
    backgroundColor: "#F1F2F5",
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  socialRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 24,
    justifyContent: "center",
  },
  socialButton: {
    alignItems: "center",
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  socialLetter: {
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 28,
  },
  signInPrompt: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 29,
    textAlign: "center",
  },
  signInLink: {
    color: "#4F46E5",
    fontWeight: "800",
  },
});
