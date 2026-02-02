import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { tokens } from "../theme/tokens";

export function RetailChat() {
  const [mode, setMode] = useState<"typed" | "barcode" | "qr" | "image">("typed");
  const [typedText, setTypedText] = useState("");
  const [lastScan, setLastScan] = useState<string>("");
  const [scanning, setScanning] = useState(true);
  const [permission, requestPermission] = useCameraPermissions();

  const requestCamera = async () => {
    if (!permission || !permission.granted) {
      const result = await requestPermission();
      if (!result.granted) return false;
    }
    return true;
  };

  const onSelectMode = async (nextMode: typeof mode) => {
    setMode(nextMode);
    if (nextMode === "barcode" || nextMode === "qr") {
      const ok = await requestCamera();
      if (!ok) {
        setLastScan("Camera permission not granted.");
      }
      setScanning(true);
    }
    if (nextMode === "image") {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        setLastScan(`IMAGE: ${result.assets[0].uri}`);
      }
      setMode("typed");
    }
  };

  const onTypedSend = () => {
    if (!typedText.trim()) return;
    setLastScan(`TYPED: ${typedText.trim()}`);
    setTypedText("");
  };

  const barcodeTypes =
    mode === "qr"
      ? ["qr"]
      : ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39", "itf", "qr"];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Retail Assistant</Text>
      <Text style={styles.subtitle}>Choose a scan mode to begin.</Text>

      <View style={styles.scanRow}>
        {["typed", "barcode", "qr", "image"].map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.scanBtn, mode === item && styles.scanBtnActive]}
            onPress={() => onSelectMode(item as typeof mode)}
          >
            <Text style={[styles.scanBtnText, mode === item && styles.scanBtnTextActive]}>
              {item.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === "typed" ? (
        <View style={styles.typedRow}>
          <TextInput
            value={typedText}
            onChangeText={setTypedText}
            placeholder="Ask for a product..."
            placeholderTextColor={tokens.colors.textSecondary}
            style={styles.input}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={onTypedSend}>
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {mode === "barcode" || mode === "qr" ? (
        <View style={styles.cameraWrap}>
          {permission?.granted ? (
            <CameraView
              style={styles.camera}
              barcodeScannerSettings={{ barcodeTypes }}
              onBarcodeScanned={(result) => {
                if (!scanning) return;
                setScanning(false);
                setLastScan(`${mode.toUpperCase()}: ${result.data}`);
              }}
            />
          ) : (
            <Text style={styles.cardText}>Camera permission required.</Text>
          )}
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Last Scan</Text>
        <Text style={styles.cardText}>{lastScan || "No scans yet."}</Text>
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
  scanRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  scanBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  scanBtnActive: {
    borderColor: tokens.colors.brandBlue,
    backgroundColor: "rgba(14, 165, 233, 0.15)",
  },
  scanBtnText: {
    color: tokens.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  scanBtnTextActive: {
    color: tokens.colors.brandBlue,
  },
  typedRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: tokens.colors.textPrimary,
    backgroundColor: tokens.colors.surface,
  },
  sendBtn: {
    backgroundColor: tokens.colors.brandBlue,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: "center",
  },
  sendBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  cameraWrap: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: 16,
  },
  camera: {
    width: "100%",
    height: 260,
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
