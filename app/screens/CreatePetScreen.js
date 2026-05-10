import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';

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

  return (
    <LinearGradient colors={['#0a0a0f', '#13131a', '#1e1b4b']} style={styles.container}>
      {Platform.OS === 'web' && <div className="aurora-bg" style={{position:'absolute', top:0, left:0, right:0, bottom:0, opacity: 0.2}} />}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create Your Pet 🐾</Text>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Give your pet a name..."
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
        />
        <Text style={styles.label}>Choose Species</Text>
        <View style={styles.grid}>
          {SPECIES.map((s) => (
            <TouchableOpacity
              key={s.name}
              className={Platform.OS === 'web' ? 'holographic-shimmer species-card-hover ' + (species.name === s.name ? 'species-selected-glow' : '') : ''}
              style={[styles.speciesCard, species.name === s.name && styles.selected]}
              onPress={() => handleSpeciesSelect(s)}
            >
              <Animated.Text style={[styles.speciesEmoji, species.name === s.name && { transform: [{ scale: scaleAnim }] }]}>
                {s.emoji}
              </Animated.Text>
              <Text style={styles.speciesName}>{s.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Personality</Text>
        {PERSONALITIES.map((p) => (
          <TouchableOpacity
            key={p}
            className={Platform.OS === 'web' ? 'holographic-shimmer species-card-hover ' + (personality === p ? 'species-selected-glow' : '') : ''}
            style={[styles.personalityCard, personality === p && styles.selected]}
            onPress={() => setPersonality(p)}
          >
            <Text style={styles.personalityText}>{p}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity 
          className={Platform.OS === 'web' ? 'glow-hover' : ''}
          style={styles.button} onPress={createPet} disabled={loading}
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
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 30, textAlign: 'center' },
  label: { color: '#a0a0c0', fontSize: 14, marginBottom: 10, marginTop: 20 },
  input: {
    backgroundColor: '#ffffff15',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ffffff20',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  speciesCard: {
    backgroundColor: '#13131a',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '30%',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  speciesEmoji: { fontSize: 32 },
  speciesName: { color: '#fff', fontSize: 12, marginTop: 5 },
  personalityCard: {
    backgroundColor: '#13131a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  personalityText: { color: '#fff', fontSize: 14 },
  selected: { borderColor: '#7c3aed' },
  button: {
    backgroundColor: '#7c3aed',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});