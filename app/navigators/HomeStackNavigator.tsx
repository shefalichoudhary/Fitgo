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
      <Stack.Screen name="Measurements" component={MeasurementScreen} />
      <Stack.Screen name="Exercises" component={ExercisesScreen} />
    </Stack.Navigator>
  )
}
