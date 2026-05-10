import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { getPetResponse } from '../lib/groq';
import PixelTransition from '../components/PixelTransition';

function useCounter(targetValue) {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (targetValue === undefined || targetValue === null) return;
    let startTimestamp = null;
    const duration = 1000;
    const startValue = prevTarget.current;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setValue(Math.floor(progress * (targetValue - startValue) + startValue));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    
    if (targetValue !== startValue) {
      if (Platform.OS === 'web') requestAnimationFrame(step);
      else setValue(targetValue);
      prevTarget.current = targetValue;
    }
  }, [targetValue]);

  return value;
}



function StatBar({ label, value, color }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statBarBg}>
        <View 
          className={Platform.OS === 'web' ? 'stat-smooth' : ''}
          style={[styles.statBarFill, { width: `${value}%`, backgroundColor: color }]} 
        />
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
  const [shareLink, setShareLink] = useState('');
  const displayInteractions = useCounter(pet?.interaction_count);

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
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', coparentEmail.toLowerCase().trim())
      .maybeSingle();

    console.log('coparent search result:', data, error);

    if (!data) return Alert.alert('❌ User not found', 'Make sure they have an account.');

    const { error: updateError } = await supabase
      .from('pets')
      .update({ coparent_id: data.id })
      .eq('id', pet.id);

    if (updateError) {
      console.log('coparent update error:', updateError);
      Alert.alert('Error', updateError.message);
    } else {
      setShareLink('https://friends-ai-pet.vercel.app');
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (loading) return (
    <LinearGradient colors={['#0a0a0f', '#13131a', '#1e1b4b']} style={styles.container}>
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
    happy: '#ff6b8a',
    sad: '#ffb3c1',
    neutral: '#ff6b8a',
  };
  const moodColor = MOOD_COLORS[pet.mood] || '#ff6b8a';

  return (
    <LinearGradient colors={['#fff0f3', '#ffe4e8', '#ffffff']} style={styles.container}>
      <PixelTransition />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Friends</Text>
          <TouchableOpacity onPress={signOut}>
            <Text style={styles.signOut}>Sign out</Text>
          </TouchableOpacity>
        </View>

        {/* Pet Display */}
        <View 
          className={Platform.OS === 'web' ? 'electric-border decay-card' : ''}
          style={[styles.petCard, { shadowColor: moodColor, shadowOpacity: 0.8, shadowRadius: 20, elevation: 10 }]}
        >
          <View style={styles.petEmojiContainer}>
            {Platform.OS === 'web' && (
              <>
                <div className="sparkle" style={{ left: '-20px', top: '10px', animationDelay: '0s' }}>✨</div>
                <div className="sparkle" style={{ right: '-20px', top: '30px', animationDelay: '0.5s' }}>⭐</div>
                <div className="sparkle" style={{ left: '10px', top: '-20px', animationDelay: '1s' }}>💫</div>
              </>
            )}
            <Animated.Text style={[styles.petEmoji, { transform: [{ translateY: bounceAnim }] }]}>
              {speciesEmoji}
            </Animated.Text>
            <View style={styles.growthBadgeContainer}>
              <Text style={styles.growthBadgeText}>{growthBadge}</Text>
            </View>
          </View>
          <Text 
            className={Platform.OS === 'web' ? 'shimmer-text' : ''}
            style={[styles.petName, Platform.OS === 'web' && { fontWeight: '900' }]}
          >
            {pet.name}
          </Text>
          <Text style={styles.petMeta}>{pet.species} • Stage {pet.growth_stage + 1} • {pet.mood} mood</Text>
          <Text style={styles.petPersonality}>✨ {pet.personality}</Text>
        </View>

        {/* Last Response */}
        {lastResponse ? (
          <Animated.View 
            className={Platform.OS === 'web' ? 'chat-tail' : ''}
            style={[styles.responseCard, { opacity: fadeAnim }]}
          >
            <Text style={styles.responseText}>"{lastResponse}"</Text>
          </Animated.View>
        ) : null}

        {/* Stats */}
        <View style={styles.statsCard}>
          <StatBar label="🍖 Hunger" value={pet.hunger} color="#ffb3c1" />
          <StatBar label="😊 Happy" value={pet.happiness} color="#ff6b8a" />
          <StatBar label="⚡ Energy" value={pet.energy} color="#ffb3c1" />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity 
            className={Platform.OS === 'web' ? 'electric-border glow-hover' : ''}
            style={[styles.actionBtn, Platform.OS === 'web' && { transition: 'all 0.3s ease' }]} 
            onPress={() => doAction('feed')} disabled={actionLoading}
          >
            <Text style={styles.actionEmoji}>🍖</Text>
            <Text style={styles.actionText}>Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={Platform.OS === 'web' ? 'electric-border glow-hover' : ''}
            style={[styles.actionBtn, Platform.OS === 'web' && { transition: 'all 0.3s ease' }]} 
            onPress={() => doAction('play')} disabled={actionLoading}
          >
            <Text style={styles.actionEmoji}>🎮</Text>
            <Text style={styles.actionText}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={Platform.OS === 'web' ? 'electric-border glow-hover' : ''}
            style={[styles.actionBtn, Platform.OS === 'web' && { transition: 'all 0.3s ease' }]} 
            onPress={() => doAction('sleep')} disabled={actionLoading}
          >
            <Text style={styles.actionEmoji}>😴</Text>
            <Text style={styles.actionText}>Sleep</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={Platform.OS === 'web' ? 'electric-border glow-hover' : ''}
            style={[styles.actionBtn, Platform.OS === 'web' && { transition: 'all 0.3s ease' }]} 
            onPress={() => navigation.navigate('Talk', { pet })}
          >
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
            {shareLink ? (
              <View>
                <Text style={styles.coparentTitle}>🎉 Friend Added!</Text>
                <Text style={{color: '#fecdd3', marginBottom: 15, lineHeight: 22}}>
                  Your friend has been added! Share this link with them: <Text style={{color: '#f472b6'}}>{shareLink}</Text>
                  {'\n\n'}Tell them to sign up with <Text style={{color: '#fff', fontWeight: 'bold'}}>{coparentEmail}</Text> and they'll see your pet!
                </Text>
                <TouchableOpacity style={styles.inviteBtn} onPress={() => { setShowCoparent(false); setShareLink(''); setCoparentEmail(''); }}>
                  <Text style={styles.inviteBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
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
                  <Text style={styles.inviteBtnText}>Generate Share Link</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <Text style={styles.interactions}>Total interactions: {displayInteractions}</Text>
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
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#2d1b2e' },
  signOut: { color: '#ff6b8a', fontSize: 14 },
  petCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 30, alignItems: 'center', marginBottom: 15 },
  petEmojiContainer: { position: 'relative' },
  growthBadgeContainer: { position: 'absolute', bottom: -10, right: -10, backgroundColor: '#fff0f3', borderRadius: 15, padding: 4, borderWidth: 1, borderColor: '#ffb3c1' },
  growthBadgeText: { fontSize: 24 },
  petEmoji: { fontSize: 80 },
  petName: { fontSize: 28, fontWeight: 'bold', color: '#2d1b2e', marginTop: 10 },
  petMeta: { color: '#8b5a6b', fontSize: 14, marginTop: 5 },
  petPersonality: { color: '#ffb3c1', fontSize: 13, marginTop: 8 },
  responseCard: { backgroundColor: '#fff0f3', borderRadius: 15, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#ffb3c1' },
  responseText: { color: '#2d1b2e', fontSize: 15, fontStyle: 'italic', textAlign: 'center' },
  statsCard: { backgroundColor: '#ffffff', borderRadius: 15, padding: 15, marginBottom: 15 },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statLabel: { color: '#8b5a6b', fontSize: 13, width: 80 },
  statBarBg: { flex: 1, backgroundColor: '#ffe4e8', borderRadius: 10, height: 8, marginHorizontal: 10 },
  statBarFill: { height: 8, borderRadius: 10 },
  statValue: { color: '#2d1b2e', fontSize: 13, width: 30, textAlign: 'right' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  actionBtn: { backgroundColor: '#ffffff', borderRadius: 15, padding: 15, alignItems: 'center', flex: 1, marginHorizontal: 4 },
  actionEmoji: { fontSize: 28 },
  actionText: { color: '#2d1b2e', fontSize: 12, marginTop: 5 },
  navRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  navBtn: { flex: 1, backgroundColor: '#ffffff', borderRadius: 12, padding: 14, alignItems: 'center' },
  navBtnText: { color: '#2d1b2e', fontSize: 14, fontWeight: '600' },
  coparentCard: { backgroundColor: '#ffffff', borderRadius: 15, padding: 20, marginBottom: 15 },
  coparentTitle: { color: '#2d1b2e', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  input: { backgroundColor: '#ffffff', borderRadius: 10, padding: 12, color: '#2d1b2e', marginBottom: 10, borderWidth: 1, borderColor: '#ffb3c1' },
  inviteBtn: { backgroundColor: '#ff6b8a', borderRadius: 10, padding: 12, alignItems: 'center' },
  inviteBtnText: { color: '#fff', fontWeight: 'bold' },
  interactions: { color: '#8b5a6b', textAlign: 'center', fontSize: 13, marginBottom: 30 },
  levelUpOverlay: {
    position: 'absolute', top: '40%', left: 20, right: 20,
    backgroundColor: 'rgba(255, 107, 138, 0.9)', padding: 20, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', zIndex: 100,
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5
  },
  levelUpText: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
});