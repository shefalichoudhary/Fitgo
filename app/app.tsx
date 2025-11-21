/* eslint-disable import/first */
/**
 * Welcome to the main entry point of the app. In this file, we'll
 * be kicking off our app.
 *
 * Most of this file is boilerplate and you shouldn't need to modify
 * it very often. But take some time to look through and understand
 * what is going on here.
 *
 * The app navigation resides in ./app/navigators, so head over there
 * if you're interested in adding screens and navigators.
 */
if (__DEV__) {
  // Load Reactotron in development only.
  // Note that you must be using metro's `inlineRequires` for this to work.
  // If you turn it off in metro.config.js, you'll have to manually import it.
  require("./devtools/ReactotronConfig.ts")
}
import "react-native-get-random-values"
import "./utils/gestureHandler"
import { RoutineProvider } from "@/context/RoutineContext"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"
import { AuthProvider } from "./context/AuthContext"
import { ThemeProvider } from "./theme/context"
import RootLayout from "./rootLayout"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { useEffect } from "react";
import { runSeedersOnce } from "@/utils/storage/runSeederOnce";
export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

/**
 * This is the root component of our app.
 * @param {AppProps} props - The props for the `App` component.
 * @returns {JSX.Element} The rendered `App` component.
 */
export function App() {
    useEffect(() => {
    runSeedersOnce();  // 🔥 Runs on first app start
  }, []);
  return (
        <GestureHandlerRootView style={{ flex: 1 }}>

    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <KeyboardProvider>
        <RoutineProvider>
          <AuthProvider>
            <ThemeProvider>
              <RootLayout />
            </ThemeProvider>
          </AuthProvider>
        </RoutineProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
        </GestureHandlerRootView>

  )
}
