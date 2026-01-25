import React from "react"
import { View, Text, TextInput, StyleSheet } from "react-native"

type Props = {
  value: string
  onChange: (val: string) => void
  isDark: boolean
}

export function NotesSection({ value, onChange, isDark }: Props) {
  const styles = getStyles(isDark)

  return (
    <View style={styles.group}>
      <View style={styles.header}>
        <Text style={styles.title}>Notes</Text>
        <Text style={styles.optional}>(optional)</Text>
      </View>

      <View style={styles.card}>
        <TextInput
          placeholder="Example: fasted, morning check-in, after leg day…"
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChange}
          multiline
          textAlignVertical="top"
          maxLength={200}
          style={styles.input}
        />
      </View>
    </View>
  )
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    group: { marginBottom: 24 },

    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },

    title: {
      fontSize: 17,
      fontWeight: "700",
      color: isDark ? "#E5E7EB" : "#111827",
    },

    optional: {
      fontSize: 13,
      color: "#9CA3AF",
      fontStyle: "italic",
    },

    card: {
      backgroundColor: isDark ? "#1F1F1F" : "#F9FAFB",
      borderRadius: 14,
      padding: 10,
      borderWidth: 1,
      borderColor: isDark ? "#1F1F1F" : "#E5E7EB",
    },

    input: {
      minHeight: 60,
      fontSize: 14,
      color: isDark ? "#FFFFFF" : "#000000",
    },
  })
