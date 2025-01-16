import React, { useState } from "react";
import { Button, ButtonText } from "../ui/button";
import { Center } from "../ui/center";
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from "../ui/modal";
import { Heading } from "../ui/heading";
import { AlertCircleIcon, CloseIcon, Icon } from "../ui/icon";
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlLabelText } from "../ui/form-control";
import { Input, InputField } from "../ui/input";
import { auth, db } from "@/firebase";
import { Auth } from "firebase/auth";
import { doc, getDoc, increment, setDoc } from "firebase/firestore";

type ChallengeAddSavingPopupProps = {
    name: string;
    refresh: () => Promise<void>;
}

const ChallengeAddSavingPopup: React.FC<ChallengeAddSavingPopupProps> = ({name, refresh}) => {
    const authRef: Auth = auth();
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const [amountAdded, setAmountAdded] = React.useState<number>(0);
    const [aaInvalid, setaaInvalid] = React.useState<boolean>(false);
    const [invalidMessage, setInvalidMessage] = useState<string>("");

    async function addAmount() {
        if (authRef.currentUser) {
            // check if ammount is less than balance
            const userDoc = doc(db, 'users', authRef.currentUser.uid);
            const userSnap = await getDoc(userDoc);
            console.log("userSnap gotten");
            
            if (userSnap.exists()) {
                console.log("userSnap exists");
                const userData = userSnap.data();
                if (amountAdded <= userData.balance) {
                    // decrement the balance by the amount added
                    await setDoc(userDoc, {balance: increment(-1*amountAdded)}, {merge: true});

                    // increment the amoutn saved by the amount to be added
                    const challengeDoc = doc(userDoc, 'challenges', name);
                    await setDoc(challengeDoc, {amount: increment(amountAdded)}, {merge: true});

                    setAmountAdded(0);
                    refresh();
                    onClose();
                } else {
                    console.log("error: amount exceeds current balance");
                    setInvalidMessage("Amount must be less than current balance.");
                    setaaInvalid(true);

                }
            }
        }
    }

    const changeAmountAdded = (s: string) => {
        console.log(s);
        if (s === "") {
            setAmountAdded(0);
            setaaInvalid(false);
        } else if (/^\d+$/.test(s)) {
            setaaInvalid(false);
            setAmountAdded(parseInt(s));
        }
        else {
            setInvalidMessage("Must be a number.");
            setaaInvalid(true);
        }
    }

    const onClose = () => {
        setAmountAdded(0);
        setaaInvalid(false);
        setIsOpen(false);
    }

    return (
        <Center>
            <Button onPress={() => setIsOpen(true)}>
                <ButtonText>Add to Amount Saved</ButtonText>
            </Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalBackdrop />
                <ModalContent style={{ maxWidth: 900, maxHeight: 600, alignSelf: 'center', padding: 10, backgroundColor: "#9fb8ad" }}>
                    <ModalHeader>
                        <Heading>Add Amount Saved</Heading>
                        <ModalCloseButton onPress={onClose}>
                            <Icon as={CloseIcon} size="md" />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody style={{margin: 5}}>
                        <FormControl isInvalid={aaInvalid} size="lg" style={{padding: 5, alignItems:"stretch"}}>
                            <FormControlLabelText>Amount to add</FormControlLabelText>
                            <Input style={{borderColor: "black", backgroundColor: "#E6E8E6"}}>
                                <InputField onChangeText={changeAmountAdded}/>
                            </Input>
                            <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>{invalidMessage}</FormControlErrorText>
                            </FormControlError>
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button onPress={addAmount}>
                            <ButtonText>Add</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Center>
    )
}

export default ChallengeAddSavingPopup;