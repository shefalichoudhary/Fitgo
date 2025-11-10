import React, { ReactElement } from "react"
import {
  StyleProp,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native"
import { isRTL } from "@/i18n"
import { translate } from "@/i18n/translate"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"
import { ExtendedEdge, useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import { IconTypes, PressableIcon } from "./Icon"
import { Text, TextProps } from "./Text"

export interface HeaderProps {
  titleMode?: "center" | "flex"
  titleStyle?: StyleProp<TextStyle>
  titleContainerStyle?: StyleProp<ViewStyle>
  style?: StyleProp<ViewStyle>
  containerStyle?: StyleProp<ViewStyle>
  backgroundColor?: string
  title?: TextProps["text"]
  titleTx?: TextProps["tx"]
  titleTxOptions?: TextProps["txOptions"]
  leftIcon?: IconTypes
  leftIconColor?: string
  leftText?: TextProps["text"]
  leftTx?: TextProps["tx"]
  LeftActionComponent?: ReactElement
  leftTxOptions?: TextProps["txOptions"]
  onLeftPress?: TouchableOpacityProps["onPress"]
  rightIcon?: IconTypes
  rightIconColor?: string
  rightText?: TextProps["text"]
  rightTx?: TextProps["tx"]
  RightActionComponent?: ReactElement
  rightTxOptions?: TextProps["txOptions"]
  onRightPress?: TouchableOpacityProps["onPress"]
  safeAreaEdges?: ExtendedEdge[]
}

/**
 * Always Dark Mode Header
 */
export function Header(props: HeaderProps) {
  const {
    LeftActionComponent,
    leftIcon,
    leftIconColor = "#FFFFFF",
    leftText,
    leftTx,
    leftTxOptions,
    onLeftPress,
    RightActionComponent,
    rightIcon,
    rightIconColor = "#FFFFFF",
    rightText,
    rightTx,
    rightTxOptions,
    onRightPress,
    title,
    titleTx,
    titleTxOptions,
    titleMode = "center",
    titleContainerStyle,
    titleStyle,
    style,
    containerStyle,
    safeAreaEdges = ["top"],
    backgroundColor = "#121212", // ✅ Always dark background
  } = props

  const $containerInsets = useSafeAreaInsetsStyle(safeAreaEdges)
  const titleContent = titleTx ? translate(titleTx, titleTxOptions) : title

  return (
    <View style={[$container, $containerInsets, { backgroundColor }, containerStyle]}>
      <View style={[$styles.row, $wrapper, style]}>
        <HeaderAction
          tx={leftTx}
          text={leftText}
          icon={leftIcon}
          iconColor={leftIconColor}
          onPress={onLeftPress}
          txOptions={leftTxOptions}
          ActionComponent={LeftActionComponent}
        />

        {!!titleContent && (
          <View
            style={[
              $titleWrapperPointerEvents,
              titleMode === "center" ? $titleWrapperCenter : $titleWrapperFlex,
              titleContainerStyle,
            ]}
          >
            <Text
              weight="medium"
              size="md"
              text={titleContent}
              style={[
                $title,
                { color: "#FFFFFF" }, // ✅ white text
                titleStyle,
              ]}
            />
          </View>
        )}

        <HeaderAction
          tx={rightTx}
          text={rightText}
          icon={rightIcon}
          iconColor={rightIconColor}
          onPress={onRightPress}
          txOptions={rightTxOptions}
          ActionComponent={RightActionComponent}
        />
      </View>
    </View>
  )
}

interface HeaderActionProps {
  icon?: IconTypes
  iconColor?: string
  text?: TextProps["text"]
  tx?: TextProps["tx"]
  txOptions?: TextProps["txOptions"]
  onPress?: TouchableOpacityProps["onPress"]
  ActionComponent?: ReactElement
}

function HeaderAction(props: HeaderActionProps) {
  const { icon, text, tx, txOptions, onPress, ActionComponent, iconColor } = props
  const content = tx ? translate(tx, txOptions) : text

  if (ActionComponent) return ActionComponent

  if (content) {
    return (
      <TouchableOpacity
        style={$actionTextContainer}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={0.8}
      >
        <Text weight="medium" size="md" text={content} style={{ color: "#FFFFFF" }} />
      </TouchableOpacity>
    )
  }

  if (icon) {
    return (
      <PressableIcon
        size={24}
        icon={icon}
        color={iconColor || "#FFFFFF"}
        onPress={onPress}
        containerStyle={$actionIconContainer}
        style={isRTL ? { transform: [{ rotate: "180deg" }] } : {}}
      />
    )
  }

  return <View style={$actionFillerContainer} />
}

/* -------------------- Styles -------------------- */
const $wrapper: ViewStyle = {
  height: 56,
  alignItems: "center",
  justifyContent: "space-between",
}

const $container: ViewStyle = {
  width: "100%",
  borderBottomWidth: 0.5,
  borderBottomColor: "rgba(255,255,255,0.1)",
}

const $title: TextStyle = {
  textAlign: "center",
  fontWeight: "600",
  fontSize: 18,
}

const $actionTextContainer: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  paddingHorizontal: 16,
  zIndex: 2,
}

const $actionIconContainer: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  paddingHorizontal: 16,
  zIndex: 2,
}

const $actionFillerContainer: ViewStyle = {
  width: 16,
}

const $titleWrapperPointerEvents: ViewStyle = {
  pointerEvents: "none",
}

const $titleWrapperCenter: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  width: "100%",
  position: "absolute",
  paddingHorizontal: 32,
  zIndex: 1,
}

const $titleWrapperFlex: ViewStyle = {
  justifyContent: "center",
  flexGrow: 1,
}
