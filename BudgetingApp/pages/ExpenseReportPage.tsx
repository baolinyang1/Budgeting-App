import React, { useState, useEffect } from "react";
import { View, Dimensions, ScrollView } from "react-native";
import { PieChart, LineChart } from "react-native-chart-kit";
import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/firebase";

const screenWidth = Dimensions.get("window").width;

  /**
    * Interface representing the structure of data used for a line chart.
    * 
    * This interface defines the data format required for displaying a line chart. It includes labels for the x-axis,
    * datasets containing the actual data points, and a legend to describe the data.
    * 
    * Properties:
    * - `labels` (string[]): An array of labels representing the x-axis points for the chart (e.g., months or categories).
    * 
    * - `datasets` (object[]): An array of datasets, each containing:
    *   - `data` (number[]): The data points to be plotted on the chart.
    *   - `color` (function): A function to generate the color of the data line.
    *     - Parameters:
    *       - `opacity` (number): The opacity of the color (between 0 and 1).
    *     - Returns: A string representing the RGBA color.
    *   - `strokeWidth` (number): The width of the line used to plot the dataset.
    * 
    * - `legend` (string[]): An array of strings representing the legend for the chart, explaining each dataset.
    */

interface LineChartData {
    labels: string[];
    datasets: {
        data: number[];
        color: (opacity: number) => string;
        strokeWidth: number;
    }[];
    legend: string[];
}

