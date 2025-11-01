import { TextStyle, ViewStyle } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Icon } from "@/components/Icon"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import HistoryScreen from "@/screens/HistoryScreen"
import ProfileScreen from "@/screens/ProfileScreen"
import type { DemoTabParamList } from "./navigationTypes"
import { HomeScreen } from "@/screens/HomeScreen"
import { Header } from "@/components/Header"
const Tab = createBottomTabNavigator<DemoTabParamList>()

export function DemoNavigator() {
  const { bottom } = useSafeAreaInsets()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <Tab.Navigator
      screenOptions={{
        header: ({ navigation, route }) => (
  <Header
    title={route.name}
    leftIcon="back"
    onLeftPress={navigation.goBack}
  
  />
),
        tabBarHideOnKeyboard: true,
        tabBarStyle: themed([$tabBar, { height: bottom + 70 }]),
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.text,
        tabBarLabelStyle: themed($tabBarLabel),
        tabBarItemStyle: themed($tabBarItem),
      }}
    >
      {/* 👇 Main Tab Screens */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          header: () => (
      <Header
        title="Home"
       
      />
    ),
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
            header: () => (
      <Header
        title="Workout History"
       
      />),
          tabBarLabel: "History",
          tabBarIcon: ({ focused }) => (
            <Icon icon="debug" color={focused ? colors.tint : colors.tintInactive} size={30} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
           header: () => (
      <Header
        title="Profile"
       
      />
    ),
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) => (
            <Icon icon="debug" color={focused ? colors.tint : colors.tintInactive} size={30} />
          ),
        }}
      />

     
     
    </Tab.Navigator>
  )
}

// Styles
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
