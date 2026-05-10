import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { getPetResponse } from '../lib/groq';

export default function TalkScreen({ route, navigation }) {
  const { pet } = route.params;
  const [messages, setMessages] = useState([
    { role: 'pet', text: `Hi! I'm ${pet.name} 🐾 Talk to me!` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const response = await getPetResponse(pet, 'talking', userMsg);
    setMessages(prev => [...prev, { role: 'pet', text: response }]);

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('interactions').insert({
      pet_id: pet.id, user_id: user.id,
      action: 'talk', message: userMsg, pet_response: response,
    });
    setLoading(false);
    scrollRef.current?.scrollToEnd({ animated: true });
  }

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat with {pet.name}</Text>
        </View>
        <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={{ padding: 15 }}>
          {messages.map((msg, i) => (
            <View key={i} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.petBubble]}>
              <Text style={styles.bubbleText}>{msg.text}</Text>
            </View>
          ))}
          {loading && (
            <View style={styles.petBubble}>
              <Text style={styles.bubbleText}>typing...</Text>
            </View>
          )}
        </ScrollView>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Say something..."
            placeholderTextColor="#666"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, gap: 15 },
  back: { color: '#e94560', fontSize: 16 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  messages: { flex: 1 },
  bubble: { maxWidth: '80%', borderRadius: 15, padding: 12, marginBottom: 10 },
  petBubble: { backgroundColor: '#ffffff15', alignSelf: 'flex-start' },
  userBubble: { backgroundColor: '#e94560', alignSelf: 'flex-end' },
  bubbleText: { color: '#fff', fontSize: 15 },
  inputRow: { flexDirection: 'row', padding: 15, gap: 10 },
  input: { flex: 1, backgroundColor: '#ffffff15', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12, color: '#fff', borderWidth: 1, borderColor: '#ffffff20' },
  sendBtn: { backgroundColor: '#e94560', borderRadius: 25, paddingHorizontal: 20, justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: 'bold' },
});