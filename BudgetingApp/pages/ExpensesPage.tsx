import React from "react"

import { Center } from "@/components/ui/center"
import { Text } from "@/components/ui/text"
import { Button, ButtonText } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { VStack } from "@/components/ui/vstack"
import { Box } from "@/components/ui/box"
import { auth, db } from "@/firebase"
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore"
import Expense from "@/components/Expense"
import AddingExpensePopup from "@/components/popups/AddingExpensePopup"
import { ScrollView } from "react-native"
import { HStack } from "@/components/ui/hstack"
import Income from "@/components/Income"
import { Pressable } from "@/components/ui/pressable"

export interface ExpenseType {
    name: string, 
    amount: number,
    year: number,
    month: number,
    date: number,
    category: string,
    description: string
}

export interface IncomeType {
    incomeName: string,
    incomeAmount: number,
    incomeYear: number,
    incomeMonth: number,
    incomeDate: number,
    incomeDescription: string
}

export interface BalanceType {
    balanceName: string,
    balanceAmount: number
}

const ExpensesPage = () => {
    const [expenses, setExpenses] = React.useState<ExpenseType[]>([]);
    const [incomes, setIncomes] = React.useState<IncomeType[]>([]);
    const [balanceAmount, setBalanceAmount] = React.useState<number | null>(null);
    // const [showModal, setShowModal] = React.useState(false)

    const [showExpensesButton, setShowExpensesButton] = React.useState<boolean>(true);
    const [showIncomesButton, setShowIncomesButton] = React.useState<boolean>();

    const getExpenses = async() => {
        const authRef = auth();
        if (authRef.currentUser) {
            const expensesRef = collection(db, 'users', authRef.currentUser.uid, 'expenses');
            const expensesQuery = query(
                expensesRef,
                orderBy('year', 'desc'),
                orderBy('month', 'desc'),
                orderBy('date', 'desc'),
            );
            const expensesSnap = await getDocs(expensesQuery);

            let c: ExpenseType[] = [];
            expensesSnap.forEach((i) => {
                const d = i.data();
                console.log(d);
                c.push({name: d.name, amount: d.amount, year: d.year, month: d.month, date: d.date , category: d.category, description: d.description});
            });
            setExpenses(c);
        }
    }

    React.useEffect(() => {
        getExpenses();
    }, [])

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

    // Below are the functions for calculating, storing and fetching the total Balance
    // Also created a page for Balance Type named "Balance.tsx" in components folder

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


    return (
        <Center style={{flex: 1, alignItems: "center", backgroundColor: "#9fb8ad"}}>
            <ScrollView 
                contentContainerStyle={{ 
                    maxWidth: 400, 
                    alignItems: "center", 
                    paddingVertical: 10,
                    paddingBottom: 200 
                }}
                style={{ width: "100%", maxHeight: "100%"}} 
            >
                <AddingExpensePopup refreshExpenses={() => {getExpenses(); getIncomes(); fetchBalance(); getBalance();}}/>

                <Pressable onPress={() => {
                        setShowIncomesButton(true);
                        setShowExpensesButton(false);
                    }}>
                    <Box style={{ padding: 20, marginVertical: 10, borderWidth: 1, borderRadius: 8, borderColor: "#000", backgroundColor: "#ffffff"}}>
                        <Heading size="md" style={{alignSelf: "center"}}>Total Balance</Heading>
                        <Text style={{ fontSize: 34, 
                                            textShadowColor: "#000000", // Black shadow for the outline
                                            textShadowOffset: { width: -1, height: 1 }, // Position the shadow around the text
                                            textShadowRadius: 1, // Blur radius for the shadow
                                            fontWeight: "bold", paddingTop: 15, color: "#37D45E", shadowColor: "black"}}>
                            ${balanceAmount !== null ? balanceAmount.toFixed(2) : "Loading..."}</Text>
                    </Box>
                </Pressable>

                <HStack space="lg" style={{padding: 10}}>
                    <Button size="lg" onPress={() => {
                        setShowExpensesButton(true);
                        setShowIncomesButton(false);
                    }}>
                        <ButtonText>Show Expenses</ButtonText>
                    </Button>
                    <Button size="lg" onPress={() => {
                        setShowIncomesButton(true);
                        setShowExpensesButton(false);
                    }}>
                        <ButtonText>Show Incomes</ButtonText>
                    </Button>
                </HStack>

                
                
                {
                    showExpensesButton && 
                    (
                        <VStack space="sm" style={{paddingTop: 10, width: 370}}>
                            <Heading size="lg" style={{padding: 10, paddingTop: 15}}>List of Expenses</Heading>
                            {expenses.length === 0 ? (
                                <Text style={{ textAlign: "center" }}>You have no expenses added yet</Text>
                            ) : (
                                expenses.map((expense) => (
                                    <Expense
                                        data={expense}
                                        key={`${expense.year}-${expense.month}-${expense.date}-${expense.name}`}
                                        refresh={getExpenses}
                                    />
                                ))
                            )}
                        </VStack>
                    )
                }
                {
                    showIncomesButton && 
                    (
                        <VStack space="sm" style={{paddingTop: 10, width: 370}}>
                            <Heading size="lg" style={{padding: 10, paddingTop: 15}}>List of Incomes</Heading>
                            {incomes.map((c) => (
                                <Income data={c} key={c.incomeName} refresh={getIncomes} />
                            ))}
                            {incomes.length === 0 ? (
                                <Text style={{ textAlign: "center" }}>You have no incomes added yet</Text>
                            ) : (
                                incomes.map((c) => (
                                    <Income
                                        data={c}
                                        key={`${c.incomeYear}-${c.incomeMonth}-${c.incomeDate}-${c.incomeName}`}
                                        refresh={getExpenses}
                                    />
                                ))
                            )}
                        </VStack>
                    )
                }
            </ScrollView>
        </Center>
    )
}

export default ExpensesPage;


