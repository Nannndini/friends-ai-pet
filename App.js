import { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from './app/lib/supabase';
import WelcomeScreen from './app/screens/WelcomeScreen';
import AuthScreen from './app/screens/AuthScreen';
import CreatePetScreen from './app/screens/CreatePetScreen';
import HomeScreen from './app/screens/HomeScreen';
import TalkScreen from './app/screens/TalkScreen';
import JournalScreen from './app/screens/JournalScreen';
import WebStyles from './app/components/WebStyles';
import PixelTrail from './app/components/PixelTrail';

const Stack = createStackNavigator();

export default function App() {
  const [session, setSession] = useState(undefined);
  const [hasPet, setHasPet] = useState(false);
  const [loading, setLoading] = useState(true);

  async function checkPet(userId) {
    const { data } = await supabase
      .from('pets')
      .select('id')
      .or(`owner_id.eq.${userId},coparent_id.eq.${userId}`)
      .maybeSingle();
    setHasPet(!!data);
    setLoading(false);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkPet(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkPet(session.user.id);
      else { setHasPet(false); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <WebStyles />
      <PixelTrail />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
          </>
        ) : !hasPet ? (
          <Stack.Screen name="CreatePet">
            {(props) => <CreatePetScreen {...props} onPetCreated={() => setHasPet(true)} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Talk" component={TalkScreen} />
            <Stack.Screen name="Journal" component={JournalScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}