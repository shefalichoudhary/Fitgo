import { Text } from "react-native"
import { useRoute, RouteProp } from "@react-navigation/native"

type RootStackParamList = {
  WorkoutDetails: { id: string }
}

export default function WorkoutDetailsScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "WorkoutDetails">>()
  const { id } = route.params

  return <Text style={{ color: "white", margin: 20 }}>Workout Details ID: {id}</Text>
}
