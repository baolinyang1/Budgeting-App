import React, { useCallback, useEffect, useState } from 'react';

import { useFocusEffect, useNavigation, useRoute, RouteProp  } from '@react-navigation/native';
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from "firebase/firestore";

import { HomeScreenNavigationProp } from '@/Routes';
import { Center } from '@/components/ui/center';
import { Text } from '@/components/ui/text';
import { auth, db } from '@/firebase';
import { Alert, ScrollView } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { IncomeType } from './ExpensesPage';
import { Card } from '@/components/ui/card';
import HomePageExpense from '@/components/HomePageExpense';

export interface ExpenseType {
  name: string; 
  amount: number;
  year: number;
  month: number;
  date: number;
  category: string;
  description: string;
}

interface HomePageProps {
  setSignIn: (b: boolean) => void;
}

type HomeRouteParams = {
  Home: {
    triggerLogout?: boolean;
  };
};

const HomePage: React.FC<HomePageProps> = ({setSignIn}) => {
  const [expenses, setExpenses] = useState<ExpenseType[]>([]);
  const [incomes, setIncomes] = useState<IncomeType[]>([]);
  const [balanceAmount, setBalanceAmount] = React.useState<number | null>(null);

  const route = useRoute<RouteProp<HomeRouteParams, 'Home'>>();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  const getLatestExpenses = async () => {
      const authRef = auth();
      if (authRef.currentUser) {
          const expensesRef = collection(db, 'users', authRef.currentUser.uid, 'expenses');
          
          // Query to get the 5 latest expenses ordered by year, month, and date in descending order
          const expensesQuery = query(
              expensesRef,
              orderBy('year', 'desc'),
              orderBy('month', 'desc'),
              orderBy('date', 'desc'),
              limit(5)
          );

          const expensesSnap = await getDocs(expensesQuery);

          let latestExpenses: ExpenseType[] = [];
          expensesSnap.forEach((doc) => {
              const data = doc.data();
              latestExpenses.push({
                  name: data.name,
                  amount: data.amount,
                  year: data.year,
                  month: data.month,
                  date: data.date,
                  category: data.category,
                  description: data.description
              });
          });
          setExpenses(latestExpenses);
      }
  };

  useEffect(() => {
      getLatestExpenses();
  }, []);

  const getIncomes = async() => {
    const authRef = auth();
    if (authRef.currentUser) {
        const incomesRef = collection(db, 'users', authRef.currentUser.uid, 'incomes');
        const incomesSnap = await getDocs(incomesRef);

        let c: IncomeType[] = [];
        incomesSnap.forEach((i) => {
            var d = i.data();
            console.log(d);
            c.push({incomeName: d.incomeName, incomeAmount: d.incomeAmount, incomeYear: d.incomeYear, incomeMonth: d.incomeMonth,
                incomeDate: d.incomeDate, incomeDescription: d.incomeDescription});
        });
        setIncomes(c);
    }
  }

  React.useEffect(() => {
      getIncomes();
  }, [])

  useEffect(() => {
    if (route.params?.triggerLogout) {
      logOut();
      navigation.setParams({ triggerLogout: false }); // Reset the parameter to prevent repeated calls
    }
  }, [route.params?.triggerLogout]);

  function logOut() {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to log out?",
      [
          { text: "Cancel", style: "cancel" },
          { text: "Log Out", onPress:() => {signOut(auth()); setSignIn(false);} },
      ],
      { cancelable: false }
  );    
  }

  const getBalance = async (): Promise<number | null> => {
    try {
        const authRef = auth();
        if (authRef.currentUser) {
            const userDoc = doc(db, 'users', authRef.currentUser.uid);
            const balanceSnap = await getDoc(userDoc);

            if (balanceSnap.exists()) {
                const balanceData = balanceSnap.data();
                if (balanceData.balance !== undefined) {
                    console.log("Balance retrieved:", balanceData.balance);
                    return balanceData.balance;
                } else {
                    console.log("Balance field not found in the document.");
                    return null;
                }
            } else {
                console.log("Balance document does not exist for this user.");
                return null;
            }
        } else {
            console.log("No authenticated user.");
            return null;
        }
    } catch (error) {
        console.error("Error retrieving balance:", error);
        return null;
    }
  };

  React.useEffect(() => {
    getBalance();
  }, [])

  const fetchBalance = async () => {
    const balance = await getBalance();
    setBalanceAmount(balance);
  };

  React.useEffect(() => {
      fetchBalance();
  }, [expenses, incomes]); // Refetch balance when expenses or incomes change

  const fetchData = async () => {
    await getLatestExpenses();
    await getIncomes();
    const balance = await getBalance();
    setBalanceAmount(balance);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  return (
    <Center style={{ flex: 1, alignContent: 'center', backgroundColor: "#9fb8ad" }}>
      
      <ScrollView 
                contentContainerStyle={{ 
                    maxWidth: 400, 
                    alignItems: "center",
                    paddingBottom: 200, 
                }}
                style={{ width: "100%", maxHeight: "100%", flex: 1 }} 
            >
              <Card size="lg" style={{ padding: 20, marginVertical: 10, borderWidth: 1, borderRadius: 8, borderColor: "#000" }}>
                  <Heading size="lg" style={{alignSelf: "center", paddingBottom: 10}}>Total Balance</Heading>
                  <Text style={{ fontSize: 34, 
                                            textShadowColor: "#000000", // Black shadow for the outline
                                            textShadowOffset: { width: -1, height: 1 }, // Position the shadow around the text
                                            textShadowRadius: 1, // Blur radius for the shadow
                                            fontWeight: "bold", paddingTop: 15, color: "#37D45E", shadowColor: "black"}}>
                            ${balanceAmount !== null ? balanceAmount.toFixed(2) : "Loading..."}</Text>
              </Card>

              <Heading size="xl" style={{marginTop: 20, marginBottom: 10}}>Latest Expenses</Heading>
              <VStack space="sm" style={{ width: 350}}>
                {expenses.length === 0 ? (
                    <Text style={{ textAlign: "center" }}>You have no expenses added yet</Text>
                ) : (
                    expenses.map((expense) => (
                        <HomePageExpense
                            data={expense}
                            key={`${expense.year}-${expense.month}-${expense.date}-${expense.name}`}
                            refresh={getLatestExpenses}
                        />
                    ))
                )}
              </VStack>
              <Button onPress={logOut} size='lg' style={{margin: 20, backgroundColor: "#FF2400", borderColor: "black", borderWidth: 2}}>
                <ButtonText >LOG OUT</ButtonText>
              </Button>
            </ScrollView>
    </Center>
  );
};

export default HomePage;
