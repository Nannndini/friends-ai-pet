import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import PixelTransition from '../components/PixelTransition';
import { useTheme } from '../lib/ThemeContext';

export default function AuthScreen({ navigation, route }) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const mode = route.params?.mode || 'login';

  async function handleAuth() {
    setLoading(true);
    let authError = null;
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      authError = error;
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      authError = error;
    }

    if (authError) {
      Alert.alert('Error', authError.message);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').upsert({ 
          id: user.id, 
          email: email.toLowerCase().trim() 
        });
      }
    }
    setLoading(false);
  }

  const dynamicStyles = {
    title: { color: theme.textMain },
    input: { backgroundColor: theme.cardBg, color: theme.textMain, borderColor: theme.primaryLight },
    button: { backgroundColor: theme.primary },
    switchText: { color: theme.textMuted },
  };

  return (
    <LinearGradient colors={theme.bgGradient} style={styles.container}>
      <PixelTransition />
      <View style={styles.content}>
        <Text style={[styles.title, dynamicStyles.title]}>{mode === 'signup' ? 'Create Account' : 'Welcome Back'}</Text>
        <TextInput
          style={[styles.input, dynamicStyles.input]}
          placeholder="Email"
          placeholderTextColor={theme.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, dynamicStyles.input]}
          placeholder="Password"
          placeholderTextColor={theme.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={[styles.button, dynamicStyles.button]} onPress={handleAuth} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Loading...' : mode === 'signup' ? 'Sign Up' : 'Login'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Auth', { mode: mode === 'login' ? 'signup' : 'login' })}>
          <Text style={[styles.switchText, dynamicStyles.switchText]}>
            {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2d1b2e', marginBottom: 40, textAlign: 'center' },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    color: '#2d1b2e',
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffb3c1',
  },
  button: {
    backgroundColor: '#ff6b8a',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  switchText: { color: '#8b5a6b', textAlign: 'center', fontSize: 14 },
});