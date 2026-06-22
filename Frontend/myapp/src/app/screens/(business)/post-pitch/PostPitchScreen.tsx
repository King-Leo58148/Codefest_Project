import { useState, useCallback, useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Megaphone,
  ArrowLeft,
  ArrowRight,
  Check,
  Save,
  Send,
  AlertCircle,
  ChevronDown,
  Sparkles,
  Building2,
  DollarSign,
  FileText,
  Image,
  TrendingUp,
} from "lucide-react-native";

// Import components
import FormInput from "@/components/forms/FormInput";
import FormSelect from "@/components/forms/FormSelect";
import SuccessModal from "@/components/modals/SuccessModal";
import VideoUploader from "./components/VideoUploader";
import EquityInput from "./components/EquityInput";
import { PITCH_CATEGORIES, PITCH_DURATIONS } from "./mockData";
import type { PostPitchForm, VideoData, EquityData } from "./types";
import { BUSINESS_COLORS } from "./utils";

const { width } = Dimensions.get("window");

// Initial form state
const INITIAL_FORM: PostPitchForm = {
  title: "",
  description: "",
  fundingGoal: "",
  category: "",
  duration: "",
  // Extended fields
  businessName: "",
  registrationNumber: "",
  location: "",
  yearsInOperation: "",
  employeeCount: "",
  annualRevenue: "",
  profitMargin: "",
  useOfFunds: "",
  returnType: "equity",
  returnRate: "",
  timeline: "",
  paymentSchedule: "monthly",
  videoUrl: "",
  images: [],
  documents: [],
};

// Step configuration
const STEPS = [
  { id: "basic", label: "Basic Info", icon: Megaphone },
  { id: "financial", label: "Financial", icon: DollarSign },
  { id: "business", label: "Business", icon: Building2 },
  { id: "media", label: "Media", icon: Image },
  { id: "terms", label: "Terms", icon: TrendingUp },
];

