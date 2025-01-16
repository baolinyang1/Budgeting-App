import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import LogInPage from './pages/LogInPage';
import HomePage from './pages/HomePage';
import SignUpPage from "./pages/SignUpPage";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import ReportsPage from "./pages/ReportsPage";
import ExpensesPage from "./pages/ExpensesPage";
import ChallengesPage from "./pages/ChallengesPage";
import ChallengeInfoPage from "./pages/ChallengeInfoPage";
import CalculationsPage from "./pages/CalculationsPage";
import ExpenseInfoPage from "./pages/ExpenseInfoPage";
import IncomeInfoPage from "./pages/IncomeInfoPage";
import ExpenseReportPage from "./pages/ExpenseReportPage";


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const ChallengesStack = createNativeStackNavigator();
const ExpensesStack = createNativeStackNavigator();
const CalculationStack = createNativeStackNavigator();

function ChallengesNavigation () {
  return (
    <ChallengesStack.Navigator>
      <ChallengesStack.Screen name="Challenges" component={ChallengesPage} 
      options={{
        headerStyle: { backgroundColor: "#3F403F" }, 
        headerTitleStyle: { color: "#E6E8E6" },
      }}/>
      <ChallengesStack.Screen name="ChallengeInfo" options={{headerBackTitle: "Challenges", headerTitle: "", headerStyle: { backgroundColor: "#3F403F" }, 
        headerTitleStyle: { color: "#E6E8E6" },}} component={ChallengeInfoPage} />
    </ChallengesStack.Navigator>
  )
}

function ExpensesNavigation () {
  return (
    <ExpensesStack.Navigator>
      <ExpensesStack.Screen name="ExpensesPage" options={{headerShown: false}} component={ExpensesPage} />
      <ExpensesStack.Screen name="ExpenseInfo" options={{headerShown: false}} component={ExpenseInfoPage} />
      <ExpensesStack.Screen name="IncomeInfo" options={{headerShown: false}} component={IncomeInfoPage} />
    </ExpensesStack.Navigator>
  )
}

function CalculationNavigation() {
  return (
    <CalculationStack.Navigator>
      <CalculationStack.Screen name="Percent Calculation" component={CalculationsPage} 
      options={{
        headerStyle: { backgroundColor: "#3F403F" }, 
        headerTitleStyle: { color: "#E6E8E6" },
      }}/>
      <CalculationStack.Screen name="Predictions" component={ExpenseReportPage} 
      options={{
        headerStyle: { backgroundColor: "#3F403F" }, 
        headerTitleStyle: { color: "#E6E8E6" },
      }}/>
    </CalculationStack.Navigator>
  );
}

export default function App() {
    const [isSignedIn, setIsSignedIn] = React.useState<boolean>(false);

    const setSignIn = (b: boolean) => {
        setIsSignedIn(b);
    };

  return (
    <GluestackUIProvider>
      <NavigationContainer>
        {isSignedIn ? (
          <Tab.Navigator 
          screenOptions={{ tabBarStyle: { position: 'absolute', backgroundColor: "#3F403F" },}} 
          initialRouteName='Home'
          >
            <Tab.Screen name="Calculations" options={{headerShown: false, headerStyle: { backgroundColor: "#3F403F" }, 
              headerTitleStyle: { color: "#E6E8E6" },
              tabBarIcon: ({ color, size }) => (
                <Icon name="calculator" color={color || "#FFD700"} size={size || 24} />
              )}} component={CalculationNavigation} />
            <Tab.Screen name="Reports" component={ReportsPage} 
            options={{
              headerStyle: { backgroundColor: "#3F403F" }, 
              headerTitleStyle: { color: "#E6E8E6" },
              tabBarIcon: ({ color, size }) => (
                <Icon name="bar-chart" color={color || "#00FF00"} size={size || 24} />
              )
            }}/>
            {/* <Tab.Screen name="Home" component={HomePage} /> */}
            <Tab.Screen name="Home"
            options={({ navigation }) =>({
              headerStyle: { backgroundColor: "#3F403F" }, 
              headerTitleStyle: { color: "#E6E8E6" },
              tabBarIcon: ({ color, size }) => (
                <Icon name="home" color={color || "#FFFFFF"} size={size || 24} />
              ),
              headerRight: () => (
                <Icon 
                  name="sign-out" // Icon for log out (FontAwesome's "sign-out")
                  size={30} 
                  color="red" 
                  style={{ marginRight: 15 }} // Add spacing from the edge
                  onPress={() => {
                    // Call your log out function here
                    navigation.navigate('Home', { triggerLogout: true });
                    console.log('Log out clicked');
                  }} 
                />
              ),
            })}>
              {(props) => <HomePage {...props} setSignIn={setSignIn} />}
            </Tab.Screen>
            <Tab.Screen name="Expenses" component={ExpensesNavigation} 
            options={{
              headerStyle: { backgroundColor: "#3F403F" }, 
              headerTitleStyle: { color: "#E6E8E6" },
              tabBarIcon: ({ color, size }) => (
                <Icon name="money" color={color || "#FF4500"} size={size || 24} />
              )
            }}/>
            <Tab.Screen name="Challenges" options={{headerShown: false, headerStyle: { backgroundColor: "#3F403F" }, 
              headerTitleStyle: { color: "#E6E8E6" },
              tabBarIcon: ({ color, size }) => (
                <Icon name="trophy" color={color || "#00CED1"} size={size || 24} />
              )}} component={ChallengesNavigation} 
            />
          </Tab.Navigator>
        ) : (
          <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: "#3F403F",  }, headerTitleStyle: {color: "#E6E8E6"} }} initialRouteName="LogIn">
            <Stack.Screen name="LogIn">
              {(props) => <LogInPage {...props} setSignIn={setSignIn} />}
            </Stack.Screen>
            <Stack.Screen name="SignUp">
              {(props) => <SignUpPage {...props} setSignIn={setSignIn} />}
            </Stack.Screen>
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </GluestackUIProvider>
  );
}

