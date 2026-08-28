import "./global.css";
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { AlertProvider } from "./src/contexts/AlertProvider";

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import SearchServices from './src/screens/SearchServices';
import SearchInputScreen from './src/screens/SearchInputScreen';
import BusinessDetailScreen from './src/screens/BusinessDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AppointmentsScreen from './src/screens/AppointmentsScreen';
import BookingScreen from './src/screens/BookingScreen';
import SelectEmployeeScreen from './src/screens/SelectEmployeeScreen';
import AddServiceScreen from './src/screens/AddServiceScreen';
import BookingConfirmationScreen from './src/screens/BookingConfirmationScreen'
import FiltersScreen from './src/screens/FiltersScreen';
import ReviewsScreen from './src/screens/ReviewsScreen';
import PortfolioScreen from './src/screens/PortfolioScreen';
import PackagesScreen from './src/screens/PackagesScreen';
import GiftCardsScreen from './src/screens/GiftCardsScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import GiftCardDetailsScreen from "./src/screens/GiftCardDetailsScreen";
import LoadingScreen from "./src/components/LoadingScreen";
import BookingPendingScreen from './src/screens/BookingPendingScreen';
import BottomTabBar from './src/components/BottomTabBar';
import CreateReviewScreen from './src/screens/CreateReviewScreen';

import { View, Text, ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ExploreStack = createNativeStackNavigator()

function PlaceholderScreen({ label }) {
  return (
    <View className="flex-1 items-center justify-center bg-neutral-900">
      <Text className="text-white">{label} — em construção</Text>
    </View>
  );
}

function ExploreNavigator() {
  return (
    <ExploreStack.Navigator screenOptions={{ headerShown: false }}>
      <ExploreStack.Screen name="SearchServices"      component={SearchServices} />
      <ExploreStack.Screen name="SearchInput"         component={SearchInputScreen} />
      <ExploreStack.Screen name="BusinessDetail"      component={BusinessDetailScreen} />
      <ExploreStack.Screen name="Booking"             component={BookingScreen} />
      <ExploreStack.Screen name="SelectEmployee"      component={SelectEmployeeScreen} />
      <ExploreStack.Screen name="AddService"          component={AddServiceScreen} />
      <ExploreStack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
      <ExploreStack.Screen name="Filters"             component={FiltersScreen} />
      <ExploreStack.Screen name="Reviews" component={ReviewsScreen} />
      <ExploreStack.Screen name="Portfolio" component={PortfolioScreen} />
      <ExploreStack.Screen name="Packages" component={PackagesScreen} />
      <ExploreStack.Screen name="GiftCards" component={GiftCardsScreen} />
      <ExploreStack.Screen name="Details" component={DetailsScreen} />
      <ExploreStack.Screen name="GiftCardsDetail" component={GiftCardDetailsScreen} />
      <ExploreStack.Screen name="Loading" component={LoadingScreen} />
      <ExploreStack.Screen name="BookingPending" component={BookingPendingScreen} />

    </ExploreStack.Navigator>
  );
}
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explorar" component={ExploreNavigator} />
      <Tab.Screen name="Agendamentos" component={AppointmentsScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function Routes() {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#9f7300" size="large" />
      </View>
    );
  }
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="BusinessDetail" component={BusinessDetailScreen} />
          <Stack.Screen name="Search" component={SearchServices} />
          <Stack.Screen name="SearchInput" component={SearchInputScreen} />
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen name="SelectEmployee" component={SelectEmployeeScreen} />
          <Stack.Screen name="AddService" component={AddServiceScreen} />
          <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
          <Stack.Screen name="Reviews" component={ReviewsScreen} />
          <Stack.Screen name="Portfolio" component={PortfolioScreen} />
          <Stack.Screen name="Packages" component={PackagesScreen} />
          <Stack.Screen name="GiftCards" component={GiftCardsScreen} />
          <Stack.Screen name="Details" component={DetailsScreen} />
          <Stack.Screen name="GiftCardsDetail" component={GiftCardDetailsScreen} />
          <Stack.Screen name="Loading" component={LoadingScreen}/>
          <Stack.Screen name="BookingPending" component={BookingPendingScreen} />
          <Stack.Screen name="CreateReview" component={CreateReviewScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) return <LoadingScreen />;

  return (
    <AlertProvider>
      <AuthProvider>
        <NavigationContainer>
          <Routes />
        </NavigationContainer>
      </AuthProvider>
    </AlertProvider>
  );
}