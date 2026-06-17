// src/app/screens/auth/ChooseRoleScreen.tsx
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { 
  ArrowLeft, 
  Building2, 
  TrendingUp, 
  Users, 
  Shield,
  Check,
  Briefcase,
  Sparkles,
  Target,
  Clock
} from "lucide-react-native";

interface RoleOption {
  id: 'investor' | 'business';
  title: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  description: string;
  features: string[];
  gradientColors: readonly [string, string];
}

const ROLES: RoleOption[] = [
  {
    id: 'investor',
    title: 'Investor',
    icon: TrendingUp,
    description: 'Discover and invest in promising businesses',
    gradientColors: ['#4F46E5', '#7C3AED'] as const,
    features: [
      'Access vetted opportunities',
      'Diversify your portfolio',
      'Track investments',
      'Earn competitive returns'
    ]
  },
  {
    id: 'business',
    title: 'Business Owner',
    icon: Building2,
    description: 'Get funding to grow your business',
    gradientColors: ['#10B981', '#059669'] as const,
    features: [
      'Connect with investors',
      'Quick funding process',
      'Business mentorship',
      'Network opportunities'
    ]
  }
];

export default function ChooseRoleScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'investor' | 'business' | null>(null);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/");
  };

  const handleContinue = () => {
    if (selectedRole) {
      router.push({
        pathname: "/register",
        params: { role: selectedRole }
      });
    }
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
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.screen}>
            {/* Hero Section */}
            <LinearGradient
              colors={['#4A6CF7', '#1A2A6C']}
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

            {/* Card Section */}
            <View style={styles.card}>
              <Text style={styles.title}>Choose Your Role</Text>
              <Text style={styles.subtitle}>
                Select how you want to use the platform
              </Text>

              {/* Role Cards */}
              <View style={styles.rolesContainer}>
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  
                  return (
                    <TouchableOpacity
                      key={role.id}
                      activeOpacity={0.85}
                      onPress={() => setSelectedRole(role.id)}
                      style={[
                        styles.roleCard,
                        isSelected && styles.roleCardSelected
                      ]}
                    >
                      {isSelected && (
                        <LinearGradient
                          colors={role.gradientColors}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.roleGradient}
                        />
                      )}
                      
                      <View style={styles.roleContent}>
                        <View style={styles.roleHeader}>
                          <View style={[
                            styles.iconContainer,
                            isSelected && styles.iconContainerSelected
                          ]}>
                            <Icon 
                              size={28} 
                              color={isSelected ? '#FFFFFF' : '#4F46E5'} 
                              strokeWidth={2}
                            />
                          </View>
                          
                          <View style={styles.roleTitleContainer}>
                            <Text style={[
                              styles.roleTitle,
                              isSelected && styles.roleTitleSelected
                            ]}>
                              {role.title}
                            </Text>
                            <Text style={[
                              styles.roleDescription,
                              isSelected && styles.roleDescriptionSelected
                            ]}>
                              {role.description}
                            </Text>
                          </View>
                          
                          {isSelected && (
                            <View style={styles.checkmarkContainer}>
                              <Check color="#FFFFFF" size={14} strokeWidth={3} />
                            </View>
                          )}
                        </View>

                        <View style={styles.featuresContainer}>
                          {role.features.map((feature, index) => (
                            <View key={index} style={styles.featureItem}>
                              <Shield 
                                size={14} 
                                color={isSelected ? '#FFFFFF' : '#10B981'} 
                                strokeWidth={2.5}
                              />
                              <Text style={[
                                styles.featureText,
                                isSelected && styles.featureTextSelected
                              ]}>
                                {feature}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionContainer}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleContinue}
                  disabled={!selectedRole}
                  style={[
                    styles.continueButton,
                    !selectedRole && styles.continueButtonDisabled
                  ]}
                >
                  <LinearGradient
                    colors={selectedRole === 'investor' 
                      ? ['#4F46E5', '#7C3AED'] 
                      : ['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.continueGradient}
                  >
                    <Text style={styles.continueText}>Continue</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.signInPrompt}>
                  Already have an account?{' '}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
    backgroundColor: '#FFFFFF',
  },
  hero: {
    height: 200,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
  },
  bubbleLarge: {
    width: 168,
    height: 168,
    right: -26,
    top: -34,
    backgroundColor: 'rgba(100, 140, 255, 0.32)',
  },
  bubbleSmall: {
    width: 112,
    height: 112,
    bottom: 30,
    left: -20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 5,
    minHeight: 40,
    paddingRight: 12,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    flex: 1,
    marginTop: -36,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: 28,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    color: '#1E1B4B',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  rolesContainer: {
    gap: 16,
  },
  roleCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    position: 'relative',
    minHeight: 140,
  },
  roleCardSelected: {
    borderColor: 'transparent',
  },
  roleGradient: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  opacity: 1,
},
  roleContent: {
    padding: 16,
    position: 'relative',
    zIndex: 1,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  roleTitleContainer: {
    flex: 1,
    gap: 2,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  roleTitleSelected: {
    color: '#FFFFFF',
  },
  roleDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  roleDescriptionSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  checkmarkContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  featuresContainer: {
    marginTop: 12,
    gap: 6,
    paddingLeft: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: '#4B5563',
  },
  featureTextSelected: {
    color: 'rgba(255,255,255,0.9)',
  },
  actionContainer: {
    marginTop: 24,
    paddingTop: 8,
  },
  continueButton: {
    borderRadius: 13,
    overflow: 'hidden',
    minHeight: 52,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 24,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  signInPrompt: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 20,
    textAlign: 'center',
  },
  signInLink: {
    color: '#4F46E5',
    fontWeight: '700',
  },
});