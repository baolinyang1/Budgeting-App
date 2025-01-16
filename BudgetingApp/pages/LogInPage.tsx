import React from "react";
import { useNavigation } from "@react-navigation/native";

// gluestack imports
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

// Firebase imports
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase";

import { HomeScreenNavigationProp } from "@/Routes";
import { AlertCircleIcon, EyeIcon, EyeOffIcon, Icon } from "lucide-react-native";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { ExpenseType, IncomeType } from "./ExpensesPage";

interface LogInPageProps {
    setSignIn: (b: boolean) => void;
  }

const LogInPage: React.FC<LogInPageProps> = ({ setSignIn }) => {

    const [emailInput, setEmailInput] = React.useState<string>("");
    const [passwordInput, setPasswordInput] = React.useState<string>("");

    const [showPassword, setShowPassword] = React.useState(false);
    const handlePasswordState = () => {
        setShowPassword((showState) => {
        return !showState
        });
    }

    const nav = useNavigation<HomeScreenNavigationProp>();

    const [isError, setIsError] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string>("");

    const fetchIncomes = async (uid: string): Promise<IncomeType[]> => {
        const incomesRef = collection(db, 'users', uid, 'incomes');
        const incomesSnap = await getDocs(incomesRef);
    
        if (incomesSnap.empty) {
            console.log("No incomes found.");
            return [];
        }

        return incomesSnap.docs.map((i) => {
            var d = i.data();
            return {incomeName: d.incomeName, incomeAmount: d.incomeAmount, incomeYear: d.incomeYear, incomeMonth: d.incomeMonth,
                incomeDate: d.incomeDate, incomeDescription: d.incomeDescription};
        });
    };

    const fetchExpenses = async (uid: string): Promise<ExpenseType[]> => {
        const expensesRef = collection(db, 'users', uid, 'expenses');
        const expensesSnap = await getDocs(expensesRef);

        if (expensesSnap.empty) {
            console.log("no expenses found");
            return [];
        }
        return expensesSnap.docs.map((i) => {
            const d = i.data();
            return {name: d.name, amount: d.amount, year: d.year, month: d.month, date: d.date , category: d.category, description: d.description};
        });
    }

    const updateUser = async (uid: string) => {
        const userCollection = collection(db, 'users');
        const userDoc = doc(userCollection, uid);
        const userSnap = await getDoc(userDoc);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            if (!userData.uid || !userData.email) {
                const updatedData = {
                    uid: uid,
                    email: emailInput,
                }
                await setDoc(userDoc, updatedData, {merge: true});
                console.log("user uid and email updated");
            }

            if (!userData.balance) {
                const [incomes, expenses] = await Promise.all([
                    fetchIncomes(uid),
                    fetchExpenses(uid),
                ]);

                const calculatedBalance = incomes.reduce((sum, income) => sum + income.incomeAmount, 0) -
                    expenses.reduce((sum, expense) => sum + expense.amount, 0);

                const updatedData = {
                    balance: calculatedBalance
                }
                await setDoc(userDoc, updatedData, {merge: true});
                console.log("calculated and updated balance (it did not exist yet)");
            }
        }
    }

    const LogIn = async () => {
        console.log("login");
        const appAuth = auth();
        signInWithEmailAndPassword(appAuth, emailInput, passwordInput)
            .then(async (userCredential) => {
                // await Promise.all([getIncomes(), getExpenses()]);
                await updateUser(userCredential.user.uid);
                setSignIn(true);
            }).catch((err) => {
                console.log(err);
                // error messages need to be better formated for user probably need to catch different types to get the specific messages for each without the other unneeded stuff
                setErrorMessage(err.message);
                setIsError(true);
            });
    };

    const styles = StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: '#9fb8ad',
          alignItems: 'center',
          justifyContent: 'center',
        },
        image: {
          flex: 1,
          height: "100%",
          width: "70%",
          maxHeight: 160,
          maxWidth: 160,
          backgroundColor: '#9fb8ad',
          marginTop: -150,
          marginBottom: 30
        },
    });

    const blurhash =
        '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';



    return (
        <Center style={{ flex: 1, justifyContent: 'center', backgroundColor: "#9fb8ad"}}>
        {/* <Box className="p-5 max-w-96 border border-background-300 rounded-lg"> */}
            <Image
                    style={styles.image}
                    source={require('/assets/SpendSmart.png')}
                    placeholder={require('/assets/SpendSmartIcon.jpg')}
                    contentFit="cover"
                    transition={1000}
                />
            <VStack space="md" reversed={false} style={{alignItems:"stretch", width: '70%'}}>
                <FormControl size="lg">
                    <FormControlLabel>
                        <FormControlLabelText style={{ fontSize: 18, width: '200%' }}>Email</FormControlLabelText>
                    </FormControlLabel>
                    <Input style={{borderColor: "#3f403f", backgroundColor: "#e6e8e6"}}>
                        <InputField onChangeText={(e: string) => setEmailInput(e)} />
                    </Input>
                </FormControl>
                <FormControl size="lg" isInvalid={isError}>
                    <FormControlLabel>
                        <FormControlLabelText style={{ fontSize: 18, width: '200%' }}>Password</FormControlLabelText>
                    </FormControlLabel>
                    <Input style={{borderColor: "#3f403f", backgroundColor: "#e6e8e6"}}>
                        <InputField onChangeText={(e: string) => setPasswordInput(e)} type={showPassword ? "text" : "password"} />
                        <InputSlot onPress={handlePasswordState} style={{padding:10}}>
                            <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} stroke="black"/>
                        </InputSlot>
                    </Input>
                    <FormControlError>
                        <FormControlErrorIcon as={AlertCircleIcon}/>
                        <FormControlErrorText>{errorMessage}</FormControlErrorText>
                    </FormControlError>
                </FormControl>
                <Button size="lg" variant="solid" action="primary" onPress={LogIn} style={{ marginTop: 30, marginBottom: 40 }}>
                    <ButtonText>Login</ButtonText>
                </Button>
                <Text size="lg" style={{shadowColor: "#3f403f", marginBottom: -10}}>New User?</Text>
                <Button size="lg" variant="solid" action="primary" onPress={() => nav.navigate("SignUp")} style={{ marginTop: 10 }}>
                    <ButtonText>SignUp</ButtonText>
                </Button>
            </VStack>
        {/* </Box> */}
        </Center>
    )
}

export default LogInPage;
