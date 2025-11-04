/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import Config from "@/config"

import { useAppTheme } from "@/theme/context"
import { DemoNavigator } from "./DemoNavigator"

import type { AppStackParamList, NavigationProps } from "./navigationTypes"
import { navigationRef,  } from "./navigationUtilities"


/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>()


export const AppNavigator = (props: NavigationProps) => {
  const { navigationTheme } = useAppTheme()

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
      <DemoNavigator />  {/* the tabs are at the top level now */}
    </NavigationContainer>
  )
}