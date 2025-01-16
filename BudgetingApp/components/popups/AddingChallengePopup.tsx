import React, { useState } from "react"

import { Button, ButtonText } from "../ui/button"
import { Center } from "../ui/center"
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from "../ui/modal"
import { Heading } from "../ui/heading"
import { AlertCircleIcon, CloseIcon, Icon } from "../ui/icon"
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlLabelText } from "../ui/form-control"
import { Input, InputField } from "../ui/input"
import { collection, doc, getDocs, setDoc } from "firebase/firestore"
import { auth, db } from "@/firebase"
import { Auth } from "firebase/auth"
import { ChallengeType } from "@/types/ChallengeTypes"
import { HStack } from "../ui/hstack"


export async function checkChallengeName(n: string) {
    const authRef = auth();
    if (authRef.currentUser) {

        const challengeCollection = collection(db, 'users', authRef.currentUser.uid, 'challenges');
        const challengesData = await getDocs(challengeCollection);

        let errorExists: boolean = false;
        challengesData.forEach((c) => {
            if (c.data().name === n) {
                console.log("Error: challenge already exists with this name");
                errorExists = true;
            }
        });
        return errorExists;
    }
    return false;
}

export function checkDeadline(d: string) {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    return !datePattern.test(d);
}

export function checkNumber(n: string) {
    if (n === "" || /^\d+$/.test(n)) {
        return true;
    } else {
        return false;
    }
}

type AddingChallengePopupProps = {
    refreshChallenges: () => Promise<void>;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddingChallengePopup: React.FC<AddingChallengePopupProps> = ({refreshChallenges, isOpen, setIsOpen}) => {
    const authRef :Auth = auth();
    const [name, setName] = React.useState<string>("");
    const [amount, setAmount] = React.useState<number>(0);

    const [year, setYear] = React.useState<number>(0);
    const [month, setMonth] = useState<number>(0);
    const [day, setDay] = useState<number>(0);

    const [aInvalid, setAInvalid] = React.useState<boolean>(false);
    const [nInvalid, setNInvalid] = React.useState<boolean>(false);
    const [yearInvalid, setYearInvalid] = useState<boolean>(false);
    const [monthInvalid, setMonthInvalid] = useState<boolean>(false);
    const [dayInvalid, setDayInvalid] = useState<boolean>(false);

    const [deadlineErrorMessage, setDeadlineErrorMessage] = useState<string>("");

    const createChallenge = async() => {
        if (authRef.currentUser) {
            // check that the date is in correct format
            // if (checkDeadline(deadline)) {
            if (year === null || isNaN(year) || year === 0) {
                setDeadlineErrorMessage("Year must be a number.")
                setYearInvalid(true);
            } 
            else if (month === null || isNaN(month) || month < 1 || month > 12) {
                setDeadlineErrorMessage("Month must be a number between 1 and 12.")
                setMonthInvalid(true);
            }
            else if (day === null || isNaN(day) || day < 1 || day > 31) {
                setDeadlineErrorMessage("Day must be a number between 1 and 31.");
                setDayInvalid(true);
            }
            else {
                setYearInvalid(false);
                setMonthInvalid(false);
                setDayInvalid(false);

                // check if challege with name entered already exists
                if (await checkChallengeName(name)) {
                    setNInvalid(true);
                } else {
                    // split date into year, month, and day strings
                    const date = year + "-" + month + "-" + day;
                    const dSplit = date.split("-");

                    // adds new challenge to database
                    const data: ChallengeType = {name: name, amount: 0, totalAmount: amount, deadline: date, year: dSplit[0], month: dSplit[1], day: dSplit[2]};
                    const userDoc = doc(db, 'users', authRef.currentUser.uid, "challenges", name);
                    await setDoc(userDoc, data, {merge:true})
                    refreshChallenges();
                    onClose();
                } 
            }
        }
    }

    // checks that the amount entered can be turned into a number
    const onAmountChange = (s: string) => {
        if (checkNumber(s)) {
            setAInvalid(false);
            setAmount(parseInt(s));
        } else {
            setAInvalid(true);
        }
        // if (s === "") {
        //     setAmount(0)
        //     setAInvalid(false);
        // } else if (/^\d+$/.test(s)) {
        //     setAInvalid(false);
        //     setAmount(parseInt(s));
        // } else {
        //     setAInvalid(true);
        // }
    }

    const onClose = () => {
        setAmount(0);
        setAInvalid(false);
        setName("");
        setNInvalid(false);
        setYear(0);
        setMonth(0);
        setDay(0);
        setYearInvalid(false);
        setMonthInvalid(false);
        setDayInvalid(false);
        setIsOpen(false);
    }

    return (
        <Center >
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                size="md"
                >
                <ModalBackdrop />
                <ModalContent style={{ maxWidth: 900, maxHeight: 600, alignSelf: 'center', padding: 10, backgroundColor: "#9fb8ad" }}>
                    <ModalHeader>
                        <Heading>Add Challenge</Heading>
                        <ModalCloseButton onPress={onClose}>
                            <Icon as={CloseIcon} size="md"/>
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody style={{margin: 5}}>
                        <FormControl size="lg" style={{padding: 5, alignItems:"stretch"}} isInvalid={nInvalid}> 
                            <FormControlLabelText>Name</FormControlLabelText>
                            <Input isInvalid={nInvalid} style={{borderColor: "black", backgroundColor: "#E6E8E6"}}>
                                <InputField onChangeText={(e: string) => setName(e)} />
                            </Input>
                            <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>Challenge with name already exists.</FormControlErrorText>
                            </FormControlError>
                        </FormControl>
                        <FormControl size="lg" style={{padding: 5, alignItems:"stretch"}} isInvalid={aInvalid}>
                            <FormControlLabelText>Amount To Save</FormControlLabelText>
                            <Input isInvalid={aInvalid} style={{borderColor: "black", backgroundColor: "#E6E8E6"}}>
                                <InputField onChangeText={onAmountChange} />
                            </Input>
                            <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>Must be a number.</FormControlErrorText>
                            </FormControlError>
                        </FormControl>
                        <FormControl size="lg" style={{padding: 5, alignItems:"stretch"}} isInvalid={yearInvalid}>
                            <FormControlLabelText>Deadline</FormControlLabelText>
                            <HStack>
                                <Input 
                                    style={{width: 70, marginRight: 5, borderColor: "black", backgroundColor: "#E6E8E6"}} 
                                    isInvalid={yearInvalid}
                                >
                                    <InputField onChangeText={(s: string) => setYear(Number(s))} placeholder="YYYY" keyboardType="numeric" />
                                </Input>
                                <Input 
                                    style={{width: 70, marginRight: 5, borderColor: "black", backgroundColor: "#E6E8E6"}} 
                                    isInvalid={monthInvalid}
                                >
                                    <InputField onChangeText={(s: string) => setMonth(Number(s))} placeholder="MM" keyboardType="numeric" />
                                </Input>
                                <Input 
                                    style={{width: 70, marginRight: 5, borderColor: "black", backgroundColor: "#E6E8E6"}} 
                                    isInvalid={dayInvalid}
                                >
                                    <InputField onChangeText={(s: string) => setDay(Number(s))} placeholder="DD" keyboardType="numeric" />
                                </Input>
                            </HStack>
                            <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>{deadlineErrorMessage}</FormControlErrorText>
                            </FormControlError>
                        </FormControl> 
                     </ModalBody>
                    <ModalFooter>
                        <Button onPress={createChallenge}>
                            <ButtonText>Create</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Center>
    )
}

export default AddingChallengePopup;