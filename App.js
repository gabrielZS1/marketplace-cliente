import "./global.css";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { AlertProvider } from "./src/contexts/AlertProvider";
import { colors } from "./src/theme";

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import SearchServices from './src/screens/SearchServices';
import SearchInputScreen from './src/screens/SearchInputScreen';
import BusinessDetailScreen from './src/screens/BusinessDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DeleteAccountScreen from './src/screens/DeleteAccountScreen';
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
import IntroSplash from "./src/components/IntroSplash";
import BookingPendingScreen from './src/screens/BookingPendingScreen';
import BottomTabBar from './src/components/BottomTabBar';
import CreateReviewScreen from './src/screens/CreateReviewScreen';

import { View } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ExploreStack = createNativeStackNavigator()

// Rotas do ExploreNavigator em que a barra inferior deve continuar aparecendo.
// Qualquer outra rota (fluxos internos como detalhe do negócio, agendamento,
// avaliações...) esconde a barra — assim os botões de rodapé dessas telas não
// ficam mais cobertos.
const TAB_BAR_VISIBLE_ROUTES = ["SearchServices", "SearchInput"];

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
      tabBar={(props) => {
        const route = props.state.routes[props.state.index];
        const focused =
          getFocusedRouteNameFromRoute(route) ??
          (route.name === "Explorar" ? "SearchServices" : route.name);

        if (route.name === "Explorar" && !TAB_BAR_VISIBLE_ROUTES.includes(focused)) {
          return null;
        }

        return <BottomTabBar {...props} />;
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Explorar"
        component={ExploreNavigator}
        listeners={({ navigation }) => ({
          // A aba "Explorar" é independente: ao tocar nela direto na barra
          // inferior, sempre volta para a lista sem filtro — sem isso, ela
          // ficava presa na última categoria escolhida a partir da Home.
          tabPress: () => {
            navigation.navigate("Explorar", {
              screen: "SearchServices",
              params: { category: "ALL" },
            });
          },
        })}
      />
      <Tab.Screen name="Agendamentos" component={AppointmentsScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function Routes() {
  const { token, loading } = useAuth();
  if (loading) {
    return <LoadingScreen />;
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
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

// Avisa a abertura animada quando a sessão já foi restaurada.
function BootSignal({ onReady }) {
  const { loading } = useAuth();
  useEffect(() => {
    if (!loading) onReady();
  }, [loading]);
  return null;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const [authReady, setAuthReady] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <StatusBar style={showIntro ? "light" : "dark"} />

      {fontsLoaded ? (
        <AlertProvider>
          <AuthProvider>
            <BootSignal onReady={() => setAuthReady(true)} />
            <NavigationContainer>
              <Routes />
            </NavigationContainer>
          </AuthProvider>
        </AlertProvider>
      ) : null}

      {/* Abertura animada por cima de tudo enquanto o app inicializa */}
      {showIntro ? (
        <IntroSplash
          ready={fontsLoaded && authReady}
          onFinish={() => setShowIntro(false)}
        />
      ) : null}
    </View>
  );
}