export default function PostPitchScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<PostPitchForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof PostPitchForm, string>>>(
    {}
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [equityData, setEquityData] = useState<EquityData>({
    equityOffered: 10,
    valuation: 250000,
  });

  // Update form field
  const updateField = useCallback(<K extends keyof PostPitchForm>(
    field: K,
    value: PostPitchForm[K]
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }, [errors]);

  // Validate current step
  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Partial<Record<keyof PostPitchForm, string>> = {};

    switch (step) {
      case 0: // Basic Info
        if (!form.title.trim()) {
          newErrors.title = "Pitch title is required";
        } else if (form.title.trim().length < 10) {
          newErrors.title = "Title must be at least 10 characters";
        }
        if (!form.category) {
          newErrors.category = "Select a category";
        }
        if (!form.location) {
          newErrors.location = "Select a location";
        }
        if (!form.description.trim()) {
          newErrors.description = "Description is required";
        } else if (form.description.trim().length < 50) {
          newErrors.description = "Description should be at least 50 characters";
        }
        break;

      case 1: // Financial
        if (!form.fundingGoal.trim()) {
          newErrors.fundingGoal = "Funding goal is required";
        } else if (Number.isNaN(Number(form.fundingGoal)) || Number(form.fundingGoal) <= 0) {
          newErrors.fundingGoal = "Enter a valid funding amount";
        }
        if (!form.duration) {
          newErrors.duration = "Select a campaign duration";
        }
        if (!form.useOfFunds.trim()) {
          newErrors.useOfFunds = "Please describe how you'll use the funds";
        }
        break;

      case 2: // Business
        if (!form.businessName.trim()) {
          newErrors.businessName = "Business name is required";
        }
        if (!form.registrationNumber.trim()) {
          newErrors.registrationNumber = "Registration number is required";
        }
        if (!form.yearsInOperation || Number(form.yearsInOperation) < 0) {
          newErrors.yearsInOperation = "Please enter valid years in operation";
        }
        break;

      case 3: // Media
        // Video is optional, but if provided it should be valid
        if (videoData?.error) {
          newErrors.videoUrl = "Video upload failed, please try again";
        }
        break;

      case 4: // Terms
        if (!form.returnType) {
          newErrors.returnType = "Select a return type";
        }
        if (!form.returnRate || Number(form.returnRate) <= 0) {
          newErrors.returnRate = "Enter a valid return rate";
        }
        if (!form.timeline || Number(form.timeline) <= 0) {
          newErrors.timeline = "Enter a valid timeline";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, videoData]);

  // Navigate to next step
  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
        // Scroll to top
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      } else {
        handleSubmit();
      }
    }
  }, [currentStep, validateStep]);

  // Navigate to previous step
  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [currentStep]);

  // Save draft
  const handleSaveDraft = useCallback(async () => {
    setIsSavingDraft(true);
    try {
      // Save draft logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Show success message or toast
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setIsSavingDraft(false);
    }
  }, [form, videoData, equityData]);

  // Submit pitch
  const handleSubmit = useCallback(async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      // Prepare form data
      const formData = {
        ...form,
        video: videoData,
        equity: equityData,
      };
      
      // Submit to API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowSuccess(true);
    } catch (error) {
      console.error("Error submitting pitch:", error);
      // Show error message
    } finally {
      setIsSubmitting(false);
    }
  }, [currentStep, form, videoData, equityData, validateStep]);

  // Handle success modal close
  const handleSuccessClose = useCallback(() => {
    setShowSuccess(false);
    setForm(INITIAL_FORM);
    setVideoData(null);
    setEquityData({ equityOffered: 10, valuation: 250000 });
    setCurrentStep(0);
    router.replace("/(business)/home");
  }, [router]);

  // Handle video upload
  const handleVideoUpload = useCallback(async (file: any) => {
    // Simulate upload to server
    await new Promise(resolve => setTimeout(resolve, 3000));
    return {
      url: "https://example.com/video.mp4",
      thumbnail: "https://example.com/thumbnail.jpg",
    };
  }, []);

  // Render step content
  const renderStepContent = useCallback(() => {
    switch (currentStep) {
      case 0:
        return renderBasicInfoStep();
      case 1:
        return renderFinancialStep();
      case 2:
        return renderBusinessStep();
      case 3:
        return renderMediaStep();
      case 4:
        return renderTermsStep();
      default:
        return null;
    }
  }, [currentStep, form, errors, videoData, equityData]);

  // Step 0: Basic Information
  const renderBasicInfoStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Megaphone size={20} color="#4F46E5" />
        </View>
        <Text style={styles.stepTitle}>Basic Information</Text>
        <Text style={styles.stepSubtitle}>
          Tell investors about your business and what you do
        </Text>
      </View>

      <View style={styles.formGroup}>
        <FormInput
          label="Pitch Title"
          placeholder="e.g., Green Valley Farms Expansion"
          value={form.title}
          onChangeText={(value) => updateField("title", value)}
          autoCapitalize="words"
          errorMessage={errors.title}
          labelStyle={styles.fieldLabel}
          required
        />
      </View>

      <View style={styles.formGroup}>
        <FormSelect
          label="Category"
          placeholder="Select a category"
          value={form.category}
          options={PITCH_CATEGORIES}
          onValueChange={(value) => updateField("category", String(value))}
          labelStyle={styles.fieldLabel}
        />
        {errors.category && (
          <Text style={styles.errorText}>{errors.category}</Text>
        )}
      </View>

      <View style={styles.formGroup}>
        <FormSelect
          label="Location"
          placeholder="Select your business location"
          value={form.location}
          options={[
            { label: "Greater Accra", value: "greater_accra" },
            { label: "Ashanti", value: "ashanti" },
            { label: "Western", value: "western" },
            { label: "Eastern", value: "eastern" },
            { label: "Central", value: "central" },
            { label: "Northern", value: "northern" },
          ]}
          onValueChange={(value) => updateField("location", String(value))}
          labelStyle={styles.fieldLabel}
        />
        {errors.location && (
          <Text style={styles.errorText}>{errors.location}</Text>
        )}
      </View>

      <View style={styles.formGroup}>
        <FormInput
          label="Description"
          placeholder="Describe your business, traction, and how you'll use the funds"
          value={form.description}
          onChangeText={(value) => updateField("description", value)}
          multiline
          numberOfLines={4}
          autoCapitalize="sentences"
          errorMessage={errors.description}
          inputStyle={styles.textArea}
          labelStyle={styles.fieldLabel}
          required
        />
        <Text style={styles.charCount}>
          {form.description.length}/500 characters
        </Text>
      </View>
    </View>
  );

  // Step 1: Financial Details
  const renderFinancialStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <DollarSign size={20} color="#4F46E5" />
        </View>
        <Text style={styles.stepTitle}>Financial Details</Text>
        <Text style={styles.stepSubtitle}>
          Provide accurate financial information to attract investors
        </Text>
      </View>

      <View style={styles.formGroup}>
        <FormInput
          label="Funding Goal"
          placeholder="e.g., 500000"
          value={form.fundingGoal}
          onChangeText={(value) => updateField("fundingGoal", value)}
          keyboardType="numeric"
          errorMessage={errors.fundingGoal}
          labelStyle={styles.fieldLabel}
          required
          leftIcon={<Text style={styles.currencyPrefix}>GHS</Text>}
        />
      </View>

      <View style={styles.formGroup}>
        <EquityInput
          value={equityData}
          onChange={setEquityData}
          minEquity={5}
          maxEquity={30}
          defaultEquity={10}
          minValuation={50000}
          currency="GHS"
          showInvestmentCalculation
          showValuationInfo
          showOwnershipPreview
        />
      </View>

      <View style={styles.formGroup}>
        <FormSelect
          label="Campaign Duration"
          placeholder="Select duration"
          value={form.duration}
          options={PITCH_DURATIONS}
          onValueChange={(value) => updateField("duration", String(value))}
          labelStyle={styles.fieldLabel}
        />
        {errors.duration && (
          <Text style={styles.errorText}>{errors.duration}</Text>
        )}
      </View>

      <View style={styles.formGroup}>
        <FormInput
          label="Use of Funds"
          placeholder="How will you use the investment?"
          value={form.useOfFunds}
          onChangeText={(value) => updateField("useOfFunds", value)}
          multiline
          numberOfLines={3}
          errorMessage={errors.useOfFunds}
          inputStyle={styles.textArea}
          labelStyle={styles.fieldLabel}
        />
      </View>
    </View>
  );

  // Step 2: Business Information
  const renderBusinessStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Building2 size={20} color="#4F46E5" />
        </View>
        <Text style={styles.stepTitle}>Business Information</Text>
        <Text style={styles.stepSubtitle}>
          Provide details about your business to build trust
        </Text>
      </View>

      <View style={styles.formGroup}>
        <FormInput
          label="Business Name"
          placeholder="Enter your registered business name"
          value={form.businessName}
          onChangeText={(value) => updateField("businessName", value)}
          errorMessage={errors.businessName}
          labelStyle={styles.fieldLabel}
          required
        />
      </View>

      <View style={styles.formGroup}>
        <FormInput
          label="Registration Number"
          placeholder="e.g., BN-2024-123456"
          value={form.registrationNumber}
          onChangeText={(value) => updateField("registrationNumber", value)}
          errorMessage={errors.registrationNumber}
          labelStyle={styles.fieldLabel}
          required
        />
      </View>

      <View style={styles.rowContainer}>
        <View style={[styles.rowItem, { marginRight: 8 }]}>
          <FormInput
            label="Years in Operation"
            placeholder="e.g., 5"
            value={form.yearsInOperation}
            onChangeText={(value) => updateField("yearsInOperation", value)}
            keyboardType="numeric"
            errorMessage={errors.yearsInOperation}
            labelStyle={styles.fieldLabel}
            required
          />
        </View>
        <View style={[styles.rowItem, { marginLeft: 8 }]}>
          <FormInput
            label="Employee Count"
            placeholder="e.g., 25"
            value={form.employeeCount}
            onChangeText={(value) => updateField("employeeCount", value)}
            keyboardType="numeric"
            labelStyle={styles.fieldLabel}
          />
        </View>
      </View>

      <View style={styles.rowContainer}>
        <View style={[styles.rowItem, { marginRight: 8 }]}>
          <FormInput
            label="Annual Revenue (GHS)"
            placeholder="e.g., 500000"
            value={form.annualRevenue}
            onChangeText={(value) => updateField("annualRevenue", value)}
            keyboardType="numeric"
            labelStyle={styles.fieldLabel}
          />
        </View>
        <View style={[styles.rowItem, { marginLeft: 8 }]}>
          <FormInput
            label="Profit Margin (%)"
            placeholder="e.g., 15"
            value={form.profitMargin}
            onChangeText={(value) => updateField("profitMargin", value)}
            keyboardType="numeric"
            labelStyle={styles.fieldLabel}
          />
        </View>
      </View>
    </View>
  );

  // Step 3: Media
  const renderMediaStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Image size={20} color="#4F46E5" />
        </View>
        <Text style={styles.stepTitle}>Media & Documents</Text>
        <Text style={styles.stepSubtitle}>
          Add a video and images to showcase your business
        </Text>
      </View>

      <View style={styles.formGroup}>
        <VideoUploader
          value={videoData}
          onChange={setVideoData}
          onUpload={handleVideoUpload}
          maxDuration={300}
          maxSize={100 * 1024 * 1024}
          label="Pitch Video"
          helperText="Upload a professional video pitch (Max 5 minutes, 100MB)"
          showPreview
          showProgress
          showControls
          allowThumbnailCapture
          allowTrim
        />
        {errors.videoUrl && (
          <Text style={styles.errorText}>{errors.videoUrl}</Text>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.fieldLabel}>Images</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.uploadButton}
          onPress={() => {
            // Open image picker
          }}
        >
          <Image size={24} color="#4F46E5" />
          <Text style={styles.uploadButtonText}>Upload Images</Text>
          <Text style={styles.uploadButtonSubtext}>
            Add up to 6 images of your business
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.fieldLabel}>Supporting Documents</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.uploadButton}
          onPress={() => {
            // Open document picker
          }}
        >
          <FileText size={24} color="#4F46E5" />
          <Text style={styles.uploadButtonText}>Upload Documents</Text>
          <Text style={styles.uploadButtonSubtext}>
            Business plan, financials, certificates (PDF)
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.helperCard}>
        <Sparkles size={20} color="#4F46E5" />
        <Text style={styles.helperCardText}>
          <Text style={styles.helperCardBold}>Tip:</Text> Quality media increases
          investor engagement by 40%. Add a professional video and clear documents.
        </Text>
      </View>
    </View>
  );

  // Step 4: Terms
  const renderTermsStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <TrendingUp size={20} color="#4F46E5" />
        </View>
        <Text style={styles.stepTitle}>Investment Terms</Text>
        <Text style={styles.stepSubtitle}>
          Define the terms of the investment
        </Text>
      </View>

      <View style={styles.formGroup}>
        <FormSelect
          label="Return Type"
          placeholder="Select return type"
          value={form.returnType}
          options={[
            { label: "Equity", value: "equity" },
            { label: "Revenue Share", value: "revenue_share" },
            { label: "Convertible Note", value: "convertible" },
            { label: "Hybrid", value: "hybrid" },
          ]}
          onValueChange={(value) => updateField("returnType", String(value))}
          labelStyle={styles.fieldLabel}
          required
        />
        {errors.returnType && (
          <Text style={styles.errorText}>{errors.returnType}</Text>
        )}
      </View>

      <View style={styles.rowContainer}>
        <View style={[styles.rowItem, { marginRight: 8 }]}>
          <FormInput
            label="Return Rate (%)"
            placeholder="e.g., 15"
            value={form.returnRate}
            onChangeText={(value) => updateField("returnRate", value)}
            keyboardType="numeric"
            errorMessage={errors.returnRate}
            labelStyle={styles.fieldLabel}
            required
          />
        </View>
        <View style={[styles.rowItem, { marginLeft: 8 }]}>
          <FormInput
            label="Timeline (months)"
            placeholder="e.g., 36"
            value={form.timeline}
            onChangeText={(value) => updateField("timeline", value)}
            keyboardType="numeric"
            errorMessage={errors.timeline}
            labelStyle={styles.fieldLabel}
            required
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <FormSelect
          label="Payment Schedule"
          placeholder="Select payment schedule"
          value={form.paymentSchedule}
          options={[
            { label: "Monthly", value: "monthly" },
            { label: "Quarterly", value: "quarterly" },
            { label: "Annually", value: "annually" },
            { label: "Milestone Based", value: "milestone" },
          ]}
          onValueChange={(value) => updateField("paymentSchedule", String(value))}
          labelStyle={styles.fieldLabel}
        />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Pitch Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Title</Text>
          <Text style={styles.summaryValue}>{form.title}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Category</Text>
          <Text style={styles.summaryValue}>
            {PITCH_CATEGORIES.find(c => c.value === form.category)?.label}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Funding Goal</Text>
          <Text style={styles.summaryValue}>GHS {form.fundingGoal || "0"}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Equity Offered</Text>
          <Text style={styles.summaryValue}>{equityData.equityOffered}%</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Valuation</Text>
          <Text style={styles.summaryValue}>GHS {equityData.valuation.toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );

  // Step indicator
  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {STEPS.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const Icon = step.icon;

        return (
          <View key={step.id} style={styles.stepIndicatorItem}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                if (validateStep(currentStep)) {
                  setCurrentStep(index);
                }
              }}
              style={[
                styles.stepIndicatorCircle,
                isActive && styles.stepIndicatorCircleActive,
                isCompleted && styles.stepIndicatorCircleCompleted,
              ]}
            >
              {isCompleted ? (
                <Check size={16} color="#FFFFFF" />
              ) : (
                <Icon size={16} color={isActive ? "#FFFFFF" : "#9CA3AF"} />
              )}
            </TouchableOpacity>
            <Text
              style={[
                styles.stepIndicatorLabel,
                isActive && styles.stepIndicatorLabelActive,
                isCompleted && styles.stepIndicatorLabelCompleted,
              ]}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        {/* Hero Header */}
        <LinearGradient
          colors={[BUSINESS_COLORS.primary, BUSINESS_COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={[styles.bubble, styles.bubbleLarge]} />
          <View style={[styles.bubble, styles.bubbleSmall]} />
          
          <View style={styles.heroHeader}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.heroTitle}>Post a Pitch</Text>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleSaveDraft}
              style={styles.draftButton}
              disabled={isSavingDraft}
            >
              {isSavingDraft ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Save size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.heroSubtitle}>
            {STEPS[currentStep].label} · Step {currentStep + 1} of {STEPS.length}
          </Text>
        </LinearGradient>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Scrollable Content */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {renderStepContent()}
          </ScrollView>

          {/* Navigation Buttons */}
          <View style={styles.footer}>
            <View style={styles.footerContent}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleBack}
                style={[
                  styles.footerButton,
                  styles.footerButtonSecondary,
                  currentStep === 0 && styles.footerButtonHidden,
                ]}
                disabled={currentStep === 0}
              >
                <Text style={styles.footerButtonSecondaryText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleNext}
                style={[
                  styles.footerButton,
                  styles.footerButtonPrimary,
                  isSubmitting && styles.footerButtonDisabled,
                ]}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.footerButtonPrimaryText}>
                      {currentStep === STEPS.length - 1 ? "Submit Pitch" : "Continue"}
                    </Text>
                    {currentStep !== STEPS.length - 1 ? (
                      <ArrowRight size={20} color="#FFFFFF" />
                    ) : (
                      <Send size={18} color="#FFFFFF" />
                    )}
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <SuccessModal
        isVisible={showSuccess}
        title="Pitch Published! 🎉"
        message={`"${form.title}" is now live. Investors can start placing bids on your pitch.`}
        buttonText="Go to Home"
        onClose={handleSuccessClose}
      />
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BUSINESS_COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  hero: {
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    minHeight: 120,
  },
  bubble: {
    position: "absolute",
    borderRadius: 999,
  },
  bubbleLarge: {
    width: 160,
    height: 160,
    right: -30,
    top: -40,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  bubbleSmall: {
    width: 96,
    height: 96,
    bottom: 12,
    left: -24,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 4,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  draftButton: {
    padding: 4,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  heroSubtitle: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 14,
    marginTop: 4,
    paddingLeft: 44,
  },
  formCard: {
    flex: 1,
    marginTop: -20,
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  stepIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  stepIndicatorItem: {
    alignItems: "center",
    gap: 4,
  },
  stepIndicatorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  stepIndicatorCircleActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  stepIndicatorCircleCompleted: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  stepIndicatorLabel: {
    fontSize: 9,
    color: "#9CA3AF",
    fontWeight: "500",
    textAlign: "center",
  },
  stepIndicatorLabelActive: {
    color: "#4F46E5",
    fontWeight: "700",
  },
  stepIndicatorLabelCompleted: {
    color: "#10B981",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  stepContainer: {
    paddingVertical: 12,
    gap: 12,
  },
  stepHeader: {
    gap: 4,
    marginBottom: 4,
  },
  stepIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  stepTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "700",
  },
  stepSubtitle: {
    color: "#6B7280",
    fontSize: 13,
  },
  formGroup: {
    gap: 4,
  },
  fieldLabel: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 2,
  },
  charCount: {
    color: "#9CA3AF",
    fontSize: 11,
    textAlign: "right",
    marginTop: 2,
  },
  rowContainer: {
    flexDirection: "row",
  },
  rowItem: {
    flex: 1,
  },
  currencyPrefix: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    borderStyle: "dashed",
    padding: 20,
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F9FAFB",
  },
  uploadButtonText: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "600",
  },
  uploadButtonSubtext: {
    color: "#6B7280",
    fontSize: 12,
  },
  helperCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    backgroundColor: "#EEF2FF",
    borderRadius: 10,
    alignItems: "flex-start",
  },
  helperCardText: {
    color: "#4F46E5",
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
  },
  helperCardBold: {
    fontWeight: "700",
  },
  summaryCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginTop: 4,
  },
  summaryTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  summaryLabel: {
    color: "#6B7280",
    fontSize: 13,
  },
  summaryValue: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "600",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  footerButtonSecondary: {
    backgroundColor: "#F3F4F6",
    flex: 1,
  },
  footerButtonSecondaryText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
  },
  footerButtonPrimary: {
    backgroundColor: "#4F46E5",
    flex: 1.5,
  },
  footerButtonPrimaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  footerButtonHidden: {
    opacity: 0,
    pointerEvents: "none",
  },
  footerButtonDisabled: {
    opacity: 0.6,
  },
});