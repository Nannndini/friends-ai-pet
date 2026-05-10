import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';

export default function JournalScreen({ route, navigation }) {
  const { petId } = route.params;
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    async function fetchJournal() {
      const { data } = await supabase
        .from('interactions')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false })
        .limit(50);
      setEntries(data || []);
    }
    fetchJournal();
  }, [petId]);

  const actionEmoji = { feed: '🍖', play: '🎮', sleep: '😴', talk: '💬' };
  const actionColors = { feed: '#e94560', play: '#ffe66d', sleep: '#4ecdc4', talk: '#00d2ff' };

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📖 Pet Journal</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {entries.length === 0 && (
          <Text style={styles.empty}>No memories yet — start interacting with your pet!</Text>
        )}
        {entries.map((entry, index) => (
          <View 
            key={entry.id} 
            className={Platform.OS === 'web' ? 'stagger-fade-card tilt-hover' : ''}
            style={[styles.entry, Platform.OS === 'web' && { animationDelay: `${index * 0.1}s` }]}
          >
            <Text style={[styles.entryAction, { color: actionColors[entry.action] || '#ffe66d' }]}>
              {actionEmoji[entry.action] || '🐾'} {entry.action}
            </Text>
            {entry.message && <Text style={styles.entryMessage}>You: "{entry.message}"</Text>}
            {entry.pet_response && <Text style={styles.entryResponse}>Pet: "{entry.pet_response}"</Text>}
            <Text style={styles.entryTime}>{new Date(entry.created_at).toLocaleString()}</Text>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, gap: 15 },
  back: { color: '#e94560', fontSize: 16 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  empty: { color: '#a0a0c0', textAlign: 'center', marginTop: 50, fontSize: 16 },
  entry: { backgroundColor: '#ffffff10', borderRadius: 15, padding: 15, marginBottom: 12 },
  entryAction: { color: '#ffe66d', fontSize: 14, fontWeight: 'bold', marginBottom: 5, textTransform: 'capitalize' },
  entryMessage: { color: '#a0a0c0', fontSize: 13, marginBottom: 3 },
  entryResponse: { color: '#fff', fontSize: 14, fontStyle: 'italic', marginBottom: 5 },
  entryTime: { color: '#666', fontSize: 11 },
});