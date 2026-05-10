import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PixelTransition from '../components/PixelTransition';

export default function WelcomeScreen({ navigation }) {
  return (
    <LinearGradient colors={['#1a0a0f', '#2d1420', '#3f1c2d']} style={styles.container}>
      <PixelTransition />
      {Platform.OS === 'web' && (
        <div className="cubes-container">
          <div className="cube" style={{ left: '15%', animationDelay: '0s' }}>
            <div className="front"/><div className="back"/><div className="right"/><div className="left"/><div className="top"/><div className="bottom"/>
          </div>
          <div className="cube" style={{ left: '45%', animationDelay: '4s' }}>
            <div className="front"/><div className="back"/><div className="right"/><div className="left"/><div className="top"/><div className="bottom"/>
          </div>
          <div className="cube" style={{ left: '75%', animationDelay: '7s' }}>
            <div className="front"/><div className="back"/><div className="right"/><div className="left"/><div className="top"/><div className="bottom"/>
          </div>
        </div>
      )}
      <View style={styles.content}>
        <View style={{ position: 'relative', marginBottom: 20 }}>
          {Platform.OS === 'web' && (
            <div className="magic-ring-container">
              <div className="magic-ring ring-1"></div>
              <div className="magic-ring ring-2"></div>
              <div className="magic-ring ring-3"></div>
            </div>
          )}
          <Text style={styles.emoji}>🐾</Text>
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          {"Friends".split('').map((char, index) => (
            Platform.OS === 'web' ? (
              <span key={index} className="letter-glitch" style={{ color: '#fff', fontSize: '48px', fontWeight: 'bold', fontFamily: 'system-ui' }}>
                {char}
              </span>
            ) : (
              <Text key={index} style={styles.title}>{char}</Text>
            )
          ))}
        </View>
        <Text style={[styles.subtitle]} className={Platform.OS === 'web' ? 'gradient-text' : ''}>
          Raise your AI companion{'\n'}together with a friend
        </Text>

        <TouchableOpacity
          className={Platform.OS === 'web' ? 'star-border glow-hover' : ''}
          style={styles.button}
          onPress={() => navigation.navigate('Auth', { mode: 'signup' })}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={Platform.OS === 'web' ? 'star-border glow-hover' : ''}
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
  subtitle: { fontSize: 18, color: '#fecdd3', textAlign: 'center', marginBottom: 60, lineHeight: 28 },
  button: {
    backgroundColor: 'transparent',
    paddingHorizontal: 50,
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: Platform.OS === 'web' ? 0 : 2,
    borderColor: '#f472b6',
    paddingHorizontal: 50,
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  buttonOutlineText: { color: '#fda4af', fontSize: 18, fontWeight: 'bold' },
});