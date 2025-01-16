import { BalanceType } from "@/pages/ExpensesPage";
import { Card } from "./ui/card";
import { VStack } from "./ui/vstack";
import { Text } from "./ui/text";

export interface BalanceProps {
    data: BalanceType;
    refresh: () => Promise<void>;
}

const Expense: React.FC<BalanceProps>= ({data, refresh}) => {

    return (
        <Card>
            <VStack>
                <Text><Text style={{fontWeight: "bold"}}>Name:</Text> {data.balanceName}</Text>
                <Text><Text style={{fontWeight: "bold"}}>Amount:</Text> ${typeof data.balanceAmount === "number" ? data.balanceAmount.toFixed(2) : "0.00"}</Text>
            </VStack>
        </Card>
    )
}

export default Expense;