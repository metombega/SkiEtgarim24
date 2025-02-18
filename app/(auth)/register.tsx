import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  //@ts-ignore
  CheckBox,
  //@ts-ignore
  Picker,
} from "react-native";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { Colors } from "../config/constants/constants";
import { getDatabase, ref, set } from "firebase/database";
import { surferAbilitiesTypes, twoSkiesAbilitiesTypes, kenSkiAbilitiesTypes, volunteerAbilitiesTypes, volunteerCertificationsTypes } from "../../types/user";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emeregencyContactPhoneNumber, setemEregencyContactPhoneNumber] =
    useState("");
  const [emeregencyContactName, setemEregencyContactName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [sex, setSex] = useState("");
  const [isSurfer, setIsSurfer] = useState(false);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const addUserToDatabase = async () => {
    const db = getDatabase();
    if (auth.currentUser) {
      if (isSurfer) {
        const surferRef = ref(db, "users/surfers/" + fullName);
        await set(surferRef, {
          email,
          fullName,
          phoneNumber,
          emeregencyContactPhoneNumber,
          emeregencyContactName,
          age,
          height,
          sex,
          isSurfer,
          isTeamMember,
          // Additional fields from Surfer (and ApprovedUser) with default values
          sittingSizeMessure: 0,
          sittingPosition: 0,
          floatingBeltSize: "",
          joinYear: 0,
          senioretyYears: 0,
          ropeType: "",
          surfingSpeed: 0,
          specialEquipment: "",
          shoulderHarness: false,
          paddle: false,
          floats: false,
        });

        // Create a sub-folder for each surfer ability type with default values
        for (const abilityType of surferAbilitiesTypes) {
          const abilityRef = ref(db, "users/surfers/" + fullName + "/abilities/" + abilityType);
          await set(abilityRef, {
            type: abilityType,
            exists: false,
            comments: "",
          });
        }

        // Create a sub-folder for each two skies ability type with default values
        for (const abilityType of twoSkiesAbilitiesTypes) {
          const abilityRef = ref(db, "users/surfers/" + fullName + "/twoSkiesAbilities/" + abilityType);
          await set(abilityRef, {
            type: abilityType,
            exists: false,
            comments: "",
          });
        }

        // Create a sub-folder for each ken ski ability type with default values
        for (const abilityType of kenSkiAbilitiesTypes) {
          const abilityRef = ref(db, "users/surfers/" + fullName + "/kenSkiAbilities/" + abilityType);
          await set(abilityRef, {
            type: abilityType,
            exists: false,
            comments: "",
          });
        }
      }
      if (isTeamMember) {
        const teamMemberRef = ref(db, "users/ski-team/" + fullName);
        await set(teamMemberRef, {
          email,
          fullName,
          phoneNumber,
          emeregencyContactPhoneNumber,
          emeregencyContactName,
          age,
          height,
          sex,
          isSurfer,
          isTeamMember,
          // Additional fields from Volunteer (extends ApprovedUser) with default values
          sittingSizeMessure: 0,
          sittingPosition: 0,
          floatingBeltSize: "",
          joinYear: 0,
          senioretyYears: 0,
          certifications: [],
        });
        // Create a sub-folder for each volunteer ability type with default values
        for (const abilityType of volunteerAbilitiesTypes) {
          const abilityRef = ref(db, "users/ski-team/" + fullName + "/abilities/" + abilityType);
          await set(abilityRef, {
            type: abilityType,
            rank: 0,
            comments: ""
          });
        }
        // Create a sub-folder for each volunteer ability type with default values
        for (const certificationType of volunteerCertificationsTypes) {
          const certificationRef = ref(db, "users/ski-team/" + fullName + "/certifications/" + certificationType);
          await set(certificationRef, {
            type: certificationType,
            exists: false,
            comments: ""
          });
        }
      }
    } else {
      setErrorMessage("User is not authenticated");
    }
  };

  const validateFields = () => {
    if (!isSurfer && !isTeamMember) {
      setErrorMessage("נא לבחור לפחות אחת מהאפשרויות: גולש או צוותסקי");
      return false;
    }
    if (!fullName.trim()) {
      setErrorMessage("נא להזין שם מלא");
      return false;
    }
    if (!phoneNumber.trim()) {
      setErrorMessage("נא להזין מספר טלפון");
      return false;
    }
    if (!/^\d+$/.test(phoneNumber)) {
      setErrorMessage("מספר טלפון לא תקין");
      return false;
    }
    if (!emeregencyContactName.trim()) {
      setErrorMessage("נא להזין שם איש קשר לחירום");
      return false;
    }
    if (!emeregencyContactPhoneNumber.trim()) {
      setErrorMessage("נא להזין מספר טלפון לאיש קשר לחירום");
      return false;
    }
    if (!/^\d+$/.test(emeregencyContactPhoneNumber)) {
      setErrorMessage("מספר טלפון איש קשר לחירום לא תקין");
      return false;
    }
    if (!age.trim()) {
      setErrorMessage("נא להזין גיל");
      return false;
    }
    if (!/^\d+$/.test(age)) {
      setErrorMessage("גיל חייב להיות מספר");
      return false;
    }
    if (!height.trim()) {
      setErrorMessage("נא להזין גובה");
      return false;
    }
    if (!/^\d+$/.test(height)) {
      setErrorMessage("גובה חייב להיות מספר");
      return false;
    }
    if (!sex.trim()) {
      setErrorMessage("נא לבחור מין");
      return false;
    }
    if (!email.trim()) {
      setErrorMessage("נא להזין אימייל");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("כתובת אימייל לא תקינה");
      return false;
    }
    if (!password) {
      setErrorMessage("נא להזין סיסמה");
      return false;
    }
    if (password.length < 6) {
      setErrorMessage("הסיסמה חייבת להכיל לפחות 6 תווים");
      return false;
    }
    if (!confirmPassword) {
      setErrorMessage("נא להזין אימות סיסמה");
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage("סיסמאות אינן תואמות");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handleRegister = async () => {
    if (!validateFields()) {
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await addUserToDatabase();
      router.replace("/(app)");
    } catch (error: any) {
      setErrorMessage(error.message || "הרשמה נכשלה. אנא נסה שוב.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>צור משתמש חדש</Text>

        <View style={styles.inputContainer}>
          <View style={styles.checkboxContainer}>
            <CheckBox value={isSurfer} onValueChange={setIsSurfer} />
            <Text style={styles.checkboxLabel}>הרשם כגולש</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.checkboxContainer}>
            <CheckBox value={isTeamMember} onValueChange={setIsTeamMember} />
            <Text style={styles.checkboxLabel}>הרשם כצוותסקי</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="שם מלא"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="מספר טלפון"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="שם איש קשר לחירום"
            value={emeregencyContactName}
            onChangeText={setemEregencyContactName}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="מספר טלפון איש קשר לחירום"
            value={emeregencyContactPhoneNumber}
            onChangeText={setemEregencyContactPhoneNumber}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="גיל"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="גובה בסנטימטרים"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Picker
            selectedValue={sex}
            style={styles.picker}
            onValueChange={(itemValue: string) => setSex(itemValue)}
          >
            <Picker.Item label="מין" value="" />
            <Picker.Item label="זכר" value="זכר" />
            <Picker.Item label="נקבה" value="נקבה" />
          </Picker>
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

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
        >
          <Text style={styles.registerButtonText}>הרשם</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>נרשמת כבר? </Text>
          <TouchableOpacity onPress={() => router.push("/login" as any)}>
            <Text style={styles.loginLink}>התחבר</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  checkboxContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 15,
  },
  checkboxLabel: {
    marginLeft: 8,
    marginRight: 8,
    color: Colors.black,
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
  errorText: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
  },
  picker: {
    height: 50,
    width: "100%",
    marginBottom: 15,
    backgroundColor: Colors.background,
    textAlign: "right",
    fontSize: 14,
  },
});
