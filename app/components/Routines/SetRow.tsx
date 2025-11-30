import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  AccessibilityRole,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Set } from "./types";

type Props = {
  idx: number;
  set: Set;
  disabled?: boolean;
  showCheckIcon?: boolean;
  onChangeField: <K extends keyof Set>(index: number, key: K, value: Set[K]) => void;
  onRemove: (index: number) => void;
  onOpenWeight?: () => void;
  onOpenRepRange?: () => void;
  onToggleComplete?: () => void;
  onAddSet?: () => void;
  onOpenRepsType?: () => void;
  onOpenSetType?: () => void;
  onToggleUnit?: () => void;
};

export default function SetRow({
  idx,
  set,
  disabled = false,
  showCheckIcon = false,
  onChangeField,
  onRemove,
  onOpenWeight,
  onToggleComplete,
  onOpenSetType,
}: Props) {
  const [menuVisible, setMenuVisible] = useState(false);
  const showRange = set.repsType === "rep range" || !!set.isRangeReps;

  const openIndexMenu = () => {
    if (disabled) return;
    setMenuVisible(true);
  };

  const closeMenu = () => setMenuVisible(false);

  const selectType = (type: string) => {
    // map friendly types to your stored setType values
    const value = type === "Warmup" ? "W" : type === "Failure" ? "F" : (type as any);
    onChangeField(idx, "setType", value as any);
    closeMenu();
  };

  const handleDelete = () => {
    closeMenu();
    onRemove(idx);
  };

  return (
    <View style={styles.row} accessibilityRole={"listitem" as AccessibilityRole}>
      {/* left: index and optional checkbox */}
      <View style={styles.left}>
        {showCheckIcon ? (
          <TouchableOpacity
            onPress={onToggleComplete}
            disabled={disabled}
            style={[styles.checkbox, set.isCompleted && styles.checkboxActive]}
            accessibilityLabel={set.isCompleted ? "Mark incomplete" : "Mark complete"}
            accessibilityRole="button"
          >
            {set.isCompleted ? (
              <Ionicons name="checkmark" size={14} color="#071026" />
            ) : (
              <Ionicons name="ellipse-outline" size={14} color="#94a3b8" />
            )}
          </TouchableOpacity>
        ) : (
          // index tappable to open menu
          <TouchableOpacity
            onPress={openIndexMenu}
            disabled={disabled}
            style={styles.indexWrap}
            accessibilityRole="button"
            accessibilityLabel="Open set actions"
          >
            <Text style={styles.indexText}>
              {set.setType === "Normal" ? idx + 1 : set.setType}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* center: inputs (NO LABELS here) */}
      <View style={styles.center}>
        <View style={styles.inputsRow}>
          {/* weight input */}
          <TouchableOpacity
            onPress={onOpenWeight}
            disabled={disabled}
            style={styles.weightWrap}
            accessibilityLabel="Edit weight"
            accessibilityRole="button"
          >
            <TextInput
              value={set.weight != null ? String(set.weight) : ""}
              keyboardType="numeric"
              editable={!disabled}
              placeholder={set.unit === "lbs" ? "lbs" : "kg"}
              onChangeText={(v) => {
                const n = v === "" ? null : Number(v);
                onChangeField(idx, "weight", Number.isNaN(n) ? null : n);
              }}
              style={styles.input}
              placeholderTextColor="#6b7280"
            />
          </TouchableOpacity>

          {/* reps or min/max */}
          <View style={styles.repsWrap}>
            {showRange ? (
              <View style={styles.rangeRow}>
                <TextInput
                  value={set.minReps != null ? String(set.minReps) : ""}
                  keyboardType="numeric"
                  editable={!disabled}
                  placeholder="min"
                  onChangeText={(v) => {
                    const n = v === "" ? null : Number(v);
                    onChangeField(idx, "minReps", Number.isNaN(n) ? null : n);
                  }}
                  style={[styles.input, styles.rangeInput]}
                  placeholderTextColor="#6b7280"
                />
                <Text style={styles.rangeSep}>-</Text>
                <TextInput
                  value={set.maxReps != null ? String(set.maxReps) : ""}
                  keyboardType="numeric"
                  editable={!disabled}
                  placeholder="max"
                  onChangeText={(v) => {
                    const n = v === "" ? null : Number(v);
                    onChangeField(idx, "maxReps", Number.isNaN(n) ? null : n);
                  }}
                  style={[styles.input, styles.rangeInput]}
                  placeholderTextColor="#6b7280"
                />
              </View>
            ) : (
              <TextInput
                value={set.reps != null ? String(set.reps) : ""}
                keyboardType="numeric"
                editable={!disabled}
                placeholder="0"
                onChangeText={(v) => {
                  const n = v === "" ? null : Number(v);
                  onChangeField(idx, "reps", Number.isNaN(n) ? null : n);
                }}
                style={styles.input}
                placeholderTextColor="#6b7280"
              />
            )}
          </View>
        </View>
      </View>

      {/* Modal: index actions (dark modal) */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={closeMenu}>
        <Pressable style={styles.modalOverlay} onPress={closeMenu}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Set actions</Text>

            <Pressable style={styles.modalItem} onPress={() => selectType("Normal")}>
              <Text style={styles.modalItemText}>Normal</Text>
            </Pressable>

            <Pressable style={styles.modalItem} onPress={() => selectType("Warmup")}>
              <Text style={styles.modalItemText}>Warmup</Text>
            </Pressable>

            <Pressable style={styles.modalItem} onPress={() => selectType("Failure")}>
              <Text style={styles.modalItemText}>Failure</Text>
            </Pressable>

            <Pressable style={[styles.modalItem, styles.deleteItem]} onPress={handleDelete}>
              <Text style={[styles.modalItemText, styles.deleteText]}>Delete set</Text>
            </Pressable>

            <Pressable style={styles.modalCancel} onPress={closeMenu}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    marginTop: 8,
  },

  left: {
    width: 48,
    alignItems: "center",
  },

  indexWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#071026", // dark chip
    borderWidth: 1,
    borderColor: "#122032",
  },

  indexText: {
    fontWeight: "700",
    color: "#e6eef8",
  },

  checkbox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#203242",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    backgroundColor: "#071026",
  },

  checkboxActive: {
    backgroundColor: "#10B981",
    borderColor: "#0b3a26",
  },

  center: {
    flex: 1,
    paddingRight: 8,
  },

  inputsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  weightWrap: {
    flex: 0.5,
    marginRight: 8,
  },

  repsWrap: {
    flex: 1,
  },

  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#122032",
    paddingHorizontal: 12,
    backgroundColor: "#071026",
    fontSize: 14,
    color: "#e6eef8",
  },

  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  rangeInput: {
    flex: 1,
  },

  rangeSep: {
    marginHorizontal: 8,
    color: "#6b7280",
    fontWeight: "700",
  },

  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#0f1724",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#192433",
  },

  pillText: {
    fontSize: 12,
    color: "#e6eef8",
    fontWeight: "600",
  },

  iconBtn: {
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  /* modal (dark) */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: 320,
    borderRadius: 12,
    backgroundColor: "#071026",
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "stretch",
    borderWidth: 1,
    borderColor: "#122032",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    color: "#e6eef8",
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  modalItemText: {
    textAlign: "center",
    fontSize: 15,
    color: "#e6eef8",
  },
  deleteItem: {
    marginTop: 6,
    backgroundColor: "#2a0a0a",
  },
  deleteText: {
    color: "#ff7878",
    fontWeight: "700",
  },
  modalCancel: {
    marginTop: 8,
    paddingVertical: 10,
  },
  modalCancelText: {
    textAlign: "center",
    color: "#94a3b8",
  },
});
