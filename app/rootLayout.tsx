// import { useEffect, useRef, useState } from "react"
// import { View, ActivityIndicator } from "react-native"
// import * as SplashScreen from "expo-splash-screen"
// import { db, expo_sqlite } from "./utils/storage/index"
// import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
// import { AppNavigator } from "./navigators/AppNavigator"
// import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
// import {migrations} from "./drizzle/migrations";

// export default function RootLayout() {
//   const { success, error: migrationError } = useMigrations(db, migrations)
//   const [appReady, setAppReady] = useState(false)
//   const hasHiddenSplash = useRef(false)

//   if (__DEV__) {
//     useDrizzleStudio(expo_sqlite)
//   }

//   useEffect(() => {
//     const prepare = async () => {
//       if (hasHiddenSplash.current) return

//       if (migrationError) console.error("Migration error:", migrationError)
//       if (success || migrationError) {
//         await SplashScreen.hideAsync()
//         setAppReady(true)
//         hasHiddenSplash.current = true
//       }
//     }

//     prepare()
//   }, [success, migrationError])

//   if (!appReady) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "black" }}>
//         <ActivityIndicator size="large" color="white" />
//       </View>
//     )
//   }

//   return <AppNavigator />
// }
