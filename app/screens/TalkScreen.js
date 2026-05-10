import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import PixelTransition from '../components/PixelTransition';
import { getPetResponse } from '../lib/groq';

function AnimatedBubble({ msg }) {
  const isUser = msg.role === 'user';
  const slideAnim = useRef(new Animated.Value(isUser ? 50 : -50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 6, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true })
    ]).start();
  }, []);

  return (
    <Animated.View 
      className={Platform.OS === 'web' ? (isUser ? 'gradient-bubble' : 'glass-morphism') : ''}
      style={[styles.bubble, isUser ? styles.userBubble : styles.petBubble, { opacity: opacityAnim, transform: [{ translateX: slideAnim }] }]}
    >
      <Text style={styles.bubbleText}>{msg.text}</Text>
    </Animated.View>
  );
}

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
    <LinearGradient colors={['#1a0a0f', '#2d1420', '#3f1c2d']} style={styles.container}>
      <PixelTransition />
      {Platform.OS === 'web' && <div className="aurora-bg" style={{position:'absolute', top:0, left:0, right:0, bottom:0, opacity: 0.1}} />}
      {Platform.OS === 'web' && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 150 + 50}px`,
              height: `${Math.random() * 150 + 50}px`,
              backgroundColor: ['#e94560', '#4ecdc4', '#ffe66d'][i % 3],
              animationDelay: `${i * -2}s`
            }} />
          ))}
        </View>
      )}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat with {pet.name}</Text>
        </View>
        <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={{ padding: 15 }}>
          {messages.map((msg, i) => (
            <AnimatedBubble key={i} msg={msg} />
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
          <TouchableOpacity 
            className={Platform.OS === 'web' ? 'ripple-btn' : ''}
            style={styles.sendBtn} onPress={sendMessage}
          >
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
  petBubble: { backgroundColor: '#2d1420', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#f472b640' },
  userBubble: { backgroundColor: '#e11d48', alignSelf: 'flex-end' },
  bubbleText: { color: '#fff', fontSize: 15 },
  inputRow: { flexDirection: 'row', padding: 15, gap: 10 },
  input: { flex: 1, backgroundColor: '#2d1420', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12, color: '#fff', borderWidth: 1, borderColor: '#f472b640' },
  sendBtn: { backgroundColor: '#e11d48', borderRadius: 25, paddingHorizontal: 20, justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: 'bold' },
});