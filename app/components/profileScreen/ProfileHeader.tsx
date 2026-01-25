import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export const ProfileHeader = ({ username, email }: any) => (
  <View style={styles.header}>
    <Ionicons name="person-circle-outline" size={72} color="#FFF" />
    <Text style={styles.name}>{username}</Text>
    <Text style={styles.email}>{email}</Text>
  </View>
)

const styles = StyleSheet.create({
  header:{ alignItems:"center", marginBottom:28 },
  name:{ color:"#FFF", fontSize:20, fontWeight:"700", marginTop:8 },
  email:{ color:"#9CA3AF", fontSize:13 },
})
