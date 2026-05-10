import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
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
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
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
              style={[styles.speciesCard, species.name === s.name && styles.selected]}
              onPress={() => setSpecies(s)}
            >
              <Text style={styles.speciesEmoji}>{s.emoji}</Text>
              <Text style={styles.speciesName}>{s.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Personality</Text>
        {PERSONALITIES.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.personalityCard, personality === p && styles.selected]}
            onPress={() => setPersonality(p)}
          >
            <Text style={styles.personalityText}>{p}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.button} onPress={createPet} disabled={loading}>
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
    backgroundColor: '#ffffff10',
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
    backgroundColor: '#ffffff10',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  personalityText: { color: '#fff', fontSize: 14 },
  selected: { borderColor: '#e94560' },
  button: {
    backgroundColor: '#e94560',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});