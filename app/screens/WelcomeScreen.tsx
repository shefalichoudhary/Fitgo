import React, { FC } from "react"
import { Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import { isRTL } from "@/i18n"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"

const welcomeLogo = require("@assets/images/logo.png")
const welcomeFace = require("@assets/images/welcome-face.png")

interface WelcomeScreenProps extends AppStackScreenProps<"Welcome"> {}

export const WelcomeScreen: FC<WelcomeScreenProps> = ({ navigation }) => {
  const { themed, theme } = useAppTheme()
  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])

  const goHome = () => {
  navigation.navigate("Demo", { screen: "DemoShowroom", params: {} })
  }

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      <View style={themed($topContainer)}>
        <Image style={themed($welcomeLogo)} source={welcomeLogo} resizeMode="contain" />
        <Text
          testID="welcome-heading"
          style={themed($welcomeHeading)}
          tx="welcomeScreen:readyForLaunch"
          preset="heading"
        />
        <Text tx="welcomeScreen:exciting" preset="subheading" />
        <Image
          style={$welcomeFace}
          resizeMode="contain"
          source={welcomeFace}
          tintColor={theme.colors.palette.neutral900}
        />
      </View>

      <View style={themed([$bottomContainer, $bottomContainerInsets])}>
        <Text tx="welcomeScreen:postscript" size="md" />

        <Button
          testID="next-screen-button"
          preset="reversed"
          tx="welcomeScreen:letsGo"
          onPress={goHome}
        />
      </View>
    </Screen>
  )
}

// --- Styles ---
const $topContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexShrink: 1,
  flexGrow: 1,
  flexBasis: "57%",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
})

const $bottomContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexShrink: 1,
  flexGrow: 0,
  flexBasis: "43%",
  backgroundColor: colors.palette.neutral100,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  paddingHorizontal: spacing.lg,
  justifyContent: "space-around",
})

const $welcomeLogo: ThemedStyle<ImageStyle> = ({ spacing }) => ({
  height: 88,
  width: "100%",
  marginBottom: spacing.xxl,
})

const $welcomeFace: ImageStyle = {
  height: 169,
  width: 269,
  position: "absolute",
  bottom: -47,
  right: -80,
  transform: [{ scaleX: isRTL ? -1 : 1 }],
}

const $welcomeHeading: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})
