import React from "react"
import { View } from "react-native"
import { MeasurementGroup } from "./MeasurementGroup"

type Props = {
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  isDark: boolean
}

export function MeasurementFields({ values, onChange, isDark }: Props) {
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
    <View>
      {fieldGroups.map((group) => (
        <MeasurementGroup
          key={group.title}
          title={group.title}
          fields={group.fields}
          values={values}
          onChange={onChange}
          isDark={isDark}
        />
      ))}
    </View>
  )
}
