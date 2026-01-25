import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import Feather from "@expo/vector-icons/Feather"

export const ProfileActions = ({
  editing,
  onEdit,
  onSave,
  onCancel,
}: any) => {
  if (editing) {
    return (
      <View style={styles.row}>
        <TouchableOpacity style={styles.primary} onPress={onSave}>
          <Text style={styles.dark}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={onCancel}>
          <Text style={styles.light}>Cancel</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <TouchableOpacity style={styles.primary} onPress={onEdit}>
      <View style={{ flexDirection:"row", alignItems:"center" }}>
        <Feather name="edit" size={18} color="#000" />
        <Text style={[styles.dark,{ marginLeft:8 }]}>Edit Profile</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  row:{ flexDirection:"row", gap:12 },
  primary:{ backgroundColor:"#FFF", paddingVertical:14, borderRadius:14, alignItems:"center", flex:1 },
  secondary:{ backgroundColor:"#1F2937", paddingVertical:14, borderRadius:14, alignItems:"center", flex:1 },
  dark:{ color:"#000", fontWeight:"700", fontSize:15 },
  light:{ color:"#FFF", fontWeight:"700", fontSize:15 },
})
