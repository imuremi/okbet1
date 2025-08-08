import { Button, Linking, Text, View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useLogin } from "@privy-io/expo/ui";
import { useLoginWithPasskey } from "@privy-io/expo/passkey";
import Constants from "expo-constants";
import { useState, useEffect } from "react";
import * as Application from "expo-application";
import { useAppKit } from "@reown/appkit-wagmi-react-native";
import * as AppleAuthentication from 'expo-apple-authentication';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { open } = useAppKit();
  const router = useRouter();
  
  const { loginWithPasskey } = useLoginWithPasskey({
    onError: (err) => {
      console.log("Passkey login error:", err);
      setError(`Passkey error: ${err.message || JSON.stringify(err)}`);
      setIsLoading(false);
    },
    onSuccess: () => {
      console.log("Passkey login successful");
      setIsLoading(false);
    },
  });
  
  const { login } = useLogin();

  const handleLoginWithPrivyUI = async () => {
    setIsLoading(true);
    setError("");
    try {
      const session = await login({ loginMethods: ["email"] });
      console.log("User logged in successfully:", session.user);
    } catch (err: any) {
      console.log("Login error:", err);
      setError(`Login error: ${err.error || err.message || JSON.stringify(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    console.log(`Starting ${provider} OAuth login...`);
    setIsLoading(true);
    setError("");
    
    if (provider === 'apple') {
      try {
        // Use native Apple Sign In - this will show the bottom sheet
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });
        
        console.log('Apple Sign In successful:', credential);
        
        // Handle the successful Apple Sign In
        // You can store the credential or handle it as needed
        console.log('Apple user ID:', credential.user);
        console.log('Apple email:', credential.email);
        console.log('Apple full name:', credential.fullName);
        
        // Navigate to the bet screen after successful Apple Sign In
        console.log('Navigating to bet screen...');
        router.push('/bet');
        
        // For now, just show success - you can integrate with Privy later if needed
        setError(''); // Clear any previous errors
        
      } catch (err: any) {
        console.log('Apple Sign In error:', err);
        if (err.code === 'ERR_CANCELED') {
          console.log('User cancelled Apple Sign In');
        } else {
          setError(`Apple Sign In error: ${err.message || JSON.stringify(err)}`);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Handle Google OAuth with existing approach
      try {
        await login({ loginMethods: ["email", "google", "apple"] });
        console.log(`${provider} OAuth login initiated via Privy UI`);
      } catch (err: any) {
        console.log(`${provider} OAuth login error:`, err);
        
        // Fallback: Try with just the specific provider
        try {
          console.log(`Trying fallback for ${provider}...`);
          await login({ loginMethods: [provider] });
          console.log(`${provider} OAuth login successful via fallback`);
        } catch (fallbackErr: any) {
          console.log(`${provider} OAuth fallback error:`, fallbackErr);
          setError(`${provider} OAuth error: ${fallbackErr.message || JSON.stringify(fallbackErr)}`);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Email Sign In */}
        <TouchableOpacity 
          style={[styles.primaryButton, isLoading && styles.disabledButton]}
          onPress={handleLoginWithPrivyUI}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? "Signing in..." : "Continue with Email"}
          </Text>
        </TouchableOpacity>

        {/* Google Button */}
        <TouchableOpacity 
          style={[styles.socialButton, styles.googleButton]}
          onPress={() => handleSocialLogin('google')}
          disabled={isLoading}
        >
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Apple Button */}
        <TouchableOpacity 
          style={[styles.socialButton, styles.appleButton]}
          onPress={() => handleSocialLogin('apple')}
          disabled={isLoading}
        >
          <Text style={styles.appleButtonText}>Continue with Apple</Text>
        </TouchableOpacity>

        {/* Passkey Option */}
        <TouchableOpacity 
          style={styles.passkeyButton}
          onPress={() => {
            setIsLoading(true);
            setError("");
            loginWithPasskey({
              relyingParty: Constants.expoConfig?.extra?.passkeyAssociatedDomain,
            });
          }}
          disabled={isLoading}
        >
          <Text style={styles.passkeyButtonText}>Use Passkey</Text>
        </TouchableOpacity>

        {/* Wallet Connection */}
        <View style={styles.walletSection}>
          <TouchableOpacity 
            style={styles.walletButton}
            onPress={() => open()}
            disabled={isLoading}
          >
            <Text style={styles.walletButtonText}>Connect Wallet</Text>
          </TouchableOpacity>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  primaryButton: {
    backgroundColor: '#676FFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#676FFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  socialButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButton: {
    borderColor: '#e0e0e0',
  },
  googleButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '500',
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  appleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  passkeyButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  passkeyButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '500',
  },
  walletSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  appKitContainer: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  walletButton: {
    backgroundColor: '#676FFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
  },
  walletButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
    fontSize: 14,
  },
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 16,
  },
});
