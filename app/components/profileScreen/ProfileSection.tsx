import React from "react"
import { View, Text, StyleSheet } from "react-native"

export const ProfileSection = ({ title, children }: any) => (
  <View style={{ marginBottom: 26 }}>
    <Text style={styles.title}>{title}</Text>
    {children}
  </View>
)

const styles = StyleSheet.create({
  title:{
    color:"#E5E7EB",
    fontSize:13,
    fontWeight:"700",
    marginBottom:12,
    textTransform:"uppercase",
  },
})
