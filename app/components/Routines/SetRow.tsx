import React, { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import type { Set } from "./types";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  AccessibilityRole,
  Vibration,
  SafeAreaView,
} from "react-native";
import { ConfirmModal } from "@/components/ConfirmModal";
import DurationTimer from "@/components/Routines/DurationTimer"; // <- adjust path if needed
import SetActionsModal from "./SetActionsModal";

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
const durationRef = useRef<number>(set.duration ?? 0);
const repsRef = useRef<number | null>(set.reps ?? null);
const weightRef = useRef<number | null>(set.weight ?? null);

  const openIndexMenu = () => {
    if (disabled) return;
    setMenuVisible(true);
  };

  const closeMenu = () => setMenuVisible(false);
  
const getSetTypeColor = () => {
  if (set.setType === "W") return "#facc15"; // yellow
  if (set.setType === "F") return "#ef4444"; // red
  return "#ffffff"; // Normal
};

useEffect(() => {
  durationRef.current = set.duration ?? 0;
  repsRef.current = set.reps ?? null;
  weightRef.current = set.weight ?? null;
}, [set.duration, set.reps, set.weight]);

const isSetValid = () => {
  if (isDuration || isYogaOrStretching) {
    return durationRef.current > 0;
  }

  if (isBodyweight) {
    return repsRef.current != null && repsRef.current > 0;
  }

  const hasWeight = weightRef.current != null;
  const isRange = set.repsType === "rep range" || !!set.isRangeReps;

  const hasReps = isRange
    ? set.minReps != null && set.maxReps != null
    : repsRef.current != null;

  return hasWeight && hasReps;
};

const handleToggle = () => {
  // allow unchecking completed set
  if (isCompleted) {
    Vibration.vibrate(40);
    onToggleComplete?.(); // ✅ uncheck
    return;
  }

  // 🔍 unified validation
  if (!isSetValid()) {
    Vibration.vibrate(40);
    setConfirmVisible(true);
    return;
  }

  // 🔒 persist final values before completion
  if (isDuration || isYogaOrStretching) {
    onChangeField(idx, "duration", durationRef.current as any);
  }

  Vibration.vibrate(60);
  onToggleComplete?.();
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
          <Text
  style={[
    styles.indexText,
    { color: getSetTypeColor() },
  ]}
>
  {set.setType === "Normal" ? idx + 1 : set.setType}
</Text>
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
  onChange={(seconds: number) => {
    durationRef.current = seconds;      // ✅ LIVE VALUE
    onChangeField(idx, "duration", seconds);
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
               <Ionicons name="checkmark" size={18} color="white" />
            )}
          </TouchableOpacity>
        ) : null}
      </View>

     <SetActionsModal
  visible={menuVisible}
  currentSetType={currentSetType as any}
  onClose={closeMenu}
  onSelectType={(type) => {
    const value = type === "Warmup" ? "W" : type === "Failure" ? "F" : "Normal";
    onChangeField(idx, "setType", value as any);
    closeMenu();
  }}
  onDelete={() => {
    closeMenu();
    onRemove(idx);
  }}
/>
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
    backgroundColor: "#294b29",
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
     backgroundColor: "transparent",
    borderColor: "gray",
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: "#019a01",
    borderColor: "#019a01",
  },

 
});
