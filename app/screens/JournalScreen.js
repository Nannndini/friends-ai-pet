import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import PixelTransition from '../components/PixelTransition';
import { useTheme } from '../lib/ThemeContext';

export default function JournalScreen({ route, navigation }) {
  const { theme } = useTheme();
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
  const actionColors = { feed: theme.primaryLight, play: theme.primary, sleep: theme.primaryLight, talk: theme.primary };

  return (
    <LinearGradient colors={theme.bgGradient} style={styles.container}>
      <PixelTransition />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.back, { color: theme.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textMain }]}>📖 Pet Journal</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {entries.length === 0 && (
          <Text style={[styles.empty, { color: theme.textMuted }]}>No memories yet — start interacting with your pet!</Text>
        )}
        <View className={Platform.OS === 'web' ? 'timeline-container' : ''}>
          {entries.map((entry, index) => (
            <View 
              key={entry.id} 
              className={Platform.OS === 'web' ? 'stagger-fade-card tilt-hover' : ''}
              style={[styles.entry, { backgroundColor: theme.cardBg, borderColor: theme.primaryLight }, Platform.OS === 'web' && { animationDelay: `${index * 0.1}s` }]}
            >
              {Platform.OS === 'web' && <div className="timeline-dot" />}
              <Text style={[styles.entryAction, { color: actionColors[entry.action] || theme.primary }]}>
                {actionEmoji[entry.action] || '🐾'} {entry.action}
              </Text>
              {entry.message && <Text style={[styles.entryMessage, { color: theme.textMuted }]}>You: "{entry.message}"</Text>}
              {entry.pet_response && <Text style={[styles.entryResponse, { color: theme.textMain }]}>Pet: "{entry.pet_response}"</Text>}
              <Text style={[styles.entryTime, { color: theme.textMuted }]}>{new Date(entry.created_at).toLocaleString()}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, gap: 15 },
  back: { color: '#ff6b8a', fontSize: 16 },
  headerTitle: { color: '#2d1b2e', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  empty: { color: '#8b5a6b', textAlign: 'center', marginTop: 50, fontSize: 16 },
  entry: { backgroundColor: '#ffffff', borderRadius: 15, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#ffb3c1' },
  entryAction: { color: '#ff6b8a', fontSize: 14, fontWeight: 'bold', marginBottom: 5, textTransform: 'capitalize' },
  entryMessage: { color: '#8b5a6b', fontSize: 13, marginBottom: 3 },
  entryResponse: { color: '#2d1b2e', fontSize: 14, fontStyle: 'italic', marginBottom: 5 },
  entryTime: { color: '#8b5a6b', fontSize: 11 },
});