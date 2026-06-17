import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  KeyboardTypeOptions,
  ReturnKeyTypeOptions
} from 'react-native';

// Define TextContentType as a type alias since it might not be exported
type TextContentType = 
  | 'none' 
  | 'URL' 
  | 'addressCity' 
  | 'addressCityAndState' 
  | 'addressState' 
  | 'countryName' 
  | 'creditCardNumber' 
  | 'creditCardExpiration' 
  | 'creditCardExpirationMonth' 
  | 'creditCardExpirationYear' 
  | 'creditCardSecurityCode' 
  | 'creditCardType' 
  | 'creditCardName' 
  | 'creditCardGivenName' 
  | 'creditCardMiddleName' 
  | 'creditCardFamilyName' 
  | 'emailAddress' 
  | 'familyName' 
  | 'fullStreetAddress' 
  | 'givenName' 
  | 'jobTitle' 
  | 'location' 
  | 'middleName' 
  | 'name' 
  | 'namePrefix' 
  | 'nameSuffix' 
  | 'nickname' 
  | 'organizationName' 
  | 'postalCode' 
  | 'streetAddressLine1' 
  | 'streetAddressLine2' 
  | 'sublocality' 
  | 'telephoneNumber' 
  | 'username' 
  | 'password' 
  | 'newPassword' 
  | 'oneTimeCode';

interface FormInputProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  textContentType?: TextContentType;
  editable?: boolean;
  maxLength?: number;
  multiline?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  inputContainerStyle?: any;
  inputStyle?: any;
  labelStyle?: any;
  errorMessage?: string;
  errorStyle?: any;
  containerStyle?: any;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  textContentType,
  editable = true,
  maxLength,
  multiline = false,
  returnKeyType = 'done',
  inputContainerStyle,
  inputStyle,
  labelStyle,
  errorMessage,
  errorStyle,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <View style={[styles.inputContainer, inputContainerStyle]}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#C7CBD4"
          selectionColor="#4F46E5"
          value={value || ''}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          textContentType={textContentType}
          editable={editable}
          maxLength={maxLength}
          multiline={multiline}
          returnKeyType={returnKeyType}
          style={[styles.input, inputStyle]}
        />
      </View>
      {errorMessage && (
        <Text style={[styles.error, errorStyle]}>{errorMessage}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    color: '#A3A8B3',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  inputContainer: {
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  input: {
    color: '#111827',
    fontSize: 14,
    minHeight: 38,
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  error: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});

export default FormInput;