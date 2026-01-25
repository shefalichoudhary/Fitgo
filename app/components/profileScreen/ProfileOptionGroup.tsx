import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

export const ProfileOptionGroup = ({ label, options, value, onChange }: any) => (
  <View style={styles.section}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.row}>
      {options.map((opt: string) => {
        const selected = value === opt
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.chip, selected && styles.active]}
          >
            <View style={[styles.radio, selected && styles.radioActive]}>
              {selected && <View style={styles.radioInner} />}
            </View>
            <Text style={[styles.text, selected && styles.textActive]}>{opt}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  </View>
)

const styles = StyleSheet.create({
  section:{ marginBottom:14 },
  label:{ color:"#9CA3AF", fontSize:12, marginBottom:6 },
  row:{ flexDirection:"row", flexWrap:"wrap", gap:10 },
  chip:{
    flexDirection:"row",
    alignItems:"center",
    padding:10,
    borderRadius:14,
    borderWidth:1,
    borderColor:"#2A2A2A",
    backgroundColor:"#050505",
  },
  active:{ backgroundColor:"#FFF", borderColor:"#FFF" },
  text:{ color:"#D1D5DB", fontSize:13 },
  textActive:{ color:"#000", fontWeight:"700" },
  radio:{
    width:16,
    height:16,
    borderRadius:8,
    borderWidth:2,
    borderColor:"#6B7280",
    marginRight:8,
    alignItems:"center",
    justifyContent:"center",
  },
  radioActive:{ borderColor:"#000" },
  radioInner:{ width:8, height:8, borderRadius:4, backgroundColor:"#000" },
})
