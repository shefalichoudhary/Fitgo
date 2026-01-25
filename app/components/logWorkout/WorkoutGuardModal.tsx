import { useNavigation } from "@react-navigation/native";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useWorkoutSession } from "@/context/WorkoutSessionContext";

export function WorkoutGuardModal() {
  const navigation = useNavigation<any>();
  const {
    pendingNavigation,
    setPendingNavigation,
    setHasUnsavedWorkout,
  } = useWorkoutSession();

  if (!pendingNavigation) return null;

  return (
    <ConfirmModal
      visible={true}
      title="Workout in progress"
      message="You have an ongoing workout. Would you like to resume or discard it?"
      confirmText="Discard"
      onConfirm={() => {
        setHasUnsavedWorkout(false);
        navigation.dispatch(pendingNavigation);
        setPendingNavigation(null);
      }}
      onCancel={() => {
        // Resume workout
        setPendingNavigation(null);
      }}
    />
  );
}
