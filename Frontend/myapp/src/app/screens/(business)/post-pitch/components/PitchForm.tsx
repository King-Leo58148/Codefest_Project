import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Modal,
  FlatList,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  DollarSign,
  FileText,
  Image,
  Info,
  MapPin,
  Percent,
  Phone,
  Save,
  Send,
  Shield,
  Star,
  Tag,
  TrendingUp,
  Users,
  X,
  Youtube,
  Globe,
  Mail,
  Briefcase,
  Target,
  Award,
  Sparkles,
} from "lucide-react-native";

// Types
export interface PitchFormData {
  // Step 1: Basic Information
  title: string;
  category: string;
  subcategory?: string;
  location: string;
  shortDescription: string;
  fullDescription?: string;
  website?: string;
  email?: string;
  phone?: string;

  // Step 2: Financial Details
  fundingAmount: number;
  minimumInvestment: number;
  valuation: number;
  equityOffered: number;
  useOfFunds: string;
  previousFunding?: number;

  // Step 3: Business Information
  businessName: string;
  registrationNumber: string;
  yearsInOperation: number;
  employeeCount: number;
  annualRevenue: number;
  profitMargin: number;
  businessStage: 'idea' | 'startup' | 'growing' | 'established' | 'scale';

  // Step 4: Investment Terms
  returnType: 'equity' | 'revenue_share' | 'convertible' | 'hybrid';
  returnRate: number;
  timeline: number; // months
  paymentSchedule: 'monthly' | 'quarterly' | 'annually' | 'milestone';
  investorPerks: string[];
  exitTimeline: number; // years

  // Step 5: Media & Documents
  videoUrl: string;
  thumbnailUrl: string;
  images: string[];
  documents: { name: string; url: string; type: string }[];
}

interface PitchFormProps {
  initialData?: Partial<PitchFormData>;
  onSubmit: (data: PitchFormData) => Promise<void>;
  onSaveDraft: (data: Partial<PitchFormData>) => Promise<void>;
  loading?: boolean;
  error?: string;
  mode?: 'create' | 'edit';
}

// Constants
const CATEGORIES = [
  { id: 'agriculture', label: 'Agriculture', icon: '🌾' },
  { id: 'technology', label: 'Technology', icon: '💻' },
  { id: 'retail', label: 'Retail', icon: '🛍️' },
  { id: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { id: 'services', label: 'Services', icon: '📊' },
  { id: 'real_estate', label: 'Real Estate', icon: '🏗️' },
  { id: 'transportation', label: 'Transportation', icon: '🚚' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'energy', label: 'Energy', icon: '⚡' },
  { id: 'fintech', label: 'Fintech', icon: '💰' },
  { id: 'other', label: 'Other', icon: '📌' },
];

const BUSINESS_STAGES = [
  { id: 'idea', label: 'Idea', description: 'Concept stage, no revenue yet' },
  { id: 'startup', label: 'Startup', description: 'Early stage, developing product' },
  { id: 'growing', label: 'Growing', description: 'Revenue generating, scaling' },
  { id: 'established', label: 'Established', description: 'Stable, profitable business' },
  { id: 'scale', label: 'Scale', description: 'Rapid growth, market expansion' },
];

const RETURN_TYPES = [
  { id: 'equity', label: 'Equity', description: 'Give ownership stake' },
  { id: 'revenue_share', label: 'Revenue Share', description: 'Share of future revenue' },
  { id: 'convertible', label: 'Convertible Note', description: 'Convert to equity later' },
  { id: 'hybrid', label: 'Hybrid', description: 'Combination of equity and revenue' },
];

const PAYMENT_SCHEDULES = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: 'Quarterly' },
  { id: 'annually', label: 'Annually' },
  { id: 'milestone', label: 'Milestone Based' },
];

const INVESTOR_PERKS = [
  { id: 'early_access', label: 'Early Access to Products' },
  { id: 'equity', label: 'Equity Ownership' },
  { id: 'revenue_share', label: 'Revenue Share' },
  { id: 'board_seat', label: 'Board Seat' },
  { id: 'mentorship', label: 'Mentorship Opportunity' },
  { id: 'discounts', label: 'Product Discounts' },
  { id: 'updates', label: 'Regular Business Updates' },
  { id: 'referral', label: 'Referral Bonuses' },
];

const LOCATIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Eastern',
  'Central',
  'Northern',
  'Upper East',
  'Upper West',
  'Volta',
  'Bono',
  'Ahafo',
  'Savannah',
  'North East',
  'Oti',
  'Western North',
];

// Step configurations
const STEPS = [
  { id: 'basic', label: 'Basic Info', icon: FileText },
  { id: 'financial', label: 'Financial', icon: DollarSign },
  { id: 'business', label: 'Business', icon: Building2 },
  { id: 'terms', label: 'Investment Terms', icon: TrendingUp },
  { id: 'media', label: 'Media & Docs', icon: Image },
];

