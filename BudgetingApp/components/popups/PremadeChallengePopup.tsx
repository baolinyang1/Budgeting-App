import { Center } from "../ui/center";
import { Heading } from "../ui/heading";
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from "../ui/modal";
import { AlertCircleIcon, CloseIcon, Icon } from "../ui/icon";
import { Button, ButtonText } from "../ui/button";
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlLabel, FormControlLabelText } from "../ui/form-control";
import { Select, SelectBackdrop, SelectContent, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectTrigger } from "../ui/select";
import { ChevronDownIcon } from "lucide-react-native";
import { Input, InputField } from "../ui/input";
import { useState } from "react";
import { auth, db } from "@/firebase";
import { Auth } from "firebase/auth";
import { ChallengeType } from "@/types/ChallengeTypes";
import { doc, setDoc } from "firebase/firestore";
import { checkChallengeName } from "./AddingChallengePopup";

type PremadeChallengePopupProps = {
    refreshChallenges: () => Promise<void>;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const PremadeChallengePopup: React.FC<PremadeChallengePopupProps> = ({refreshChallenges, isOpen, setIsOpen}) => {
    const authRef: Auth = auth();

    const [name, setName] = useState<string>("");
    const [nameInvalid, setNameInvalid] = useState<boolean>(false);
    const [nameErrorMessage, setNameErrorMessage] = useState<string>("");

    const [challenge, setChallenge] = useState<string>("");
    const [challengeInvalid, setChallengeInvalid] = useState<boolean>(false);

    const createChallenge = async() => {
        try {
            console.log("create");
            if (authRef.currentUser) {
                // get values for selected challenge
                var amount = 0
                var deadlineInDays = 0;
                switch (challenge) {
                    case "$100 in 2 weeks":
                        console.log("100/14");
                        amount = 100;
                        deadlineInDays = 14;
                        break;
                    case "$200 in 2 weeks":
                        console.log("200/14");
                        amount = 200;
                        deadlineInDays = 14;
                        break;
                    case "$500 in 30 days":
                        console.log("500/30");
                        amount = 500;
                        deadlineInDays = 30;
                        break;
                    case "$1,000 in 30 days":
                        console.log("1000/30");
                        amount = 1000;
                        deadlineInDays = 30;
                        break;
                    case "$1,000 in 90 days":
                        console.log("1000/90");
                        amount = 1000;
                        deadlineInDays = 90;
                        break;
                    case "$2,000 in 90 days":
                        console.log("2000/90");
                        amount = 2000;
                        deadlineInDays = 90;
                        break;
                    case "$2,500 in 6 months":
                        console.log("2500/180");
                        amount = 2500;
                        deadlineInDays = 180;
                        break;
                    case "$5,000 in 6 months":
                        console.log("5000/180");
                        amount = 5000;
                        deadlineInDays = 180;
                        break;
                    case "$5,000 in 1 year":
                        console.log("5000/365");
                        amount = 5000;
                        deadlineInDays = 365;
                        break;
                    case "$10,000 in 1 year":
                        console.log("10000/365");
                        amount = 10000
                        deadlineInDays = 365
                        break;
                    default:
                        setChallengeInvalid(true);
                        return;
                }

                // make name if entered name
                let actualName: string = "";
                if (name !== "") {
                    console.log("user entered custom name");
                    actualName = name + ": " + challenge;
                } else {
                    console.log("user didnt enter a name");
                    setNameErrorMessage("Required Field: Name must be entered.");
                    setNameInvalid (true);
                    return;
                }

                if (await checkChallengeName(actualName)) {
                    setNameErrorMessage("Challenge with name already exists.");
                    setNameInvalid(true);
                    return;
                }

                // calculate when deadline is
                const d = calculateDeadline(deadlineInDays);
                if (d === "") {
                    alert("no deadline currently");
                    return;
                }
                const date = d.split("-");

                // create challenge
                const data: ChallengeType = {name: actualName, amount: 0, totalAmount: amount, deadline: d, year: date[0], month: date[1], day: date[2]};
                const challengeDoc = doc(db, 'users', authRef.currentUser.uid, 'challenges', actualName);
                await setDoc(challengeDoc, data, {merge: true});
                refreshChallenges();
                onClose();
            }
        } catch (e) {
            console.log(e);
        }
    }

    function calculateDeadline(deadlineInDays: number): string {
        const currentDate = new Date();
            const currentDay = currentDate.getDate();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();
            const daysInCurrentMonth = getDaysInMonth(currentMonth);

            console.log(currentDay + deadlineInDays);
            console.log(deadlineInDays);

            if (currentDay + deadlineInDays > daysInCurrentMonth) {
                console.log("date overflow");
                
                var daysLeftInMonth = daysInCurrentMonth-currentDay;
                var daysLeftTillDeadline = deadlineInDays-daysLeftInMonth;
                
                var day = currentDay;
                var month = currentMonth + 1;
                var year = currentYear;

                var daysInNextMonth = getDaysInMonth(currentMonth+1);

                while (daysLeftTillDeadline > daysInNextMonth) {
                    daysLeftTillDeadline = daysLeftTillDeadline - daysInNextMonth;

                    if (month == 11) {
                        month = 0
                        year += 1;
                    } else {
                        month += 1;
                    }
                    daysInNextMonth = getDaysInMonth(month);
                }
                day = daysLeftTillDeadline;
                return year + "-" + (month+1) + "-" + day;
            } else {
                console.log("no date overflow");
                return currentYear + "-" + (currentMonth+1) + "-" + (currentDay+deadlineInDays);
            }
    }

    function getDaysInMonth(m: number): number {
        switch(m) {
            case 0: 
            case 2:
            case 4:
            case 6:
            case 7:
            case 9:
            case 11:
                return 31;
            case 3:
            case 5:
            case 8:
            case 10:
                return 30;
            case 1:
                return 28;
            default:
                return -1;
        }
    }

    const onClose = () => {
        setName("");
        setChallenge("");
        setNameInvalid(false);
        setChallengeInvalid(false);
        setIsOpen(false);
    }

    return (
        <Center>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                size="md"
            >
                <ModalBackdrop />
                <ModalContent style={{maxWidth: 900, maxHeight: 600, alignSelf: 'center', padding: 10, backgroundColor: "#9fb8ad"}}>
                    <ModalHeader>
                        <Heading>Create Pre-made Challenge</Heading>
                        <ModalCloseButton onPress={onClose}>
                            <Icon as={CloseIcon} size="md" />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody style={{margin: 5}} >
                        <FormControl isInvalid={nameInvalid}>
                            <FormControlLabel>
                                <FormControlLabelText>Challenge Name</FormControlLabelText>
                            </FormControlLabel>
                            <Input style={{borderColor: "black", backgroundColor: "#E6E8E6"}}>
                                <InputField onChangeText={(s: string) => setName(s)}/>
                            </Input>
                            <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>{nameErrorMessage}</FormControlErrorText>
                            </FormControlError>
                        </FormControl>
                        <FormControl isInvalid={challengeInvalid}>
                            <FormControlLabel>
                                <FormControlLabelText>Challenge Options</FormControlLabelText>
                            </FormControlLabel>
                            <Select onValueChange={(v: string) => {
                                setChallengeInvalid(false);
                                setChallenge(v)}}>
                                <SelectTrigger variant="outline" size="md" style={{borderColor: "black", backgroundColor: "#E6E8E6"}}>
                                    <SelectInput placeholder="Select Challenge"/>
                                    <SelectIcon className="mr-3" as={ChevronDownIcon}/>
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent>
                                        <SelectItem label="$100 in 2 weeks" value="$100 in 2 weeks" />
                                        <SelectItem label="$200 in 2 weeks" value="$200 in 2 weeks" />
                                        <SelectItem label="$500 in 30 days" value="$500 in 30 days" />
                                        <SelectItem label="$1,000 in 30 days" value="$1,000 in 30 days" />
                                        <SelectItem label="$,1000 in 90 days" value="$1,000 in 90 days" />
                                        <SelectItem label="$2,000 in 90 days" value ="$2,000 in 90 days" />
                                        <SelectItem label="$2,500 in 6 months" value="$2,500 in 6 months" />
                                        <SelectItem label="$5,000 in 6 months" value="$5,000 in 6 months" />
                                        <SelectItem label="$5,000 in 1 year" value="$5,000 in 1 year" />
                                        <SelectItem label="$10,000 in 1 year" value="$10,000 in 1 year" />
                                    </SelectContent>
                                </SelectPortal>
                            </Select>
                            <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>Must Select an option.</FormControlErrorText>
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

export default PremadeChallengePopup;