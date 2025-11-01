/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import Config from "@/config"
import { useAuth } from "@/context/AuthContext"

import { useAppTheme } from "@/theme/context"
import { DemoNavigator } from "./DemoNavigator"

import type { AppStackParamList, NavigationProps } from "./navigationTypes"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"
import RoutineScreen from "@/screens/Routine"
import MeasurementScreen from "@/screens/MeasurementScreen"
import { Header } from "@/components/Header"
import CreateRoutineScreen from "@/screens/Routine/CreateRoutineScreen"
import PreMadeRoutineScreen from "@/screens/Routine/PreMadeRoutineScreen"

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>()
const AppStack = () => {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Stack.Navigator
      screenOptions={{
              header: ({ navigation, route }) => (
          <Header
            title={route.name}
            leftIcon="back"
            onLeftPress={navigation.goBack}

          />
        ),
        navigationBarColor: colors.background,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      {/* Use DemoNavigator as the initial route */}
      <Stack.Screen name="Demo" component={DemoNavigator}   options={{ headerShown: false }} />
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
        onRightPress={() => {
          // Navigate to a screen where user adds a new exercise or routine item
          navigation.navigate("CreateRoutine") // or your custom screen name
        }}
      />
    ),
  })}
/>
  <Stack.Screen name="Measurements" component={MeasurementScreen} />
  <Stack.Screen name="CreateRoutine" component={CreateRoutineScreen} />
  <Stack.Screen name="PreMadeRoutines" component={PreMadeRoutineScreen}  options={({ navigation }) => ({
    header: () => (
      <Header
        title="Pre-Made Routines"
        leftIcon="back"
        onLeftPress={navigation.goBack}
        
      />
    ),
  })}/>


      {/** 🔥 Your other screens go here */}
      {/* IGNITE_GENERATOR_ANCHOR_APP_STACK_SCREENS */}
    </Stack.Navigator>
  )
}

export const AppNavigator = (props: NavigationProps) => {
  const { navigationTheme } = useAppTheme()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
        <AppStack />
    </NavigationContainer>
  )
}
