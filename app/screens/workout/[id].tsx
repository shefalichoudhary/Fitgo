import { Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function WorkoutDetailsScreen() {
  const { id } = useLocalSearchParams();

  return (
    <Text style={{ color: "white", margin: 20 }}>
      Workout Details ID: {id}
    </Text>
  );
}
