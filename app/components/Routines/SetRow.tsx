import React, { useEffect, useState } from "react";
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
  SafeAreaView,
  Platform,
} from "react-native";
import { ConfirmModal } from "@/components/ConfirmModal";
import DurationTimer from "@/components/Routines/DurationTimer"; // <- adjust path if needed

type Props = {
  idx: number;
  set: Set;
  exerciseType?: string; // NEW: "Duration" etc.
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
  exerciseType = "Normal",
  disabled = false,
  showCheckIcon,
  onChangeField,
  onRemove,
  onOpenWeight,
  onToggleComplete,
}: Props) {
  // canonicalize & classify incoming exerciseType (case-insensitive)
  const normalizedExerciseType = (exerciseType ?? "").toString().trim().toLowerCase();
  const isDuration = normalizedExerciseType === "duration";
  const isYogaOrStretching =
    normalizedExerciseType === "yoga" || normalizedExerciseType === "stretching";
  const isBodyweight =
    normalizedExerciseType === "bodyweight" || normalizedExerciseType === "assisted bodyweight";
  const currentSetType =
    set.setType === "W" ? "Warmup" : set.setType === "F" ? "Failure" : "Normal";
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
    if (isCompleted) {
      Vibration.vibrate(40);
      onToggleComplete && onToggleComplete();
      return;
    }

    // Validation by exercise kind
    if (isDuration || isYogaOrStretching) {
      const hasDuration = (set.duration ?? 0) > 0;
      if (!hasDuration) {
        Vibration.vibrate(40);
        setConfirmVisible(true);
        return;
      }
    } else if (isBodyweight) {
      const hasReps = set.reps != null && set.reps > 0;
      if (!hasReps) {
        Vibration.vibrate(40);
        setConfirmVisible(true);
        return;
      }
    } else {
      const hasWeight = set.weight != null;
      const isRangeLocal = set.repsType === "rep range" || !!set.isRangeReps;
      const hasReps = isRangeLocal ? set.minReps != null && set.maxReps != null : set.reps != null;
      if (!hasWeight || !hasReps) {
        Vibration.vibrate(40);
        setConfirmVisible(true);
        return;
      }
    }

    if (isDuration || isYogaOrStretching) {
      onChangeField(idx, "duration", (set.duration ?? 0) as any);
    }

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
          {isDuration || isYogaOrStretching ? (
            <View style={[styles.durationWrap]}>
              <DurationTimer
                key={`${set.id}-${isCompleted ? "completed" : "active"}`}
                initialSeconds={set.duration ?? 0}
                editable={editable}
                hideControlsWhenNotEditable={true}
                onChange={(seconds: any) => {
                  onChangeField(idx, "duration", seconds as any);
                }}
                onStop={() => {
                  onChangeField(idx, "duration", (set.duration ?? 0) as any);
                }}
                soundFile={require("../../../assets/sounds/beep.mp3")}
              />
            </View>
          ) : isBodyweight ? (
            // Bodyweight: only reps input (no weight UI)
            <View style={styles.repsWrap}>
              <TextInput
                value={set.reps != null ? String(set.reps) : ""}
                keyboardType="numeric"
                editable={editable}
                placeholder="reps"
                onChangeText={(v) => {
                  const n = v === "" ? null : Number(v);
                  onChangeField(idx, "reps", Number.isNaN(n) ? null : n);
                }}
                style={[styles.underlineInput]}
                placeholderTextColor="#6b7280"
              />
            </View>
          ) : (
            // Weighted: weight + reps/range
            <>
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
                  style={[styles.underlineInput]}
                  placeholderTextColor="#6b7280"
                />
              </TouchableOpacity>

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
                      style={[styles.underlineInput, styles.rangeInput]}
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
                      style={[styles.underlineInput, styles.rangeInput]}
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
                    style={[styles.underlineInput]}
                    placeholderTextColor="#6b7280"
                  />
                )}
              </View>
            </>
          )}
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
      <Modal visible={menuVisible} transparent animationType="slide" onRequestClose={closeMenu}>
        <Pressable style={styles.modalOverlay} onPress={closeMenu}>
          <SafeAreaView style={styles.safeArea}>
            <Pressable style={styles.bottomSheet} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitle}>Set actions</Text>
              <Pressable style={[styles.modalItem]} onPress={() => selectType("Normal")}>
                <Text
                  style={[
                    styles.modalItemText,
                    currentSetType === "Normal" && styles.modalItemTextActive,
                  ]}
                >
                  Normal
                </Text>
              </Pressable>
              <Pressable style={[styles.modalItem]} onPress={() => selectType("Warmup")}>
                <Text
                  style={[
                    styles.modalItemText,
                    currentSetType === "Warmup" && styles.modalItemTextActive,
                  ]}
                >
                  Warmup
                </Text>
              </Pressable>

              <Pressable style={[styles.modalItem]} onPress={() => selectType("Failure")}>
                <Text
                  style={[
                    styles.modalItemText,
                    currentSetType === "Failure" && styles.modalItemTextActive,
                  ]}
                >
                  Failure
                </Text>
              </Pressable>

              <Pressable style={[styles.modalItem, styles.deleteItem]} onPress={handleDelete}>
                <Text style={[styles.modalItemText, styles.deleteText]}>Delete set</Text>
              </Pressable>
            </Pressable>
          </SafeAreaView>
        </Pressable>
      </Modal>

      <ConfirmModal
        visible={confirmVisible}
        title="Incomplete Set"
        message={
          isDuration || isYogaOrStretching
            ? "Please enter duration (seconds) before marking this set complete."
            : isBodyweight
              ? "Please enter reps before marking this set complete."
              : "Please enter weight and reps before marking this set complete."
        }
        onCancel={() => setConfirmVisible(false)}
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
  underlineInput: {
    height: 38,
    borderBottomWidth: 0,
    borderBottomColor: "#2b3948", // subtle divider; adjust to taste
    paddingHorizontal: 6,
    paddingVertical: 8,
    backgroundColor: "transparent", // remove filled background
    fontSize: 14,
    color: "#e7eaecff",
    textAlignVertical: "center",
  },
  rangeInput: {
    minWidth: 56,
    paddingHorizontal: 8,
    marginVertical: 0,
    textAlign: "center",
  },

  weightWrap: {
    flex: 0.58, // a bit less than half
    alignItems: "center",
  },
  repsWrap: {
    flex: 1,
    alignItems: "center",
  },
  rangeSep: {
    color: "#94a3b8",
    fontWeight: "700",
  },
  indexWrap: {
    width: 34,
    height: 34,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  checkbox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#122032",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  indexText: {
    fontWeight: "700",
    color: "#e6eef8",
  },
  center: {
    flex: 1,
    paddingHorizontal: 8,
  },
  inputsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerBtn: {
    width: 40,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#183b8a",
  },
  timerBtnActive: {
    backgroundColor: "#10B981",
  },
  durationWrap: {
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
  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  right: {
    width: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: "#08865cff",
    borderColor: "#0b3a26ff",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end", // 👈 bottom
  },

  safeArea: {
    width: "100%",
  },

  bottomSheet: {
    width: "100%",
    backgroundColor: "#000000ff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#122032",
    paddingBottom: Platform.OS === "android" ? 55 : 0,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
    color: "#e6eef8",
  },

  modalItem: {
    paddingVertical: 14,
    borderRadius: 10,
  },

  modalItemText: {
    textAlign: "center",
    fontSize: 15,
    color: "#e6eef8",
  },

  deleteItem: {
    marginTop: 8,
    backgroundColor: "#2a0a0a",
  },

  deleteText: {
    color: "#ff7878",
    fontWeight: "700",
  },
  modalItemTextActive: {
    color: "#1d4ed8",
    fontWeight: "700",
  },
});
