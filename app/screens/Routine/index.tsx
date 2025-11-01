import React from "react"
import { StyleSheet, Text, Pressable, View, FlatList } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Screen } from "@/components/Screen"

export default function RoutineScreen() {
  const router = useRouter()

  const routines: any[] = [] // Empty routines list for now

  const handleCreateRoutine = () => {
    router.push("/routine/create")
  }

  return (
    <Screen preset="scroll" style={styles.screen}>
      {routines.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="fitness-outline" size={72} color="#555" />
          <Text style={styles.emptyTitle}>No Routines Yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your first workout routine and start tracking your progress.
          </Text>
         
        </View>
      ) : (
        <FlatList
          data={routines}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.routineCard}
              onPress={() => router.push(`/routine/${item.id}`)}
            >
              <Text style={styles.routineText}>{item.name}</Text>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </Pressable>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#121212",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  routineCard: {
    backgroundColor: "#1E1E1E",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  routineText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical:100
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 16,
  },
  emptySubtitle: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 20,
  },
 
  
})
