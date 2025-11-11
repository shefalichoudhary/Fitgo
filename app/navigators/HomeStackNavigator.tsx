// HomeStackNavigator.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { HomeScreen } from "@/screens/HomeScreen"
import RoutineScreen from "@/screens/Routine"
import CreateRoutineScreen from "@/screens/Routine/CreateRoutineScreen"
import PreMadeRoutineScreen from "@/screens/Routine/PreMadeRoutineScreen"
import MeasurementScreen from "@/screens/MeasurementScreen"
import { Header } from "@/components/Header"
import ExercisesScreen from "@/screens/Routine/ExercisesScreen"
import RoutineDetailsScreen from "@/screens/Routine/[id]"
import Entypo from '@expo/vector-icons/Entypo';
import AddMeasurementScreen from "@/screens/AddMeasurementScreen"
import LogWorkoutScreen from "@/screens/Routine/LogWorkoutScreen"

const Stack = createNativeStackNavigator()

export function HomeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={({ navigation }) => ({
          header: () => <Header title="Home" />,
        })}
      />
      <Stack.Screen
        name="Routines"
        component={RoutineScreen}
        options={({ navigation }) => ({
          header: () => (
            <Header
              title="Routines"
              leftIcon="back"
              onLeftPress={navigation.goBack}
              rightText="Create"
              onRightPress={() => navigation.navigate("CreateRoutine")}
            />
          ),
        })}
      />
      <Stack.Screen name="CreateRoutine" component={CreateRoutineScreen} />
      <Stack.Screen
        name="PreMadeRoutines"
        component={PreMadeRoutineScreen}
        options={({ navigation }) => ({
          header: () => (
            <Header title="Pre-Made Routines" leftIcon="back" onLeftPress={navigation.goBack} />
          ),
        })}
      />

      <Stack.Screen
        name="RoutineDetails" // ✅ new screen
        component={RoutineDetailsScreen}
        options={({ navigation }) => ({
          header: () => (
            <Header title="Routine Details" leftIcon="back" onLeftPress={navigation.goBack} />
          ),
        })}
      />
       <Stack.Screen
        name="Measurements"
        component={MeasurementScreen}
        options={({ navigation }) => ({
          header: () => (
            <Header
              title="Measurements"
              leftIcon="back"
              onLeftPress={navigation.goBack}
               RightActionComponent={
                <Entypo
                  name="circle-with-plus"
                  size={28}
                  color="#3B82F6" 
                  style={{marginRight:6}}// blue-500
                  onPress={() => navigation.navigate("Add Measurement")}
                />
              }
            />
          ),
        })}
      />
      <Stack.Screen name="Exercises" component={ExercisesScreen} />
      <Stack.Screen name="Add Measurement" component={AddMeasurementScreen} />
 <Stack.Screen
  name="Log Workout"
  component={LogWorkoutScreen}
  options={({ navigation, route }) => ({
    header: () => (
      <Header
        title="Log Workout"
        leftIcon="back"
        onLeftPress={() => navigation.goBack()}
         rightText="Save"
              onRightPress={() => navigation.navigate("History")}
       
      />
    ),
  })}
/>

    </Stack.Navigator>
  )
}
