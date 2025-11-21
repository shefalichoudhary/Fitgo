// components/AppAlert.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated, Vibration } from "react-native";

interface AppAlertProps {
  message: string;
  visible: boolean;
  duration?: number; // milliseconds
  onHide?: () => void;
}

export const AppAlert: React.FC<AppAlertProps> = ({
  message,
  visible,
  duration = 2000,
  onHide,
}) => {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      // Vibrate strongly
      Vibration.vibrate([0, 500]); 
      // pattern: [pause, vibrate, pause, vibrate]

      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onHide?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: "#333",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
});
