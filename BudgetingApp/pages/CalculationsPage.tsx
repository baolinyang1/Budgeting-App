import React, { useState } from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { PieChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native'; 
import { Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectItem } from '@/components/ui/select';
import { CalculationNavigationProp } from '@/Routes';

const screenWidth = Dimensions.get('window').width;

const CalculationsPage: React.FC = () => {
    const [totalAmount, setTotalAmount] = useState<number | null>(null);
    const [categories, setCategories] = useState<{ name: string; percentage: number }[]>([]);
    const [results, setResults] = useState<{ name: string; amount: number; color: string }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showResults, setShowResults] = useState<boolean>(false);

    const navigation = useNavigation<CalculationNavigationProp>();

    const availableCategories = ['Food', 'Housing', 'Transport', 'Health', 'Entertainment'];

     /**
     * Adds a new category to the list of categories.
     * 
     * This function appends a new category object to the existing list of categories. 
     * The new category will have a default name (the first available category) and a percentage of 0.
     * 
     * Parameters: None
     * 
     * Returns: None
     * 
     * Side effects:
     * - Updates the `categories` state by adding a new category to it.
     */

    const addCategory = () => {
        setCategories([...categories, { name: availableCategories[0], percentage: 0 }]);
    };

    /**
     * Calculates the total amount distribution across categories and generates the result.
     * 
     * This function calculates the amount for each category based on the total amount and the given percentages.
     * If the sum of all percentages exceeds 100%, an error message is set, and results are not generated.
     * If the total percentage is less than 100%, an additional 'Extra' category is added to account for the remaining percentage.
     * The final result is stored in the `results` state to be displayed in a chart format.
     * 
     * Parameters: None
     * 
     * Returns: None
     * 
     * Side effects:
     * - Sets an error message in the `error` state if percentages exceed 100%.
     * - Updates the `results` state with calculated values for each category.
     * - Updates `showResults` to control the display of results.
     * 
     * Notes:
     * - If the `totalAmount` is not provided, the function exits without performing any calculations.
     * - Uses hardcoded color values to differentiate between categories.
     */

    const calculate = () => {
        const totalPercentage = categories.reduce((sum, category) => sum + category.percentage, 0);

        if (totalPercentage > 100) {
            setError('Over 100%. Please click "Clean" and try again.');
            setShowResults(false);
            return;
        }

        if (!totalAmount) return;

        setError(null);

        const colors = ['#F00', '#0F0', '#00F', '#FF0', '#0FF'];
        const calculatedResults = categories.map((category, index) => ({
            name: category.name,
            amount: (totalAmount * category.percentage) / 100,
            population: (totalAmount * category.percentage) / 100,
            color: colors[index % colors.length],
            legendFontColor: '#7F7F7F',
            legendFontSize: 15,
        }));

        if (totalPercentage < 100) {
            const extraPercentage = 100 - totalPercentage;
            calculatedResults.push({
                name: 'Extra',
                amount: (totalAmount * extraPercentage) / 100,
                population: (totalAmount * extraPercentage) / 100,
                color: '#CCCCCC',
                legendFontColor: '#7F7F7F',
                legendFontSize: 15,
            });
        }

        setResults(calculatedResults);
        setShowResults(true);
    };

    /**
     * Resets all inputs and results to their initial state.
     * 
     * This function clears all user inputs and calculation results, effectively resetting the UI to its initial state.
     * It sets `totalAmount` to null, clears the list of `categories`, removes any previously calculated results,
     * and clears any error messages. Additionally, it sets `showResults` to false, ensuring that the results section is hidden.
     * 
     * Parameters: None
     * 
     * Returns: None
     * 
     * Side effects:
     * - Updates the following states:
     *   - `totalAmount` to null.
     *   - `categories` to an empty list.
     *   - `results` to an empty list.
     *   - `error` to null.
     *   - `showResults` to false.
     */

    const clean = () => {
        setTotalAmount(null);
        setCategories([]);
        setResults([]);
        setError(null);
        setShowResults(false);
    };

    /**
     * Updates a specific category's attribute (name or percentage).
     * 
     * This function modifies the specified category in the `categories` list.
     * It uses the `index` to locate the category that needs to be updated and then updates either its `name` or `percentage`.
     * If the `percentage` is being updated, the value is parsed to a floating-point number, defaulting to 0 if invalid.
     * 
     * Parameters:
     * - `index` (number): The index of the category to be updated.
     * - `key` ('name' | 'percentage'): The attribute of the category to be updated. It can be either `'name'` or `'percentage'`.
     * - `value` (string): The new value to set for the specified attribute. 
     *   - If the `key` is `'percentage'`, `value` is parsed as a float to ensure it is numeric.
     * 
     * Returns: None
     * 
     * Side effects:
     * - Updates the `categories` state by modifying the specified category with the new value.
     */

    const updateCategory = (index: number, key: 'name' | 'percentage', value: string) => {
        const updatedCategories = categories.map((category, i) =>
            i === index
                ? {
                    ...category,
                    [key]: key === 'percentage' ? parseFloat(value) || 0 : value,
                }
                : category
        );
        setCategories(updatedCategories);
    };

    /**
     * Configuration object for customizing the appearance of charts.
     * 
     * This object is used to configure various visual aspects of the chart, such as background gradients and color.
     * 
     * Properties:
     * - `backgroundGradientFrom` (string): Specifies the starting color of the background gradient.
     *   - Value: `'#1E2923'` (dark green color).
     * 
     * - `backgroundGradientTo` (string): Specifies the ending color of the background gradient.
     *   - Value: `'#08130D'` (dark green/black color).
     * 
     * - `color` (function): A function that determines the color of chart elements, such as bars or lines.
     *   - Parameters:
     *     - `opacity` (number, optional): The opacity value for the color, defaults to 1 (fully opaque).
     *   - Returns: A string representing the RGBA color value, with the opacity applied.
     * 
     * Usage:
     * This configuration is used in `react-native-chart-kit` to customize the appearance of the chart components.
     */

    const chartConfig = {
        backgroundGradientFrom: '#1E2923',
        backgroundGradientTo: '#08130D',
        color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    };

    return (
        <ScrollView style={{ flex: 1, paddingBottom: 20, backgroundColor: "#9fb8ad"  }}>
            <Box style={{ padding: 16 }}>
                {error && (
                    <Box style={{ marginBottom: 20 }}>
                        <Text style={{ color: 'red', fontWeight: "bold" }}>{error}</Text>
                    </Box>
                )}

                {showResults ? (
                    <>
                        <Box style={{ marginBottom: 20 }}>
                            <Text size="lg" style={{ marginBottom: 10, color: "fff" }}>
                                Calculation Results:
                            </Text>
                            <View>
                                {results.map((item, index) => (
                                    <Box key={index} style={{ padding: 5 }}>
                                        <Text style={{ color: "fff" }}>
                                            {item.name}: ${item.amount.toFixed(2)}
                                        </Text>
                                    </Box>
                                ))}

                            </View>
                         
                        </Box>

                        <PieChart
                            data={results}
                            width={screenWidth}
                            height={220}
                            chartConfig={chartConfig}
                            accessor={'population'}
                            backgroundColor={'transparent'}
                            paddingLeft={'15'}
                            center={[10, 20]}
                            absolute
                        />


                    </>
                ) : (
                    <>
                        <Text size="lg" style={{ marginBottom: 20, color: "fff"  }}>
                            Enter Total Amount($):
                        </Text>
                        <Input style={{borderColor: "black", backgroundColor: "#E6E8E6"}}>
                            <InputField
                                keyboardType="numeric"
                                placeholder="Total Amount"
                                value={totalAmount ? totalAmount.toString() : ''}
                                onChangeText={(value) => setTotalAmount(parseFloat(value))}
                            />
                        </Input>
                        <Text size="lg" style={{ marginBottom: 20, color: "fff", paddingTop: 30 }}>
                            Enter  percentage(%):
                        </Text>
                        {categories.map((category, index) => (
                            <Box key={index} style={{ marginBottom: 10 }}>
                                <Select onValueChange={(value) => updateCategory(index, 'name', value)}>
                                    <SelectTrigger variant="outline" size="md" style={{borderColor: "black", backgroundColor: "#E6E8E6"}}>
                                        <SelectInput placeholder="Select category(The default is food)" />
                                        <SelectIcon />
                                    </SelectTrigger>
                                    <SelectPortal>
                                        <SelectBackdrop />
                                            <SelectContent>
                                                <SelectItem label="Housing " value="Housing" />
                                                <SelectItem label="Food" value="Food" />
                                                <SelectItem label="Transport" value="Transport" />
                                                <SelectItem label="Health" value="Health" />
                                                <SelectItem label="Personal" value="Personal" />
                                                <SelectItem label="Entertainment" value="Entertainment" />
                                                <SelectItem label="Education" value="Education" />
                                                <SelectItem label="Miscellaneous" value="Miscellaneous" />
                                            </SelectContent>
                                        </SelectPortal>
                                </Select>

                                <Input style={{borderColor: "black", backgroundColor: "#E6E8E6"}}>
                                    <InputField
                                        keyboardType="numeric"
                                        placeholder="Percentage"
                                        value={category.percentage.toString()}
                                        onChangeText={(value) => updateCategory(index, 'percentage', value)}
                                    />
                                </Input>
                            </Box>
                        ))}

                        <Button onPress={addCategory} style={{ marginTop: 20 }}>
                            <Text style={{color: "#E6E8E6"}}>Add Category</Text>
                        </Button>
                        <Button onPress={calculate} style={{ marginTop: 20 }} action="primary">
                            <Text style={{color: "#E6E8E6"}}>Calculate</Text>
                        </Button>
                    </>
                )}

                {/* 新增的按钮 */}
                <Button onPress={clean} style={{ marginTop: 50, borderColor: "black", backgroundColor: "#E6E8E6",borderWidth: 1, marginBottom: 50 }} action="secondary">
                    <Text style={{color: "#000", fontWeight: "bold"}}>Clean</Text>
                </Button>


                <Button
                    style={{ marginTop: 20 }}
                    onPress={() => navigation.navigate('Predictions')}
                >
                    <Text style={{color: "#E6E8E6"}}>Go to Expense Report</Text>
                </Button>
            </Box>
        </ScrollView >
    );
};

export default CalculationsPage;
