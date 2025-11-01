import { TextStyle, ViewStyle } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Icon } from "@/components/Icon"
import { translate } from "@/i18n/translate"
import type { ThemedStyle } from "@/theme/types"
import { useAppTheme } from "@/theme/context"

import type { DemoTabParamList } from "./navigationTypes"
import {HomeScreen } from "@/screens/HomeScreen" // Named export
import HistoryScreen from "@/screens/HistoryScreen"

const Tab = createBottomTabNavigator<DemoTabParamList>()

/**
 * This is the main navigator for the demo screens with a bottom tab bar.
 * Each tab is a stack navigator with its own set of screens.
 *
 * More info: https://reactnavigation.org/docs/bottom-tab-navigator/
 * @returns {JSX.Element} The rendered `DemoNavigator`.
 */
export function DemoNavigator() {
  const { bottom } = useSafeAreaInsets()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
  <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: themed([$tabBar, { height: bottom + 70}]),
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.text,
          tabBarLabelStyle: themed($tabBarLabel),
          tabBarItemStyle: themed($tabBarItem),
        }}
      >
  <Tab.Screen
    name="Home"
    component={HomeScreen}
    options={{
      tabBarLabel: "Home",
      tabBarIcon: ({ focused }) => (
        <Icon icon="debug" color={focused ? colors.tint : colors.tintInactive} size={30} />
      ),
    }}
  />

  <Tab.Screen
    name="History"
    component={HistoryScreen}
    options={{
      tabBarLabel:"History",
      tabBarIcon: ({ focused }) => (
        <Icon icon="debug" color={focused ? colors.tint : colors.tintInactive} size={30} />
      ),
    }}
  />
</Tab.Navigator>

  )
}

const $tabBar: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderTopColor: colors.transparent,
})

const $tabBarItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.xs,
})

const $tabBarLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.medium,
  lineHeight: 16,
  color: colors.text,
})

// @demo remove-file