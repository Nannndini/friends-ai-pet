import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput, Animated, Platform, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { getPetResponse } from '../lib/groq';
import PixelTransition from '../components/PixelTransition';
import { useTheme, themes } from '../lib/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

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

const SPECIES_EMOJIS = {
  'Cat': '🐱', 'Dog': '🐶', 'Dragon': '🐲',
  'Bunny': '🐰', 'Fox': '🦊', 'Panda': '🐼'
};

const getGrowthBadge = (stage) => {
  if (stage === 0) return '🥚';
  if (stage <= 2) return '🐣';
  if (stage <= 4) return '🐥';
  if (stage <= 6) return '🐾';
  if (stage <= 8) return '⭐';
  return '👑';
};

export default function HomeScreen({ navigation }) {
  const { theme, themeName, changeTheme } = useTheme();
  const [petsList, setPetsList] = useState([]);
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const pet = petsList[currentPetIndex] || null;

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState('');
  const [coparentEmail, setCoparentEmail] = useState('');
  const [showCoparent, setShowCoparent] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [sharedWithEmail, setSharedWithEmail] = useState('');
  const [showThemeModal, setShowThemeModal] = useState(false);
  
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

  const fetchPets = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('pets')
      .select('*')
      .or(`owner_id.eq.${user.id},coparent_id.eq.${user.id}`)
      .order('created_at', { ascending: true });
      
    if (!data || data.length === 0) {
      navigation.replace('CreatePet');
    } else { 
      setPetsList(data);
      if (currentPetIndex >= data.length) setCurrentPetIndex(0);
      setLoading(false); 
    }
  }, [navigation, currentPetIndex]);

  useFocusEffect(
    useCallback(() => {
      fetchPets();
    }, [fetchPets])
  );

  useEffect(() => {
    async function fetchCoparentEmail() {
      setSharedWithEmail('');
      if (!pet) return;
      const { data: { user } } = await supabase.auth.getUser();
      const otherUserId = user.id === pet.owner_id ? pet.coparent_id : pet.owner_id;
      if (otherUserId) {
        const { data } = await supabase.from('profiles').select('email').eq('id', otherUserId).maybeSingle();
        if (data) setSharedWithEmail(data.email);
      }
    }
    fetchCoparentEmail();
  }, [pet]);

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
    
    // Update local state
    const newPetsList = [...petsList];
    newPetsList[currentPetIndex] = { ...pet, ...updates };
    setPetsList(newPetsList);
    setActionLoading(false);
  }

  async function addCoparent() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', coparentEmail.toLowerCase().trim())
      .maybeSingle();

    if (!data) return Alert.alert('❌ User not found', 'Make sure they have an account.');

    const { error: updateError } = await supabase
      .from('pets')
      .update({ coparent_id: data.id })
      .eq('id', pet.id);

    if (updateError) {
      Alert.alert('Error', updateError.message);
    } else {
      setShareLink('https://friends-ai-pet.vercel.app');
      setSharedWithEmail(coparentEmail);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (loading || !theme) return (
    <LinearGradient colors={theme?.bgGradient || ['#0a0a0f', '#13131a', '#1e1b4b']} style={styles.container}>
      <Text style={styles.loadingText}>Loading your pets...</Text>
    </LinearGradient>
  );

  const speciesEmoji = SPECIES_EMOJIS[pet.species] || '🐾';
  const growthBadge = getGrowthBadge(pet.growth_stage || 0);

  const MOOD_COLORS = {
    happy: theme.primary,
    sad: theme.primaryLight,
    neutral: theme.primary,
  };
  const moodColor = MOOD_COLORS[pet.mood] || theme.primary;

  const dynamicStyles = {
    headerTitle: { color: theme.textMain },
    signOut: { color: theme.primary },
    petCard: { backgroundColor: theme.cardBg },
    growthBadgeContainer: { backgroundColor: theme.primaryMuted, borderColor: theme.primaryLight },
    petName: { color: theme.textMain },
    petMeta: { color: theme.textMuted },
    petPersonality: { color: theme.primary },
    responseCard: { backgroundColor: theme.primaryMuted, borderColor: theme.primaryLight },
    responseText: { color: theme.textMain },
    statsCard: { backgroundColor: theme.cardBg },
    statLabel: { color: theme.textMuted },
    statValue: { color: theme.textMain },
    actionBtn: { backgroundColor: theme.cardBg },
    actionText: { color: theme.textMain },
    navBtn: { backgroundColor: theme.cardBg },
    navBtnText: { color: theme.textMain },
    coparentCard: { backgroundColor: theme.cardBg },
    coparentTitle: { color: theme.textMain },
    input: { backgroundColor: theme.cardBg, color: theme.textMain, borderColor: theme.primaryLight },
    inviteBtn: { backgroundColor: theme.primary },
    interactions: { color: theme.textMuted },
    switcherCard: { backgroundColor: theme.cardBg, borderColor: theme.primaryLight },
  };

  return (
    <LinearGradient colors={theme.bgGradient} style={styles.container}>
      <PixelTransition />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Friends</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => setShowThemeModal(true)} style={styles.iconBtn}>
              <Ionicons name="color-palette-outline" size={24} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={signOut}>
              <Text style={[styles.signOut, dynamicStyles.signOut]}>Sign out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pet Switcher */}
        <View style={styles.switcherContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.switcherScroll}>
            {petsList.map((p, idx) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => { setCurrentPetIndex(idx); setLastResponse(''); setShowCoparent(false); }}
                style={[
                  styles.switcherPet, 
                  dynamicStyles.switcherCard,
                  currentPetIndex === idx && { borderColor: theme.primary, borderWidth: 2 }
                ]}
              >
                <Text style={styles.switcherEmoji}>{SPECIES_EMOJIS[p.species] || '🐾'}</Text>
                <Text style={[styles.switcherName, { color: theme.textMain }]}>{p.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => navigation.navigate('CreatePet')}
              style={[styles.switcherPet, dynamicStyles.switcherCard, styles.addPetBtn]}
            >
              <Text style={[styles.addPetIcon, { color: theme.primary }]}>+</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Pet Display */}
        <View 
          className={Platform.OS === 'web' ? 'electric-border decay-card' : ''}
          style={[styles.petCard, dynamicStyles.petCard, { shadowColor: moodColor, shadowOpacity: 0.8, shadowRadius: 20, elevation: 10 }]}
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
            <View style={[styles.growthBadgeContainer, dynamicStyles.growthBadgeContainer]}>
              <Text style={styles.growthBadgeText}>{growthBadge}</Text>
            </View>
          </View>
          <Text 
            className={Platform.OS === 'web' ? 'shimmer-text' : ''}
            style={[styles.petName, dynamicStyles.petName, Platform.OS === 'web' && { fontWeight: '900' }]}
          >
            {pet.name}
          </Text>
          <Text style={[styles.petMeta, dynamicStyles.petMeta]}>{pet.species} • Stage {pet.growth_stage + 1} • {pet.mood} mood</Text>
          <Text style={[styles.petPersonality, dynamicStyles.petPersonality]}>✨ {pet.personality}</Text>
          {sharedWithEmail ? (
            <View style={[styles.sharedBadge, { backgroundColor: theme.primaryMuted, borderColor: theme.primaryLight }]}>
              <Text style={[styles.sharedBadgeText, { color: theme.textMain }]}>🤝 Shared with: {sharedWithEmail}</Text>
            </View>
          ) : null}
        </View>

        {/* Last Response */}
        {lastResponse ? (
          <Animated.View 
            className={Platform.OS === 'web' ? 'chat-tail' : ''}
            style={[styles.responseCard, dynamicStyles.responseCard, { opacity: fadeAnim }]}
          >
            <Text style={[styles.responseText, dynamicStyles.responseText]}>"{lastResponse}"</Text>
          </Animated.View>
        ) : null}

        {/* Stats */}
        <View style={[styles.statsCard, dynamicStyles.statsCard]}>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, dynamicStyles.statLabel]}>🍖 Hunger</Text>
            <View style={[styles.statBarBg, { backgroundColor: theme.statBarBg }]}>
              <View className={Platform.OS === 'web' ? 'stat-smooth' : ''} style={[styles.statBarFill, { width: `${pet.hunger}%`, backgroundColor: theme.primaryLight }]} />
            </View>
            <Text style={[styles.statValue, dynamicStyles.statValue]}>{pet.hunger}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, dynamicStyles.statLabel]}>😊 Happy</Text>
            <View style={[styles.statBarBg, { backgroundColor: theme.statBarBg }]}>
              <View className={Platform.OS === 'web' ? 'stat-smooth' : ''} style={[styles.statBarFill, { width: `${pet.happiness}%`, backgroundColor: theme.primary }]} />
            </View>
            <Text style={[styles.statValue, dynamicStyles.statValue]}>{pet.happiness}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, dynamicStyles.statLabel]}>⚡ Energy</Text>
            <View style={[styles.statBarBg, { backgroundColor: theme.statBarBg }]}>
              <View className={Platform.OS === 'web' ? 'stat-smooth' : ''} style={[styles.statBarFill, { width: `${pet.energy}%`, backgroundColor: theme.primaryLight }]} />
            </View>
            <Text style={[styles.statValue, dynamicStyles.statValue]}>{pet.energy}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity 
            className={Platform.OS === 'web' ? 'electric-border glow-hover' : ''}
            style={[styles.actionBtn, dynamicStyles.actionBtn, Platform.OS === 'web' && { transition: 'all 0.3s ease' }]} 
            onPress={() => doAction('feed')} disabled={actionLoading}
          >
            <Text style={styles.actionEmoji}>🍖</Text>
            <Text style={[styles.actionText, dynamicStyles.actionText]}>Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={Platform.OS === 'web' ? 'electric-border glow-hover' : ''}
            style={[styles.actionBtn, dynamicStyles.actionBtn, Platform.OS === 'web' && { transition: 'all 0.3s ease' }]} 
            onPress={() => doAction('play')} disabled={actionLoading}
          >
            <Text style={styles.actionEmoji}>🎮</Text>
            <Text style={[styles.actionText, dynamicStyles.actionText]}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={Platform.OS === 'web' ? 'electric-border glow-hover' : ''}
            style={[styles.actionBtn, dynamicStyles.actionBtn, Platform.OS === 'web' && { transition: 'all 0.3s ease' }]} 
            onPress={() => doAction('sleep')} disabled={actionLoading}
          >
            <Text style={styles.actionEmoji}>😴</Text>
            <Text style={[styles.actionText, dynamicStyles.actionText]}>Sleep</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={Platform.OS === 'web' ? 'electric-border glow-hover' : ''}
            style={[styles.actionBtn, dynamicStyles.actionBtn, Platform.OS === 'web' && { transition: 'all 0.3s ease' }]} 
            onPress={() => navigation.navigate('Talk', { pet })}
          >
            <Text style={styles.actionEmoji}>💬</Text>
            <Text style={[styles.actionText, dynamicStyles.actionText]}>Talk</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity style={[styles.navBtn, dynamicStyles.navBtn]} onPress={() => navigation.navigate('Journal', { petId: pet.id })}>
            <Text style={[styles.navBtnText, dynamicStyles.navBtnText]}>📖 Journal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navBtn, dynamicStyles.navBtn]} onPress={() => setShowCoparent(!showCoparent)}>
            <Text style={[styles.navBtnText, dynamicStyles.navBtnText]}>👫 Co-parent</Text>
          </TouchableOpacity>
        </View>

        {/* Co-parent Input */}
        {showCoparent && (
          <View style={[styles.coparentCard, dynamicStyles.coparentCard]}>
            {shareLink ? (
              <View>
                <Text style={[styles.coparentTitle, dynamicStyles.coparentTitle]}>🎉 Friend Added!</Text>
                <Text style={{color: theme.textMain, marginBottom: 15, lineHeight: 22}}>
                  Your friend has been added! Share this link with them: <Text style={{color: theme.primaryLight}}>{shareLink}</Text>
                  {'\n\n'}Tell them to sign up with <Text style={{color: theme.primary, fontWeight: 'bold'}}>{coparentEmail}</Text> and they'll see your pet!
                </Text>
                <TouchableOpacity style={[styles.inviteBtn, dynamicStyles.inviteBtn]} onPress={() => { setShowCoparent(false); setShareLink(''); setCoparentEmail(''); }}>
                  <Text style={styles.inviteBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={[styles.coparentTitle, dynamicStyles.coparentTitle]}>Invite a Co-parent</Text>
                <Text style={{color: theme.textMuted, marginBottom: 12, fontSize: 13}}>Enter your friend's email address below. Once invited, they will co-own this pet with you!</Text>
                <TextInput
                  style={[styles.input, dynamicStyles.input]}
                  placeholder="Friend's email..."
                  placeholderTextColor={theme.textMuted}
                  value={coparentEmail}
                  onChangeText={setCoparentEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity style={[styles.inviteBtn, dynamicStyles.inviteBtn]} onPress={addCoparent}>
                  <Text style={styles.inviteBtnText}>Generate Share Link</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <Text style={[styles.interactions, dynamicStyles.interactions]}>Total interactions: {displayInteractions}</Text>
      </ScrollView>

      {showLevelUp && (
        <Animated.View style={[styles.levelUpOverlay, { opacity: levelUpFade, backgroundColor: theme.primary }]} pointerEvents="none">
          <Text style={styles.levelUpText}>🎉 Grew up to Stage {pet.growth_stage + 1}! 🎉</Text>
        </Animated.View>
      )}

      {/* Theme Modal */}
      <Modal visible={showThemeModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.modalTitle, { color: theme.textMain }]}>Choose a Theme</Text>
            {Object.keys(themes).map(key => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.themeOption,
                  { borderColor: themeName === key ? theme.primary : theme.primaryLight, borderWidth: themeName === key ? 2 : 1 }
                ]}
                onPress={() => { changeTheme(key); setShowThemeModal(false); }}
              >
                <View style={[styles.themeColorPreview, { backgroundColor: themes[key].primary }]} />
                <Text style={[styles.themeOptionText, { color: theme.textMain, fontWeight: themeName === key ? 'bold' : 'normal' }]}>
                  {themes[key].name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.closeModalBtn, { backgroundColor: theme.primaryMuted }]} onPress={() => setShowThemeModal(false)}>
              <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 50 },
  loadingText: { color: '#fff', textAlign: 'center', marginTop: 100, fontSize: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconBtn: { padding: 5 },
  signOut: { fontSize: 14 },
  
  switcherContainer: { marginBottom: 20, marginHorizontal: -20 },
  switcherScroll: { paddingHorizontal: 20, gap: 10 },
  switcherPet: { 
    borderRadius: 15, padding: 10, paddingHorizontal: 15, 
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1
  },
  switcherEmoji: { fontSize: 20 },
  switcherName: { fontSize: 14, fontWeight: 'bold' },
  addPetBtn: { justifyContent: 'center', paddingHorizontal: 20 },
  addPetIcon: { fontSize: 20, fontWeight: 'bold' },

  petCard: { borderRadius: 20, padding: 30, alignItems: 'center', marginBottom: 15 },
  petEmojiContainer: { position: 'relative' },
  growthBadgeContainer: { position: 'absolute', bottom: -10, right: -10, borderRadius: 15, padding: 4, borderWidth: 1 },
  growthBadgeText: { fontSize: 24 },
  petEmoji: { fontSize: 80 },
  petName: { fontSize: 28, fontWeight: 'bold', marginTop: 10 },
  petMeta: { fontSize: 14, marginTop: 5 },
  petPersonality: { fontSize: 13, marginTop: 8 },
  sharedBadge: { marginTop: 12, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  sharedBadgeText: { fontSize: 12, fontWeight: '600' },

  responseCard: { borderRadius: 15, padding: 15, marginBottom: 15, borderWidth: 1 },
  responseText: { fontSize: 15, fontStyle: 'italic', textAlign: 'center' },
  
  statsCard: { borderRadius: 15, padding: 15, marginBottom: 15 },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statLabel: { fontSize: 13, width: 80 },
  statBarBg: { flex: 1, borderRadius: 10, height: 8, marginHorizontal: 10 },
  statBarFill: { height: 8, borderRadius: 10 },
  statValue: { fontSize: 13, width: 30, textAlign: 'right' },
  
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  actionBtn: { borderRadius: 15, padding: 15, alignItems: 'center', flex: 1, marginHorizontal: 4 },
  actionEmoji: { fontSize: 28 },
  actionText: { fontSize: 12, marginTop: 5 },
  
  navRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  navBtn: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  navBtnText: { fontSize: 14, fontWeight: '600' },
  
  coparentCard: { borderRadius: 15, padding: 20, marginBottom: 15 },
  coparentTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  input: { borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1 },
  inviteBtn: { borderRadius: 10, padding: 12, alignItems: 'center' },
  inviteBtnText: { color: '#fff', fontWeight: 'bold' },
  
  interactions: { textAlign: 'center', fontSize: 13, marginBottom: 30 },
  
  levelUpOverlay: {
    position: 'absolute', top: '40%', left: 20, right: 20,
    padding: 20, borderRadius: 20, alignItems: 'center', justifyContent: 'center', zIndex: 100,
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5
  },
  levelUpText: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  themeOption: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 10 },
  themeColorPreview: { width: 20, height: 20, borderRadius: 10, marginRight: 15 },
  themeOptionText: { fontSize: 16 },
  closeModalBtn: { marginTop: 10, padding: 15, borderRadius: 12, alignItems: 'center' }
});