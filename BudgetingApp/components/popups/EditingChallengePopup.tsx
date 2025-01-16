import React, { useState } from "react";
import { Button, ButtonText } from "../ui/button"
import { Center } from "../ui/center"
import { Heading } from "../ui/heading";
import { AlertCircleIcon, CloseIcon, Icon } from "../ui/icon";
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from "../ui/modal";
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlLabelText } from "../ui/form-control";
import { auth, db } from "@/firebase";
import { Input, InputField } from "../ui/input";
import { checkChallengeName, checkNumber } from "./AddingChallengePopup";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { Alert } from "react-native";
import { HStack } from "../ui/hstack";


type EditingChallengePopupProps = {
    name: string;
    refresh: () => Promise<void>;
    navigateBackToHome: () => Promise<void>;
}

const EditingChallengePopup: React.FC<EditingChallengePopupProps> = ({name, refresh, navigateBackToHome}) => {
    const [isOpen, setIsOpen] = React.useState<boolean>(false);

    const [newName, setNewName] = React.useState<string>("");
    const [nameInvalid, setNameInvalid] = React.useState<boolean>(false);
    const [nameChanged, setNameChanged] = useState<boolean>(false);

    const [newGoalAmount, setNewGoalAmount] = React.useState<number>();
    const [goalInvalid, setGoalInvalid] = React.useState<boolean>(false);

    const [newAmountSaved, setNewAmountSaved] = React.useState<number>();
    const [savedInvalid, setSavedInvalid] = React.useState<boolean>(false);


    const [newYear, setNewYear] = useState<number>(0);
    const [newYearInvalid, setNewYearInvalid] = useState<boolean>(false);

    const [newMonth, setNewMonth] = useState<number>(0);
    const [newMonthInvalid, setNewMonthInvalid] = useState<boolean>(false);

    const [newDay, setNewDay] = useState<number>(0);
    const [newDayInvalid, setNewDayInvalid] = useState<boolean>(false);

    const [deadlineErrorMessage, setDeadlineErrorMessage] = useState<string>("");

    async function getInfo() {
        const authRef = auth();
        if (authRef.currentUser) {
            const cRef = doc(db, 'users', authRef.currentUser.uid, 'challenges', name);
            const cSnap = await getDoc(cRef);

            if (cSnap.exists()) {
                const cd = cSnap.data();
                setNewName(cd.name);
                setNewAmountSaved(cd.amount);
                setNewGoalAmount(cd.totalAmount);
                setNewYear(Number(cd.year));
                setNewMonth(Number(cd.month));
                setNewDay(Number(cd.day));
            }
        }
    }

    function onOpen() {
        getInfo();
        setIsOpen(true);
    }


    async function updateChallenge() {
        const authRef = auth();
        if (authRef.currentUser) {
            if (newYear === null || isNaN(newYear) || newYear === 0) {
                setDeadlineErrorMessage("Year must be a number.")
                setNewYearInvalid(true);
            }
            else if (newMonth === null || isNaN(newMonth) || newMonth < 1 || newMonth > 12) {
                setDeadlineErrorMessage("Month must be a number between 1 and 12.")
                setNewMonthInvalid(true);
            }
            else if (newDay === null || isNaN(newDay) || newDay < 1 || newDay > 31) {
                setDeadlineErrorMessage("Day must be a number between 1 and 31.");
                setNewDayInvalid(true);
            }
            else {
                setNewYearInvalid(false);
                setNewMonthInvalid(false);
                setNewDayInvalid(false);

                console.log(nameChanged);
                console.log("newName")
                if (nameChanged) {
                    console.log(newName);
                    if (await checkChallengeName(newName)) {
                        setNameInvalid(true);
                        return;
                    } 
                } 
                setNameInvalid(false);

                const cRef = doc(db, 'users', authRef.currentUser.uid, 'challenges', name);
                await deleteDoc(cRef);

                const date = newYear + "-" + newMonth + "-" + newDay;
                const dSplit = date.split("-");

                const data = {name: newName, amount: newAmountSaved, totalAmount: newGoalAmount, deadline: date, year: dSplit[0], month: dSplit[1], day: dSplit[2]};
                const userDoc = doc(db, 'users', authRef.currentUser.uid, "challenges", newName);
                await setDoc(userDoc, data, {merge:true});

                refresh();
                onClose();
                
            }
        }
    }

    function onGoalChange(s: string) {
        if (checkNumber(s)) {
            setGoalInvalid(false);
            setNewGoalAmount(parseInt(s));
        } else {
            setGoalInvalid(true);
        }
    }

    function onAmountChange(s: string) {
        if (checkNumber(s)) {
            setSavedInvalid(false);
            setNewAmountSaved(parseInt(s));
        } else {
            setSavedInvalid(true);
        }
    }

    const onClose = () => {
        setNewName("");
        setNameInvalid(false);
        setNewGoalAmount(0);
        setGoalInvalid(false);
        setNewAmountSaved(0);
        setSavedInvalid(false);
        setNewYear(0);
        setNewYearInvalid(false);
        setNewMonth(0);
        setNewMonthInvalid(false);
        setNewDay(0);
        setNewDayInvalid(false);

        setIsOpen(false);
    }

    const deleteChallenge = async() => {
        const authRef = auth();
        if (authRef.currentUser) {
            const challengeDoc = doc(db, 'users', authRef.currentUser.uid, 'challenges', name);
            try {
                await deleteDoc(challengeDoc);
                Alert.alert("Success", "Expense deleted successfully!", [
                    {text: "OK", onPress: () => {
                        navigateBackToHome();
                    }}
                ]);
            } catch (error) {
                const errorMessage = (error as { message?: string }).message || "Failed to delete expense";
                Alert.alert("Error", errorMessage);
            }
        }
    }

    const onDeletePress = () => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this expense?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", onPress: deleteChallenge },
            ],
            { cancelable: false }
        );
    }

    return (
        <Center>
            <Button onPress={onOpen}>
                <ButtonText>Edit</ButtonText>
            </Button>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                >
                <ModalBackdrop />
                <ModalContent style={{ maxWidth: 900, maxHeight: 600, alignSelf: 'center', padding: 10, backgroundColor: "#9fb8ad" }}>
                    <ModalHeader>
                        <Heading>Edit</Heading>
                        <ModalCloseButton onPress={onClose}>
                            <Icon as={CloseIcon} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody style={{margin: 5}}>
                        <FormControl isInvalid={nameInvalid} size="lg" style={{padding: 5, alignItems:"stretch"}}>
                            <FormControlLabelText>Name</FormControlLabelText>
                            <Input style={{borderColor: "black", backgroundColor: "#E6E8E6"}}>
                                <InputField onChangeText={(e: string) => {
                                    setNameChanged(true);
                                    setNewName(e)
                                }}/>
                            </Input>
                            <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>Challenge with name already exists.</FormControlErrorText>
                            </FormControlError>
                        </FormControl>
                        <FormControl isInvalid={goalInvalid} size="lg" style={{padding: 5, alignItems:"stretch"}}>
                            <FormControlLabelText>Goal Amount</FormControlLabelText>
                            <Input style={{borderColor: "black", backgroundColor: "#E6E8E6"}}>
                                <InputField onChangeText={onGoalChange} />
                            </Input>
                            <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>Challenge with name already exists.</FormControlErrorText>
                            </FormControlError>
                        </FormControl>
                        <FormControl isInvalid={savedInvalid} size="lg" style={{padding: 5, alignItems:"stretch"}}>
                            <FormControlLabelText>Amount Saved</FormControlLabelText>
                            <Input style={{borderColor: "black", backgroundColor: "#E6E8E6"}}>
                                <InputField onChangeText={onAmountChange} />
                            </Input>
                            <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>Amount must be a number.</FormControlErrorText>
                            </FormControlError>
                        </FormControl>
                        <FormControl isInvalid={newYearInvalid} size="lg" style={{padding: 5, alignItems:"stretch"}}>
                            <FormControlLabelText>Deadline</FormControlLabelText>
                            <HStack>
                            <Input 
                                    style={{width: 70, marginRight: 5, borderColor: "black", backgroundColor: "#E6E8E6"}} 
                                    isInvalid={newYearInvalid}
                                >
                                    <InputField onChangeText={(s: string) => setNewYear(Number(s))} placeholder="YYYY" keyboardType="numeric" />
                                </Input>
                                <Input 
                                    style={{width: 70, marginRight: 5, borderColor: "black", backgroundColor: "#E6E8E6"}} 
                                    isInvalid={newMonthInvalid}
                                >
                                    <InputField onChangeText={(s: string) => setNewMonth(Number(s))} placeholder="MM" keyboardType="numeric" />
                                </Input>
                                <Input 
                                    style={{width: 70, marginRight: 5, borderColor: "black", backgroundColor: "#E6E8E6"}} 
                                    isInvalid={newDayInvalid}
                                >
                                    <InputField onChangeText={(s: string) => setNewDay(Number(s))} placeholder="DD" keyboardType="numeric" />
                                </Input>
                            </HStack>
                            <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>{deadlineErrorMessage}</FormControlErrorText>
                            </FormControlError>
                        </FormControl>
                    </ModalBody>
                    <ModalFooter style={{alignSelf:"center"}}>
                        <Button onPress={onDeletePress} size="sm" >
                            <ButtonText>Delete Challenge</ButtonText>
                        </Button>
                        <Button onPress={updateChallenge} size="sm">
                            <ButtonText>Save Changes</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Center>
    )
}

export default EditingChallengePopup;