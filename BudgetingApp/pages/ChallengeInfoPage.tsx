import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { ChallengeNaviagationProp, ChallengeParamList } from "@/Routes";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import ChallengeAddSavingPopup from "@/components/popups/ChallengeAddSavingPopup";
import { auth, db } from "@/firebase";
import React from "react";
import { doc, getDoc } from "firebase/firestore";
import { ProgressChart } from "react-native-chart-kit";

import { Dimensions } from "react-native";
import { Box } from "@/components/ui/box";
import { ChallengeInfo } from "@/types/ChallengeTypes";
import EditingChallengePopup from "@/components/popups/EditingChallengePopup";
const screenWidth = Dimensions.get("window").width;

export type ChallengeInfoPageRouteProp = RouteProp<ChallengeParamList, 'ChallengeInfo'>;

const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#1E2923",
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false // optional
  };



const ChallengeInfoPage = () => {
    const authRef = auth();
    const route = useRoute<ChallengeInfoPageRouteProp>();
    const data = route.params.data;
    const [cData, setCData] = React.useState<ChallengeInfo[]>([]);
    const nav = useNavigation<ChallengeNaviagationProp>();

    async function getChallengeInfo() {
        if (authRef.currentUser) {
            const cRef = doc(db, 'users', authRef.currentUser.uid, 'challenges', data.name);
            const cSnap = await getDoc(cRef);

            if (cSnap.exists()) {
                const cd = cSnap.data();
                setCData([{challenge: {name: cd.name, amount: cd.amount, totalAmount: cd.totalAmount, deadline: cd.deadline, year: cd.year, month: cd.month, day: cd.day},
                           chart: {data: [cd.amount/cd.totalAmount]}}]);
            }
        }
    }

    React.useEffect(() => {
        getChallengeInfo();
    }, []);

    async function navigateBackToHome () {
        route.params.refeshChallengesHome();
        nav.navigate("ChallengesHome");
    }
    
    return(
        <Center style={{flex: 1, backgroundColor: "#9fb8ad", alignContent: 'center'}}>
            <Box style={{alignItems: "center", marginTop: -50}}>
            {cData.map((c) => (
                <Card key={c.challenge.name}>
                    <Center>
                        <Heading>{c.challenge.name}</Heading>
                    </Center>
                    <Box style={{alignItems: "center", justifyContent: "center"}}>
                        <ProgressChart 
                            data={c.chart} 
                            chartConfig={chartConfig} 
                            width={200} 
                            height={220}
                            radius={80}
                            hideLegend
                            strokeWidth={25}
                        />
                        <Box style={{position: "absolute", alignItems: "center", justifyContent: "center"}}>
                            <Heading>{((c.challenge.amount / c.challenge.totalAmount) * 100).toFixed(2)}% Done</Heading>
                            <Heading>${c.challenge.amount}/${c.challenge.totalAmount}</Heading>
                        </Box>
                    </Box>
                    <ChallengeAddSavingPopup name={c.challenge.name} refresh={getChallengeInfo}/>
                    <HStack style={{paddingVertical: 30}}>
                        <Text><Text style={{fontWeight: "bold"}}>Deadline Date:</Text> {c.challenge.deadline} </Text>
                    </HStack>
                    <EditingChallengePopup name={c.challenge.name} refresh={getChallengeInfo} navigateBackToHome={navigateBackToHome}/>
                </Card>
            ))}
            </Box>
        </Center>
    )
}

export default ChallengeInfoPage;