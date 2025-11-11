import React from "react"
import { TextInput, StyleSheet, View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons";

interface InputFieldProps {
  placeholder?: string
  value: string
  onChangeText: (text: string) => void
  secureTextEntry?: boolean
  keyboardType?: "default" | "numeric" | "email-address"
   leftIcon?: keyof typeof Ionicons.glyphMap // 👈 optional icon name
  onLeftIconPress?: () => void
}

export const InputField: React.FC<InputFieldProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  leftIcon,
  onLeftIconPress,
}) => {
  return (
    <View style={styles.container}>
         {leftIcon && ( // 👈 show only if leftIcon is provided
        <TouchableOpacity onPress={onLeftIconPress} style={styles.iconButton}>
          <Ionicons name={leftIcon} size={22} color="#aaa" />
        </TouchableOpacity>
      )}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#A0AEC0"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />

       {value.length > 0 && (
              <TouchableOpacity onPress={() => onChangeText("")} style={styles.clearButton}>
                <Ionicons name="close-circle" size={26} color="#aaaaaaff" />
              </TouchableOpacity>
            )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F1F1F",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 44,
    color: "#fff",
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 8,
  },
  iconButton: {
    marginRight: 8,
  },
})
