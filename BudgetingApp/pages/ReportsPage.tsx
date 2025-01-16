import React, {useState} from 'react';
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input, InputField } from "@/components/ui/input";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { Select, SelectBackdrop, SelectContent, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectTrigger } from "@/components/ui/select";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText } from '@/components/ui/form-control';
import { AlertCircleIcon } from '@/components/ui/icon';
import { Heading } from '@/components/ui/heading';

export interface Expenses {
  name: string, 
  amount: number,
  year: number,
  month: number,
  date: number,
  category: string,
  description: string
}

interface ChartData {
  labels: string[];
  datasets: { data: number[]; strokeWidth: number }[];
}

const ReportsPage = () => {
  //State Variables and chart config-------------------------------------------------------------------------------
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reportData, setReportData] = useState<Expenses[]>([]);
  const [emptyMessage, setEmptyMessage] = useState("");
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [selectedBi, setSelectedBi] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const screenWidth = Dimensions.get("window").width;
  const [warningMessage, setWarningMessage] = useState("");
  const categories = ["Education", "Housing", "Food", "Transport", "Health", "Personal", "Entertainment", "Miscellaneous"];
  const dateRanges = ["Biweekly", "Monthly", "Yearly", "Custom Date Range"];


  const [startYear, setStartYear] = useState<number>(0);
  const [startMonth, setStartMonth] = useState<number>(0);

  const [endYear, setEndYear] = useState<number>(0);
  const [endMonth, setEndMonth] = useState<number>(0);
  const [endDay, setEndDay] = useState<number>(0);

  const [yearDisabled, setYearDisabled] = useState<boolean>(false);
  const [monthDisabled, setMonthDisabled] = useState<boolean>(false);
  const [dayDisabled, setDayDisabled] = useState<boolean>(false);
  const [endDateVisable, setEndDateVisable] = useState<boolean>(false);

  const [year, setYear] = useState<number>(0);
  const [month, setMonth] = useState<number>(0);
  const [day, setDay] = useState<number>(0);

  const [dateInvalid, setDateInvalid] = useState<boolean>(false);
  const [categoryInvalid, setCategoryInvalid] = useState<boolean>(false);
  const [dateErrorMessage, setDateErrorMessage] = useState<string>("");

  const [dateRangeInvalid, setDateRangeInvalid] = useState<boolean>(false);

  
  const chartConfig = {
    backgroundGradientFrom: "#000000",
    backgroundGradientTo: "#333333",
    backgroundGradientFromOpacity: 0.7,
    backgroundGradientToOpacity: 0.8,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    useShadowColorFromDataset: false,
    propsForLabels: {
      fontSize: 5,      
      rotation: 0,        
      textAnchor: "end",   
    },
  };

  //all the validate functions begin-----------------------------------------------------------------------------
  //validate the date formate for select category button
  const validateDateFormat = (date: string) => {
    const monthYearPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
    return monthYearPattern.test(date);
  };

  const checkCategoryDate = (y: number, m: number): boolean => {
    if (y === null || isNaN(y) || y === 0) {
      console.log("year error");
      return false;
    }
    if (m === null || isNaN(m) || m < 1 || m > 12) {
      console.log("month error");
      return false;
    }
    return true;
  }

  const compareCategoryDate = (sy: number, sm: number, ey: number, em: number): boolean => {
    if (ey > sy) {
      return true;
    } else if (ey === sy && em > sm) {
      return true;
    } else {
      return false;
    }
  }

  const checkYear = (y: number): boolean => {
    if (y === null || isNaN(y) || y === 0) {
      console.log("year error");
      return false;
    } else {
      return true;
    }
  }

  // validate a month value is an acceptable value
  const checkMonth = (m: number): boolean => {
    if (m === null || isNaN(m) || m < 1 || m > 12) {
      console.log("month error");
      return false;
    } else {
      return true;
    }
  }

  // validate a day value is an acceptable value
  const checkDay = (d: number): boolean => {
    if (d === null || isNaN(d) || d < 1 || d > 31) {
      console.log("month error");
      return false;
    } else {
      return true;
    }
  }

  // determines if the start date is smaller then the end date
  function compareCustomDate(sy: number, sm: number, sd: number, ey: number, em: number, ed: number): boolean {
    if (ey > sy) {
      return true;
    } else if (ey === sy && em > sm) {
      return true;
    } else if (ey === sy && em === sm && ed > sd) {
      return true;
    } else {
      return false;
    }
  }

