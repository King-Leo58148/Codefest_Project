import { useState, useMemo, useCallback, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  TrendingUp,
  Info,
  AlertCircle,
  CheckCircle,
  Percent,
  DollarSign,
  Building2,
  Users,
  Calculator,
  ArrowRight,
  HelpCircle,
} from "lucide-react-native";

// Types
export interface EquityData {
  equityOffered: number; // Percentage (0-100)
  valuation: number; // Pre-money valuation in GHS
  investmentAmount?: number; // Optional investment amount
  calculatedOwnership?: number; // Calculated ownership percentage
}

interface EquityInputProps {
  value: EquityData;
  onChange: (data: EquityData) => void;
  minEquity?: number;
  maxEquity?: number;
  defaultEquity?: number;
  minValuation?: number;
  maxValuation?: number;
  investmentAmount?: number;
  currency?: string;
  showInvestmentCalculation?: boolean;
  showValuationInfo?: boolean;
  showOwnershipPreview?: boolean;
  onCalculate?: (data: EquityData) => void;
  onValuationHelp?: () => void;
  loading?: boolean;
  error?: string;
  disabled?: boolean;
}

// Constants
const { width } = Dimensions.get("window");
const MIN_EQUITY = 1;
const MAX_EQUITY = 49;
const MIN_VALUATION = 10000;
const DEFAULT_EQUITY = 10;
const DEFAULT_VALUATION = 250000;

