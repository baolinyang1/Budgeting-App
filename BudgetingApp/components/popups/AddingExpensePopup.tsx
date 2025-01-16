import { auth, db } from "@/firebase";
import { Auth } from "firebase/auth";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import React from "react";

import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from "../ui/modal";
import { FormControl, FormControlLabel, FormControlLabelText } from "../ui/form-control";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";
import { Icon, CloseIcon } from "../ui/icon";
import { Input, InputField } from "../ui/input";
import { Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectItem } from "../ui/select";
import { Button, ButtonText } from "../ui/button";
import { HStack } from "../ui/hstack";
import Papa from 'papaparse';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from "react-native";
import { Center } from "../ui/center";

type AddingExpensePopupProps = {
    refreshExpenses: ()=>void;
}

const AddingExpensePopup: React.FC<AddingExpensePopupProps> = ({refreshExpenses}) => {
    const authRef :Auth = auth();
    const [isExpenseModalOpen, setIsExpenseModalOpen] = React.useState<boolean>(false);
    const [isAddExpenseOptionOpen, setAddExpenseOptionOpen] = React.useState<boolean>(false);
    const [isAddFileModalOpen, setAddFileModalOpen] = React.useState<boolean>(false);
    const [name, setName] = React.useState<string>("");
    const [amount, setAmount] = React.useState<number>(0);
    const [date, setDate] = React.useState<number>(0);
    const [month, setMonth] = React.useState<number>(0);
    const [year, setYear] = React.useState<number>(0);
    const [category, setCategory] = React.useState<string>("");
    const [description, setDescription] = React.useState<string>("");

    const [nameInvalid, setNameInvalid] = React.useState<boolean>(false);
    const [amountInvalid, setAmountInvalid] = React.useState<boolean>(false);
    const [dateInvalid, setDateInvalid] = React.useState<boolean>(false);
    const [monthInvalid, setMonthInvalid] = React.useState<boolean>(false);
    const [yearInvalid, setYearInvalid] = React.useState<boolean>(false);
    const [categoryInvalid, setCategoryInvalid] = React.useState<boolean>(false);
    const [descriptionInvalid, setDescriptionInvalid] = React.useState<boolean>(false);

    const [isIncomeModalOpen, setIsIncomeModalOpen] = React.useState<boolean>(false);
    const [incomeName, setIncomeName] = React.useState<string>("");
    const [incomeAmount, setIncomeAmount] = React.useState<number>(0);
    const [incomeDate, setIncomeDate] = React.useState<number>(0);
    const [incomeMonth, setIncomeMonth] = React.useState<number>(0);
    const [incomeYear, setIncomeYear] = React.useState<number>(0);
    const [incomeDescription, setIncomeDescription] = React.useState<string>("");

    const [incomeNameInvalid, setIncomeNameInvalid] = React.useState<boolean>(false);
    const [incomeAmountInvalid, setIncomeAmountInvalid] = React.useState<boolean>(false);
    const [incomeDateInvalid, setIncomeDateInvalid] = React.useState<boolean>(false);
    const [incomeMonthInvalid, setIncomeMonthInvalid] = React.useState<boolean>(false);
    const [incomeYearInvalid, setIncomeYearInvalid] = React.useState<boolean>(false);
    const [incomeDescriptionInvalid, setIncomeDescriptionInvalid] = React.useState<boolean>(false);

    const createExpense = async() => {
        if (!name || name === "") {
            alert("Please enter a name for the expense.");
            setNameInvalid(true);
            return;
        }
        if (amount === null || isNaN(amount) || amount === 0) {
            alert("Please enter a valid numeric amount.");
            setAmountInvalid(true);
            return;
        }
        if (year === null || isNaN(year) || year === 0) {
            alert("Please enter a valid numeric year.");
            setYearInvalid(true);
            return;
        }
        if (month === null || isNaN(month) || month < 1 || month > 12) {
            alert("Please enter a valid numeric month between 1 and 12.");
            setMonthInvalid(true);
            return;
        }
        if (date === null || isNaN(date) || date < 1 || date > 31) {
            alert("Please enter a valid numeric day between 1 and 31.");
            setDateInvalid(true);
            return;
        }
        if (!category || category === "") {
            alert("Please select a category.");
            setCategoryInvalid(true);
            return;
        }
        if (!description || description === "") {
            alert("Please enter a description.");
            setDescriptionInvalid(true);
            return;
        }

        

        const data = {name: name, amount: amount, year: year, month: month, date: date, category: category, description: description};
        if (authRef.currentUser) {

            // check if expense with name entered already exists
            const expenseCollection = collection(db, 'users', authRef.currentUser.uid, 'expenses');
            const expensesData = await getDocs(expenseCollection);

            for (const c of expensesData.docs) {
                if (c.data().name === name) {
                    console.log("Error: expense already exists with this name");
                    Alert.alert("Error", "Expense already exists with this name");
                    return; // Exit the function early
                }
            }

            const userDoc = doc(db, 'users', authRef.currentUser.uid, "expenses", name);
            setDoc(userDoc, data, {merge:true});
            updateBalance("expenses",-amount, name);
         
            refreshExpenses();
            setIsExpenseModalOpen(false);
            setAddExpenseOptionOpen(false);
        }
    }

    const createIncome = async() => {
        if (!incomeName || incomeName === "") {
            alert("Please enter a name for the income.");
            setIncomeNameInvalid(true);
            return;
        }
        if (incomeAmount === null || isNaN(incomeAmount) || incomeAmount === 0) {
            alert("Please enter a valid numeric amount.");
            setIncomeAmountInvalid(true);
            return;
        }
        if (incomeYear === null || isNaN(incomeYear) || incomeYear === 0) {
            alert("Please enter a valid numeric year.");
            setIncomeYearInvalid(true);
            return;
        }
        if (incomeMonth === null || isNaN(incomeMonth) || incomeMonth < 1 || incomeMonth > 12) {
            alert("Please enter a valid numeric month between 1 and 12.");
            setIncomeMonthInvalid(true);
            return;
        }
        if (incomeDate === null || isNaN(incomeDate) || incomeDate < 1 || incomeDate > 31) {
            alert("Please enter a valid numeric day between 1 and 31.");
            setIncomeDateInvalid(true);
            return;
        }
        if (!incomeDescription || incomeDescription === "") {
            alert("Please enter a description.");
            setIncomeDescriptionInvalid(true);
            return;
        }

        const data = {incomeName: incomeName, incomeAmount: incomeAmount, incomeYear: incomeYear, incomeMonth: incomeMonth,
             incomeDate: incomeDate, incomeDescription: incomeDescription};
        if (authRef.currentUser) {

            // check if income with name entered already exists
            const incomeCollection = collection(db, 'users', authRef.currentUser.uid, 'incomes');
            const incomesData = await getDocs(incomeCollection);

            // Check if income name already exists
            for (const c of incomesData.docs) {
                if (c.data().incomeName === incomeName) {
                    console.log("Error: income already exists with this name");
                    Alert.alert("Error", "Income already exists with this name");
                    return; // Exit the function early
                }
            }

            const userDoc = doc(db, 'users', authRef.currentUser.uid, "incomes", incomeName);
            setDoc(userDoc, data, {merge:true});
            updateBalance("incomes",incomeAmount, incomeName);   
            
            refreshExpenses();
            setIsIncomeModalOpen(false);
        }
    }

    const getBalance = async (): Promise<number | null> => {
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

    const updateBalance = async(dataType: string, dataAmount: number, dataName: string) => {
        if (authRef.currentUser) {
            const userDoc = doc(db, 'users', authRef.currentUser.uid, dataType, dataName);
            const userDocBalance = doc(db, 'users', authRef.currentUser.uid);
            const userSnapBalance = await getDoc(userDoc);
            let calculatedBalance = await getBalance();
            console.log("The balance is" + calculatedBalance);
            if (calculatedBalance!=null) {
                console.log("Adding change to balance");
                calculatedBalance += dataAmount;
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

            refreshExpenses();
        }
    }

    const handleCSVImport = async () => {
        try {
            // Step 1: Pick a file
            const result = await DocumentPicker.getDocumentAsync({
                type: "text/csv",
                copyToCacheDirectory: true
            });

            // if (result.type === "cancel") {
            //     return;
            // }

            if (result.assets!=null) {
                const fileUri = result.assets[0].uri;

                // Step 2: Read the file content
                const response = await fetch(fileUri);
                const fileContent = await response.text();

                // Step 3: Parse the CSV file
                const parsedData = Papa.parse(fileContent, {
                    header: false,
                    skipEmptyLines: true,
                });

                if (parsedData.errors.length > 0) {
                    Alert.alert("Error", "Failed to parse CSV file. Please check the file format.");
                    return;
                }

                // Step 4: Process each row
                const rows = parsedData.data as string[][];
                let totalBalanceChange = 0;

                for (const row of rows) {
                    if (row.length !== 7) {
                        Alert.alert("Error", "Each row must have exactly 7 columns. Import aborted.");
                        return;
                    }

                    const [name, amount, year, month, date, category, description] = row;

                    // Validate the data
                    if (!name || !amount || !year || !month || !date || !category || !description) {
                        Alert.alert("Error", "All fields are required. Import aborted.");
                        return;
                    }

                    if (isNaN(Number(amount)) || isNaN(Number(year)) || isNaN(Number(month)) || isNaN(Number(date))) {
                        Alert.alert("Error", "Amount, Year, Month, and Day must be numeric. Import aborted.");
                        return;
                    }

                    // Add the expense to Firebase
                    if (authRef.currentUser) {

                        const expenseCollection = collection(db, 'users', authRef.currentUser.uid, 'expenses');
                        const expensesData = await getDocs(expenseCollection);

                        for (const c of expensesData.docs) {
                            if (c.data().name === name) {
                                console.log("Error: expense already exists with this name");
                                Alert.alert("Error", "Expense already exists with this name");
                                return; // End the function early
                            }
                        }
                        
                        const userDoc = doc(
                            db,
                            "users",
                            authRef.currentUser.uid,
                            "expenses",
                            name
                        );

                        setDoc(
                            userDoc,
                            {
                                name,
                                amount: Number(amount),
                                year: Number(year),
                                month: Number(month),
                                date: Number(date),
                                category,
                                description,
                            },
                            { merge: true }
                        );
                        totalBalanceChange -= Number(amount);
                        
                        console.log("Added Data entry from CSV File");
                    }
                } 

                // Update balance after processing all rows
                await updateBalanceBatch(totalBalanceChange);

                Alert.alert("Success", "CSV file imported successfully!");
                refreshExpenses();
                setAddFileModalOpen(false);
                } else {return;}

        } catch (error) {
            console.error("Error importing CSV:", error);
            Alert.alert("Error", "An unexpected error occurred while importing the CSV file.");
        }
    };

    const updateBalanceBatch = async (totalBalanceChange: number) => {
        if (authRef.currentUser) {
            const userDocBalance = doc(db, "users", authRef.currentUser.uid);
            const calculatedBalance = await getBalance();
    
            if (calculatedBalance !== null) {
                const newBalance = calculatedBalance + totalBalanceChange;
                console.log(`Updating balance by ${totalBalanceChange}. New balance: ${newBalance}`);
                await setDoc(
                    userDocBalance,
                    { balance: newBalance },
                    { merge: true }
                );
            } else {
                console.error("Unable to retrieve balance for batch update.");
            }
        }
    };
    

    return(
        <Center>
            <HStack space="lg">
                <Button size="lg" onPress={() => setAddExpenseOptionOpen(true)}>
                    <ButtonText>Add Expense</ButtonText>
                </Button>
                <Button size="lg" onPress={() => setIsIncomeModalOpen(true)}>
                    <ButtonText>Add Income</ButtonText>
                </Button>
            </HStack>
            <Modal isOpen = {isAddExpenseOptionOpen} onClose={()=>setAddExpenseOptionOpen(false)} size="lg">
                <ModalBackdrop/>
                <ModalContent style={{ maxWidth: 900, maxHeight: 600, alignSelf: 'center', justifyContent: 'center',padding: 10, backgroundColor: "#9fb8ad", borderColor: "black" }}>
                    <ModalHeader>
                        <ModalCloseButton onPress={() => setAddExpenseOptionOpen(false)}>
                            <Icon
                                as={CloseIcon}
                                size="md"
                                className="stroke-background-400 group-[:hover]/modal-close-button:stroke-background-700 group-[:active]/modal-close-button:stroke-background-900 group-[:focus-visible]/modal-close-button:stroke-background-900"
                                style={{margin: 10}}
                            />
                        </ModalCloseButton>
                        <Heading size="lg" className="text-typography-950">
                            Add Expense
                        </Heading>
                    </ModalHeader>
                    <ModalBody style={{margin: 5}}>
                        <Text style={{alignSelf: "center", padding: 5, color: "black"}} >How do you want to add your expenses?</Text>
                        <HStack space="sm" style={{alignSelf: "center", alignItems: "center"}}>
                            <Button size="sm" onPress={() => setAddFileModalOpen(true)} style={{height: 60, width: 130, margin: 5, paddingTop: 5}}>
                                <ButtonText>Import from CSV File</ButtonText>
                            </Button>
                            <Button size="sm" onPress={() => setIsExpenseModalOpen(true)} style={{height: 60, width: 130, margin: 5, paddingTop: 5}}>
                                <ButtonText>Enter Expense Info Manually</ButtonText>
                            </Button>
                        </HStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <Modal isOpen = {isAddFileModalOpen} onClose={()=>setAddFileModalOpen(false)} size="lg">
                <ModalBackdrop/>
                <ModalContent style={{ maxWidth: 900, maxHeight: 600, alignSelf: 'center', justifyContent: 'center',padding: 10, backgroundColor: "#9fb8ad", borderColor: "black" }}>
                    <ModalHeader>
                        <ModalCloseButton onPress={() => setAddFileModalOpen(false)}>
                            <Icon
                                as={CloseIcon}
                                size="md"
                                className="stroke-background-400 group-[:hover]/modal-close-button:stroke-background-700 group-[:active]/modal-close-button:stroke-background-900 group-[:focus-visible]/modal-close-button:stroke-background-900"
                                style={{margin: 10}}
                            />
                        </ModalCloseButton>
                        <Heading size="lg" className="text-typography-950" style={{}}>
                            Import CSV File
                        </Heading>
                    </ModalHeader>
                    <ModalBody style={{margin: 5}}>
                        <Text style={{alignSelf: "center", padding: 5, color: "black"}} >
                            <Text style={{fontWeight: "bold", color: "black"}}>Caution: </Text>
                            The order of the CSV File must be in the following way only: Column 1 - Expense Name, Column 2 -
                            Amount, Column 3 - Year of Expense, Column 4 - Month of Expense, Column 5 - Day of Expense, Column 6 - 
                            Category Name, Column 7 - Description and the Rows must contain only one Expense each. 
                            Tables <Text style={{fontWeight: "bold", color: "black"}}>MUST NOT CONTAIN </Text>headers and footers. </Text>
                        <Button size="md" onPress={() => handleCSVImport()} style={{height: 60, width: 130, margin: 5, paddingTop: 5, alignSelf: "center"}}>
                            <ButtonText>IMPORT from CSV File</ButtonText>
                        </Button>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <Modal isOpen={isExpenseModalOpen} onClose={() => {setIsExpenseModalOpen(false); setAddExpenseOptionOpen(false);}} size="lg">
                <ModalBackdrop />
                    <ModalContent style={{ maxWidth: 900, maxHeight: 600, alignSelf: 'center', padding: 10, backgroundColor: "#9fb8ad", borderColor: "black" }}>
                        <ModalHeader>
                            <ModalCloseButton onPress={() => setIsExpenseModalOpen(false)}>
                            <Icon
                                as={CloseIcon}
                                size="md"
                                className="stroke-background-400 group-[:hover]/modal-close-button:stroke-background-700 group-[:active]/modal-close-button:stroke-background-900 group-[:focus-visible]/modal-close-button:stroke-background-900"
                                style={{margin: 10}}
                            />
                            </ModalCloseButton>
                            <Heading size="lg" className="text-typography-950">
                                Add Expense Manually
                            </Heading>
                        </ModalHeader>
                        <ModalBody style={{margin: 5}}>
                            <FormControl size="lg" style={{padding: 5}} isInvalid={nameInvalid}>
                                <FormControlLabel>
                                    <FormControlLabelText style={{ fontSize: 18, width: '90%' }}>Expense Name</FormControlLabelText>
                                </FormControlLabel>
                                <Input isInvalid={nameInvalid} style={{borderColor: "black", backgroundColor: "#E6E8E6"}}>
                                    <InputField onChangeText={(e: string) => setName(e)} placeholder="Enter Name here..." />
                                </Input>
                            </FormControl>
                            <FormControl size="lg" style={{padding: 5}} isInvalid={amountInvalid}>
                                <FormControlLabel>
                                    <FormControlLabelText style={{ fontSize: 18, width: '90%' }}>Amount</FormControlLabelText>
                                </FormControlLabel>
                                <Input isInvalid={amountInvalid} style={{borderColor: "black", backgroundColor: "#E6E8E6"}}>
                                    <InputField onChangeText={(e: string) => setAmount(Number(e))} placeholder="Enter Amount here..." keyboardType="numeric" />
                                </Input>
                            </FormControl>
                            <FormControl size="lg" style={{padding: 5}} isInvalid={yearInvalid}>
                                <FormControlLabel>
                                    <FormControlLabelText style={{ fontSize: 18, width: '90%' }}>Date Of Created Expense</FormControlLabelText>
                                </FormControlLabel>
                                <HStack>
                                    <Input style={{width: 70, marginRight: 5, borderColor: "black", backgroundColor: "#E6E8E6"}} isInvalid={yearInvalid}>                                        
                                        <InputField onChangeText={(e: string) => setYear(Number(e))} placeholder="YYYY" keyboardType="numeric" />                                        
                                    </Input>
                                    <Input style={{width: 70, marginRight: 5, borderColor: "black", backgroundColor: "#E6E8E6"}} isInvalid={monthInvalid}>                                        
                                        <InputField onChangeText={(e: string) => setMonth(Number(e))} placeholder="MM" keyboardType="numeric" />                                        
                                    </Input>
                                    <Input style={{width: 70, marginRight: 5, borderColor: "black", backgroundColor: "#E6E8E6"}} isInvalid={dateInvalid}>
                                        <InputField onChangeText={(e: string) => setDate(Number(e))} placeholder="DD" keyboardType="numeric" />                                        
                                    </Input>
                                </HStack>
                            </FormControl>
                            <FormControl size="lg" style={{ padding: 5 }} isInvalid={categoryInvalid}>
                                <FormControlLabel>
                                    <FormControlLabelText style={{ fontSize: 18, width: '90%' }}>Category</FormControlLabelText>
                                </FormControlLabel>
                                <Select onValueChange={(value: string) => setCategory(value)} isInvalid={categoryInvalid} style={{borderColor: "black", borderWidth: 1, borderRadius: 4, backgroundColor: "#E6E8E6"}}>
                                    <SelectTrigger variant="outline" size="md">
                                        <SelectInput placeholder="Select category" />
                                        <SelectIcon />
                                    </SelectTrigger>
                                    <SelectPortal style={{paddingBottom: 30}}>
                                        <SelectBackdrop />
                                        <SelectContent style={{backgroundColor: "#9fb8ad"}}>
                                            <SelectItem label="Housing " value="Housing" />
                                            <SelectItem label="Food" value="Food" />
                                            <SelectItem label="Transport" value="Transport" />
                                            <SelectItem label="Health" value="Health" />
                                            <SelectItem label="Personal" value="Personal" />
                                            <SelectItem label="Entertainment" value="Entertainment" />
                                            <SelectItem label="Education" value="Education" />
                                            <SelectItem label="Miscellaneous" value="Miscellaneous" />
                                        </SelectContent>
                                    </SelectPortal>
                                </Select>
                            </FormControl>
                            
                            <FormControl size="lg" style={{padding: 5}} isInvalid={descriptionInvalid}>
                                <FormControlLabel>
                                    <FormControlLabelText style={{ fontSize: 18, width: '90%' }}>Description</FormControlLabelText>
                                </FormControlLabel>
                                <Input style={{ height: 200, alignItems: "flex-start", borderColor: "black", backgroundColor: "#E6E8E6"}} isInvalid={descriptionInvalid}>
                                    <InputField size="sm" style={{ height: 40, alignSelf: "flex-start" }}
                                     onChangeText={(e: string) => setDescription(e)} placeholder="Enter Description here..." />
                                </Input>      
                            </FormControl>
                        </ModalBody>
                        <ModalFooter>
                            <Button onPress={() => { createExpense(); }}>
                                <ButtonText>Add</ButtonText>
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                <Modal isOpen={isIncomeModalOpen} onClose={() => setIsIncomeModalOpen(false)} size="lg">
                <ModalBackdrop />
                    <ModalContent style={{ maxWidth: 900, maxHeight: 600, alignSelf: 'center', padding: 10, backgroundColor: "#9fb8ad", borderColor: "black"  }}>
                        <ModalHeader>
                            <ModalCloseButton onPress={() => setIsIncomeModalOpen(false)}>
                            <Icon
                                as={CloseIcon}
                                size="md"
                                className="stroke-background-400 group-[:hover]/modal-close-button:stroke-background-700 group-[:active]/modal-close-button:stroke-background-900 group-[:focus-visible]/modal-close-button:stroke-background-900"
                                style={{margin: 10}}
                            />
                            </ModalCloseButton>
                            <Heading size="lg" className="text-typography-950">
                                Add Income
                            </Heading>
                        </ModalHeader>
                        <ModalBody style={{margin: 5}}>
                            <FormControl size="lg" style={{padding: 5}} isInvalid={incomeNameInvalid}>
                                <FormControlLabel>
                                    <FormControlLabelText style={{ fontSize: 18, width: '90%' }}>Income Name</FormControlLabelText>
                                </FormControlLabel>
                                <Input isInvalid={incomeNameInvalid} style={{borderColor: "black", backgroundColor: "#E6E8E6"}}>
                                    <InputField onChangeText={(e: string) => setIncomeName(e)} placeholder="Enter Name here..." />
                                </Input>
                            </FormControl>
                            <FormControl size="lg" style={{padding: 5}} isInvalid={incomeAmountInvalid}>
                                <FormControlLabel>
                                    <FormControlLabelText style={{ fontSize: 18, width: '90%' }}>Amount</FormControlLabelText>
                                </FormControlLabel>
                                <Input isInvalid={incomeAmountInvalid} style={{borderColor: "black", backgroundColor: "#E6E8E6"}}>
                                    <InputField onChangeText={(e: string) => setIncomeAmount(Number(e))} placeholder="Enter Amount here..." keyboardType="numeric" />
                                </Input>
                            </FormControl>
                            <FormControl size="lg" style={{padding: 5}} isInvalid={incomeYearInvalid}>
                                <FormControlLabel>
                                    <FormControlLabelText style={{ fontSize: 18, width: '90%' }}>Date Of Created Income</FormControlLabelText>
                                </FormControlLabel>
                                <HStack>
                                    <Input style={{width: 70, marginRight: 5, borderColor: "black", backgroundColor: "#E6E8E6"}} isInvalid={incomeYearInvalid}>                                        
                                        <InputField onChangeText={(e: string) => setIncomeYear(Number(e))} placeholder="YYYY" keyboardType="numeric" />                                        
                                    </Input>
                                    <Input style={{width: 70, marginRight: 5, borderColor: "black", backgroundColor: "#E6E8E6"}} isInvalid={incomeMonthInvalid}>                                        
                                        <InputField onChangeText={(e: string) => setIncomeMonth(Number(e))} placeholder="MM" keyboardType="numeric" />                                        
                                    </Input>
                                    <Input style={{width: 70, marginRight: 5, borderColor: "black", backgroundColor: "#E6E8E6"}} isInvalid={incomeDateInvalid}>
                                        <InputField onChangeText={(e: string) => setIncomeDate(Number(e))} placeholder="DD" keyboardType="numeric" />                                        
                                    </Input>
                                </HStack>
                            </FormControl>
                            <FormControl size="lg" style={{padding: 5}} isInvalid={incomeDescriptionInvalid}>
                                <FormControlLabel>
                                    <FormControlLabelText style={{ fontSize: 18, width: '90%' }}>Description</FormControlLabelText>
                                </FormControlLabel>
                                <Input style={{ height: 200, alignItems: "flex-start", borderColor: "black", backgroundColor: "#E6E8E6"}} isInvalid={incomeDescriptionInvalid}>
                                    <InputField size="sm" style={{ height: 40, alignSelf: "flex-start" }}
                                     onChangeText={(e: string) => setIncomeDescription(e)} placeholder="Enter Description here..." />
                                </Input>      
                            </FormControl>
                        </ModalBody>
                        <ModalFooter>
                            <Button onPress={() => { createIncome(); }}>
                                <ButtonText>Add</ButtonText>
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
        </Center>
    )
}

export default AddingExpensePopup;


    

function setFileUri(uri: string) {
    throw new Error("Function not implemented.");
}
    