// All handling functiosn begin-----------------------------------------------------------------------------------------
  // handles the allowed input fields when selecting whuch type of chart to create
  function handleReportTypeChange(selection: string) {
    setDateInvalid(false);
    setDateRangeInvalid(false);
    setSelectedDateRange(selection);
    if (selection === "Biweekly") {
      console.log(1);
      setYearDisabled(false);
      setMonthDisabled(false);
      setDayDisabled(false)
      setEndDateVisable(false);
    } else if (selection === "Yearly") {
      console.log(2);
      setYearDisabled(false);
      setMonthDisabled(true);
      setDayDisabled(true);
      setEndDateVisable(false);

    } else if (selection === "Monthly") {
      console.log(3);
      setYearDisabled(false);
      setMonthDisabled(false);
      setDayDisabled(true);
      setEndDateVisable(false);

    } else if (selection === "Custom Date Range") {
      console.log(4);
      setYearDisabled(false);
      setMonthDisabled(false);
      setDayDisabled(false)
      setEndDateVisable(true);
    }
  }

  // determines which type of report to create and calls appropriate functions
  const handleDateRangeCreate = () => {
    switch (selectedDateRange) {
      case "Biweekly":
        if (checkYear(year) && checkMonth(month) && checkDay(day)) {
          fetchBiweeklyExpenses();
        } else {
          console.log("error in bi weekly date");
          setDateErrorMessage("Date must be a valid date.");
          setDateInvalid(true);
        }
        break;
      case "Yearly":
        if (checkYear(year)) {
          fetchExpensesForYear();
        } else {
          console.log("error in yearly date");
          setDateErrorMessage("Year must be a valid year.");
          setDateInvalid(true);
        }
        break;
      case "Monthly":
        if (checkYear(year) && checkMonth(month)) {
          fetchExpensesForMonth();
        } else {
          console.log("error in monthly date");
          setDateErrorMessage("Date must be a valid date.");
          setDateInvalid(true);
        }
        break;
      case "Custom Date Range":
        handleCustomRangeFetch();
        break;
      default:
        console.log("error in selection");
        setDateRangeInvalid(true);
        break;
    }
  }

  const onCategorySelectChange = (s: string) => {
    if (categories.includes(s)) {
      setSelectedCategory(s);
    } else {
      setCategoryInvalid(true);
    }
  }

  function onCategoryClose() {
    setDateInvalid(false);
    setCategoryInvalid(false);
    setShowCategoryModal(false);
  }

  function onDateRangeClose() {
    setDateInvalid(false);
    setDateRangeInvalid(false);
    setShowDateRangeModal(false);
  }

  //All fetching functions begin------------------------------------------------------------------------------------------
  //Fetch function for select category
  const fetchExpenses = async () => {
    try {
      const authRef = auth();
      if (authRef.currentUser) {
        if (!categories.includes(selectedCategory)) {
          setCategoryInvalid(true);
        } else {
          if (checkCategoryDate(startYear, startMonth) && checkCategoryDate(endYear,endMonth) && compareCategoryDate(startYear, startMonth, endYear, endMonth)) {
            const expensesRef = collection(db, "users", authRef.currentUser.uid, "expenses");
            let Query;

            const monthYearCombinations = [];
            for (let year = startYear; year <= endYear; year++) {
              const monthStart = (year === startYear) ? startMonth : 1;
              const monthEnd = (year === endYear) ? endMonth : 12;
              for (let month = monthStart; month <= monthEnd; month++) {
                monthYearCombinations.push({ year, month });
              }
            }
            const orQueries = monthYearCombinations.map(({ year, month }) =>
              query(expensesRef, where("category", "==", selectedCategory), where("year", "==", year), where("month", "==", month))
            );
            const expensesPromises = orQueries.map(q => getDocs(q));
            const expensesResults = await Promise.all(expensesPromises);
            const Expenses: Expenses[] = expensesResults.flatMap(snap => snap.docs.map(doc => doc.data() as Expenses));
      
            setReportData(Expenses);
            if (Expenses.length > 0) {
              generateChartData(Expenses);
              setShowChart(true);
              setEmptyMessage("");
              onCategoryClose();
            } else {
              setChartData(null);  // Clear chart data if no expenses are found
              setShowChart(false);
              setEmptyMessage(`No ${selectedCategory} expenses found!`);
              onCategoryClose();
            }
          } else {
            setDateErrorMessage("End Date must be greater than Start Date");
            setDateInvalid(true);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };
  
  const fetchExpensesForMonth = async () => {
    try {
      const authRef = auth();
      if (authRef.currentUser) {
        const expensesRef = collection(db, "users", authRef.currentUser.uid, "expenses");
        const expensesQuery = query(
          expensesRef,
          where("year", "==", year),
          where("month", "==", month)
        );
        const expensesSnapshot = await getDocs(expensesQuery);
        const expenses: Expenses[] = expensesSnapshot.docs.map((doc) => doc.data() as Expenses);

        setReportData(expenses);
        if (expenses.length > 0) {
          generateBarChartData(expenses);
          setShowChart(true);
          setEmptyMessage("");
          onDateRangeClose();
        } else {
          setChartData(null);
          setShowChart(false);
          setEmptyMessage(`No expenses found for ${year}-${month}`);
          onDateRangeClose();
        }
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const fetchExpensesForYear = async () => { 
    try {
      const authRef = auth();
      if (authRef.currentUser) {
        const expensesRef = collection(db, "users", authRef.currentUser.uid, "expenses");
        const expensesQuery = query(
          expensesRef,
          where("year", "==", year)
        );
        const expensesSnapshot = await getDocs(expensesQuery);
        const expenses: Expenses[] = expensesSnapshot.docs.map((doc) => doc.data() as Expenses);
        
        setReportData(expenses);
        if (expenses.length > 0) {
          generateBarChartData(expenses);
          setShowChart(true);
          setEmptyMessage("");
          onDateRangeClose();
        } else {
          setChartData(null);
          setShowChart(false);
          setEmptyMessage(`No expenses found for ${year}`);
          onDateRangeClose();
        }
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  
  const handleCustomRangeFetch = async () => {
    try {
      if (checkYear(year) && checkMonth(month) && checkDay(day) && checkYear(endYear) && checkMonth(endMonth) && checkDay(endDay)) {
        if (compareCustomDate(year, month, day, endYear, endMonth, endDay)) {
      
          const startDateObj = new Date(year, month - 1, day);
          const endDateObj = new Date(endYear, endMonth - 1, endDay);

          const authRef = auth();
          if (authRef.currentUser) {
            const expensesRef = collection(db, "users", authRef.currentUser.uid, "expenses");
      
            // Query Firestore with a broad range on year, and filter later in code
            const expensesQuery = query(
              expensesRef,
              where("year", ">=", year),
              where("year", "<=", endYear)
            );
            const expensesSnapshot = await getDocs(expensesQuery);
      
            const expenses: Expenses[] = expensesSnapshot.docs
              .map((doc) => doc.data() as Expenses)
              .filter((exp) => {
                // Convert expense date fields to a JavaScript Date object
                const expenseDateObj = new Date(exp.year, exp.month - 1, exp.date);
                return expenseDateObj >= startDateObj && expenseDateObj <= endDateObj;
              });
      
            setReportData(expenses);
      
            if (expenses.length > 0) {
              generateBarChartData(expenses);
              setShowChart(true);
              setEmptyMessage("");
              onDateRangeClose();
            } else {
              setChartData(null);
              setShowChart(false);
              setEmptyMessage(`No expenses found between ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} and ${endYear}-${String(endMonth).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`);
              onDateRangeClose();
            }
          }
        } else {
          console.log("end date before start date");
          setDateErrorMessage("End date must be after start date.");
          setDateInvalid(true);
        }
      } else {
        console.log("error date");
        setDateErrorMessage("Dates must be valid dates.");
        setDateInvalid(true);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };
  
  //Fetch function for select biweekly date range
  const fetchBiweeklyExpenses = async () => {

    // Parse start date
    const startDateObj = new Date(year, month - 1, day);
  
    // Compute end date (14 days later)
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(startDateObj.getDate() + 14);
  
    const endYear = endDateObj.getFullYear();
    const endMonth = endDateObj.getMonth() + 1; // Month is 0-indexed
    const endDay = endDateObj.getDate();
  
    try {
      const authRef = auth();
      if (authRef.currentUser) {
        const expensesRef = collection(db, "users", authRef.currentUser.uid, "expenses");
  
        // Query Firestore for a broad range
        const expensesQuery = query(
          expensesRef,
          where("year", ">=", year),
          where("year", "<=", endYear)
        );
        const expensesSnapshot = await getDocs(expensesQuery);
  
        const expenses: Expenses[] = expensesSnapshot.docs
          .map((doc) => doc.data() as Expenses)
          .filter((exp) => {
            // Convert expense date fields to a JavaScript Date object
            const expenseDateObj = new Date(exp.year, exp.month - 1, exp.date);
            return expenseDateObj >= startDateObj && expenseDateObj < endDateObj;
          });
  
        setReportData(expenses);
  
        if (expenses.length > 0) {
          generateBarChartData(expenses);
          setShowChart(true);
          setEmptyMessage("");
          onDateRangeClose();
        } else {
          setChartData(null);
          setShowChart(false);
          setEmptyMessage(`no expense found between ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} to ${calculateEndDate(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, 14)}`);
          onDateRangeClose();
        }
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };
  
  //calculation helper function begin-------------------------------------------------------------------------------------
  const calculateEndDate = (startDate: string, daysToAdd: number) => {
    const start = new Date(startDate); // Convert startDate (YYYY-MM-DD) to a Date object
    console.log(start.toDateString());
    start.setDate(start.getDate() + daysToAdd); // Add the specified number of days
    const year = start.getFullYear();
    const month = String(start.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(start.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // Return the new date in YYYY-MM-DD format
  };

  // Calculate total amount from report data
  const calculateTotalAmount = () => {
    return reportData.reduce((total, exp) => total + exp.amount, 0);
  };

  //generate chart functions begin----------------------------------------------------------------------------------------
  //generate chart data for selected category 
  const generateChartData = (expenses: Expenses[]) => {
    const formattedData = expenses.map((exp) => ({
      date: `${exp.year}-${exp.month}-${exp.date}`,
      amount: exp.amount,
    }));
  
    // Sort formatted data by date
    formattedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
    setChartData({
      labels: formattedData.map(data => data.date),
      datasets: [
        {
          data: formattedData.map(data => data.amount),
          strokeWidth: 2 // optional
        }
      ]
    });
  };

  //generate bar chart for select date range
  const generateBarChartData = (expenses: Expenses[]) => {
    const categoryTotals = categories.reduce((acc, category) => {
      acc[category] = 0;
      return acc;
    }, {} as { [key: string]: number });

    expenses.forEach((exp) => {
      categoryTotals[exp.category] += exp.amount;
    });

    setChartData({
      labels: categories,
      datasets: [
        {
          data: categories.map((category) => categoryTotals[category]),
          strokeWidth: 2
        }
      ]
    });
  };

  return (
    <Center style={{ flex: 1, justifyContent: "center", backgroundColor: "#9fb8ad", alignContent: "center" }}>
      <Heading style={{marginTop: -100}}>Reports Page</Heading>
      <Text style={{ justifyContent: "center", alignSelf: "center", marginHorizontal: 50, marginVertical: 10, textAlign: "center" }}>Generate Reports based on categories or by selecting a date range</Text>

      <Button
        size="lg"
        variant="solid"
        action="primary"
        onPress={() => {
          // Clear previous category-related state
          setSelectedCategory("");
          setStartDate(""); // Clear previously selected start date (if any)
          setEndDate("");   // Clear previously selected end date (if any)
          setEmptyMessage("");
          setSelectedMonth("");
          setWarningMessage("");
          setChartData(null);
          setShowCategoryModal(true);
        }}
        style={{ marginTop: 30 }}
      >
        <ButtonText>Select Category</ButtonText>
      </Button>

      <Button
          size="lg"
          variant="solid"
          action="primary"
          onPress={() => {
          // Clear previous category-related state
          setSelectedCategory("");
          setStartDate(""); // Clear previously selected start date (if any)
          setEndDate("");   // Clear previously selected end date (if any)
          setSelectedMonth("");
          setEmptyMessage("");
          setChartData(null);
          setWarningMessage("");
          // Open the date range modal
          setShowDateRangeModal(true);
        }}
        style={{ marginTop: 30, marginBottom: 22 }}
>
            <ButtonText>Select Date Range</ButtonText>
      </Button>

      <Modal isOpen={showCategoryModal} onClose={onCategoryClose} size="md">
        <ModalBackdrop />
        <ModalContent style={{ maxWidth: 900, maxHeight: 550, alignSelf: 'center', padding: 10, backgroundColor: "#9fb8ad", borderColor: "black"  }}>
          <ModalHeader>
            <Text>Select a Category</Text>
            <ModalCloseButton onPress={onCategoryClose} />

          </ModalHeader>
          <ModalBody>
            <Text>category modal 1</Text>
            <VStack space="sm">
              <FormControl isInvalid={categoryInvalid}>
                <Select onValueChange={onCategorySelectChange} isInvalid={categoryInvalid} style={{borderColor: "black", backgroundColor: "#E6E8E6", borderWidth: 1}}>
                  <SelectTrigger variant="outline" size="md">
                    <SelectInput placeholder="Select Category" />
                    <SelectIcon />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} label={category} value={category} />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText>Invalid Category selected.</FormControlErrorText>
                </FormControlError>
              </FormControl>

              <FormControl isInvalid={dateInvalid}>
                <Text style={{marginTop: 10}}>Start Date:</Text>
                <HStack>
                  <Input style={{width: 70, marginRight: 5, borderColor: "black", backgroundColor: "#E6E8E6", borderWidth: 1}}>
                    <InputField onChangeText={(e: string) => setStartYear(Number(e))} placeholder="YYYY" keyboardType="numeric" />                                        
                  </Input>
                  <Input style={{width: 70, marginRight: 5, borderColor: "black", backgroundColor: "#E6E8E6", borderWidth: 1}} >
                    <InputField onChangeText={(e: string) => setStartMonth(Number(e))} placeholder="MM" keyboardType="numeric" />                                        
                  </Input>
                </HStack>              
                
                <Text>End Date:</Text>
                <HStack>
                  <Input style={{width: 70, marginRight: 5, borderColor: "black", backgroundColor: "#E6E8E6", borderWidth: 1}}>
                    <InputField onChangeText={(e: string) => setEndYear(Number(e))} placeholder="YYYY" keyboardType="numeric" />                                        
                  </Input>
                  <Input style={{width: 70, marginRight: 5, borderColor: "black", backgroundColor: "#E6E8E6", borderWidth: 1}} >
                    <InputField onChangeText={(e: string) => setEndMonth(Number(e))} placeholder="MM" keyboardType="numeric" />                                        
                  </Input>
                </HStack>

                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText>{dateErrorMessage}</FormControlErrorText>
                </FormControlError>
              </FormControl>
              
              {warningMessage && (
                <Text style={{ color: 'red', marginVertical: 10, textAlign: 'center' }}>
                  {warningMessage}
                </Text>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onPress={onCategoryClose}>
              <ButtonText>Close</ButtonText>
            </Button>
            <Button onPress={() => {
              fetchExpenses();
            }} >
              <ButtonText>Create</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
     
      <Modal isOpen={showDateRangeModal} onClose={onDateRangeClose} size="md">
        <ModalBackdrop />
        <ModalContent style={{ maxWidth: 900, maxHeight: 300, alignSelf: 'center', padding: 10, backgroundColor: "#9fb8ad", borderColor: "black" }}>
          <ModalHeader>
            <Text>Select a Date Range</Text>
            <ModalCloseButton onPress={onDateRangeClose} />
          </ModalHeader>
          <ModalBody>
            <Text>Date Range modal 4</Text>
            <FormControl isInvalid={dateRangeInvalid}>
              <Select onValueChange={(v) => handleReportTypeChange(v)} style={{borderColor: "black", backgroundColor: "#E6E8E6", borderWidth: 1}}>
                <SelectTrigger variant="outline" size="md">
                  <SelectInput placeholder="Select Date Range" />
                  <SelectIcon />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    {dateRanges.map((range) => (
                      <SelectItem key={range} label={range} value={range} />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>

              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>Date Range must be selected.</FormControlErrorText>
              </FormControlError>
            </FormControl>

            {endDateVisable ? (
              <Text>Start Date:</Text>
            ) : (
              <Text>Date:</Text>
            )}
            <FormControl isInvalid={dateInvalid}>
              <HStack>
                <Input style={{width: 70, marginRight: 5, borderColor: "black", backgroundColor: "#E6E8E6", borderWidth: 1}} isDisabled={yearDisabled}>
                  <InputField onChangeText={(s: string) => setYear(Number(s))} placeholder="YYYY" keyboardType="numeric" />
                </Input>
                <Input style={{width: 70, marginRight: 5, borderColor: "black", backgroundColor: "#E6E8E6", borderWidth: 1}} isDisabled={monthDisabled}>
                  <InputField onChangeText={(s: string) => setMonth(Number(s))} placeholder="MM" keyboardType="numeric" />
                </Input>
                <Input style={{width: 70, marginRight: 5, borderColor: "black", backgroundColor: "#E6E8E6", borderWidth: 1}} isDisabled={dayDisabled}>
                    <InputField onChangeText={(s: string) => setDay(Number(s))} placeholder="DD" keyboardType="numeric" />
                </Input>
              </HStack>

              {endDateVisable ? (
                <>
                <Text>End Date</Text>
                <HStack>
                  <Input style={{width: 70, marginRight: 5}}>
                    <InputField onChangeText={(s: string) => setEndYear(Number(s))} placeholder="YYYY" keyboardType="numeric" />
                  </Input>
                  <Input style={{width: 70, marginRight: 5}}>
                    <InputField onChangeText={(s: string) => setEndMonth(Number(s))} placeholder="MM" keyboardType="numeric" />
                  </Input>
                  <Input style={{width: 70, marginRight: 5}}>
                      <InputField onChangeText={(s: string) => setEndDay(Number(s))} placeholder="DD" keyboardType="numeric" />
                  </Input>
                </HStack>
                </>
              ) : (<></>)}

              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>{dateErrorMessage}</FormControlErrorText>
              </FormControlError>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button onPress={onDateRangeClose}>
              <ButtonText>Close</ButtonText>
            </Button>
            <Button onPress={handleDateRangeCreate}>
              <ButtonText>Create</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {showChart && chartData && (
        <>
          <Text style={{ textAlign: "center", fontSize: 15, marginBottom: 10 }}>
              Report for{" "}
              {selectedCategory
              ? `${selectedCategory} (${startYear}-${String(startMonth).padStart(2, '0')} to ${endYear}-${String(endMonth).padStart(2, '0')})`
              : selectedDateRange === "Biweekly"
              ? `Biweekly: ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} to ${calculateEndDate(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, 14)}`
              : selectedDateRange === "Yearly"
              ? `Year ${year}`
              : selectedDateRange === "Monthly"
              ? `Month ${String(month).padStart(2, '0')}`
              : selectedDateRange === "Custom Date Range"
              ? `Custom Range (${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} to ${endYear}-${String(endMonth).padStart(2, '0')}-${String(endDay).padStart(2, '0')})`
              : "No selection made"}
              {"\n"}Total Amount: {calculateTotalAmount()}
          </Text>

          <BarChart
            data={chartData}
            width={screenWidth - 25}
            height={220}
            yAxisLabel="$"
            chartConfig={chartConfig}
            style={{ marginVertical: 4,  paddingRight: 50,  paddingLeft: 50}} 
          />
        </>
      )}

      {warningMessage && (
        <Text style={{ color: 'red', marginVertical: 10, textAlign: 'center' }}>
          {warningMessage}
        </Text>
      )}


      {emptyMessage && <Text style={{ color: 'red' }}>{emptyMessage}</Text>}
    </Center>
    
  );
};
        
export default ReportsPage;