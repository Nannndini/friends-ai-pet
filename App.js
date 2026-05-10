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

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (isMounted) setInitialRoute('Welcome');
        return;
      }
      
      const { data: pet } = await supabase
        .from('pets')
        .select('*')
        .or(`owner_id.eq.${session.user.id},coparent_id.eq.${session.user.id}`)
        .single();
        
      if (isMounted) {
        if (!pet) {
          setInitialRoute('CreatePet');
        } else {
          setInitialRoute('Home');
        }
      }
    }
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        if (isMounted) setInitialRoute('Welcome');
      } else {
        const { data: pet } = await supabase
          .from('pets')
          .select('*')
          .or(`owner_id.eq.${session.user.id},coparent_id.eq.${session.user.id}`)
          .single();
          
        if (isMounted) {
          if (!pet) {
            setInitialRoute('CreatePet');
          } else {
            setInitialRoute('Home');
          }
        }
      }
    });

    return () => {
      isMounted = false;
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="CreatePet" component={CreatePetScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Talk" component={TalkScreen} />
        <Stack.Screen name="Journal" component={JournalScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}