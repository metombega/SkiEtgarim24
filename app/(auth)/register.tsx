import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { Colors } from '../config/constants/constants';
import { getDatabase, ref, set } from 'firebase/database';

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setfullName] = useState("");

  const addUserToDatabase = async () => {
    const db = getDatabase();
    if (auth.currentUser) {
      const userRef = ref(db, 'users/' + fullName);
      await set(userRef, { email });
    } else {
      Alert.alert("Error", "User is not authenticated");
    }
  }

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "סיסמאות אינן תואמות");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      router.replace("/(app)");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
    addUserToDatabase();
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>צור משתמש חדש</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="שם מלא"
            value={fullName}
            onChangeText={setfullName}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="אימייל"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="סיסמה חדשה"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="אימות סיסמה"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>הרשם</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>נרשמת כבר? </Text>
          <TouchableOpacity onPress={() => router.push("/login" as any)}>
            <Text style={styles.loginLink}>התחבר</Text>
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
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row-reverse",
    width: "100%",
  },
  registerButton: {
    width: "100%",
    height: 50,
    backgroundColor: Colors.light_blue,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  registerButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row-reverse",
    marginTop: 20,
  },
  loginText: {
    color: Colors.black,
  },
  loginLink: {
    color: Colors.dark_orange,
    fontWeight: "bold",
  },
});
