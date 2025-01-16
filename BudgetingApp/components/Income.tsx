import React from "react";
import { Card } from "./ui/card";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";
import { IncomeType } from "@/pages/ExpensesPage";
import { ExpenseNaviagationProp } from "@/Routes";
import { useNavigation } from "@react-navigation/native";
import { Pressable } from "./ui/pressable";
import { HStack } from "./ui/hstack";

export interface IncomeProps {
    data: IncomeType;
    refresh: () => Promise<void>;
}

const Income: React.FC<IncomeProps>= ({data, refresh}) => {
    const nav = useNavigation<ExpenseNaviagationProp>();

    return (
        <Card style={{backgroundColor: "#E6E8E6"}}>
            <VStack>
                <Pressable onPress={() => nav.navigate('IncomeInfo', {data: data, refresh: refresh})}>
                    {/* <Text><Text style={{fontWeight: "bold"}}>Name:</Text> {data.incomeName}</Text>
                    <Text><Text style={{fontWeight: "bold"}}>Amount:</Text> ${typeof data.incomeAmount === "number" ? data.incomeAmount.toFixed(2) : "0.00"}</Text>
                    <Text><Text style={{fontWeight: "bold"}}>Date:</Text> {data.incomeYear  ?? "YYYY"}-
                    {(typeof data.incomeMonth === "number" ? data.incomeMonth.toString().padStart(2, '0') : "MM")}-
                    {(typeof data.incomeDate === "number" ? data.incomeDate.toString().padStart(2, '0') : "DD")}</Text>
                    <Text><Text style={{fontWeight: "bold"}}>Description:</Text> {data.incomeDescription}</Text>
 */}

                    <VStack style={{}}>
                    <HStack  style={{flex: 1,paddingRight: 20, justifyContent: "space-between"}}>
                        <Text size="xl" style={{paddingBottom: 10}}><Text style={{fontWeight: "bold"}}>Name:</Text> {data.incomeName}</Text>
                        <Text style={{paddingBottom: 10}}>
                            <Text style={{fontWeight: "bold", paddingBottom: 10}}>Date:</Text> {data.incomeYear  ?? "YYYY"}-
                            {(typeof data.incomeMonth === "number" ? data.incomeMonth.toString().padStart(2, '0') : "MM")}-
                            {(typeof data.incomeDate === "number" ? data.incomeDate.toString().padStart(2, '0') : "DD")}
                        </Text>
                    </HStack>
                    <VStack style={{ flex: 1, alignSelf: "center", alignItems: "center" }}>
                        
                        <Text style={{fontWeight: "bold"}}>Amount:</Text>
                        <Text size="2xl" style={{paddingBottom: 10, fontWeight: "bold"}}> ${typeof data.incomeAmount === "number" ? data.incomeAmount.toFixed(2) : "0.00"}</Text>

                    </VStack>
                    </VStack>
                </Pressable>
            </VStack>
        </Card>
    )
}

export default Income;