import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { LoginScreen } from '../components/auth/LoginScreen';
import { RegisterScreen } from '../components/auth/RegisterScreen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading screen
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      {isLogin ? (
        <LoginScreen onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <RegisterScreen onSwitchToLogin={() => setIsLogin(true)} />
      )}
      <StatusBar style="auto" />
    </>
  );
}
