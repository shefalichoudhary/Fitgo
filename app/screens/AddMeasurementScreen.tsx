import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, useColorScheme,TextInput } from "react-native"
import { Screen } from "@/components/Screen"
import { InputField } from "@/components/InputField"
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
  const styles = getStyles(isDark)

  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>()
  const route = useRoute<RouteProp<HomeStackParamList, "AddMeasurement">>()

  const editData = route.params?.editData || null

  const [alertVisible, setAlertVisible] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

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
    notes: "",
  }

  const [formData, setFormData] = useState(initialFormData)

  useEffect(() => {
    if (editData) {
      setFormData({
        weight: editData.weight?.toString() || "",
        bodyFat: editData.bodyFat?.toString() || "",
        muscleMass: editData.muscleMass?.toString() || "",
        waist: editData.waist?.toString() || "",
        chest: editData.chest?.toString() || "",
        shoulders: editData.shoulders?.toString() || "",
        neck: editData.neck?.toString() || "",
        hips: editData.hips?.toString() || "",
        leftArm: editData.leftArm?.toString() || "",
        rightArm: editData.rightArm?.toString() || "",
        leftThigh: editData.leftThigh?.toString() || "",
        rightThigh: editData.rightThigh?.toString() || "",
        leftCalf: editData.leftCalf?.toString() || "",
        rightCalf: editData.rightCalf?.toString() || "",
        notes: editData.notes || "",
      })
    }
  }, [editData])

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const normalizeData = () =>
    Object.fromEntries(
      Object.entries(formData).map(([key, value]) => {
        if (key === "notes") {
          return [key, value.trim() === "" ? null : value]
        }
        return [key, value.trim() === "" ? null : parseFloat(value)]
      })
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
    } catch (err) {
      console.error(err)
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
    } catch (err) {
      console.error(err)
      setAlertMessage("Failed to update measurement")
      setAlertVisible(true)
    }
  }
const [noteHeight, setNoteHeight] = useState(90)
const MAX_NOTES = 200
  const isAllEmpty = Object.values(formData).every((v) => v.trim() === "")

  const fieldGroups = [
    {
      title: "Body Composition",
      fields: [
        { label: "Weight (kg)", key: "weight" },
        { label: "Body Fat (%)", key: "bodyFat" },
        { label: "Muscle Mass (kg)", key: "muscleMass" },
      ],
    },
    {
      title: "Upper Body",
      fields: [
        { label: "Chest (cm)", key: "chest" },
        { label: "Shoulders (cm)", key: "shoulders" },
        { label: "Left Arm (cm)", key: "leftArm" },
        { label: "Right Arm (cm)", key: "rightArm" },
      ],
    },
    {
      title: "Core",
      fields: [
        { label: "Waist (cm)", key: "waist" },
        { label: "Hips (cm)", key: "hips" },
      ],
    },
    {
      title: "Lower Body",
      fields: [
        { label: "Left Thigh (cm)", key: "leftThigh" },
        { label: "Right Thigh (cm)", key: "rightThigh" },
        { label: "Left Calf (cm)", key: "leftCalf" },
        { label: "Right Calf (cm)", key: "rightCalf" },
      ],
    },
  ]

  return (
    <Screen preset="scroll" contentContainerStyle={styles.container}>
      <Text style={styles.heading}>
        {editData ? "Edit Measurement" : "Record Your Full-Body Measurements"}
      </Text>

   <View style={styles.group}>
  <View style={styles.notesHeader}>
    <Text style={styles.groupTitle}>Notes</Text>
    <Text style={styles.optional}>(optional)</Text>
  </View>

  <View style={styles.notesCard}>
    <TextInput
      placeholder="Example: fasted, morning check-in, after leg day…"
      placeholderTextColor="#9CA3AF"
      value={formData.notes}
      onChangeText={(val) => handleChange("notes", val)}
      multiline
      textAlignVertical="top"
      maxLength={20}
      style={styles.notesInput}
    />
  </View>
</View>
      {/* MEASUREMENT GROUPS */}
      {fieldGroups.map((group) => (
        <View key={group.title} style={styles.group}>
          <Text style={styles.groupTitle}>{group.title}</Text>

          {group.fields.map(({ label, key }) => (
            <View key={key} style={styles.field}>
              <Text style={styles.label}>{label}</Text>
              <InputField
                placeholder={`Enter ${label}`}
                value={formData[key as keyof typeof formData]}
                onChangeText={(val) => handleChange(key, val)}
                keyboardType="numeric"
              />
            </View>
          ))}
        </View>
      ))}

      {editData ? (
        <>
          <Button
            text="Update Measurement"
            preset="filled"
            onPress={handleUpdate}
            style={styles.primaryBtn}
          />
          <Button
            text="Cancel"
            preset="default"
            onPress={() => navigation.goBack()}
            style={styles.secondaryBtn}
          />
        </>
      ) : (
        <Button
          text="Save Measurements"
          preset="filled"
          onPress={handleSave}
          disabled={isAllEmpty}
          style={[
            styles.primaryBtn,
            { backgroundColor: isAllEmpty ? "#94A3B8" : "#3B82F6" },
          ]}
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

/* ───────── STYLES ───────── */

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

    group: { marginBottom: 24 },

    groupTitle: {
      fontSize: 17,
      fontWeight: "700",
      marginBottom: 12,
      color: isDark ? "#E5E7EB" : "#111827",
    },

    label: {
      fontSize: 15,
      fontWeight: "500",
      marginBottom: 6,
      color: isDark ? "#CCCCCC" : "#333333",
    },

    field: { marginBottom: 14 },

    notesHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },

    optional: {
      fontSize: 13,
      color: "#9CA3AF",
      fontStyle: "italic",
    },

    notesCard: {
      backgroundColor: isDark ? "#1F1F1F" : "#F9FAFB",
      borderRadius: 14,
      padding: 10,
      borderWidth: 1,
      borderColor: isDark ? "#1F1F1F" : "#E5E7EB",
    },

    notesInput: {
      minHeight: 60,
      fontSize: 14,
      color: isDark ? "#FFFFFF" : "#000000",
      
    },

    primaryBtn: {
      borderRadius: 10,
      marginTop: 12,
    },

    secondaryBtn: {
      marginTop: 10,
      borderColor: "#888",
    },
  })
