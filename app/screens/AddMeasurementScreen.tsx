import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, useColorScheme } from "react-native"
import { InputField } from "@/components/InputField"
import { Screen } from "@/components/Screen"
import { Button } from "@/components/Button"
import { db } from "../utils/storage"
import { measurements } from "../utils/storage/schema"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { HomeStackParamList } from "@/navigators/navigationTypes"
import { eq } from "drizzle-orm"
import { AppAlert } from "@/components/AppAlert"

export default function AddMeasurementScreen() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>()
  const [alertVisible, setAlertVisible] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

const route = useRoute<RouteProp<HomeStackParamList, "AddMeasurement">>()
  const editData = route.params?.editData || null
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

  /** 🔥 Prefill Form When Editing */
  useEffect(() => {
    if (editData) {
      setFormData({
        weight: editData.weight?.toString() || "",
        bodyFat: editData.bodyFat?.toString() || "",
        muscleMass: editData.muscleMass?.toString() || "",
        waist: editData.waist?.toString() || "",
        chest: editData.chest?.toString() || "",
        shoulders: "",
        neck: "",
        hips: "",
        leftArm: "",
        rightArm: "",
        leftThigh: "",
        rightThigh: "",
        leftCalf: "",
        rightCalf: "",
      })
    }
  }, [editData])

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  /** ✅ Save New Measurement */
  const handleSave = async () => {
    try {
      const cleaned = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          value.trim() === "" ? null : parseFloat(value),
        ]),
      )

      await db.insert(measurements).values({
        userId: "guest-user-id",
        date: new Date().toISOString(),
        ...cleaned,
      })

      navigation.goBack()
      
      setAlertMessage("Measurement saved successfully!")
      setAlertVisible(true)
    } catch (error) {
      console.error("❌ Error saving:", error)
        setAlertMessage("Failed to save measurement. Please try again.")
      setAlertVisible(true)
    }
  }

  /** ✨ Update Existing Measurement */
 const handleUpdate = async () => {
  if (!editData) return; // <-- solves the error

  try {
    const cleaned = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key,
        value.trim() === "" ? null : parseFloat(value),
      ]),
    )

    await db
      .update(measurements)
      .set(cleaned)
      .where(eq(measurements.id, editData.id))

    navigation.goBack()
     setAlertMessage("Measurement updated successfully!")
      setAlertVisible(true)
  } catch (error) {
    console.error("❌ Error updating:", error)
    setAlertMessage("Failed to update measurement. Please try again.")
      setAlertVisible(true)
  }
}

  const isAllEmpty = Object.values(formData).every((v) => v.trim() === "")

  const fields = [
    { label: "Weight (kg)", key: "weight" },
    { label: "Body Fat %", key: "bodyFat" },
    { label: "Muscle Mass (kg)", key: "muscleMass" },
    { label: "Waist (cm)", key: "waist" },
    { label: "Chest (cm)", key: "chest" },
  ]

  return (
    <Screen preset="scroll" contentContainerStyle={styles.container}>
      <Text style={styles.heading}>
        {editData ? "Edit Measurement" : "Record Your Full-Body Measurements"}
      </Text>

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

      {/* 🔥 If Editing → Show UPDATE & CANCEL */}
      {editData ? (
        <>
          <Button
            text="Update Measurement"
            preset="filled"
            onPress={handleUpdate}
            style={[styles.btn, { backgroundColor: "#3B82F6" }]}
          />

          <Button
            text="Cancel"
            preset="default"
            onPress={() => navigation.goBack()}
            style={[styles.btn, { borderColor: "#888" }]}
          />
        </>
      ) : (
        // 🆕 Normal Save Button
        <Button
          text="Save Measurements"
          preset="filled"
          onPress={handleSave}
          disabled={isAllEmpty}
          style={[styles.btn, { backgroundColor: isAllEmpty ? "#94A3B8" : "#3B82F6" }]}
        />
      )}
       {/* AppAlert for save/update feedback */}
      <AppAlert
        visible={alertVisible}
        message={alertMessage}
        onHide={() => {
          setAlertVisible(false)
          navigation.goBack()
        }}
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
