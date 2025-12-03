// components/RestTimer/RestTimer.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type ActiveRestTimer = {
  exerciseId: string | null;
  remaining: number;
  running: boolean;
};

type Props = {
  activeRestTimer: ActiveRestTimer;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  // optionally show label mapping (exerciseId -> display name)
  label?: string;
};

export default function RestTimer({ activeRestTimer, onPause, onResume, onStop, label }: Props) {
  if (!activeRestTimer || !activeRestTimer.exerciseId || activeRestTimer.remaining <= 0)
    return null;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>{label ?? "Rest Timer"}</Text>
        <Text style={styles.seconds}>{activeRestTimer.remaining}s</Text>
      </View>

      <View style={styles.controls}>
        {activeRestTimer.running ? (
          <TouchableOpacity onPress={onPause} style={styles.btn}>
            <Text style={styles.btnText}>Pause</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onResume} style={styles.btn}>
            <Text style={styles.btnText}>Resume</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={onStop} style={[styles.btn, styles.stopBtn]}>
          <Text style={[styles.btnText, { color: "#fff" }]}>Stop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    zIndex: 1000,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#071826",
    borderWidth: 1,
    borderColor: "#122032",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  left: {},
  title: { color: "#94a3b8", fontSize: 12 },
  seconds: { color: "#e6eef8", fontSize: 20, fontWeight: "700" },
  controls: { flexDirection: "row", gap: 8 },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#0f1724",
    borderWidth: 1,
    borderColor: "#1f2a44",
    marginLeft: 8,
  },
  stopBtn: {
    backgroundColor: "#dc2626",
    borderColor: "#b91c1c",
  },
  btnText: { color: "#cbd5e1", fontWeight: "600" },
});
