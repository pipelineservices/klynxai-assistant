import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, Button, ScrollView } from "react-native";

const API = "http://34.205.58.174:8010"; // change if needed

export default function App() {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<{ role: string; content: string }[]>([]);

  const send = async () => {
    const userMsg = { role: "user", content: input };
    const next = [...msgs, userMsg];
    setMsgs(next);
    setInput("");

    const r = await fetch(`${API}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: "mock", messages: next }),
    });
    const data = await r.json();
    setMsgs([...next, { role: "assistant", content: data.reply || "(no reply)" }]);
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>KLYNX Mobile</Text>
      <ScrollView style={{ flex: 1, marginVertical: 12 }}>
        {msgs.map((m, i) => (
          <View key={i} style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: "700" }}>{m.role}</Text>
            <Text>{m.content}</Text>
          </View>
        ))}
      </ScrollView>

      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Ask..."
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8 }}
      />
      <View style={{ height: 10 }} />
      <Button title="Send" onPress={send} />
    </SafeAreaView>
  );
}
