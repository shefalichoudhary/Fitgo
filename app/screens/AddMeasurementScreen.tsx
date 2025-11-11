import React, { useState } from "react"
import { View, Text, StyleSheet, useColorScheme } from "react-native"
import { InputField } from "@/components/InputField"
import { Screen } from "@/components/Screen"
import { Button } from "@/components/Button"
import { navigate } from "@/navigators/navigationUtilities"
import { db } from "../utils/storage"
import { measurements } from "../utils/storage/schema" // drizzle table
import { eq } from "drizzle-orm"

export default function AddMeasurementScreen() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const styles = getStyles(isDark)
const initialFormData = {
  weight: "",
  bodyFat: "",
  muscleMass: "",
  waist: "",
  chest: "",
  shoulders: "",
  neck: "",
  hips: "",
  leftArm: "",
  rightArm: "",
  leftThigh: "",
  rightThigh: "",
  leftCalf: "",
  rightCalf: "",
}
  const [formData, setFormData] = useState(initialFormData)

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    try {
      const cleanedMeasurements = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          value.trim() === "" ? null : parseFloat(value),
        ])
      )

      const userId = "guest-user-id" // replace with actual user ID

      await db.insert(measurements).values({
        userId,
        date: new Date().toISOString(),
        ...cleanedMeasurements,
      })

      console.log("✅ Measurements saved to DB:", cleanedMeasurements)
      navigate("Measurements")
    } catch (error) {
      console.error("❌ Error saving measurements:", error)
    }
  }

  const isAllEmpty = Object.values(formData).every((val) => val.trim() === "")

  const fields = [
    { label: "Weight (kg)", key: "weight" },
    { label: "Body Fat %", key: "bodyFat" },
    { label: "Muscle Mass (kg)", key: "muscleMass" },
    { label: "Waist (cm)", key: "waist" },
    { label: "Chest (cm)", key: "chest" },
    { label: "Shoulders (cm)", key: "shoulders" },
    { label: "Neck (cm)", key: "neck" },
    { label: "Hips (cm)", key: "hips" },
    { label: "Left Arm (cm)", key: "leftArm" },
    { label: "Right Arm (cm)", key: "rightArm" },
    { label: "Left Thigh (cm)", key: "leftThigh" },
    { label: "Right Thigh (cm)", key: "rightThigh" },
    { label: "Left Calf (cm)", key: "leftCalf" },
    { label: "Right Calf (cm)", key: "rightCalf" },
  ]

  return (
    <Screen preset="scroll" contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Record Your Full-Body Measurements</Text>

      {fields.map(({ label, key }) => (
        <View key={key}>
          <Text style={styles.label}>{label}</Text>
          <InputField
            placeholder={`Enter ${label.toLowerCase()}`}
            value={formData[key as keyof typeof formData]}
            onChangeText={(val) => handleChange(key, val)}
            keyboardType="numeric"
          />
        </View>
      ))}

      <Button
        text="Save Measurements"
        preset="filled"
        onPress={handleSave}
        disabled={isAllEmpty}
        style={[
          styles.btn,
          { backgroundColor: isAllEmpty ? "#94A3B8" : "#3B82F6" },
        ]}
      />
    </Screen>
  )
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 20,
      backgroundColor: isDark ? "#121212" : "#FFFFFF",
    },
    heading: {
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 20,
      textAlign: "center",
      color: isDark ? "#FFFFFF" : "#000000",
    },
    label: {
      fontSize: 15,
      fontWeight: "500",
      marginBottom: 6,
      color: isDark ? "#CCCCCC" : "#333333",
    },
    btn: {
      borderRadius: 8,
      marginTop: 12,
    },
  })
