import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen({ navigation }) {
  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
      {Platform.OS === 'web' && <div className="aurora-bg" style={{position:'absolute', top:0, left:0, right:0, bottom:0}} />}
      <View style={styles.content}>
        <Text style={styles.emoji}>🐾</Text>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          {"Friends".split('').map((char, index) => (
            Platform.OS === 'web' ? (
              <span key={index} className="blur-text-letter" style={{ animationDelay: `${index * 0.1}s`, color: '#fff', fontSize: '48px', fontWeight: 'bold', fontFamily: 'system-ui' }}>
                {char}
              </span>
            ) : (
              <Text key={index} style={styles.title}>{char}</Text>
            )
          ))}
        </View>
        <Text style={styles.subtitle}>Raise your AI companion{'\n'}together with a friend</Text>

        <TouchableOpacity
          className={Platform.OS === 'web' ? 'glow-hover' : ''}
          style={styles.button}
          onPress={() => navigation.navigate('Auth', { mode: 'signup' })}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={Platform.OS === 'web' ? 'glow-hover' : ''}
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