const ExpenseReportPage: React.FC = () => {
    const [chartData, setChartData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("food"); // Default food selection
    const [lineChartData, setLineChartData] = useState<LineChartData | null>(null);
    const [monthlyAverages, setMonthlyAverages] = useState<Record<string, number>>({});
    /**
      * Fetches the user's expenses from the Firebase database.
      * 
      * This function retrieves all expenses of the currently authenticated user from the Firestore database.
      * It first checks if there is an authenticated user, and then queries the user's expenses collection.
      * If there is no authenticated user or an error occurs, an empty array is returned.
      * 
      * Parameters: None
      * 
      * Returns:
      * - A promise that resolves to an array of expense objects if the user is authenticated.
      * - Returns an empty array if there is no authenticated user or if an error occurs during data retrieval.
      * 
      * Side effects:
      * - Logs a message to the console if there is no authenticated user.
      * - Logs an error message to the console if the data fetching fails.
      * 
      * Notes:
      * - The expenses are fetched from the collection path: `users/{userId}/expenses`.
      * - Each document in the collection is mapped to its data object.
      */

    const fetchUserExpenses = async () => {
        try {
            const authRef = auth();
            if (authRef.currentUser) {
                const expensesRef = collection(db, 'users', authRef.currentUser.uid, 'expenses');
                const expensesSnap = await getDocs(expensesRef);
                return expensesSnap.docs.map((doc) => doc.data());
            } else {
                console.log("No authenticated user found.");
                return [];
            }
        } catch (err) {
            console.error("Error fetching expenses: ", err);
            return [];
        }
    };

    /**
       * Generates the expense report for the user based on fetched data.
       * 
       * This function performs multiple tasks to generate the expense report:
       * - Fetches all user expenses from the database.
       * - Summarizes expenses by category to prepare data for a pie chart.
       * - Prepares data for a line chart showing monthly expenses for the selected category.
       * - Calculates the average monthly expenditure for each category.
       * - Updates various states to display the generated report.
       * 
       * Parameters: None
       * 
       * Returns: None
       * 
       * Side effects:
       * - Updates `chartData` state to store category-wise data for the pie chart.
       * - Updates `lineChartData` state to store monthly data for the selected category's line chart.
       * - Updates `monthlyAverages` state to store the calculated monthly average for each category.
       * - Sets `error` state if fetching or processing expenses fails.
       * 
       * Logic Overview:
       * - **Expense Summarization**: The function summarizes total spending for each category using the `expenses` array.
       * - **Chart Data Preparation**: Converts summarized category data into the format needed for the pie chart, using predefined colors.
       * - **Monthly Data Calculation**: Filters expenses by selected category, aggregates them by month, and prepares data for the line chart.
       * - **Monthly Average Calculation**: Calculates the average monthly expense for each category and updates the state.
       * 
       * Notes:
       * - The function uses a fixed set of colors to differentiate pie chart categories.
       * - The line chart's color is dynamically generated using RGBA format with adjustable opacity.
       */
    const handleGenerateReport = async () => {
        try {
            setError(null);
            const expenses = await fetchUserExpenses();

            // Summarize the amount spent in each category
            const categoryTotals: Record<string, number> = {};
            expenses.forEach((expense: any) => {
                if (!categoryTotals[expense.category]) {
                    categoryTotals[expense.category] = 0;
                }
                categoryTotals[expense.category] += expense.amount;
            });

            // Calculate the number of months between the earliest and latest dates
            let earliestYear = Infinity;
            let earliestMonth = Infinity;
            let latestYear = -Infinity;
            let latestMonth = -Infinity;

            expenses.forEach((expense: any) => {
                if (expense.year < earliestYear || (expense.year === earliestYear && expense.month < earliestMonth)) {
                    earliestYear = expense.year;
                    earliestMonth = expense.month;
                }
                if (expense.year > latestYear || (expense.year === latestYear && expense.month > latestMonth)) {
                    latestYear = expense.year;
                    latestMonth = expense.month;
                }
            });

            const monthsCount = (latestYear - earliestYear) * 12 + (latestMonth - earliestMonth + 1);

            // Calculate the average monthly expenditure for each type
            const averages: Record<string, number> = {};
            Object.keys(categoryTotals).forEach((category) => {
                averages[category] = categoryTotals[category] / monthsCount;
            });
            setMonthlyAverages(averages);

            // Calculate total average monthly expenditure
            const totalAverage = Object.values(averages).reduce((acc, val) => acc + val, 0);

            // Convert to pie chart data format using monthly averages
            const colors = ["#F00", "#0F0", "#00F", "#FF0", "#0FF", "#A0A"];
            const chartData = Object.keys(averages).map((category, index) => ({
                name: category,
                population: averages[category],
                color: colors[index % colors.length],
                legendFontColor: "#7F7F7F",
                legendFontSize: 15,
            }));

            setChartData(chartData);

            // Generate line chart data
            const selectedCategoryData = expenses.filter(expense => expense.category === selectedCategory);
            const monthlyData: Record<string, number> = {};
            selectedCategoryData.forEach((expense: any) => {
                const key = `${expense.year}-${String(expense.month).padStart(2, '0')}`;
                if (!monthlyData[key]) {
                    monthlyData[key] = 0;
                }
                monthlyData[key] += expense.amount;
            });

            const labels = Object.keys(monthlyData).sort();
            const data = labels.map(label => monthlyData[label]);

            setLineChartData({
                labels,
                datasets: [
                    {
                        data,
                        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
                        strokeWidth: 2,
                    }
                ],
                legend: ["Monthly Expenses for " + selectedCategory]
            });
        } catch (err) {
            setError("Failed to fetch expenses. Please try again.");
            console.error(err);
        }
    };

    useEffect(() => {
        handleGenerateReport();
    }, [selectedCategory]);

    return (
        <ScrollView style={{ flex: 1, paddingBottom: 200, backgroundColor: "#9fb8ad" }}>
            <Box style={{ padding: 16, paddingBottom: 200  }}>
                <Button style={{ marginTop: 20 }} onPress={handleGenerateReport}>
                    <Text style={{color: "#E6E8E6"}}>Generate Report</Text>
                </Button>

                {error && (
                    <Text style={{ color: "red", marginTop: 20 }}>{error}</Text>
                )}

                {chartData.length > 0 && (
                    <Box style={{ marginTop: 20 }}>
                        <Text size="lg" style={{ marginBottom: 10, color: "#000" }}>Average Monthly Expense Report($)</Text>
                        <Text size="md" style={{ marginBottom: 10, color: "#000" }}>Total Average Monthly Expense: ${Object.values(monthlyAverages).reduce((acc, val) => acc + val, 0).toFixed(2)}</Text>
                        <PieChart
                            data={chartData}
                            width={screenWidth}
                            height={220}
                            chartConfig={{
                                backgroundGradientFrom: "#1E2923",
                                backgroundGradientTo: "#08130D",
                                color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
                            }}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                        />
                    </Box>
                )}

                {chartData.length > 0 && (
                    <Box style={{ marginTop: 20 }}>
                        <Text size="lg" style={{ marginBottom: 10, color: "#000" }}>Select Expense Category</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            {chartData.map((item, index) => (
                                <Button
                                    key={index}
                                    style={{
                                        margin: 5,
                                        backgroundColor: selectedCategory === item.name ? "#4682B4" : "#d3d3d3"
                                    }}
                                    onPress={() => setSelectedCategory(item.name)}
                                >
                                    <Text style={{color: "#000"}}>{item.name}</Text>
                                </Button>
                            ))}
                        </View>
                    </Box>
                )}

                {lineChartData && lineChartData.labels.length > 0 && (
                    <Box style={{ marginTop: 40 }}>
                        <Text size="lg" style={{ marginBottom: 10, color: "#000" }}>Monthly Expense Trend for {selectedCategory}</Text>
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
                        <LineChart
                            data={lineChartData}
                            width={500}
                            height={220}
                            chartConfig={{
                                backgroundGradientFrom: "#1E2923",
                                backgroundGradientTo: "#08130D",
                                color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                strokeWidth: 2,
                            }}
                        />
                        </ScrollView>
                    </Box>
                )}
            </Box>
        </ScrollView>
    );
};

export default ExpenseReportPage;
