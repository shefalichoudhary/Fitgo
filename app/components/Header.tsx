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
import { $styles } from "@/theme/styles"
import { ExtendedEdge, useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import { IconTypes, PressableIcon } from "./Icon"
import { Text, TextProps } from "./Text"

/* ==================== TYPES ==================== */

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
  leftTextColor?: string
  leftTx?: TextProps["tx"]
  leftTxOptions?: TextProps["txOptions"]
  LeftActionComponent?: ReactElement
  onLeftPress?: TouchableOpacityProps["onPress"]

  rightIcon?: IconTypes
  rightIconColor?: string
  rightText?: TextProps["text"]
  rightTextColor?: string
  rightTx?: TextProps["tx"]
  rightTxOptions?: TextProps["txOptions"]
  RightActionComponent?: ReactElement
  onRightPress?: TouchableOpacityProps["onPress"]

  safeAreaEdges?: ExtendedEdge[]
}

/* ==================== HEADER ==================== */

export function Header(props: HeaderProps) {
  const {
    LeftActionComponent,
    RightActionComponent,

    leftIcon,
    leftIconColor = "#FFFFFF",
    leftText,
    leftTextColor,
    leftTx,
    leftTxOptions,
    onLeftPress,

    rightIcon,
    rightIconColor = "#FFFFFF",
    rightText,
    rightTextColor,
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
    backgroundColor = "#121212",
  } = props

  const $containerInsets = useSafeAreaInsetsStyle(safeAreaEdges)
  const titleContent = titleTx ? translate(titleTx, titleTxOptions) : title

  return (
    <View style={[$container, $containerInsets, { backgroundColor }, containerStyle]}>
      <View style={[$styles.row, $wrapper, style]}>

        {/* LEFT ACTION (TEXT ONLY) */}
        <HeaderAction
          tx={leftTx}
          text={leftText}
          textColor={leftTextColor}
          icon={leftIcon}
          iconColor={leftIconColor}
          onPress={onLeftPress}
          txOptions={leftTxOptions}
          ActionComponent={LeftActionComponent}
          variant="text"
        />

        {/* TITLE */}
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
              size="sm"
              text={titleContent}
              style={[$title, { color: "#FFFFFF" }, titleStyle]}
            />
          </View>
        )}

        {/* RIGHT ACTION (BUTTON) */}
        <HeaderAction
          tx={rightTx}
          text={rightText}
          textColor={rightTextColor}
          icon={rightIcon}
          iconColor={rightIconColor}
          onPress={onRightPress}
          txOptions={rightTxOptions}
          ActionComponent={RightActionComponent}
          variant="button"
        />
      </View>
    </View>
  )
}

/* ==================== HEADER ACTION ==================== */

interface HeaderActionProps {
  icon?: IconTypes
  iconColor?: string
  text?: TextProps["text"]
  textColor?: string
  tx?: TextProps["tx"]
  txOptions?: TextProps["txOptions"]
  onPress?: TouchableOpacityProps["onPress"]
  ActionComponent?: ReactElement
  variant?: "text" | "button"
}

function HeaderAction(props: HeaderActionProps) {
  const {
    icon,
    text,
    tx,
    txOptions,
    onPress,
    ActionComponent,
    iconColor,
    textColor,
    variant = "text",
  } = props

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
        <Text
          weight="medium"
          size="sm"
          text={content}
          style={[
            { color: textColor ?? "#FFFFFF" },
            variant === "button" && $buttonText,
          ]}
        />
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

/* ==================== STYLES ==================== */

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

const $buttonText: TextStyle = {
  backgroundColor: "#2563EB",
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 12,
  overflow: "hidden",
}
