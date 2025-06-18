import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const validateForm = () => {
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (username.length < 3 || username.length > 30) {
      Alert.alert('Error', 'Username must be between 3 and 30 characters');
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      Alert.alert('Error', 'Username can only contain letters, numbers, and underscores');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      Alert.alert(
        'Error',
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      );
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await register(username.trim(), email.trim(), password);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Join Hidden Spots</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Create an account to start sharing hidden gems
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Username</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Choose a username"
              placeholderTextColor={colors.textTertiary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Enter your email"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Create a password"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Confirm your password"
              placeholderTextColor={colors.textTertiary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.registerButton,
              {
                backgroundColor: colors.primary,
                opacity: isLoading ? 0.7 : 1,
              },
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.registerButtonText}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <View style={styles.switchContainer}>
            <Text style={[styles.switchText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={onSwitchToLogin}>
              <Text style={[styles.switchLink, { color: colors.primary }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  registerButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  switchText: {
    fontSize: 14,
  },
  switchLink: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 