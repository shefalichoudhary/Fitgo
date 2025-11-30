// Header.tsx
import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, AccessibilityRole } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Exercise, DataShape } from "./types";
import { ConfirmModal } from "../ConfirmModal"; // adjust path if needed

type Props = {
  exercise: Exercise;
  data: DataShape;
  onDelete?: () => void;
  disabled?: boolean;
};

export default function Header({ exercise, data, onDelete, disabled = false }: Props) {
  const [confirmVisible, setConfirmVisible] = useState(false);

  const openConfirm = useCallback(() => {
    if (disabled) return;
    setConfirmVisible(true);
  }, [disabled]);

  const closeConfirm = useCallback(() => setConfirmVisible(false), []);

  const handleConfirmDelete = useCallback(() => {
    setConfirmVisible(false);
    onDelete && onDelete();
  }, [onDelete]);

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{exercise.exercise_name}</Text>

      <View style={styles.headerRight}>
        <TouchableOpacity
          onPress={openConfirm}
          disabled={disabled}
          style={styles.iconBtn}
          accessibilityRole={"button" as AccessibilityRole}
          accessibilityLabel="Exercise options"
        >
          {/* question-mark / help icon */}
          <Ionicons name="help-circle-outline" size={22} color="#ffd166" />
        </TouchableOpacity>
      </View>

      <ConfirmModal
        visible={confirmVisible}
        title="Delete exercise"
        message={`Remove "${exercise.exercise_name}" from routine?`}
        onCancel={closeConfirm}
        onConfirm={handleConfirmDelete}
        cancelText="Cancel"
        confirmText="Delete"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f2937", // dark grey bubble
  },
});
