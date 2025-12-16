// RestTimerPicker.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  initialSeconds: number;
  onConfirm: (seconds: number) => void;
};

const PRESETS = [0, 5,15, 30, 45, 60, 90];

export default function RestTimerPicker({ initialSeconds, onConfirm }: Props) {
  const [selected, setSelected] = useState(initialSeconds);

  const handleSelect = (sec: number) => {
    setSelected(sec);
    onConfirm(sec); // ✅ auto close handled by parent
  };

  return (
   <View style={styles.container}>
  <Text style={styles.title}>Rest Timer</Text>

  <View style={styles.grid}>
    {PRESETS.map((sec) => {
      const active = selected === sec;
      return (
        <TouchableOpacity
          key={sec}
          style={[styles.tile, active && styles.tileActive]}
          onPress={() => handleSelect(sec)}
          activeOpacity={0.85}
        >
          <Text style={[styles.tileText, active && styles.tileTextActive]}>
            {sec === 0 ? "OFF" : `${sec}s`}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
</View>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
    backgroundColor: "#030303ff",
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 18,
    textAlign: "center",
    letterSpacing: 0.4,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  tile: {
    width: "28%",
    margin: "2%",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#020202e1",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#525252ff",
  },

  tileActive: {
    backgroundColor: "#1d4ed8",
    borderColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },

  tileText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#9ca3af",
  },

  tileTextActive: {
    color: "#ffffff",
  },
});

