import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import Config from "@/config"
import { useAppTheme } from "@/theme/context"
import { DemoNavigator } from "./DemoNavigator"
import type { AppStackParamList, NavigationProps } from "./navigationTypes"
import { navigationRef } from "./navigationUtilities"


const Stack = createNativeStackNavigator<AppStackParamList>()
const exitRoutes = Config.exitRoutes

export const AppNavigator = (props: NavigationProps) => {
  const { navigationTheme } = useAppTheme()
  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
      <DemoNavigator />
    </NavigationContainer>
  )
}
