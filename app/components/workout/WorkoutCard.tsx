import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { format } from "date-fns"
import { formatDuration } from "../../utils/formatDuration"

export const WorkoutCard = ({ item, onLongPress, onPress }: any) => {
  const formattedDate = format(new Date(item.date), "MMM d, yyyy")

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} onLongPress={onLongPress}>
      <View style={styles.card}>
        {/* Date */}
        <Text style={styles.dateText}>{formattedDate}</Text>

        {/* Title + Duration */}
        <View style={styles.rowBetween}>
          <Text style={styles.titleText}>{item.title || "Workout"}</Text>

          {item.duration ? (
            <Text style={styles.durationChip}>
              ⏱ {formatDuration(item.duration)}
            </Text>
          ) : null}
        </View>

        {/* Muscle Groups */}
        {item.muscleGroups ? (
          <View style={styles.chipRow}>
            <Text style={styles.chip}>💪 {item.muscleGroups}</Text>
          </View>
        ) : null}

        {/* Notes */}
        {item.notes ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📝</Text>
            <Text style={styles.infoText} numberOfLines={2}>
              {item.notes}
            </Text>
          </View>
        ) : null}

        {/* Rest Time */}
        {item.restTime ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>⏱</Text>
            <Text style={styles.infoText}>
              Rest: {formatDuration(item.restTime)}
            </Text>
          </View>
        ) : null}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{item.exerciseCount}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{item.totalSets}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{item.totalVolume}</Text>
            <Text style={styles.statLabel}>Volume</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#181818",
    borderWidth: 1,
    borderColor: "#262626",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateText: { fontSize: 13, color: "#d9d9d9", fontWeight: "600" },
  durationChip: {
    backgroundColor: "#1f1f1f",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    fontSize: 11,
    color: "#bfbfbf",
  },

  chipRow: { flexDirection: "row", marginTop: 6 },

  chip: {
    backgroundColor: "#1e1e1e",
    paddingVertical: 3,
    paddingHorizontal: 8,
    color: "#c1c1c1",
    borderRadius: 10,
    fontSize: 11,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    backgroundColor: "#101010",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
infoRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 6,
  gap: 6,
},

infoIcon: {
  fontSize: 13,
},

infoText: {
  fontSize: 12,
  color: "#b5b5b5",
  flex: 1,
},
  statBox: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 16, fontWeight: "700", color: "#f1f1f1" },
  statLabel: { fontSize: 11, marginTop: 2, color: "#8c8c8c" },

  divider: { width: 1, backgroundColor: "#2c2c2c", marginHorizontal: 8 },
  titleText: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 4 },
})
