import { TextStyle, ViewStyle } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import HistoryScreen from "@/screens/workout/index"
import ProfileScreen from "@/screens/ProfileScreen"
import type { DemoTabParamList } from "./navigationTypes"
import { Header } from "@/components/Header"
import { HomeStackNavigator } from "./HomeStackNavigator"
import ExercisesScreen from "@/screens/Routine/ExercisesScreen"

const Tab = createBottomTabNavigator<DemoTabParamList>()

export function DemoNavigator() {
  const { bottom } = useSafeAreaInsets()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const getTabBarIcon =
    (iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"]) =>
    ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
      <MaterialCommunityIcons
        name={iconName}
        size={size * 1.2} // Dynamically increase size
        color={focused ? "#3B82F6" : color} // Blue-500 when focused
      />
    )

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarStyle: themed([$tabBar, { height: bottom + 70 }]),
        tabBarActiveTintColor: "#3B82F6", // focused icon and label color (blue-500)
        tabBarInactiveTintColor: colors.text, // default theme text color
        tabBarLabelStyle: themed($tabBarLabel),
        tabBarItemStyle: themed($tabBarItem),
      }}
    >
      {/* 👇 Main Tab Screens */}
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: "Home",
          tabBarIcon: getTabBarIcon("home-outline"),
        }}
      />
      <Tab.Screen
    name="Exercises"
    component={ExercisesScreen} // 👈 New one
     options={{
        header: () => <Header title="All Exercises" />,
        tabBarLabel: "Exercises",
        tabBarIcon: getTabBarIcon("dumbbell"),
      }}

  />

      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          header: () => <Header title="Workout History" />,
          tabBarLabel: "History",
          tabBarIcon: getTabBarIcon("history"),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          header: () => <Header title="Profile" />,
          tabBarLabel: "Profile",
          tabBarIcon: getTabBarIcon("account-outline"),
        }}
      />
    </Tab.Navigator>
  )
}

// Styles
const $tabBar: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#161616ff",
  borderTopColor: "transparent",
})
const $tabBarItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.xs,
})

const $tabBarLabel: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.medium,
  lineHeight: 16,
})
