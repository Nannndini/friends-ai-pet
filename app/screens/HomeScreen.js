import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { getPetResponse } from '../lib/groq';



function StatBar({ label, value, color }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statBarBg}>
        <View style={[styles.statBarFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState('');
  const [coparentEmail, setCoparentEmail] = useState('');
  const [showCoparent, setShowCoparent] = useState(false);

  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const levelUpFade = useRef(new Animated.Value(0)).current;
  const prevStageRef = useRef(null);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -15, duration: 1000, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [bounceAnim]);

  useEffect(() => {
    if (lastResponse) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }
  }, [lastResponse, fadeAnim]);

  useEffect(() => {
    if (pet && prevStageRef.current !== null && pet.growth_stage > prevStageRef.current) {
      setShowLevelUp(true);
      Animated.sequence([
        Animated.timing(levelUpFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(levelUpFade, { toValue: 0, duration: 500, useNativeDriver: true })
      ]).start(() => setShowLevelUp(false));
    }
    if (pet) prevStageRef.current = pet.growth_stage;
  }, [pet?.growth_stage]);

  const fetchPet = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('pets')
      .select('*')
      .or(`owner_id.eq.${user.id},coparent_id.eq.${user.id}`)
      .single();
    if (!data) navigation.replace('CreatePet');
    else { setPet(data); setLoading(false); }
  }, [navigation]);

  useEffect(() => { fetchPet(); }, [fetchPet]);

  async function doAction(action) {
    if (!pet || actionLoading) return;
    setActionLoading(true);
    const updates = {};
    if (action === 'feed') updates.hunger = Math.min(100, pet.hunger + 20);
    if (action === 'play') { updates.happiness = Math.min(100, pet.happiness + 20); updates.energy = Math.max(0, pet.energy - 10); }
    if (action === 'sleep') updates.energy = Math.min(100, pet.energy + 30);
    updates.interaction_count = pet.interaction_count + 1;
    const count = updates.interaction_count;
    if (count < 5) updates.growth_stage = 0;
    else if (count < 10) updates.growth_stage = 1;
    else if (count < 20) updates.growth_stage = 2;
    else if (count < 30) updates.growth_stage = 3;
    else if (count < 50) updates.growth_stage = 4;
    else updates.growth_stage = 5;
    updates.mood = updates.happiness > 70 ? 'happy' : updates.happiness > 40 ? 'neutral' : 'sad';

    const response = await getPetResponse({ ...pet, ...updates }, action);
    setLastResponse(response);

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('pets').update(updates).eq('id', pet.id);
    await supabase.from('interactions').insert({
      pet_id: pet.id, user_id: user.id, action, pet_response: response,
    });
    setPet({ ...pet, ...updates });
    setActionLoading(false);
  }

  async function addCoparent() {
    const { data: userData } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', coparentEmail)
      .single();
    if (!userData) return Alert.alert('User not found');
    await supabase.from('pets').update({ coparent_id: userData.id }).eq('id', pet.id);
    Alert.alert('✅ Co-parent added!');
    setShowCoparent(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (loading) return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
      <Text style={styles.loadingText}>Loading your pet...</Text>
    </LinearGradient>
  );

  const SPECIES_EMOJIS = {
    'Cat': '🐱',
    'Dog': '🐶',
    'Dragon': '🐲',
    'Bunny': '🐰',
    'Fox': '🦊',
    'Panda': '🐼'
  };

  const getGrowthBadge = (stage) => {
    if (stage === 0) return '🥚';
    if (stage <= 2) return '🐣';
    if (stage <= 4) return '🐥';
    if (stage <= 6) return '🐾';
    if (stage <= 8) return '⭐';
    return '👑';
  };

  const speciesEmoji = SPECIES_EMOJIS[pet.species] || '🐾';
  const growthBadge = getGrowthBadge(pet.growth_stage || 0);

  const MOOD_COLORS = {
    happy: '#ffe66d',
    sad: '#4ecdc4',
    neutral: '#e94560',
  };
  const moodColor = MOOD_COLORS[pet.mood] || '#ffffff';

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Friends</Text>
          <TouchableOpacity onPress={signOut}>
            <Text style={styles.signOut}>Sign out</Text>
          </TouchableOpacity>
        </View>

        {/* Pet Display */}
        <View style={[styles.petCard, { shadowColor: moodColor, shadowOpacity: 0.8, shadowRadius: 20, elevation: 10 }]}>
          <View style={styles.petEmojiContainer}>
            <Animated.Text style={[styles.petEmoji, { transform: [{ translateY: bounceAnim }] }]}>
              {speciesEmoji}
            </Animated.Text>
            <View style={styles.growthBadgeContainer}>
              <Text style={styles.growthBadgeText}>{growthBadge}</Text>
            </View>
          </View>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petMeta}>{pet.species} • Stage {pet.growth_stage + 1} • {pet.mood} mood</Text>
          <Text style={styles.petPersonality}>✨ {pet.personality}</Text>
        </View>

        {/* Last Response */}
        {lastResponse ? (
          <Animated.View style={[styles.responseCard, { opacity: fadeAnim }]}>
            <Text style={styles.responseText}>"{lastResponse}"</Text>
          </Animated.View>
        ) : null}

        {/* Stats */}
        <View style={styles.statsCard}>
          <StatBar label="🍖 Hunger" value={pet.hunger} color="#e94560" />
          <StatBar label="😊 Happy" value={pet.happiness} color="#4ecdc4" />
          <StatBar label="⚡ Energy" value={pet.energy} color="#ffe66d" />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => doAction('feed')} disabled={actionLoading}>
            <Text style={styles.actionEmoji}>🍖</Text>
            <Text style={styles.actionText}>Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => doAction('play')} disabled={actionLoading}>
            <Text style={styles.actionEmoji}>🎮</Text>
            <Text style={styles.actionText}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => doAction('sleep')} disabled={actionLoading}>
            <Text style={styles.actionEmoji}>😴</Text>
            <Text style={styles.actionText}>Sleep</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Talk', { pet })}>
            <Text style={styles.actionEmoji}>💬</Text>
            <Text style={styles.actionText}>Talk</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Journal', { petId: pet.id })}>
            <Text style={styles.navBtnText}>📖 Journal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => setShowCoparent(!showCoparent)}>
            <Text style={styles.navBtnText}>👫 Co-parent</Text>
          </TouchableOpacity>
        </View>

        {/* Co-parent Input */}
        {showCoparent && (
          <View style={styles.coparentCard}>
            <Text style={styles.coparentTitle}>Invite a Co-parent</Text>
            <TextInput
              style={styles.input}
              placeholder="Friend's email..."
              placeholderTextColor="#666"
              value={coparentEmail}
              onChangeText={setCoparentEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.inviteBtn} onPress={addCoparent}>
              <Text style={styles.inviteBtnText}>Send Invite</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.interactions}>Total interactions: {pet.interaction_count}</Text>
      </ScrollView>

      {showLevelUp && (
        <Animated.View style={[styles.levelUpOverlay, { opacity: levelUpFade }]} pointerEvents="none">
          <Text style={styles.levelUpText}>🎉 Grew up to Stage {pet.growth_stage + 1}! 🎉</Text>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 50 },
  loadingText: { color: '#fff', textAlign: 'center', marginTop: 100, fontSize: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  signOut: { color: '#e94560', fontSize: 14 },
  petCard: { backgroundColor: '#ffffff10', borderRadius: 20, padding: 30, alignItems: 'center', marginBottom: 15 },
  petEmojiContainer: { position: 'relative' },
  growthBadgeContainer: { position: 'absolute', bottom: -10, right: -10, backgroundColor: '#1a1a2e', borderRadius: 15, padding: 4, borderWidth: 1, borderColor: '#ffffff20' },
  growthBadgeText: { fontSize: 24 },
  petEmoji: { fontSize: 80 },
  petName: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 10 },
  petMeta: { color: '#a0a0c0', fontSize: 14, marginTop: 5 },
  petPersonality: { color: '#ffe66d', fontSize: 13, marginTop: 8 },
  responseCard: { backgroundColor: '#e9456020', borderRadius: 15, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#e9456040' },
  responseText: { color: '#fff', fontSize: 15, fontStyle: 'italic', textAlign: 'center' },
  statsCard: { backgroundColor: '#ffffff10', borderRadius: 15, padding: 15, marginBottom: 15 },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statLabel: { color: '#a0a0c0', fontSize: 13, width: 80 },
  statBarBg: { flex: 1, backgroundColor: '#ffffff15', borderRadius: 10, height: 8, marginHorizontal: 10 },
  statBarFill: { height: 8, borderRadius: 10 },
  statValue: { color: '#fff', fontSize: 13, width: 30, textAlign: 'right' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  actionBtn: { backgroundColor: '#ffffff15', borderRadius: 15, padding: 15, alignItems: 'center', flex: 1, marginHorizontal: 4 },
  actionEmoji: { fontSize: 28 },
  actionText: { color: '#fff', fontSize: 12, marginTop: 5 },
  navRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  navBtn: { flex: 1, backgroundColor: '#ffffff15', borderRadius: 12, padding: 14, alignItems: 'center' },
  navBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  coparentCard: { backgroundColor: '#ffffff10', borderRadius: 15, padding: 20, marginBottom: 15 },
  coparentTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  input: { backgroundColor: '#ffffff15', borderRadius: 10, padding: 12, color: '#fff', marginBottom: 10, borderWidth: 1, borderColor: '#ffffff20' },
  inviteBtn: { backgroundColor: '#e94560', borderRadius: 10, padding: 12, alignItems: 'center' },
  inviteBtnText: { color: '#fff', fontWeight: 'bold' },
  interactions: { color: '#a0a0c0', textAlign: 'center', fontSize: 13, marginBottom: 30 },
  levelUpOverlay: {
    position: 'absolute', top: '40%', left: 20, right: 20,
    backgroundColor: '#e94560e0', padding: 20, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', zIndex: 100,
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5
  },
  levelUpText: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
});