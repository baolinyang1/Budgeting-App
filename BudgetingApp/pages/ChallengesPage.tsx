import Challenge from "@/components/Challenge";
import ChallengeCreationMenu from "@/components/ChallengeCreationMenu";
import { Center } from "@/components/ui/center"
import { VStack } from "@/components/ui/vstack";
import { auth, db } from "@/firebase";
import { ChallengeType } from "@/types/ChallengeTypes";
import { useFocusEffect } from "@react-navigation/native";
import { collection, getDocs } from "firebase/firestore";
import React from "react";
import { ScrollView } from "react-native";

const ChallengesPage = () => {
    const [challenges, setChallenges] = React.useState<ChallengeType[]>([]);

    const getChallenges = async() => {
        const authRef = auth();
        if (authRef.currentUser) {
            const challengesRef = collection(db, 'users', authRef.currentUser.uid, 'challenges');
            const challengesSnap = await getDocs(challengesRef);

            let c: ChallengeType[] = [];
            challengesSnap.forEach((i) => {
                const d = i.data();
                c.push({name: d.name, amount: d.amount, totalAmount: d.totalAmount, deadline: d.deadline, year: d.year, month: d.month, day: d.day});
            });
            setChallenges(c);
        }
    }

    useFocusEffect(
        React.useCallback(() => {
            getChallenges();
        }, [])
    );

    return (
        <Center style={{width: "100%", height: "100%", backgroundColor: "#9fb8ad"}}>
            <ScrollView 
                contentContainerStyle={{ 
                    maxWidth: 400, 
                    alignItems: "center", 
                    paddingVertical: 10,
                    paddingBottom: 90,
                    flex: 1 
                }}
                style={{ width: "100%", maxHeight: "100%"}} 
            >
                <VStack space="xl" style={{width: "95%"}} >
                    {challenges.map((c) => (
                        <Challenge data={c} key={c.name} refeshHome={getChallenges}/>
                    ))}
                </VStack>
                <ChallengeCreationMenu getChallenges={getChallenges}/>
            </ScrollView>
            
        </Center>
        
    )
}

export default ChallengesPage;