export default function EquityInput({
  value,
  onChange,
  minEquity = MIN_EQUITY,
  maxEquity = MAX_EQUITY,
  defaultEquity = DEFAULT_EQUITY,
  minValuation = MIN_VALUATION,
  maxValuation = undefined,
  investmentAmount,
  currency = "GHS",
  showInvestmentCalculation = true,
  showValuationInfo = true,
  showOwnershipPreview = true,
  onCalculate,
  onValuationHelp,
  loading = false,
  error,
  disabled = false,
}: EquityInputProps) {
  const [localEquity, setLocalEquity] = useState(value?.equityOffered || defaultEquity);
  const [localValuation, setLocalValuation] = useState(value?.valuation || DEFAULT_VALUATION);
  const [focusedField, setFocusedField] = useState<'equity' | 'valuation' | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customInvestment, setCustomInvestment] = useState(investmentAmount || 0);

  // Animated values
  const equityAnim = useState(new Animated.Value(0))[0];
  const valuationAnim = useState(new Animated.Value(0))[0];

  // Recalculate ownership when equity or valuation changes
  const calculatedOwnership = useMemo(() => {
    if (localEquity && localValuation) {
      const ownership = localEquity / 100;
      return ownership;
    }
    return 0;
  }, [localEquity, localValuation]);

  const investmentValue = useMemo(() => {
    if (customInvestment > 0) {
      return customInvestment;
    }
    if (investmentAmount) {
      return investmentAmount;
    }
    // Calculate based on equity and valuation
    if (localEquity > 0 && localValuation > 0) {
      return (localEquity / 100) * localValuation;
    }
    return 0;
  }, [customInvestment, investmentAmount, localEquity, localValuation]);

  const estimatedInvestment = useMemo(() => {
    if (localEquity > 0 && localValuation > 0) {
      return (localEquity / 100) * localValuation;
    }
    return 0;
  }, [localEquity, localValuation]);

  const ownershipPercentage = useMemo(() => {
    if (investmentValue > 0 && localValuation > 0) {
      return (investmentValue / (localValuation + investmentValue)) * 100;
    }
    return 0;
  }, [investmentValue, localValuation]);

  const equityValue = useMemo(() => {
    if (localEquity > 0 && localValuation > 0) {
      return (localEquity / 100) * localValuation;
    }
    return 0;
  }, [localEquity, localValuation]);

  // Handlers
  const handleEquityChange = useCallback((text: string) => {
    const numericValue = parseFloat(text) || 0;
    const clampedValue = Math.max(minEquity, Math.min(maxEquity, numericValue));
    setLocalEquity(clampedValue);
    
    // Animate the change
    Animated.timing(equityAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      equityAnim.setValue(0);
    });

    onChange({
      equityOffered: clampedValue,
      valuation: localValuation,
      investmentAmount: customInvestment || investmentAmount,
      calculatedOwnership: ownershipPercentage,
    });
  }, [localValuation, customInvestment, investmentAmount, onChange, equityAnim, minEquity, maxEquity, ownershipPercentage]);

  const handleValuationChange = useCallback((text: string) => {
    const numericValue = parseInt(text.replace(/,/g, '')) || 0;
    const clampedValue = Math.max(minValuation, maxValuation ? Math.min(maxValuation, numericValue) : numericValue);
    setLocalValuation(clampedValue);

    Animated.timing(valuationAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      valuationAnim.setValue(0);
    });

    onChange({
      equityOffered: localEquity,
      valuation: clampedValue,
      investmentAmount: customInvestment || investmentAmount,
      calculatedOwnership: ownershipPercentage,
    });
  }, [localEquity, customInvestment, investmentAmount, onChange, valuationAnim, minValuation, maxValuation, ownershipPercentage]);

  const handleInvestmentChange = useCallback((text: string) => {
    const numericValue = parseInt(text.replace(/,/g, '')) || 0;
    setCustomInvestment(numericValue);
    
    onChange({
      equityOffered: localEquity,
      valuation: localValuation,
      investmentAmount: numericValue,
      calculatedOwnership: ownershipPercentage,
    });
  }, [localEquity, localValuation, onChange, ownershipPercentage]);

  const formatCurrencyValue = (value: number): string => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-GH').format(value);
  };

  // Helper text based on equity range
  const getEquityHelper = useMemo(() => {
    if (localEquity <= 10) {
      return {
        text: "Lower equity offering may attract more investors",
        type: "info",
      };
    } else if (localEquity <= 25) {
      return {
        text: "Good balance of equity and valuation",
        type: "success",
      };
    } else if (localEquity <= 40) {
      return {
        text: "Higher equity means less ownership for you",
        type: "warning",
      };
    } else {
      return {
        text: "Consider if you're giving away too much ownership",
        type: "error",
      };
    }
  }, [localEquity]);

  // Get valuation tier
  const getValuationTier = useMemo(() => {
    if (localValuation < 100000) {
      return {
        label: "Seed Stage",
        color: "#F59E0B",
        description: "Early-stage business seeking initial funding",
      };
    } else if (localValuation < 500000) {
      return {
        label: "Growth Stage",
        color: "#3B82F6",
        description: "Proven concept with growth potential",
      };
    } else if (localValuation < 2000000) {
      return {
        label: "Expansion Stage",
        color: "#10B981",
        description: "Scaling operations with market traction",
      };
    } else {
      return {
        label: "Established",
        color: "#8B5CF6",
        description: "Mature business with solid track record",
      };
    }
  }, [localValuation]);

  // Loading state
  if (loading) {
    return (
      <View style={styles.skeletonContainer}>
        <View style={styles.skeletonHeader}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonSubtitle} />
        </View>
        <View style={styles.skeletonSlider} />
        <View style={styles.skeletonInput} />
        <View style={styles.skeletonPreview} />
      </View>
    );
  }

  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconContainer}>
            <Percent size={18} color="#4F46E5" />
          </View>
          <Text style={styles.headerTitle}>Equity Offering</Text>
        </View>
        {!disabled && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowAdvanced(!showAdvanced)}
            style={styles.advancedToggle}
          >
            <Text style={styles.advancedToggleText}>
              {showAdvanced ? "Simple" : "Advanced"}
            </Text>
            <ArrowRight 
              size={14} 
              color="#6B7280" 
              style={{ transform: [{ rotate: showAdvanced ? '270deg' : '90deg' }] }}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Main Input - Equity Percentage */}
      <View style={styles.equitySection}>
        <View style={styles.equityRow}>
          <Text style={styles.equityLabel}>Equity Offered</Text>
          <View style={styles.equityValueContainer}>
            <Text style={styles.equityValue}>{localEquity}%</Text>
          </View>
        </View>

        {/* Custom Slider */}
        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrack}>
            <View 
              style={[
                styles.sliderFill,
                { width: `${((localEquity - minEquity) / (maxEquity - minEquity)) * 100}%` }
              ]} 
            />
            <View 
              style={[
                styles.sliderThumb,
                { left: `${((localEquity - minEquity) / (maxEquity - minEquity)) * 100}%` }
              ]}
            >
              <View style={styles.sliderThumbInner} />
            </View>
          </View>

          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>{minEquity}%</Text>
            <Text style={styles.sliderLabel}>{Math.round((minEquity + maxEquity) / 2)}%</Text>
            <Text style={styles.sliderLabel}>{maxEquity}%</Text>
          </View>
        </View>

        {/* Quick Select Buttons */}
        <View style={styles.quickSelectContainer}>
          {[5, 10, 15, 20, 25, 30].map((value) => (
            <TouchableOpacity
              key={value}
              activeOpacity={0.85}
              onPress={() => handleEquityChange(String(value))}
              style={[
                styles.quickSelectButton,
                localEquity === value && styles.quickSelectButtonActive,
              ]}
              disabled={disabled || value < minEquity || value > maxEquity}
            >
              <Text
                style={[
                  styles.quickSelectText,
                  localEquity === value && styles.quickSelectTextActive,
                ]}
              >
                {value}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Helper Text */}
        {getEquityHelper && (
          <View style={[
            styles.helperContainer,
            styles[`helper${getEquityHelper.type.charAt(0).toUpperCase() + getEquityHelper.type.slice(1)}`]
          ]}>
            {getEquityHelper.type === 'error' && <AlertCircle size={14} color="#EF4444" />}
            {getEquityHelper.type === 'warning' && <AlertCircle size={14} color="#F59E0B" />}
            {getEquityHelper.type === 'success' && <CheckCircle size={14} color="#10B981" />}
            {getEquityHelper.type === 'info' && <Info size={14} color="#3B82F6" />}
            <Text style={[
              styles.helperText,
              styles[`helperText${getEquityHelper.type.charAt(0).toUpperCase() + getEquityHelper.type.slice(1)}`]
            ]}>
              {getEquityHelper.text}
            </Text>
          </View>
        )}
      </View>

      {/* Advanced Section */}
      {showAdvanced && (
        <View style={styles.advancedSection}>
          {/* Valuation Input */}
          <View style={styles.valuationSection}>
            <View style={styles.valuationHeader}>
              <View style={styles.valuationTitleRow}>
                <Building2 size={16} color="#6B7280" />
                <Text style={styles.valuationTitle}>Pre-Money Valuation</Text>
              </View>
              {showValuationInfo && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={onValuationHelp}
                  style={styles.helpButton}
                >
                  <HelpCircle size={16} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.valuationInputContainer}>
              <Text style={styles.currencyPrefix}>{currency}</Text>
              <TextInput
                style={styles.valuationInput}
                value={formatNumber(localValuation)}
                onChangeText={handleValuationChange}
                keyboardType="numeric"
                placeholder={`Enter ${currency} value`}
                placeholderTextColor="#9CA3AF"
                editable={!disabled}
                onFocus={() => setFocusedField('valuation')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Valuation Tier */}
            <View style={[styles.valuationTier, { borderColor: getValuationTier.color }]}>
              <View 
                style={[styles.valuationTierDot, { backgroundColor: getValuationTier.color }]} 
              />
              <Text style={styles.valuationTierLabel}>{getValuationTier.label}</Text>
              <Text style={styles.valuationTierDescription}>
                {getValuationTier.description}
              </Text>
            </View>

            {/* Valuation Range Guide */}
            <View style={styles.valuationRange}>
              <Text style={styles.valuationRangeLabel}>Typical range:</Text>
              <Text style={styles.valuationRangeValue}>
                {formatCurrencyValue(50000)} - {formatCurrencyValue(2000000)}
              </Text>
            </View>
          </View>

          {/* Investment Calculation */}
          {showInvestmentCalculation && (
            <View style={styles.investmentSection}>
              <View style={styles.investmentHeader}>
                <View style={styles.investmentTitleRow}>
                  <Calculator size={16} color="#6B7280" />
                  <Text style={styles.investmentTitle}>Investment Calculation</Text>
                </View>
                <Text style={styles.investmentSubtitle}>
                  Based on equity and valuation
                </Text>
              </View>

              <View style={styles.investmentPreview}>
                <View style={styles.investmentRow}>
                  <Text style={styles.investmentLabel}>Investment Amount</Text>
                  <Text style={styles.investmentValue}>
                    {formatCurrencyValue(estimatedInvestment)}
                  </Text>
                </View>
                <View style={styles.investmentRow}>
                  <Text style={styles.investmentLabel}>Post-Money Valuation</Text>
                  <Text style={styles.investmentValue}>
                    {formatCurrencyValue(localValuation + estimatedInvestment)}
                  </Text>
                </View>
                <View style={styles.investmentRowHighlight}>
                  <Text style={styles.investmentLabelHighlight}>Ownership for Investor</Text>
                  <Text style={styles.investmentValueHighlight}>
                    {ownershipPercentage.toFixed(1)}%
                  </Text>
                </View>
              </View>

              {/* Custom Investment Input */}
              <View style={styles.customInvestmentContainer}>
                <Text style={styles.customInvestmentLabel}>
                  Or enter custom investment amount
                </Text>
                <View style={styles.customInvestmentInputContainer}>
                  <Text style={styles.currencyPrefix}>{currency}</Text>
                  <TextInput
                    style={styles.customInvestmentInput}
                    value={customInvestment > 0 ? formatNumber(customInvestment) : ''}
                    onChangeText={handleInvestmentChange}
                    keyboardType="numeric"
                    placeholder={`Enter ${currency} amount`}
                    placeholderTextColor="#9CA3AF"
                    editable={!disabled}
                  />
                </View>
                {customInvestment > 0 && (
                  <View style={styles.customInvestmentResult}>
                    <Text style={styles.customInvestmentResultText}>
                      This investment would give the investor{' '}
                      <Text style={styles.customInvestmentResultHighlight}>
                        {((customInvestment / (localValuation + customInvestment)) * 100).toFixed(1)}%
                      </Text>
                      {' '}ownership
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Ownership Preview */}
      {showOwnershipPreview && (
        <View style={styles.ownershipPreview}>
          <View style={styles.ownershipHeader}>
            <View style={styles.ownershipTitleRow}>
              <Users size={16} color="#4F46E5" />
              <Text style={styles.ownershipTitle}>Ownership Structure</Text>
            </View>
          </View>

          <View style={styles.ownershipChart}>
            <View style={styles.ownershipBar}>
              <View 
                style={[
                  styles.ownershipBarFill,
                  { width: `${localEquity}%` }
                ]}
              >
                <LinearGradient
                  colors={['#4F46E5', '#7C3AED']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ownershipBarGradient}
                />
              </View>
            </View>
            <View style={styles.ownershipLabels}>
              <View style={styles.ownershipLabelLeft}>
                <View style={[styles.ownershipDot, { backgroundColor: '#4F46E5' }]} />
                <Text style={styles.ownershipLabelText}>
                  Investors: {localEquity}%
                </Text>
              </View>
              <View style={styles.ownershipLabelRight}>
                <View style={[styles.ownershipDot, { backgroundColor: '#E5E7EB' }]} />
                <Text style={styles.ownershipLabelText}>
                  Founder: {100 - localEquity}%
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.ownershipDetails}>
            <View style={styles.ownershipDetail}>
              <Text style={styles.ownershipDetailLabel}>Founder Ownership</Text>
              <Text style={styles.ownershipDetailValue}>
                {100 - localEquity}%
              </Text>
            </View>
            <View style={styles.ownershipDivider} />
            <View style={styles.ownershipDetail}>
              <Text style={styles.ownershipDetailLabel}>Investor Pool</Text>
              <Text style={styles.ownershipDetailValue}>
                {localEquity}%
              </Text>
            </View>
            <View style={styles.ownershipDivider} />
            <View style={styles.ownershipDetail}>
              <Text style={styles.ownershipDetailLabel}>Valuation</Text>
              <Text style={styles.ownershipDetailValue}>
                {formatCurrencyValue(localValuation)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={16} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  containerDisabled: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  advancedToggleText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
  },
  equitySection: {
    gap: 12,
  },
  equityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  equityLabel: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  equityValueContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
  },
  equityValue: {
    color: '#4F46E5',
    fontSize: 18,
    fontWeight: '700',
  },
  sliderContainer: {
    paddingVertical: 4,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    top: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderThumbInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4F46E5',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '500',
  },
  quickSelectContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  quickSelectButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  quickSelectButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  quickSelectText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  quickSelectTextActive: {
    color: '#4F46E5',
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  helperInfo: {
    backgroundColor: '#EFF6FF',
  },
  helperSuccess: {
    backgroundColor: '#ECFDF5',
  },
  helperWarning: {
    backgroundColor: '#FFFBEB',
  },
  helperError: {
    backgroundColor: '#FEF2F2',
  },
  helperText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  helperTextInfo: {
    color: '#3B82F6',
  },
  helperTextSuccess: {
    color: '#10B981',
  },
  helperTextWarning: {
    color: '#F59E0B',
  },
  helperTextError: {
    color: '#EF4444',
  },
  advancedSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 16,
  },
  valuationSection: {
    gap: 8,
  },
  valuationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valuationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  valuationTitle: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  helpButton: {
    padding: 4,
  },
  valuationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  currencyPrefix: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    paddingRight: 8,
  },
  valuationInput: {
    flex: 1,
    color: '#111827',
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  valuationTier: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#F9FAFB',
  },
  valuationTierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  valuationTierLabel: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '600',
  },
  valuationTierDescription: {
    color: '#6B7280',
    fontSize: 12,
    marginLeft: 'auto',
  },
  valuationRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  valuationRangeLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  valuationRangeValue: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  investmentSection: {
    gap: 12,
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  investmentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  investmentTitle: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  investmentSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  investmentPreview: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  investmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  investmentLabel: {
    color: '#6B7280',
    fontSize: 13,
  },
  investmentValue: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  investmentRowHighlight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  investmentLabelHighlight: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  investmentValueHighlight: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '700',
  },
  customInvestmentContainer: {
    gap: 8,
  },
  customInvestmentLabel: {
    color: '#6B7280',
    fontSize: 13,
  },
  customInvestmentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  customInvestmentInput: {
    flex: 1,
    color: '#111827',
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  customInvestmentResult: {
    padding: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
  },
  customInvestmentResultText: {
    color: '#4F46E5',
    fontSize: 12,
    textAlign: 'center',
  },
  customInvestmentResultHighlight: {
    fontWeight: '700',
  },
  ownershipPreview: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  ownershipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ownershipTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ownershipTitle: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  ownershipChart: {
    gap: 8,
  },
  ownershipBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ownershipBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  ownershipBarGradient: {
    flex: 1,
    borderRadius: 4,
  },
  ownershipLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ownershipLabelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ownershipLabelRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ownershipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ownershipLabelText: {
    color: '#6B7280',
    fontSize: 11,
  },
  ownershipDetails: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
  },
  ownershipDetail: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  ownershipDetailLabel: {
    color: '#6B7280',
    fontSize: 11,
  },
  ownershipDetailValue: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  ownershipDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    flex: 1,
  },
  // Skeleton
  skeletonContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  skeletonHeader: {
    gap: 4,
  },
  skeletonTitle: {
    width: 120,
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  skeletonSubtitle: {
    width: 80,
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  skeletonSlider: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  skeletonInput: {
    height: 44,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  skeletonPreview: {
    height: 60,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
});