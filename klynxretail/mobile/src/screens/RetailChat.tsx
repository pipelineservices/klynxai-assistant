import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { tokens } from "../theme/tokens";

export function RetailChat() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Retail Chat</Text>
      <Text style={styles.subtitle}>
        Ask about any product and get governed recommendations.
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Demo Mode</Text>
        <Text style={styles.cardText}>
          TODO: Connect to chat API and streaming responses.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    color: tokens.colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    color: tokens.colors.textSecondary,
    fontSize: 13,
    marginBottom: 16,
  },
  card: {
    backgroundColor: tokens.colors.surface,
    borderColor: tokens.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  cardTitle: {
    color: tokens.colors.textPrimary,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardText: {
    color: tokens.colors.textSecondary,
    fontSize: 12,
  },
});
