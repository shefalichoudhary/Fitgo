import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from "react-native"

export default function MeasurementScreen() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  const styles = getStyles(isDark)

  const [measurements, setMeasurements] = useState({
    weight: "",
    bodyFat: "",
    muscleMass: "",
    waist: "",
    chest: "",
    date: new Date().toISOString().split("T")[0],
  })

  const handleChange = (key: string, value: string) => {
    setMeasurements({ ...measurements, [key]: value })
  } 

  const handleSave = () => {
    // TODO: Save to AsyncStorage, SQLite, or server
    console.log("Measurements saved:", measurements)
  }

  const fields = [
    { label: "Weight (kg)", key: "weight" },
    { label: "Body Fat %", key: "bodyFat" },
    { label: "Muscle Mass (kg)", key: "muscleMass" },
    { label: "Waist (cm)", key: "waist" },
    { label: "Chest (cm)", key: "chest" },
    { label: "Date (YYYY-MM-DD)", key: "date" },
  ]

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Record Your Measurements</Text>

      {fields.map(({ label, key }) => (
        <View key={key} style={styles.inputContainer}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            value={measurements[key as keyof typeof measurements]}
            onChangeText={(val) => handleChange(key, val)}
            style={styles.input}
            placeholder={`Enter ${label.toLowerCase()}`}
            placeholderTextColor={isDark ? "#888" : "#999"}
            keyboardType="numeric"
          />
        </View>
      ))}

      <View style={styles.buttonContainer}>
        <Button title="Save Measurement" onPress={handleSave} color={isDark ? "#3b82f6" : undefined} />
      </View>
    </ScrollView>
  )
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 16,
      backgroundColor: isDark ? "#121212" : "#fff",
    },
    heading: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 16,
      textAlign: "center",
      color: isDark ? "#fff" : "#000",
    },
    inputContainer: {
      marginBottom: 12,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 4,
      color: isDark ? "#ccc" : "#333",
    },
    input: {
      height: 44,
      borderColor: isDark ? "#444" : "#ccc",
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 10,
      backgroundColor: isDark ? "#1e1e1e" : "#f9f9f9",
      color: isDark ? "#fff" : "#000",
    },
    buttonContainer: {
      marginTop: 16,
    },
  })
