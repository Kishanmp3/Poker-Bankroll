import React from "react";
import { PaperProvider, MD3DarkTheme } from "react-native-paper";
import MainNavigation from "./src/navigation/MainNavigation";
import { AuthProvider } from "./src/context/AuthContext";

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#2196F3",
    background: "#121920",
    surface: "#1a2634",
    text: "#ffffff",
    placeholder: "#8899aa",
    outline: "#2a3744",
  },
};

function App() {
  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <MainNavigation />
      </PaperProvider>
    </AuthProvider>
  );
}

export default App;
