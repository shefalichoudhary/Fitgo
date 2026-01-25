import React, { useState, useEffect } from "react"
import { Text, StyleSheet, useColorScheme, View } from "react-native"
import { Screen } from "@/components/Screen"
import { Button } from "@/components/Button"
import { AppAlert } from "@/components/AppAlert"
import { NotesSection } from "@/components/addMeasurement/NotesSection"
import { MeasurementFields } from "@/components/addMeasurement/MeasurementField"
import { db } from "@/utils/storage"
import { measurements } from "@/utils/storage/schema"
import { eq } from "drizzle-orm"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { HomeStackParamList } from "@/navigators/navigationTypes"

type MeasurementFormKey =
  | "weight"
  | "bodyFat"
  | "muscleMass"
  | "waist"
  | "chest"
  | "shoulders"
  | "neck"
  | "hips"
  | "leftArm"
  | "rightArm"
  | "leftThigh"
  | "rightThigh"
  | "leftCalf"
  | "rightCalf"
  | "notes"

type MeasurementForm = Record<MeasurementFormKey, string>

export default function AddMeasurementScreen() {
  const isDark = useColorScheme() === "dark"
  const styles = getStyles(isDark)

  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>()
  const route = useRoute<RouteProp<HomeStackParamList, "AddMeasurement">>()

  const editData = route.params?.editData ?? null

  const [alertVisible, setAlertVisible] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

const [formData, setFormData] = useState<MeasurementForm>({
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
  notes: "",
})

useEffect(() => {
  if (!editData) return

  const updatedForm: Partial<MeasurementForm> = {}

  ;(Object.keys(formData) as MeasurementFormKey[]).forEach((key) => {
    if (key === "notes") {
      updatedForm.notes = editData.notes ?? ""
    } else {
      const value = editData[key as keyof MeasurementForm]
      updatedForm[key] =
        value === null || value === undefined ? "" : String(value)
    }
  })

  setFormData((prev) => ({ ...prev, ...updatedForm }))
}, [editData])

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const normalizeData = () =>
    Object.fromEntries(
      Object.entries(formData).map(([key, value]) =>
        key === "notes"
          ? [key, value.trim() || null]
          : [key, value.trim() === "" ? null : parseFloat(value)]
      )
    )

  const handleSave = async () => {
    try {
      await db.insert(measurements).values({
        userId: "guest-user-id",
        date: new Date().toISOString(),
        ...normalizeData(),
      })
      setAlertMessage("Measurement saved successfully!")
      setAlertVisible(true)
    } catch {
      setAlertMessage("Failed to save measurement")
      setAlertVisible(true)
    }
  }

  const handleUpdate = async () => {
    if (!editData) return

    try {
      await db
        .update(measurements)
        .set(normalizeData())
        .where(eq(measurements.id, editData.id))

      setAlertMessage("Measurement updated successfully!")
      setAlertVisible(true)
    } catch {
      setAlertMessage("Failed to update measurement")
      setAlertVisible(true)
    }
  }

  const isAllEmpty = Object.values(formData).every((v) => v.trim() === "")

  return (
    <Screen preset="scroll" contentContainerStyle={styles.container}>
      <Text style={styles.heading}>
        {editData ? "Edit Measurement" : "Record Your Full-Body Measurements"}
      </Text>

      <NotesSection
        value={formData.notes}
        onChange={(val) => handleChange("notes", val)}
        isDark={isDark}
      />

      <MeasurementFields
        values={formData}
        onChange={handleChange}
        isDark={isDark}
      />

      {editData ? (
        <>
          <View style={styles.buttonGroup}>
    <Button text="Update Measurement" onPress={handleUpdate} />
    <Button text="Cancel" preset="default" onPress={navigation.goBack} />
  </View>
        </>
      ) : (
        <Button
          text="Save Measurements"
          onPress={handleSave}
          disabled={isAllEmpty}
        />
      )}

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
    buttonGroup: {
  gap: 8, // 👈 space between buttons (RN 0.71+)
},
  })
