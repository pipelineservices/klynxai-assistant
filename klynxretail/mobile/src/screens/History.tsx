import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { tokens } from "../theme/tokens";

export function History() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>
      <Text style={styles.subtitle}>Previous scans and decisions.</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>No history yet</Text>
        <Text style={styles.cardText}>
          TODO: Connect to audit logs and user history storage.
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
