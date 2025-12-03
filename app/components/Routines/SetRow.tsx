import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import type { Set } from "./types";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  AccessibilityRole,
  Modal,
  Pressable,
  Vibration,
  Alert,
} from "react-native";
import { ConfirmModal } from "@/components/ConfirmModal";

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
  showCheckIcon,
  onChangeField,
  onRemove,
  onOpenWeight,
  onToggleComplete,
  onOpenSetType,
}: Props) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const showRange = set.repsType === "rep range" || !!set.isRangeReps;
  const isCompleted = !!set.isCompleted;
  const editable = !disabled && !isCompleted;

  const openIndexMenu = () => {
    if (disabled) return;
    setMenuVisible(true);
  };

  const closeMenu = () => setMenuVisible(false);

  const selectType = (type: string) => {
    const value = type === "Warmup" ? "W" : type === "Failure" ? "F" : (type as any);
    onChangeField(idx, "setType", value as any);
    closeMenu();
  };

  const handleDelete = () => {
    closeMenu();
    onRemove(idx);
  };

  const handleToggle = () => {
    // If already completed, allow unchecking without validation
    if (isCompleted) {
      Vibration.vibrate(40);
      onToggleComplete && onToggleComplete();
      return;
    }

    // Validate weight
    const hasWeight = set.weight != null;

    // Validate reps depending on repsType / range
    const isRange = set.repsType === "rep range" || !!set.isRangeReps;
    const hasReps = isRange ? set.minReps != null && set.maxReps != null : set.reps != null;

    // If anything is missing → block toggle + show confirm modal (simple message)
    if (!hasWeight || !hasReps) {
      Vibration.vibrate(40);
      setConfirmVisible(true);
      return;
    }

    // All good → toggle complete
    Vibration.vibrate(60);
    onToggleComplete && onToggleComplete();
  };

  return (
    <View
      style={[styles.row, isCompleted ? styles.rowCompleted : null]}
      accessibilityRole={"listitem" as AccessibilityRole}
    >
      {/* left: index tappable to open menu */}
      <View style={styles.left}>
        <TouchableOpacity
          onPress={openIndexMenu}
          disabled={disabled}
          style={styles.indexWrap}
          accessibilityRole="button"
          accessibilityLabel="Open set actions"
        >
          <Text style={[styles.indexText]}>{set.setType === "Normal" ? idx + 1 : set.setType}</Text>
        </TouchableOpacity>
      </View>

      {/* center: inputs */}
      <View style={styles.center}>
        <View style={styles.inputsRow}>
          {/* weight input */}
          <TouchableOpacity
            onPress={onOpenWeight}
            disabled={!editable}
            style={styles.weightWrap}
            accessibilityLabel="Edit weight"
            accessibilityRole="button"
          >
            <TextInput
              value={set.weight != null ? String(set.weight) : ""}
              keyboardType="numeric"
              editable={editable}
              placeholder={set.unit === "lbs" ? "lbs" : "kg"}
              onChangeText={(v) => {
                const n = v === "" ? null : Number(v);
                onChangeField(idx, "weight", Number.isNaN(n) ? null : n);
              }}
              style={[styles.input]}
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
                  editable={editable}
                  placeholder="min"
                  onChangeText={(v) => {
                    const n = v === "" ? null : Number(v);
                    onChangeField(idx, "minReps", Number.isNaN(n) ? null : n);
                  }}
                  style={[styles.input, styles.rangeInput]}
                  placeholderTextColor="#6b7280"
                />
                <Text style={[styles.rangeSep]}>-</Text>
                <TextInput
                  value={set.maxReps != null ? String(set.maxReps) : ""}
                  keyboardType="numeric"
                  editable={editable}
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
                editable={editable}
                placeholder="0"
                onChangeText={(v) => {
                  const n = v === "" ? null : Number(v);
                  onChangeField(idx, "reps", Number.isNaN(n) ? null : n);
                }}
                style={[styles.input]}
                placeholderTextColor="#6b7280"
              />
            )}
          </View>
        </View>
      </View>

      {/* right: check icon (shown when showCheckIcon = true) */}
      <View style={styles.right}>
        {showCheckIcon ? (
          <TouchableOpacity
            onPress={handleToggle}
            disabled={disabled}
            style={[styles.checkbox, isCompleted && styles.checkboxActive]}
            accessibilityLabel={isCompleted ? "Mark incomplete" : "Mark complete"}
            accessibilityRole="button"
          >
            {isCompleted ? (
              <Ionicons name="checkmark" size={16} color="#071026" />
            ) : (
              <Ionicons name="ellipse-outline" size={16} color="#94a3b8" />
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      {/* actions modal */}
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
      <ConfirmModal
        visible={confirmVisible}
        title="Incomplete Set"
        message="Please enter weight and reps before marking this set complete."
        onCancel={() => setConfirmVisible(false)} // not used in single mode, but keep for type safety
        onConfirm={() => setConfirmVisible(false)}
        confirmText="OK"
        singleButton={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginTop: 8,
  },

  rowCompleted: {
    backgroundColor: "rgba(16,185,129,0.06)",
    borderRadius: 8,
    padding: 6,
  },

  left: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  indexWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#080808ff",
    borderWidth: 1,
    borderColor: "#080808ff",
  },

  indexText: {
    fontWeight: "700",
    color: "#e6eef8",
  },

  completedText: {
    color: "#9be6b7",
    textDecorationLine: "line-through",
  },

  center: {
    flex: 1,
    paddingHorizontal: 8,
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
    borderColor: "#080808ff",
    paddingHorizontal: 12,
    backgroundColor: "#080808ff",
    fontSize: 14,
    color: "#e7eaecff",
  },

  inputCompleted: {
    color: "#023314ff",
    opacity: 0.9,
    textDecorationLine: "line-through",
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

  right: {
    width: 56,
    alignItems: "center",
    justifyContent: "center",
  },

  checkbox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#080808ff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#080808ff",
  },

  checkboxActive: {
    backgroundColor: "#08865cff",
    borderColor: "#0b3a26ff",
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
