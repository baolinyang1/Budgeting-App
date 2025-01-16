import { RouteProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ChallengeType } from './types/ChallengeTypes';
import { ExpenseType, IncomeType } from './pages/ExpensesPage';

// Define the type for your Tab Navigator routes
type TabParamList = {
  Home: { triggerLogout?: boolean };
  LogIn: undefined;
  Reports: undefined;
  SignUp: undefined;
};

// Define a navigation type for useNavigation
export type HomeScreenNavigationProp = BottomTabNavigationProp<TabParamList, 'Home'>;


export type ChallengeParamList = {
  ChallengesHome: undefined;
  ChallengeInfo: {data: ChallengeType, refeshChallengesHome: ()=>Promise<void>};
}

export type ChallengeNaviagationProp = BottomTabNavigationProp<ChallengeParamList, 'ChallengeInfo'>

export type ExpenseParamList = {
  ExpensesPage: undefined;
  ExpenseInfo: {data: ExpenseType, refresh:()=>Promise<void>};
  IncomeInfo: {data: IncomeType, refresh:()=>Promise<void>}
}

export type ExpenseNaviagationProp = BottomTabNavigationProp<ExpenseParamList, 'ExpenseInfo'>

export type CalculationParamList = {
  CalculationsPage: undefined;
  Predictions: undefined;
}

export type CalculationNavigationProp = BottomTabNavigationProp<CalculationParamList, 'Predictions'>


