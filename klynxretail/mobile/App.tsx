import React from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import { tokens } from "./src/theme/tokens";
import { RetailChat } from "./src/screens/RetailChat";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.logoBox} />
        <Text style={styles.title}>Klynx Retail Assistant</Text>
      </View>
      <RetailChat />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: tokens.colors.brandBlue,
  },
  title: {
    color: tokens.colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
});
