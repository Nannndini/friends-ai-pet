import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import PixelTransition from '../components/PixelTransition';
import { useTheme } from '../lib/ThemeContext';

const SPECIES = [
  { name: 'Cat', emoji: '🐱' },
  { name: 'Dog', emoji: '🐶' },
  { name: 'Dragon', emoji: '🐲' },
  { name: 'Bunny', emoji: '🐰' },
  { name: 'Fox', emoji: '🦊' },
  { name: 'Panda', emoji: '🐼' },
];

const PERSONALITIES = ['curious and playful', 'shy and sweet', 'energetic and bold', 'calm and wise'];

export default function CreatePetScreen({ navigation, onPetCreated }) {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState(SPECIES[0]);
  const [personality, setPersonality] = useState(PERSONALITIES[0]);
  const [loading, setLoading] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleSpeciesSelect = (s) => {
    setSpecies(s);
    scaleAnim.setValue(1);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true })
    ]).start();
  };

  async function createPet() {
    if (!name.trim()) return Alert.alert('Name your pet first!');
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('pets').insert({
      name,
      species: species.name,
      owner_id: user.id,
      personality,
      mood: 'happy',
      hunger: 80,
      happiness: 80,
      energy: 80,
      growth_stage: 1,
      interaction_count: 0,
    });
    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
    } else {
      if (onPetCreated) onPetCreated();
      navigation.replace('Home');
    }
  }

  const dynamicStyles = {
    title: { color: theme.textMain },
    label: { color: theme.textMuted },
    input: { backgroundColor: theme.cardBg, color: theme.textMain, borderColor: theme.primaryLight },
    speciesCard: { backgroundColor: theme.cardBg, borderColor: theme.primaryLight },
    speciesName: { color: theme.textMain },
    personalityCard: { backgroundColor: theme.cardBg, borderColor: theme.primaryLight },
    personalityText: { color: theme.textMain },
    selected: { borderColor: theme.primary, backgroundColor: theme.primaryMuted },
    button: { backgroundColor: theme.primary },
  };

  return (
    <LinearGradient colors={theme.bgGradient} style={styles.container}>
      <PixelTransition />
      {Platform.OS === 'web' && <div className="aurora-bg" style={{position:'absolute', top:0, left:0, right:0, bottom:0, opacity: 0.2}} />}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, dynamicStyles.title]}>Create Your Pet 🐾</Text>
        <Text style={[styles.label, dynamicStyles.label]}>Name</Text>
        <TextInput
          style={[styles.input, dynamicStyles.input]}
          placeholder="Give your pet a name..."
          placeholderTextColor={theme.textMuted}
          value={name}
          onChangeText={setName}
        />
        <Text style={[styles.label, dynamicStyles.label]}>Choose Species</Text>
        <View style={styles.grid}>
          {SPECIES.map((s) => (
            <TouchableOpacity
              key={s.name}
              className={Platform.OS === 'web' ? 'holographic-shimmer species-card-hover ' + (species.name === s.name ? 'species-selected-glow' : '') : ''}
              style={[styles.speciesCard, dynamicStyles.speciesCard, species.name === s.name && dynamicStyles.selected]}
              onPress={() => handleSpeciesSelect(s)}
            >
              <Animated.Text style={[styles.speciesEmoji, species.name === s.name && { transform: [{ scale: scaleAnim }] }]}>
                {s.emoji}
              </Animated.Text>
              <Text style={[styles.speciesName, dynamicStyles.speciesName]}>{s.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.label, dynamicStyles.label]}>Personality</Text>
        {PERSONALITIES.map((p) => (
          <TouchableOpacity
            key={p}
            className={Platform.OS === 'web' ? 'holographic-shimmer species-card-hover ' + (personality === p ? 'species-selected-glow' : '') : ''}
            style={[styles.personalityCard, dynamicStyles.personalityCard, personality === p && dynamicStyles.selected]}
            onPress={() => setPersonality(p)}
          >
            <Text style={[styles.personalityText, dynamicStyles.personalityText]}>{p}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity 
          className={Platform.OS === 'web' ? 'glow-hover' : ''}
          style={[styles.button, dynamicStyles.button]} onPress={createPet} disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Creating...' : `Adopt ${species.emoji}`}</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 30, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2d1b2e', marginBottom: 30, textAlign: 'center' },
  label: { color: '#8b5a6b', fontSize: 14, marginBottom: 10, marginTop: 20 },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    color: '#2d1b2e',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ffb3c1',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  speciesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '30%',
    borderWidth: 2,
    borderColor: '#ffb3c1',
  },
  speciesEmoji: { fontSize: 32 },
  speciesName: { color: '#2d1b2e', fontSize: 12, marginTop: 5 },
  personalityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#ffb3c1',
  },
  personalityText: { color: '#2d1b2e', fontSize: 14 },
  selected: { borderColor: '#ff6b8a', backgroundColor: '#fff0f3' },
  button: {
    backgroundColor: '#ff6b8a',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});