export default function PitchForm({
  initialData,
  onSubmit,
  onSaveDraft,
  loading = false,
  error,
  mode = 'create',
}: PitchFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PitchFormData>({
    title: '',
    category: '',
    subcategory: '',
    location: '',
    shortDescription: '',
    fullDescription: '',
    website: '',
    email: '',
    phone: '',
    fundingAmount: 0,
    minimumInvestment: 0,
    valuation: 0,
    equityOffered: 10,
    useOfFunds: '',
    previousFunding: 0,
    businessName: '',
    registrationNumber: '',
    yearsInOperation: 0,
    employeeCount: 0,
    annualRevenue: 0,
    profitMargin: 0,
    businessStage: 'startup',
    returnType: 'equity',
    returnRate: 0,
    timeline: 36,
    paymentSchedule: 'monthly',
    investorPerks: [],
    exitTimeline: 5,
    videoUrl: '',
    thumbnailUrl: '',
    images: [],
    documents: [],
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showReturnTypeModal, setShowReturnTypeModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPerksModal, setShowPerksModal] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);

  // Validation
  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Basic Info
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (formData.title.length < 10) newErrors.title = 'Title must be at least 10 characters';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.location) newErrors.location = 'Location is required';
        if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Description is required';
        if (formData.shortDescription.length < 50) newErrors.shortDescription = 'Description must be at least 50 characters';
        break;
      case 1: // Financial
        if (!formData.fundingAmount || formData.fundingAmount < 1000) newErrors.fundingAmount = 'Funding amount must be at least GHS 1,000';
        if (!formData.minimumInvestment || formData.minimumInvestment < 500) newErrors.minimumInvestment = 'Minimum investment must be at least GHS 500';
        if (formData.minimumInvestment > formData.fundingAmount) newErrors.minimumInvestment = 'Minimum investment cannot exceed funding amount';
        if (!formData.valuation || formData.valuation < 10000) newErrors.valuation = 'Valuation must be at least GHS 10,000';
        if (!formData.equityOffered || formData.equityOffered < 1) newErrors.equityOffered = 'Equity offered must be at least 1%';
        if (formData.equityOffered > 49) newErrors.equityOffered = 'Equity offered cannot exceed 49%';
        break;
      case 2: // Business
        if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
        if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'Registration number is required';
        if (!formData.yearsInOperation) newErrors.yearsInOperation = 'Years in operation is required';
        if (!formData.employeeCount) newErrors.employeeCount = 'Employee count is required';
        if (!formData.annualRevenue) newErrors.annualRevenue = 'Annual revenue is required';
        if (!formData.businessStage) newErrors.businessStage = 'Business stage is required';
        break;
      case 3: // Investment Terms
        if (!formData.returnType) newErrors.returnType = 'Return type is required';
        if (!formData.returnRate) newErrors.returnRate = 'Return rate is required';
        if (!formData.timeline) newErrors.timeline = 'Timeline is required';
        if (!formData.paymentSchedule) newErrors.paymentSchedule = 'Payment schedule is required';
        break;
      case 4: // Media & Docs
        // Video is optional
        // At least one image or document
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
        // Auto-save draft on step change
        handleSaveDraft();
      } else {
        handleSubmit();
      }
    }
  }, [currentStep, validateStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleSaveDraft = useCallback(async () => {
    if (isDraftSaving) return;
    setIsDraftSaving(true);
    try {
      await onSaveDraft(formData);
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsDraftSaving(false);
    }
  }, [formData, isDraftSaving, onSaveDraft]);

  const handleSubmit = useCallback(async () => {
    if (validateStep(currentStep)) {
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Error submitting pitch:', error);
      }
    }
  }, [currentStep, formData, onSubmit, validateStep]);

  const updateField = useCallback((field: keyof PitchFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleFieldBlur = useCallback((field: keyof PitchFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  // Render step content
  const renderStepContent = useCallback(() => {
    switch (currentStep) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderFinancialInfo();
      case 2:
        return renderBusinessInfo();
      case 3:
        return renderInvestmentTerms();
      case 4:
        return renderMediaDocuments();
      default:
        return null;
    }
  }, [currentStep, formData]);

  // Step 1: Basic Information
  const renderBasicInfo = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Tell us about your business</Text>
      <Text style={styles.stepSubtitle}>
        Help investors understand what your business does and why it's a great opportunity.
      </Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          Pitch Title <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.title && styles.inputError]}
          value={formData.title}
          onChangeText={(text) => updateField('title', text)}
          onBlur={() => handleFieldBlur('title')}
          placeholder="e.g., Green Valley Farms Expansion"
          placeholderTextColor="#9CA3AF"
          maxLength={60}
        />
        {touched.title && errors.title && (
          <Text style={styles.errorText}>{errors.title}</Text>
        )}
        <Text style={styles.charCount}>{formData.title.length}/60</Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          Category <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowCategoryModal(true)}
          style={[styles.selectInput, errors.category && styles.inputError]}
        >
          <View style={styles.selectContent}>
            {formData.category ? (
              <>
                <Text style={styles.categoryIcon}>
                  {CATEGORIES.find(c => c.id === formData.category)?.icon}
                </Text>
                <Text style={styles.selectText}>
                  {CATEGORIES.find(c => c.id === formData.category)?.label}
                </Text>
              </>
            ) : (
              <Text style={styles.selectPlaceholder}>Select a category</Text>
            )}
          </View>
          <ChevronDown size={20} color="#6B7280" />
        </TouchableOpacity>
        {touched.category && errors.category && (
          <Text style={styles.errorText}>{errors.category}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          Location <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowLocationModal(true)}
          style={[styles.selectInput, errors.location && styles.inputError]}
        >
          <View style={styles.selectContent}>
            <MapPin size={16} color="#6B7280" />
            <Text style={formData.location ? styles.selectText : styles.selectPlaceholder}>
              {formData.location || 'Select location'}
            </Text>
          </View>
          <ChevronDown size={20} color="#6B7280" />
        </TouchableOpacity>
        {touched.location && errors.location && (
          <Text style={styles.errorText}>{errors.location}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          Short Description <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.textArea, errors.shortDescription && styles.inputError]}
          value={formData.shortDescription}
          onChangeText={(text) => updateField('shortDescription', text)}
          onBlur={() => handleFieldBlur('shortDescription')}
          placeholder="Briefly describe your business and what you do (150-200 characters)"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={3}
          maxLength={200}
        />
        {touched.shortDescription && errors.shortDescription && (
          <Text style={styles.errorText}>{errors.shortDescription}</Text>
        )}
        <Text style={styles.charCount}>{formData.shortDescription.length}/200</Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Full Description</Text>
        <TextInput
          style={[styles.textArea, styles.fullDescriptionArea]}
          value={formData.fullDescription}
          onChangeText={(text) => updateField('fullDescription', text)}
          placeholder="Detailed description of your business, market opportunity, and growth plans..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={6}
          maxLength={2000}
        />
        <Text style={styles.charCount}>{formData.fullDescription?.length || 0}/2000</Text>
      </View>

      <View style={styles.fieldRow}>
        <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.fieldLabel}>Website</Text>
          <View style={styles.inputWithIcon}>
            <Globe size={16} color="#9CA3AF" />
            <TextInput
              style={styles.inputWithIconField}
              value={formData.website}
              onChangeText={(text) => updateField('website', text)}
              placeholder="https://example.com"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
            />
          </View>
        </View>
        <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.fieldLabel}>Email</Text>
          <View style={styles.inputWithIcon}>
            <Mail size={16} color="#9CA3AF" />
            <TextInput
              style={styles.inputWithIconField}
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              placeholder="contact@example.com"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Phone Number</Text>
        <View style={styles.inputWithIcon}>
          <Phone size={16} color="#9CA3AF" />
          <TextInput
            style={styles.inputWithIconField}
            value={formData.phone}
            onChangeText={(text) => updateField('phone', text)}
            placeholder="+233 XX XXX XXXX"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
          />
        </View>
      </View>
    </View>
  );

  // Step 2: Financial Information
  const renderFinancialInfo = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Financial Details</Text>
      <Text style={styles.stepSubtitle}>
        Provide accurate financial information to help investors evaluate your opportunity.
      </Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          Funding Amount Needed <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWithIcon}>
          <DollarSign size={16} color="#9CA3AF" />
          <TextInput
            style={styles.inputWithIconField}
            value={formData.fundingAmount ? formData.fundingAmount.toString() : ''}
            onChangeText={(text) => updateField('fundingAmount', parseInt(text) || 0)}
            onBlur={() => handleFieldBlur('fundingAmount')}
            placeholder="e.g., 500000"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>
        {touched.fundingAmount && errors.fundingAmount && (
          <Text style={styles.errorText}>{errors.fundingAmount}</Text>
        )}
        <Text style={styles.helperText}>
          Minimum: GHS 1,000 · Suggested range: GHS 10,000 - GHS 10,000,000
        </Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          Minimum Investment <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWithIcon}>
          <DollarSign size={16} color="#9CA3AF" />
          <TextInput
            style={styles.inputWithIconField}
            value={formData.minimumInvestment ? formData.minimumInvestment.toString() : ''}
            onChangeText={(text) => updateField('minimumInvestment', parseInt(text) || 0)}
            onBlur={() => handleFieldBlur('minimumInvestment')}
            placeholder="e.g., 10000"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>
        {touched.minimumInvestment && errors.minimumInvestment && (
          <Text style={styles.errorText}>{errors.minimumInvestment}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          Pre-Money Valuation <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWithIcon}>
          <DollarSign size={16} color="#9CA3AF" />
          <TextInput
            style={styles.inputWithIconField}
            value={formData.valuation ? formData.valuation.toString() : ''}
            onChangeText={(text) => updateField('valuation', parseInt(text) || 0)}
            onBlur={() => handleFieldBlur('valuation')}
            placeholder="e.g., 250000"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>
        {touched.valuation && errors.valuation && (
          <Text style={styles.errorText}>{errors.valuation}</Text>
        )}
        <Text style={styles.helperText}>
          Valuation determines how much equity investors get for their investment.
        </Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          Equity Offered <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWithIcon}>
          <Percent size={16} color="#9CA3AF" />
          <TextInput
            style={styles.inputWithIconField}
            value={formData.equityOffered ? formData.equityOffered.toString() : ''}
            onChangeText={(text) => updateField('equityOffered', parseFloat(text) || 0)}
            onBlur={() => handleFieldBlur('equityOffered')}
            placeholder="e.g., 15"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>
        {touched.equityOffered && errors.equityOffered && (
          <Text style={styles.errorText}>{errors.equityOffered}</Text>
        )}
        <Text style={styles.helperText}>
          Typical range: 5-30% · Suggested: 10-20%
        </Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Use of Funds</Text>
        <TextInput
          style={[styles.textArea, styles.fullDescriptionArea]}
          value={formData.useOfFunds}
          onChangeText={(text) => updateField('useOfFunds', text)}
          placeholder="How will you use the investment funds? (e.g., Equipment, Marketing, Hiring, etc.)"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          maxLength={500}
        />
        <Text style={styles.charCount}>{formData.useOfFunds?.length || 0}/500</Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Previous Funding Received</Text>
        <View style={styles.inputWithIcon}>
          <DollarSign size={16} color="#9CA3AF" />
          <TextInput
            style={styles.inputWithIconField}
            value={formData.previousFunding ? formData.previousFunding.toString() : ''}
            onChangeText={(text) => updateField('previousFunding', parseInt(text) || 0)}
            placeholder="e.g., 100000"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>
        <Text style={styles.helperText}>
          Include any previous investments or funding rounds.
        </Text>
      </View>
    </View>
  );

  // Step 3: Business Information
  const renderBusinessInfo = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Business Information</Text>
      <Text style={styles.stepSubtitle}>
        Provide details about your business to build investor confidence.
      </Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          Business Name <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.businessName && styles.inputError]}
          value={formData.businessName}
          onChangeText={(text) => updateField('businessName', text)}
          onBlur={() => handleFieldBlur('businessName')}
          placeholder="Enter your registered business name"
          placeholderTextColor="#9CA3AF"
        />
        {touched.businessName && errors.businessName && (
          <Text style={styles.errorText}>{errors.businessName}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          Registration Number <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.registrationNumber && styles.inputError]}
          value={formData.registrationNumber}
          onChangeText={(text) => updateField('registrationNumber', text)}
          onBlur={() => handleFieldBlur('registrationNumber')}
          placeholder="e.g., BN-2024-123456"
          placeholderTextColor="#9CA3AF"
        />
        {touched.registrationNumber && errors.registrationNumber && (
          <Text style={styles.errorText}>{errors.registrationNumber}</Text>
        )}
      </View>

      <View style={styles.fieldRow}>
        <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.fieldLabel}>
            Years in Operation <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.yearsInOperation && styles.inputError]}
            value={formData.yearsInOperation ? formData.yearsInOperation.toString() : ''}
            onChangeText={(text) => updateField('yearsInOperation', parseInt(text) || 0)}
            onBlur={() => handleFieldBlur('yearsInOperation')}
            placeholder="e.g., 5"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
          {touched.yearsInOperation && errors.yearsInOperation && (
            <Text style={styles.errorText}>{errors.yearsInOperation}</Text>
          )}
        </View>
        <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.fieldLabel}>
            Employee Count <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.employeeCount && styles.inputError]}
            value={formData.employeeCount ? formData.employeeCount.toString() : ''}
            onChangeText={(text) => updateField('employeeCount', parseInt(text) || 0)}
            onBlur={() => handleFieldBlur('employeeCount')}
            placeholder="e.g., 25"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
          {touched.employeeCount && errors.employeeCount && (
            <Text style={styles.errorText}>{errors.employeeCount}</Text>
          )}
        </View>
      </View>

      <View style={styles.fieldRow}>
        <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.fieldLabel}>
            Annual Revenue <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWithIcon}>
            <DollarSign size={16} color="#9CA3AF" />
            <TextInput
              style={styles.inputWithIconField}
              value={formData.annualRevenue ? formData.annualRevenue.toString() : ''}
              onChangeText={(text) => updateField('annualRevenue', parseInt(text) || 0)}
              onBlur={() => handleFieldBlur('annualRevenue')}
              placeholder="e.g., 500000"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>
          {touched.annualRevenue && errors.annualRevenue && (
            <Text style={styles.errorText}>{errors.annualRevenue}</Text>
          )}
        </View>
        <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.fieldLabel}>
            Profit Margin <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWithIcon}>
            <Percent size={16} color="#9CA3AF" />
            <TextInput
              style={styles.inputWithIconField}
              value={formData.profitMargin ? formData.profitMargin.toString() : ''}
              onChangeText={(text) => updateField('profitMargin', parseFloat(text) || 0)}
              onBlur={() => handleFieldBlur('profitMargin')}
              placeholder="e.g., 15"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>
          {touched.profitMargin && errors.profitMargin && (
            <Text style={styles.errorText}>{errors.profitMargin}</Text>
          )}
        </View>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          Business Stage <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowStageModal(true)}
          style={[styles.selectInput, errors.businessStage && styles.inputError]}
        >
          <View style={styles.selectContent}>
            {formData.businessStage ? (
              <>
                <Text style={styles.selectText}>
                  {BUSINESS_STAGES.find(s => s.id === formData.businessStage)?.label}
                </Text>
                <Text style={styles.selectSubtext}>
                  {BUSINESS_STAGES.find(s => s.id === formData.businessStage)?.description}
                </Text>
              </>
            ) : (
              <Text style={styles.selectPlaceholder}>Select business stage</Text>
            )}
          </View>
          <ChevronDown size={20} color="#6B7280" />
        </TouchableOpacity>
        {touched.businessStage && errors.businessStage && (
          <Text style={styles.errorText}>{errors.businessStage}</Text>
        )}
      </View>
    </View>
  );

  // Step 4: Investment Terms
  const renderInvestmentTerms = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Investment Terms</Text>
      <Text style={styles.stepSubtitle}>
        Define the terms of the investment to attract the right investors.
      </Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          Return Type <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowReturnTypeModal(true)}
          style={[styles.selectInput, errors.returnType && styles.inputError]}
        >
          <View style={styles.selectContent}>
            {formData.returnType ? (
              <>
                <Text style={styles.selectText}>
                  {RETURN_TYPES.find(r => r.id === formData.returnType)?.label}
                </Text>
                <Text style={styles.selectSubtext}>
                  {RETURN_TYPES.find(r => r.id === formData.returnType)?.description}
                </Text>
              </>
            ) : (
              <Text style={styles.selectPlaceholder}>Select return type</Text>
            )}
          </View>
          <ChevronDown size={20} color="#6B7280" />
        </TouchableOpacity>
        {touched.returnType && errors.returnType && (
          <Text style={styles.errorText}>{errors.returnType}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          Return Rate <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWithIcon}>
          <Percent size={16} color="#9CA3AF" />
          <TextInput
            style={styles.inputWithIconField}
            value={formData.returnRate ? formData.returnRate.toString() : ''}
            onChangeText={(text) => updateField('returnRate', parseFloat(text) || 0)}
            onBlur={() => handleFieldBlur('returnRate')}
            placeholder="e.g., 15"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>
        {touched.returnRate && errors.returnRate && (
          <Text style={styles.errorText}>{errors.returnRate}</Text>
        )}
        <Text style={styles.helperText}>
          Typical range: 10-30% annual return
        </Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          Investment Timeline <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWithIcon}>
          <Clock size={16} color="#9CA3AF" />
          <TextInput
            style={styles.inputWithIconField}
            value={formData.timeline ? formData.timeline.toString() : ''}
            onChangeText={(text) => updateField('timeline', parseInt(text) || 0)}
            onBlur={() => handleFieldBlur('timeline')}
            placeholder="e.g., 36"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
          <Text style={styles.inputSuffix}>months</Text>
        </View>
        {touched.timeline && errors.timeline && (
          <Text style={styles.errorText}>{errors.timeline}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          Payment Schedule <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowScheduleModal(true)}
          style={[styles.selectInput, errors.paymentSchedule && styles.inputError]}
        >
          <View style={styles.selectContent}>
            <Text style={formData.paymentSchedule ? styles.selectText : styles.selectPlaceholder}>
              {formData.paymentSchedule
                ? PAYMENT_SCHEDULES.find(s => s.id === formData.paymentSchedule)?.label
                : 'Select payment schedule'}
            </Text>
          </View>
          <ChevronDown size={20} color="#6B7280" />
        </TouchableOpacity>
        {touched.paymentSchedule && errors.paymentSchedule && (
          <Text style={styles.errorText}>{errors.paymentSchedule}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Investor Perks</Text>
        <Text style={styles.helperText}>Select the perks investors will receive</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowPerksModal(true)}
          style={styles.perksSelector}
        >
          {formData.investorPerks.length > 0 ? (
            <View style={styles.perksList}>
              {formData.investorPerks.map((perkId) => {
                const perk = INVESTOR_PERKS.find(p => p.id === perkId);
                return perk ? (
                  <View key={perkId} style={styles.perkChip}>
                    <Text style={styles.perkChipText}>{perk.label}</Text>
                  </View>
                ) : null;
              })}
            </View>
          ) : (
            <Text style={styles.perksPlaceholder}>
              Tap to select investor perks
            </Text>
          )}
          <ChevronDown size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Expected Exit Timeline</Text>
        <View style={styles.inputWithIcon}>
          <Calendar size={16} color="#9CA3AF" />
          <TextInput
            style={styles.inputWithIconField}
            value={formData.exitTimeline ? formData.exitTimeline.toString() : ''}
            onChangeText={(text) => updateField('exitTimeline', parseInt(text) || 0)}
            placeholder="e.g., 5"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
          <Text style={styles.inputSuffix}>years</Text>
        </View>
        <Text style={styles.helperText}>
          When do you expect investors to exit (get their returns)?
        </Text>
      </View>
    </View>
  );

  // Step 5: Media & Documents
  const renderMediaDocuments = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Media & Documents</Text>
      <Text style={styles.stepSubtitle}>
        Add media and documents to showcase your business to investors.
      </Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Pitch Video URL</Text>
        <View style={styles.inputWithIcon}>
          <Youtube size={16} color="#9CA3AF" />
          <TextInput
            style={styles.inputWithIconField}
            value={formData.videoUrl}
            onChangeText={(text) => updateField('videoUrl', text)}
            placeholder="https://www.youtube.com/watch?v=..."
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
          />
        </View>
        <Text style={styles.helperText}>
          Upload a video pitch to YouTube and paste the link here.
        </Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Thumbnail Image URL</Text>
        <View style={styles.inputWithIcon}>
          <Image size={16} color="#9CA3AF" />
          <TextInput
            style={styles.inputWithIconField}
            value={formData.thumbnailUrl}
            onChangeText={(text) => updateField('thumbnailUrl', text)}
            placeholder="https://example.com/thumbnail.jpg"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
          />
        </View>
        <Text style={styles.helperText}>
          Add a thumbnail image for your pitch (recommended: 1280x720).
        </Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Business Images</Text>
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
        {formData.images.length > 0 && (
          <View style={styles.uploadedItems}>
            {formData.images.map((image, index) => (
              <View key={index} style={styles.uploadedItem}>
                <Text style={styles.uploadedItemText}>📷 Image {index + 1}</Text>
                <TouchableOpacity
                  onPress={() => {
                    const newImages = [...formData.images];
                    newImages.splice(index, 1);
                    updateField('images', newImages);
                  }}
                >
                  <X size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.fieldContainer}>
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
        {formData.documents.length > 0 && (
          <View style={styles.uploadedItems}>
            {formData.documents.map((doc, index) => (
              <View key={index} style={styles.uploadedItem}>
                <Text style={styles.uploadedItemText}>📄 {doc.name}</Text>
                <TouchableOpacity
                  onPress={() => {
                    const newDocs = [...formData.documents];
                    newDocs.splice(index, 1);
                    updateField('documents', newDocs);
                  }}
                >
                  <X size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.helperCard}>
        <Info size={20} color="#4F46E5" />
        <Text style={styles.helperCardText}>
          <Text style={styles.helperCardBold}>Tip:</Text> Quality media and documents
          increase investor confidence by 40%. Add a professional video and clear
          financial documents.
        </Text>
      </View>
    </View>
  );

  // Category Modal
  const renderCategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={CATEGORIES}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.modalItem,
                  formData.category === item.id && styles.modalItemSelected,
                ]}
                onPress={() => {
                  updateField('category', item.id);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={styles.modalItemIcon}>{item.icon}</Text>
                <Text style={[
                  styles.modalItemText,
                  formData.category === item.id && styles.modalItemTextSelected,
                ]}>
                  {item.label}
                </Text>
                {formData.category === item.id && (
                  <Check size={20} color="#4F46E5" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  // Location Modal
  const renderLocationModal = () => (
    <Modal
      visible={showLocationModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowLocationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Location</Text>
            <TouchableOpacity onPress={() => setShowLocationModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={LOCATIONS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.modalItem,
                  formData.location === item && styles.modalItemSelected,
                ]}
                onPress={() => {
                  updateField('location', item);
                  setShowLocationModal(false);
                }}
              >
                <Text style={[
                  styles.modalItemText,
                  formData.location === item && styles.modalItemTextSelected,
                ]}>
                  {item}
                </Text>
                {formData.location === item && (
                  <Check size={20} color="#4F46E5" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  // Stage Modal
  const renderStageModal = () => (
    <Modal
      visible={showStageModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowStageModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Business Stage</Text>
            <TouchableOpacity onPress={() => setShowStageModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={BUSINESS_STAGES}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.modalItem,
                  formData.businessStage === item.id && styles.modalItemSelected,
                ]}
                onPress={() => {
                  updateField('businessStage', item.id as any);
                  setShowStageModal(false);
                }}
              >
                <View style={styles.modalItemContent}>
                  <Text style={[
                    styles.modalItemText,
                    formData.businessStage === item.id && styles.modalItemTextSelected,
                  ]}>
                    {item.label}
                  </Text>
                  <Text style={styles.modalItemSubtext}>
                    {item.description}
                  </Text>
                </View>
                {formData.businessStage === item.id && (
                  <Check size={20} color="#4F46E5" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  // Return Type Modal
  const renderReturnTypeModal = () => (
    <Modal
      visible={showReturnTypeModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowReturnTypeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Return Type</Text>
            <TouchableOpacity onPress={() => setShowReturnTypeModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={RETURN_TYPES}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.modalItem,
                  formData.returnType === item.id && styles.modalItemSelected,
                ]}
                onPress={() => {
                  updateField('returnType', item.id as any);
                  setShowReturnTypeModal(false);
                }}
              >
                <View style={styles.modalItemContent}>
                  <Text style={[
                    styles.modalItemText,
                    formData.returnType === item.id && styles.modalItemTextSelected,
                  ]}>
                    {item.label}
                  </Text>
                  <Text style={styles.modalItemSubtext}>
                    {item.description}
                  </Text>
                </View>
                {formData.returnType === item.id && (
                  <Check size={20} color="#4F46E5" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  // Schedule Modal
  const renderScheduleModal = () => (
    <Modal
      visible={showScheduleModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowScheduleModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Payment Schedule</Text>
            <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={PAYMENT_SCHEDULES}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.modalItem,
                  formData.paymentSchedule === item.id && styles.modalItemSelected,
                ]}
                onPress={() => {
                  updateField('paymentSchedule', item.id as any);
                  setShowScheduleModal(false);
                }}
              >
                <Text style={[
                  styles.modalItemText,
                  formData.paymentSchedule === item.id && styles.modalItemTextSelected,
                ]}>
                  {item.label}
                </Text>
                {formData.paymentSchedule === item.id && (
                  <Check size={20} color="#4F46E5" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  // Perks Modal
  const renderPerksModal = () => (
    <Modal
      visible={showPerksModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowPerksModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Investor Perks</Text>
            <TouchableOpacity onPress={() => setShowPerksModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={INVESTOR_PERKS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = formData.investorPerks.includes(item.id);
              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[
                    styles.modalItem,
                    isSelected && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    const newPerks = isSelected
                      ? formData.investorPerks.filter(p => p !== item.id)
                      : [...formData.investorPerks, item.id];
                    updateField('investorPerks', newPerks);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    isSelected && styles.modalItemTextSelected,
                  ]}>
                    {item.label}
                  </Text>
                  {isSelected && (
                    <Check size={20} color="#4F46E5" />
                  )}
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.modalDoneButton}
            onPress={() => setShowPerksModal(false)}
          >
            <Text style={styles.modalDoneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Loading overlay
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>
          {mode === 'create' ? 'Creating your pitch...' : 'Updating your pitch...'}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {mode === 'create' ? 'Create New Pitch' : 'Edit Pitch'}
            </Text>
            {mode === 'edit' && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Draft</Text>
              </View>
            )}
          </View>

          {/* Step Progress */}
          <View style={styles.progressContainer}>
            {STEPS.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const isLast = index === STEPS.length - 1;

              return (
                <View key={step.id} style={styles.progressStep}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      if (validateStep(currentStep)) {
                        setCurrentStep(index);
                      }
                    }}
                    style={[
                      styles.progressCircle,
                      isActive && styles.progressCircleActive,
                      isCompleted && styles.progressCircleCompleted,
                    ]}
                  >
                    {isCompleted ? (
                      <Check size={16} color="#FFFFFF" />
                    ) : (
                      <step.icon
                        size={16}
                        color={isActive ? '#FFFFFF' : '#9CA3AF'}
                      />
                    )}
                  </TouchableOpacity>
                  {!isLast && (
                    <View
                      style={[
                        styles.progressLine,
                        isCompleted && styles.progressLineCompleted,
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>

          {/* Step Labels */}
          <View style={styles.stepLabels}>
            {STEPS.map((step, index) => (
              <Text
                key={step.id}
                style={[
                  styles.stepLabel,
                  index === currentStep && styles.stepLabelActive,
                  index < currentStep && styles.stepLabelCompleted,
                ]}
              >
                {step.label}
              </Text>
            ))}
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorBanner}>
              <AlertCircle size={16} color="#EF4444" />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {/* Step Content */}
          <ScrollView
            style={styles.content}
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
                <ArrowLeft size={20} color="#6B7280" />
                <Text style={styles.footerButtonSecondaryText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSaveDraft}
                style={[styles.footerButton, styles.footerButtonDraft]}
                disabled={isDraftSaving}
              >
                {isDraftSaving ? (
                  <ActivityIndicator size="small" color="#6B7280" />
                ) : (
                  <>
                    <Save size={16} color="#6B7280" />
                    <Text style={styles.footerButtonDraftText}>Save Draft</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleNext}
                style={[
                  styles.footerButton,
                  styles.footerButtonPrimary,
                  loading && styles.footerButtonDisabled,
                ]}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.footerButtonPrimaryText}>
                      {currentStep === STEPS.length - 1 ? 'Submit Pitch' : 'Continue'}
                    </Text>
                    {currentStep !== STEPS.length - 1 && (
                      <ArrowRight size={20} color="#FFFFFF" />
                    )}
                    {currentStep === STEPS.length - 1 && (
                      <Send size={18} color="#FFFFFF" />
                    )}
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Modals */}
        {renderCategoryModal()}
        {renderLocationModal()}
        {renderStageModal()}
        {renderReturnTypeModal()}
        {renderScheduleModal()}
        {renderPerksModal()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#FEF3C7',
    borderRadius: 999,
  },
  statusText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  progressCircleActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  progressCircleCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
  },
  progressLineCompleted: {
    backgroundColor: '#10B981',
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  stepLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  stepLabelCompleted: {
    color: '#10B981',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#FEF2F2',
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorBannerText: {
    color: '#EF4444',
    fontSize: 13,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  stepContent: {
    paddingVertical: 8,
    gap: 16,
  },
  stepTitle: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
  },
  stepSubtitle: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: -8,
    marginBottom: 4,
  },
  fieldContainer: {
    gap: 4,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 16,
  },
  fieldLabel: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  required: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111827',
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    minHeight: 44,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  inputWithIconField: {
    flex: 1,
    color: '#111827',
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  inputSuffix: {
    color: '#6B7280',
    fontSize: 13,
    paddingRight: 4,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111827',
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  fullDescriptionArea: {
    minHeight: 120,
  },
  charCount: {
    color: '#9CA3AF',
    fontSize: 11,
    textAlign: 'right',
    marginTop: 2,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    minHeight: 44,
  },
  selectContent: {
    flex: 1,
  },
  selectText: {
    color: '#111827',
    fontSize: 14,
  },
  selectSubtext: {
    color: '#6B7280',
    fontSize: 12,
  },
  selectPlaceholder: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 2,
  },
  helperText: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  helperCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    alignItems: 'flex-start',
  },
  helperCardText: {
    color: '#4F46E5',
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
  },
  helperCardBold: {
    fontWeight: '700',
  },
  perksSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#FFFFFF',
    minHeight: 44,
  },
  perksList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    flex: 1,
  },
  perkChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#EEF2FF',
    borderRadius: 4,
  },
  perkChipText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '500',
  },
  perksPlaceholder: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
  },
  uploadButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadButtonSubtext: {
    color: '#6B7280',
    fontSize: 12,
  },
  uploadedItems: {
    gap: 6,
    marginTop: 8,
  },
  uploadedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
  },
  uploadedItemText: {
    color: '#374151',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemSelected: {
    backgroundColor: '#EEF2FF',
  },
  modalItemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  modalItemContent: {
    flex: 1,
  },
  modalItemText: {
    color: '#374151',
    fontSize: 16,
  },
  modalItemTextSelected: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  modalItemSubtext: {
    color: '#6B7280',
    fontSize: 13,
  },
  modalDoneButton: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalDoneText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  footerButtonSecondary: {
    backgroundColor: '#F3F4F6',
    flex: 1,
  },
  footerButtonSecondaryText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  footerButtonDraft: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flex: 1,
  },
  footerButtonDraftText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  footerButtonPrimary: {
    backgroundColor: '#4F46E5',
    flex: 1.5,
  },
  footerButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footerButtonHidden: {
    opacity: 0,
    pointerEvents: 'none',
  },
  footerButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
});