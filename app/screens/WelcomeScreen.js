import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen({ navigation }) {
  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🐾</Text>
        <Text style={styles.title}>Friends</Text>
        <Text style={styles.subtitle}>Raise your AI companion{'\n'}together with a friend</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Auth', { mode: 'signup' })}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonOutline}
          onPress={() => navigation.navigate('Auth', { mode: 'login' })}
        >
          <Text style={styles.buttonOutlineText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emoji: { fontSize: 80, marginBottom: 20 },
  title: { fontSize: 48, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#a0a0c0', textAlign: 'center', marginBottom: 60, lineHeight: 28 },
  button: {
    backgroundColor: '#e94560',
    paddingHorizontal: 50,
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  buttonOutline: {
    borderWidth: 2,
    borderColor: '#e94560',
    paddingHorizontal: 50,
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  buttonOutlineText: { color: '#e94560', fontSize: 18, fontWeight: 'bold' },
});