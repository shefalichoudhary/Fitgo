import React, { useEffect, useRef, useState } from "react"
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Modal,
  Pressable,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native"
import { SafeAreaView, } from "react-native-safe-area-context";

const ITEM_HEIGHT = 40
const VISIBLE_ITEMS = 5
const CENTER_OFFSET = Math.floor(VISIBLE_ITEMS / 2)
const DEFAULT_INDEX = 4 // 0-based (3 = 4th item)


type Props = {
  visible: boolean
  title: string
  values: number[]
  onSelect: (v: number) => void
  onClose: () => void
}

export const NumberPickerModal = ({
  visible,
  title,
  values,
  onSelect,
  onClose,
}: Props) => {
  const listRef = useRef<FlatList<number>>(null)
const [selectedIndex, setSelectedIndex] = useState(DEFAULT_INDEX)

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT)
    setSelectedIndex(index)
  }
useEffect(() => {
  if (visible && listRef.current) {
    listRef.current.scrollToOffset({
      offset: DEFAULT_INDEX * ITEM_HEIGHT,
      animated: false,
    })
  }
}, [visible])
  const confirmSelect = () => {
    onSelect(values[selectedIndex])
    onClose()
  }

  return (
<Modal visible={visible} transparent animationType="slide">
  <View style={styles.modalRoot}>
    {/* Overlay – outside press */}
    <Pressable style={styles.overlay} onPress={onClose} />

    {/* Bottom sheet */}
    <View style={styles.sheetWrapper} pointerEvents="box-none">
      <SafeAreaView edges={["bottom"]}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>

          <View style={styles.pickerWrapper}>
            <View style={styles.centerHighlight} />

          <FlatList
  ref={listRef}
  data={values}
  keyExtractor={(v) => String(v)}
  showsVerticalScrollIndicator={false}
  snapToInterval={ITEM_HEIGHT}
  decelerationRate="fast"
  onMomentumScrollEnd={onScrollEnd}
  getItemLayout={(_, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  contentContainerStyle={{
    paddingVertical: ITEM_HEIGHT * CENTER_OFFSET,
  }}
  renderItem={({ item, index }) => {
    const isActive = index === selectedIndex
    return (
      <View style={styles.item}>
        <Text style={[styles.text, isActive && styles.activeText]}>
          {item}
        </Text>
      </View>
    )
  }}
/>

          </View>

          <Pressable style={styles.confirmBtn} onPress={confirmSelect}>
            <Text style={styles.confirmText}>Confirm</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  </View>
</Modal>



  )
}
const styles = StyleSheet.create({
modalRoot: {
  flex: 1,
},

overlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(0,0,0,0.55)",
},

sheetWrapper: {
  flex: 1,
  justifyContent: "flex-end",
},

safeArea: {
  flex: 1,
  justifyContent: "flex-end",
},

  sheet: {
    backgroundColor: "#0B0B0C",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#2A2A2A",
    alignSelf: "center",
     marginVertical: 6, 
  },

  title: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    paddingBottom: 5,
  },

  pickerWrapper: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    overflow: "hidden",
  },

  centerHighlight: {
    position: "absolute",
    top: ITEM_HEIGHT * CENTER_OFFSET,
    height: ITEM_HEIGHT,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#2A2A2A",
    backgroundColor: "rgba(255,255,255,0.04)",
    zIndex: 1,
  },

  item: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
  },

  activeText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },

  confirmBtn: {
    marginTop: 16,
    backgroundColor: "#FFF",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },

  confirmText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "700",
  },
})
