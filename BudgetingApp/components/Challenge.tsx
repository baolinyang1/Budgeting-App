import React from "react";
import { Card } from "./ui/card";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";
import { Center } from "./ui/center";
import { Pressable } from "./ui/pressable";
import { useNavigation } from "@react-navigation/native";
import { ChallengeNaviagationProp } from "@/Routes";
import { ChallengeType } from "@/types/ChallengeTypes";
import { Heading } from "./ui/heading";
import { Progress, ProgressFilledTrack } from "./ui/progress";

export interface ChallengeProps {
    data: ChallengeType;
    refeshHome: () => Promise<void>;
}

const Challenge: React.FC<ChallengeProps>= ({data, refeshHome}) => {
    const nav = useNavigation<ChallengeNaviagationProp>();

    const calculateDaysTill = () => {
        const todaysDate: Date = new Date();
        const deadlineDate: Date = new Date(data.deadline);

        const diffMill = deadlineDate.getTime() - todaysDate.getTime();

        if (diffMill < 0) {
            return "Goal Date has Passed!"
        } else {
            const diffDays = Math.floor(diffMill / (1000 * 60 * 60 * 24)) + 1;
            return diffDays;
        }
    }

    return (
        <Center>
            <Card style={{width: "80%"}}>
                <Pressable onPress={() => nav.navigate('ChallengeInfo', {data: data, refeshChallengesHome: refeshHome})}>
                <VStack style={{paddingBlock: 5}}>
                    <Heading style={{padding: 2, paddingBottom: 10}}>{data.name}</Heading>
                    <Progress value={(data.amount/data.totalAmount)*100} size="lg" orientation="horizontal" style={{padding: 2}}>
                        <ProgressFilledTrack />
                    </Progress>
                    <Text style={{padding: 2, paddingTop: 10}}>Days until deadline: <Text style={{fontWeight: "bold"}}>{calculateDaysTill()}</Text></Text>
                    <Text style={{padding: 2}}>Total Amount: <Text style={{fontWeight: "bold"}}>${data.totalAmount}</Text></Text>
                </VStack>
                </Pressable>
            </Card>
        </Center>
    )
}

export default Challenge;