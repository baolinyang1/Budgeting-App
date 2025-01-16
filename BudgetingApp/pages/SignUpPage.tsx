import React from "react";
import { useNavigation } from "@react-navigation/native";

// gluestack imports
import { Button, ButtonText } from "@/components/ui/button";
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";

// firebase imports
import { auth, db } from "@/firebase";
import { createUserWithEmailAndPassword, User } from "firebase/auth";

import { HomeScreenNavigationProp } from "@/Routes";
import { Center } from "@/components/ui/center";
import { doc, setDoc } from "firebase/firestore";
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from "lucide-react-native";

interface SignInPageprops {
    setSignIn: (b: boolean) => void;
}

const SignUpPage: React.FC<SignInPageprops> = ({setSignIn}) => {
    const [email, setEmail] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");

    const nav = useNavigation<HomeScreenNavigationProp>();

    const createUserData = async(u: User) => {
        const user = {
            email: u.email,                    
            uid: u.uid,
            balance: 0
        }
        const userDoc = doc(db, 'users', u.uid);
        await setDoc(userDoc, user, {merge:true})
    }

    const [showPassword, setShowPassword] = React.useState<boolean>(false);
    function handlePasswordState() {
    setShowPassword((showstate) => {
        return !showstate
        });
        
    }

    const [isError, setIsError] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string>("");

    const signup = () => {
        const appAuth = auth();
        createUserWithEmailAndPassword(appAuth, email, password)
            .then((userCredential) => {
                createUserData(userCredential.user);
                setSignIn(true);
            }).catch((err) => {
                console.log(err);
                setErrorMessage(err.message);
                setIsError(true);

            });
    }

    return(
        <Center style={{ flex: 1, justifyContent: 'center', backgroundColor: "#9fb8ad"}}>
            <VStack space="md" reversed={false} style={{alignItems:"stretch", width: '70%'}}>
                <FormControl>
                    <FormControlLabel>
                        <FormControlLabelText style={{ fontSize: 18, width: '200%' }}>Email</FormControlLabelText>
                    </FormControlLabel>
                    <Input style={{borderColor: "#3f403f", backgroundColor: "#e6e8e6"}}>
                        <InputField onChangeText={(e: string) => setEmail(e)} />
                    </Input>
                </FormControl>
                <FormControl isInvalid={isError}>
                    <FormControlLabel>
                        <FormControlLabelText style={{ fontSize: 18, width: '200%' }}>Password</FormControlLabelText>
                    </FormControlLabel>
                    <Input style={{borderColor: "#3f403f", backgroundColor: "#e6e8e6"}}>
                        <InputField onChangeText={(e: string) => setPassword(e)} type={showPassword ? "text" : "password"}/>
                        <InputSlot className="pr-3" onPress={handlePasswordState} style={{padding:10}}>
                            <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} stroke="black" />
                        </InputSlot>
                    </Input>
                    <FormControlError>
                        <FormControlErrorIcon as={AlertCircleIcon} />
                        <FormControlErrorText>{errorMessage}</FormControlErrorText>
                    </FormControlError>
                </FormControl> 
                <Button size="lg" variant="solid" action="primary" onPress={signup} style={{ marginTop: 30 }}>
                    <ButtonText>Sign Up</ButtonText>
                </Button>
            </VStack>
        </Center>
    )
}

export default SignUpPage;

