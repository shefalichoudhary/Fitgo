import React from "react"
import { View, Text, TextInput, StyleSheet } from "react-native"

export const ProfileField = ({
  label,
  value,
  editable,
  onChange,
  keyboardType="default",
}: any) => (
  <View style={styles.section}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      value={value}
      editable={editable} 
      keyboardType={keyboardType}
      onChangeText={onChange}
      style={styles.input}
    />
  </View>
)

const styles = StyleSheet.create({
  section:{ marginBottom:14 },
  label:{ color:"#9CA3AF", fontSize:12, marginBottom:6 },
  input:{
    borderBottomWidth:1,
    borderBottomColor:"#2A2A2A",
    color:"#FFF",
    fontSize:15,
    paddingVertical:6,
  },
})
