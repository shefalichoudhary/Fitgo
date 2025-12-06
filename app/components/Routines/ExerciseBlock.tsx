import React, { useMemo, useState, useEffect, useCallback } from "react";
import { View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity } from "react-native";
import type { Exercise, DataShape, Set, Unit, RepsType } from "./types";
import SetRow from "./SetRow";
import Header from "./Header";
import { narrowUnit, narrowRepsType, normalizeSet } from "./utils";

type Props = {
  exercise: Exercise;
  data: DataShape;
  onChange: (newData: DataShape) => void;
  onStartTimer?: () => void;
  onOpenRepRange: (exerciseId: string, setIndex: number) => void;
  showCheckIcon?: boolean;
  viewOnly?: boolean;
  onOpenWeight?: (exerciseId: string) => void;
  onOpenSetType: (exerciseId: string, setIndex?: number) => void;
  onOpenRepsType?: (exerciseId: string) => void;
  onOpenRestTimer: (exerciseId: string) => void;
  onToggleSetComplete: (exerciseId: string, setIndex: number, completed: boolean) => void;
  onDeleteExercise: (exerciseId: string) => void;
};

export default function ExerciseBlock({
  exercise,
  data,
  onChange,
  onOpenRepRange,
  showCheckIcon,
  viewOnly = false,
  onOpenWeight,
  onOpenSetType,
  onOpenRepsType,
  onToggleSetComplete,
  onDeleteExercise,
}: Props) {
  const [visibleSets, setVisibleSets] = useState<number>(Math.max(1, data.sets.length));
  const exerciseType: string =
    (exercise?.exercise_type as string) ??
    (exercise as any).exerciseType ??
    (exercise as any).type ??
    "Weighted";

  // classify exercise type for rendering
  const normalizedType = (exerciseType || "").toLowerCase();
  const isDuration = normalizedType === "duration";
  const isYogaOrStretching = normalizedType === "yoga" || normalizedType === "stretching";
  const isBodyweight =
    normalizedType === "bodyweight" || normalizedType === "assisted bodyweight" || normalizedType === "assisted bodyweight".toLowerCase() /* defensive */;
  const isWeighted = !isDuration && !isYogaOrStretching && !isBodyweight;



  useEffect(() => {
    setVisibleSets((prev) => Math.max(prev, data.sets.length, 1));
  }, [data.sets.length]);

  // normalized sets with narrowed unit/repsType
const sets = useMemo(
  () =>
    (data.sets || []).map((s: any, idx: number) =>
      normalizeSet(
        {
          id: s.id ?? `${exercise.id}-set-${idx}`, // upstream should already include routineId; this is defensive
          ...s,
        },
        data.unit,
        data.repsType
      )
    ),
  [data.sets, data.unit, data.repsType, exercise.id]
);

  const handleChangeField = useCallback(
    <K extends keyof Set>(index: number, key: K, value: Set[K]) => {
      const next = [...sets];
      next[index] = { ...next[index], [key]: value };
      const normalizedNext = next.map((s) => normalizeSet(s, data.unit, data.repsType));
      onChange({ ...data, sets: normalizedNext });
    },
    [sets, onChange, data]
  );

  const handleAddSet = useCallback(() => {
    if (visibleSets < sets.length) {
      setVisibleSets((v) => v + 1);
      return;
    }
    const newSet: Set = {
      id: `${exercise.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      reps: null,
      weight: null,
      duration: null, // NEW: support duration
      unit: narrowUnit(data.unit),
      repsType: narrowRepsType(data.repsType),
      isCompleted: false,
      setType: "Normal",
    };
    const next = [...sets, newSet].map((s) => normalizeSet(s, data.unit, data.repsType));
    onChange({ ...data, sets: next });
    setVisibleSets(next.length);
  }, [visibleSets, sets, onChange, data, exercise.id]);

  const handleRemoveSet = useCallback(
    (index: number) => {
      const next = sets
        .filter((_, i) => i !== index)
        .map((s) => normalizeSet(s, data.unit, data.repsType));
      const nextVisible = Math.max(1, Math.min(visibleSets, next.length));
      onChange({ ...data, sets: next });
      setVisibleSets(nextVisible);
    },
    [sets, onChange, visibleSets, data]
  );

  const handleNotes = useCallback(
    (text: string) => onChange({ ...data, notes: text }),
    [data, onChange]
  );

  // ---------- Rest-timer handlers ----------
  const setRestTimer = useCallback(
    (seconds: number) => {
      const safe = Math.max(0, Math.round(seconds));
      onChange({ ...data, restTimer: safe });
    },
    [data, onChange]
  );

  const changeRestBy = useCallback(
    (delta: number) => {
      setRestTimer((data.restTimer ?? 0) + delta);
    },
    [data.restTimer, setRestTimer]
  );

  // ---------- Exercise-level handlers for labels ----------
  const handleToggleUnitAll = useCallback(() => {
    const nextUnit: Unit = data.unit === "kg" ? "lbs" : "kg";
    // If you want conversion of weight values, add conversion logic here.
    const next = sets
      .map((s) => ({ ...s, unit: nextUnit }))
      .map((s) => normalizeSet(s, nextUnit, data.repsType));
    onChange({ ...data, unit: nextUnit, sets: next });
  }, [data, sets, onChange]);

  // Toggle reps type for entire exercise (reps <-> rep range)
  const handleToggleRepsTypeAll = useCallback(() => {
    const nextReps: RepsType = data.repsType === "reps" ? "rep range" : "reps";
    const next = sets
      .map((s) => ({ ...s, repsType: nextReps }))
      .map((s) => normalizeSet(s, data.unit, nextReps));
    onChange({ ...data, repsType: nextReps, sets: next });
    if (onOpenRepsType) onOpenRepsType(exercise.id);
  }, [data, sets, onChange, onOpenRepsType, exercise.id]);

  // toggle unit for a single set (used by SetRow)
  const handleToggleUnitForSet = useCallback(
    (setIndex: number) => {
      const next = sets.map((s) => ({ ...s }));
      const s = next[setIndex];
      if (!s) return;
      const newUnit: Unit = s.unit === "kg" ? "lbs" : "kg";
      s.unit = newUnit;
      const normalizedNext = next.map((x) => normalizeSet(x, x.unit ?? newUnit, data.repsType));
      onChange({ ...data, sets: normalizedNext });
    },
    [sets, data, onChange]
  );

  const handleToggleComplete = useCallback(
    (index: number) => {
      const prev = sets[index]?.isCompleted ?? false;
      const next = !prev;

      handleChangeField(index, "isCompleted", next);

      if (onToggleSetComplete) {
        onToggleSetComplete(exercise.id, index, next);
      }
    },
    [sets, handleChangeField, onToggleSetComplete, exercise.id]
  );

  const renderSet = useCallback(
    ({ item, index }: { item: Set; index: number }) => (
     <SetRow
        key={item.id}
        idx={index}
        set={item}
        exerciseType={exerciseType} // PASS in exercise type
        onChangeField={handleChangeField}
        onRemove={handleRemoveSet}
        onOpenWeight={() => onOpenWeight && onOpenWeight(exercise.id)}
        onOpenSetType={() => onOpenSetType && onOpenSetType(exercise.id, index)}
        onOpenRepRange={() => onOpenRepRange(exercise.id, index)}
        disabled={viewOnly}
        onAddSet={handleAddSet}
        showCheckIcon={showCheckIcon}
        onToggleUnit={() => handleToggleUnitForSet(index)}
        onOpenRepsType={() => onOpenRepsType && onOpenRepsType(exercise.id)}
        onToggleComplete={() => handleToggleComplete(index)}
      />
    ),
    [
      handleChangeField,
      handleRemoveSet,
      onOpenWeight,
      onOpenSetType,
      onOpenRepRange,
      viewOnly,
      handleAddSet,
      handleToggleUnitForSet,
      onOpenRepsType,
      handleToggleComplete,
      exercise.id,
      exercise.exercise_type,
      showCheckIcon,
    ]
  );


  return (
    <View style={styles.container}>
      <Header exercise={exercise} data={data} onDelete={() => onDeleteExercise(exercise.id)} />

      {/* Notes */}
      <TextInput
        style={styles.notesInput}
        placeholder="Notes about this exercise..."
        placeholderTextColor="#94a3b8"
        value={data.notes}
        editable={!viewOnly}
        onChangeText={handleNotes}
      />

      {/* Rest timer UI (shown after notes) */}
      <View style={styles.restRow}>
        <View style={styles.restLeft}>
          <Text style={styles.restLabel}>Rest</Text>
          <Text style={styles.restValue}>
            {(data.restTimer ?? 0) > 0 ? `${data.restTimer}s` : "OFF"}
          </Text>
        </View>

        <View style={styles.restControls}>
          <TouchableOpacity
            style={styles.restBtn}
            onPress={() => changeRestBy(-5)}
            disabled={viewOnly}
          >
            <Text style={styles.restBtnText}>-5s</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restBtn}
            onPress={() => setRestTimer(10)}
            disabled={viewOnly}
          >
            <Text style={styles.restBtnText}>10s</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restBtn}
            onPress={() => changeRestBy(15)}
            disabled={viewOnly}
          >
            <Text style={styles.restBtnText}>+15s</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Single labels row — adapt to duration exercises */}
       {sets.length > 0 && (
        <View style={styles.labelsRow}>
          <View style={styles.setLeft}>
            <Text style={styles.columnLabel}>SET</Text>
          </View>

          <View style={[styles.setCenter]}>
            <View style={styles.rowInputs}>
              {isDuration || isYogaOrStretching ? (
                // Duration / Yoga / Stretching show DURATION column
                <View style={styles.weightWrap}>
                  <Text style={styles.columnLabel}>DURATION</Text>
                </View>
              ) : isBodyweight ? (
                // Bodyweight/Assisted Bodyweight: only reps, show "REPS" + optional "BW" label
                  <View style={[styles.repsWrap,{marginRight:20}]}>
                    <Text style={styles.columnLabel}>REPS</Text>
                  </View>
              ) : (
                // Weighted: unit + reps
                <>
                  <TouchableOpacity
                    onPress={handleToggleUnitAll}
                    accessibilityLabel="Toggle unit"
                    accessibilityRole="button"
                    style={styles.weightWrap}
                  >
                    <Text style={styles.columnLabel}>{(data.unit ?? "kg").toUpperCase()}</Text>
                  </TouchableOpacity>

                  <View style={[styles.repsWrap, { flex: 1 }]}>
                    <TouchableOpacity
                      onPress={handleToggleRepsTypeAll}
                      accessibilityLabel="Toggle reps type"
                      accessibilityRole="button"
                    >
                      <Text style={styles.columnLabel}>
                        {data.repsType === "rep range" ? "REP — RANGE" : "REPS"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={styles.right} />
        </View>
      )}

      <FlatList
        data={sets.slice(0, visibleSets)}
        keyExtractor={(_, idx) => `${exercise.id}-set-${idx}`}
        renderItem={renderSet}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.empty}>No sets — add one.</Text>}
      />

      <TouchableOpacity onPress={handleAddSet} style={styles.addBtn}>
        <Text style={styles.addBtnText}>+ Add Set</Text>
      </TouchableOpacity>
    </View>
  );
}

// ... keep your styles from the original file unchanged (omitted here for brevity)

const styles = StyleSheet.create({
  // overall
  container: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#161616ff", // dark card
    borderWidth: 1,
    borderColor: "#111827",
  },

  notesInput: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#080808ff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: "#020202e1",
    color: "#e7eaecff",
  },

  empty: { textAlign: "center", paddingVertical: 12, color: "#94a3b8" },

  // rest row
  restRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: "#050505ff",
    borderColor: "#030303ff",
    borderWidth: 1,
  },
  restLeft: { flexDirection: "column" },
  restLabel: { fontSize: 12, color: "#94a3b8" },
  restValue: { fontSize: 14, fontWeight: "700", marginTop: 4, color: "#e6eef8" },
  restControls: { flexDirection: "row", alignItems: "center" },
  restBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#070707ff",
    borderWidth: 1,
    borderColor: "#202020ff",
    marginRight: 8,
  },
  restBtnText: { fontSize: 12, fontWeight: "600", color: "#cbd5e1" },
  openRest: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#000000ff",
    borderWidth: 1,
    borderColor: "#050505ff",
  },
  openRestText: { fontSize: 12, color: "#cbd5e1" },

  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#183b8a",
    borderRadius: 10,
    marginTop: 12,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "700" },
  labelsRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingBottom: 6,
  },
  columnLabel: { fontSize: 12, color: "#fafafaff", fontWeight: "600" },
  setLeft: { width:75},
  setCenter: { flex: 1,},
  rowInputs: { flexDirection: "row", alignItems: "center" },
   // make the weight input compact and aligned
  weightWrap: {
    flex: 0.58, // a bit less than half

  },
   repsWrap: {
    flex: 1,
    alignItems:"center",
  },
  right: { width: 56, alignItems: "center", justifyContent: "flex-start" },
});
