import React from "react";
import { Card } from "./ui/card";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";
import { ExpenseNaviagationProp } from "@/Routes";
import { useNavigation } from "@react-navigation/native";
import { Pressable } from "./ui/pressable";
import { HStack } from "./ui/hstack";
import { View } from "react-native";
import { ExpenseProps } from "./Expense";

const HomePageExpense: React.FC<ExpenseProps>= ({data, refresh}) => {
    const nav = useNavigation<ExpenseNaviagationProp>();

    const categoryColors: Record<string, string> = {
        Housing: "#FF871F", 
        Food: "#A01EE1", 
        Transport: "#41D4DC", 
        Health: "#FF0035", 
        Personal: "#37D45E", 
        Entertainment: "#E13FC9",
        Finance: "#FED047",
        Education: "#1C110A", 
        Family: "#1C47D4", 
        Miscellaneous: "#036D19", 
    };

    const categoryColor = categoryColors[data.category] || "#FFFFFF";
    return (
        <Card style={{backgroundColor: "#E6E8E6"}}>
            <VStack>
                <Pressable>
                    <HStack style={{ justifyContent: "space-between" }}>
                    <VStack  style={{flex: 1,paddingRight: 20}}>
                        <Text size="xl" style={{paddingBottom: 10}}><Text style={{fontWeight: "bold"}}>Name:</Text> {data.name}</Text>
                        <Text style={{fontWeight: "bold"}}>Amount:</Text>
                        <Text size="3xl" style={{paddingBottom: 10, fontWeight: "bold"}}> ${typeof data.amount === "number" ? data.amount.toFixed(2) : "0.00"}</Text>

                    </VStack>
                    <VStack style={{ flex: 1 }}>
                        <Text style={{paddingBottom: 10}}>
                            <Text style={{fontWeight: "bold", paddingBottom: 10}}>Date:</Text> {data.year  ?? "YYYY"}-
                            {(typeof data.month === "number" ? data.month.toString().padStart(2, '0') : "MM")}-
                            {(typeof data.date === "number" ? data.date.toString().padStart(2, '0') : "DD")}
                        </Text>
                        <Text style={{ fontWeight: "bold", paddingBottom: 10 }}>Category:</Text> 
                        <View 
                            style={{ 
                                backgroundColor: categoryColor, 
                                paddingVertical: 2,  // Add vertical padding
                                borderRadius: 8,     // Round the corners
                            }}
                        >
                            <Text size="sm" style={{ color: "white", fontWeight: "bold", 
                                            textShadowColor: "#000000", // Black shadow for the outline
                                            textShadowOffset: { width: -1, height: 1 }, // Position the shadow around the text
                                            textShadowRadius: 1, // Blur radius for the shadow
                                 backgroundColor: categoryColor, padding: 4, borderRadius: 4, alignSelf: "center" }}>
                                {data.category}
                            </Text>
                        </View>
                    </VStack>
                    </HStack>
                </Pressable>
            </VStack>
        </Card>
    )
}

export default HomePageExpense;