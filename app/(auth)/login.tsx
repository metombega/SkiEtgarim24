import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Link, router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { Colors } from "@/app/config/constants/constants";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); 

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      router.replace("/(app)");
    } catch (error: any) {
      console.error("4444444444444444444444:", error.code);
      switch (error.code) {
        case "auth/invalid-credential":
          setErrorMessage("שם המשתמש או הסיסמה שגויים.");
          break;
        default:
          setErrorMessage("התחברות נכשלה. אנא נסה שוב.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>ברוך הבא!</Text>

        <TextInput
          style={[styles.input, styles.textBox]}
          placeholder="אימייל"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={[styles.input, styles.textBox]}
          placeholder="סיסמה"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>התחבר</Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>אין לך חשבון? </Text>
          <TouchableOpacity onPress={() => router.push("/register" as any)}>
            <Text style={styles.registerLink}>הרשם</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: Colors.dark_blue,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: Colors.background,
  },
  loginButton: {
    width: "100%",
    height: 50,
    backgroundColor: Colors.light_blue,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row-reverse",
    marginTop: 20,
  },
  registerText: {
    color: Colors.brown,
  },
  registerLink: {
    color: Colors.dark_orange,
    fontWeight: "bold",
  },
  textBox: {
    textAlign: "right",
  },
  errorText: {
    color: "red",
    marginBottom: 15,
  },
});
