import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { auth, db } from "@/firebase";
import { ExpenseNaviagationProp, ExpenseParamList } from "@/Routes";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Auth } from "firebase/auth";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { Alert, View } from "react-native";

type ExpenseInfoPageRouteProp = RouteProp<ExpenseParamList, 'ExpenseInfo'>;

const ExpenseInfoPage = () => {
    const route = useRoute<ExpenseInfoPageRouteProp>();
    const data = route.params.data;

    type NewType = ExpenseNaviagationProp;

    const nav = useNavigation<NewType>();

    const deleteExpense = async () => {
        const authRef: Auth = auth();
        if (authRef.currentUser) {
            const userDoc = doc(db, 'users', authRef.currentUser.uid, "expenses", data.name);
            try {
                const userDocBalance = doc(db, 'users', authRef.currentUser.uid);
                const userSnapBalance = await getDoc(userDoc);
                let calculatedBalance = await getBalance();
                console.log("The balance is" + calculatedBalance);
                if (calculatedBalance!=null) {
                    console.log("Adding change to balance");
                    calculatedBalance += data.amount;
                    console.log("The updated balance is " + calculatedBalance);
                }
                const updatedData = {
                    balance: calculatedBalance
                }
                await setDoc(userDocBalance, updatedData, {merge: true});
                if (userSnapBalance.exists()) {
                    const userDataBalance = userSnapBalance.data();
                    console.log("The updated balance on Firebase is " + userDataBalance.balance);  
                }

                await deleteDoc(userDoc);
                Alert.alert("Success", "Expense deleted successfully!", [
                    {text: "OK", onPress: () => {
                        route.params.refresh();
                        nav.navigate("ExpensesPage")}}
                ]);
            } catch (error) {
                const errorMessage = (error as { message?: string }).message || "Failed to delete expense";
                Alert.alert("Error", errorMessage);
            }
        } else {
            Alert.alert("Error", "No user is currently logged in.");
        }
    };

    const handleDeletePress = () => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this expense?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", onPress: deleteExpense },
            ],
            { cancelable: false }
        );
    };
    
    const getBalance = async (): Promise<number | null> => {
        const authRef: Auth = auth();
        try {
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

    const categoryColors: Record<string, string> = {
        Housing: "#FF871F", 
        Food: "#A01EE1", 
        Transport: "#41D4DC", 
        Health: "#FF0035", 
        Personal: "#37D45E", 
        Entertainment: "#E13FC9",
        Finance: "#FED047",
        Education: "#1C110A", 
        Family: "#1C47D4", 
        Miscellaneous: "#036D19", 
    };

    const categoryColor = categoryColors[data.category] || "#FFFFFF";
    
    return(
        <Center style={{flex: 1, alignItems: "stretch", backgroundColor: "#9fb8ad"}}>
            <Card>
                <VStack style={{alignItems: "stretch"}}>
                    <Button onPress={() => {
                                route.params.refresh(); // Ensure the data refreshes
                                nav.navigate("ExpensesPage"); // Navigate to ExpensesPage
                        }} style={{marginBottom: 50}}>
                        <ButtonText>Go Back</ButtonText>
                    </Button>
                    <Text size="lg" style={{fontWeight: "bold"}}>Name:</Text>
                    <Text size="2xl" style={{backgroundColor: "#E6E8E6"}}>{data.name}</Text>
                    <Text size="lg" style={{fontWeight: "bold"}}>Amount:</Text>
                    <Text size="2xl" style={{fontWeight: "bold", backgroundColor: "#E6E8E6"}}>${data.amount}</Text>
                    <Text size="lg" style={{fontWeight: "bold"}}>Date:</Text> 
                    <Text size="2xl" style={{backgroundColor: "#E6E8E6"}}>{data.year}-{data.month}-{data.date}</Text>
                    <Text size="lg" style={{fontWeight: "bold"}}>Category:</Text> 
                    <View 
                        style={{ 
                            backgroundColor: categoryColor, 
                            paddingVertical: 2,  // Add vertical padding
                            borderRadius: 8,     // Round the corners
                            alignSelf: "flex-start"
                        }}>
                        <Text size="lg" style={{ color: "white", fontWeight: "bold", 
                                        textShadowColor: "#000000", // Black shadow for the outline
                                        textShadowOffset: { width: -1, height: 1 }, // Position the shadow around the text
                                        textShadowRadius: 1, // Blur radius for the shadow
                                backgroundColor: categoryColor, padding: 4, borderRadius: 4, alignSelf: "center" }}>
                            {data.category}
                        </Text>
                    </View>
                    <Text size="lg" style={{fontWeight: "bold"}}>Description:</Text>
                    <Text size="lg" style={{backgroundColor: "#E6E8E6"}}>{data.description}</Text>
                    <Button onPress={handleDeletePress} style={{marginTop: 50}}>
                        <ButtonText>Delete Expense</ButtonText>
                    </Button>
                </VStack>
            </Card>
        </Center>
    )
}

export default ExpenseInfoPage;