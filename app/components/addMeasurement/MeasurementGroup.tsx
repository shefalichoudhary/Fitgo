import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { InputField } from "@/components/InputField"

type Field = {
  label: string
  key: string
}

type Props = {
  title: string
  fields: Field[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  isDark: boolean
}

export function MeasurementGroup({
  title,
  fields,
  values,
  onChange,
  isDark,
}: Props) {
  const styles = getStyles(isDark)

  return (
    <View style={styles.group}>
      <Text style={styles.title}>{title}</Text>

      {fields.map(({ label, key }) => (
        <View key={key} style={styles.field}>
          <Text style={styles.label}>{label}</Text>
          <InputField
            placeholder={`Enter ${label}`}
            value={values[key]}
            onChangeText={(val) => onChange(key, val)}
            keyboardType="numeric"
          />
        </View>
      ))}
    </View>
  )
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    group: { marginBottom: 24 },

    title: {
      fontSize: 17,
      fontWeight: "700",
      marginBottom: 12,
      color: isDark ? "#E5E7EB" : "#111827",
    },

    field: { marginBottom: 14 },

    label: {
      fontSize: 15,
      fontWeight: "500",
      marginBottom: 6,
      color: isDark ? "#CCCCCC" : "#333333",
    },
  })
