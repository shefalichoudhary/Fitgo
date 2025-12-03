// app/components/LoadingOverlay.tsx
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  useColorScheme,
  AccessibilityRole,
} from "react-native";

type Props = {
  /** show or hide loading UI */
  visible: boolean;
  /** optional message shown under spinner */
  message?: string;
  /** full-screen overlay (default true). If false, renders inline container */
  overlay?: boolean;
  /** spinner size: 'small' | 'large' | number */
  size?: "small" | "large" | number;
  /** spinner color override */
  color?: string;
  /** optional style for container (inline mode) */
  containerStyle?: any;
};

/**
 * LoadingOverlay
 *
 * Usage:
 *  <LoadingOverlay visible={isLoading} message="Saving..." />
 *  <LoadingOverlay visible={isBusy} overlay={false} message="Loading more" />
 */
export default function LoadingOverlay({
  visible,
  message,
  overlay = true,
  size = "large",
  color,
  containerStyle,
}: Props) {
  const fade = useRef(new Animated.Value(0)).current;
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  useEffect(() => {
    Animated.timing(fade, {
      toValue: visible ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [visible, fade]);

  const spinnerColor = color ?? (isDark ? "#E6EEF8" : "#0f1724");
  const overlayBackground = isDark ? "rgba(2,6,23,0.6)" : "rgba(255,255,255,0.7)";

  // Inline container variant (not full-screen overlay)
  if (!overlay) {
    if (!visible) return null;
    return (
      <Animated.View
        style={[
          styles.inlineContainer,
          containerStyle,
          { opacity: fade, backgroundColor: isDark ? "#071026" : "#fff" },
        ]}
        accessibilityRole={"status" as AccessibilityRole}
        accessible={visible}
      >
        <ActivityIndicator size={size} color={spinnerColor} />
        {message ? <Text style={[styles.inlineText, { color: isDark ? "#e6eef8" : "#0b1220" }]}>{message}</Text> : null}
      </Animated.View>
    );
  }

  // Full screen overlay
  return visible ? (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[styles.overlayWrap, { opacity: fade, backgroundColor: overlayBackground }]}
      accessibilityRole={"alert" as AccessibilityRole}
      accessible={visible}
    >
      <View >
        <ActivityIndicator size={size} color={spinnerColor} />
        {message ? <Text style={[styles.messageText, isDark ? styles.messageDark : styles.messageLight]}>{message}</Text> : null}
      </View>
    </Animated.View>
  ) : null;
}

const styles = StyleSheet.create({
  overlayWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    // ensure overlay sits above most UI
    zIndex: 1000,
  },
  panel: {
    minWidth: 160,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },

 
  messageText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  messageDark: {
    color: "#e6eef8",
  },
  messageLight: {
    color: "#0b1220",
  },
  // inline
  inlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  inlineText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "600",
  },
});
