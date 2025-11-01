import React from "react";
import { View, Text, FlatList, StyleSheet, ScrollView } from "react-native";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { Screen } from "@/components/Screen";

interface Workout {
  id: number;
  date: string;
  totalVolume: number;
  totalSets: number;
}

type ListItem = 
  | { type: "header"; title: string }
  | (Workout & { type: "workout" });

const sampleHistory: Workout[] = [
  { id: 1, date: "2025-10-29T10:30:00Z", totalVolume: 12500, totalSets: 18 },
  { id: 2, date: "2025-10-28T09:15:00Z", totalVolume: 15000, totalSets: 22 },
  { id: 3, date: "2025-10-24T07:00:00Z", totalVolume: 9800, totalSets: 15 },
  { id: 4, date: "2025-10-18T07:00:00Z", totalVolume: 10500, totalSets: 16 },
  { id: 5, date: "2025-10-15T11:00:00Z", totalVolume: 11200, totalSets: 17 },
  { id: 8, date: "2025-10-15T11:00:00Z", totalVolume: 1100, totalSets: 19 },
];

// Helper to format the week range
const getWeekRange = (date: string) => {
  const current = new Date(date);
  const weekStart = startOfWeek(current, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(current, { weekStartsOn: 1 });
  return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
};

export default function HistoryScreen() {
  const groupedData = sampleHistory.reduce((groups: any, workout) => {
    const week = getWeekRange(workout.date);
    if (!groups[week]) groups[week] = [];
    groups[week].push(workout);
    return groups;
  }, {});

  const flatData: ListItem[] = [];
  Object.keys(groupedData).forEach((week) => {
    flatData.push({ type: "header", title: week });
    groupedData[week].forEach((workout: Workout) =>
      flatData.push({ ...workout, type: "workout" })
    );
  });

  return (
    <Screen preset="fixed"  >
      <FlatList
        data={flatData}
        keyExtractor={(item, index) =>
          item.type === "header" ? `header-${index}` : `workout-${item.id}`
        }
        renderItem={({ item }) => {
          if (item.type === "header") {
            return <Text style={styles.sectionHeader}>{item.title}</Text>;
          }

          return (
            <View style={styles.card}>
              <Text style={styles.dateText}>
                {format(new Date(item.date), "MMM d, yyyy")}
              </Text>
              <View style={styles.row}>
                <Text style={styles.stat}>💪 Volume: {item.totalVolume} kg</Text>
                <Text style={styles.stat}>📝 Sets: {item.totalSets}</Text>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
       
      />
    </Screen>
  );
}


const styles = StyleSheet.create({
   
  listContent: {
    padding: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
    marginVertical: 20,
  },
  sectionHeader: {
    backgroundColor: "#3d84f7",
    color: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 10,
  },
  card: {
    backgroundColor: "#262626",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stat: {
    fontSize: 14,
    color: "#ccc",
  },
});
