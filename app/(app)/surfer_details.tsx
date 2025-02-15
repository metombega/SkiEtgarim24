import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput } from 'react-native';
import { get, getDatabase, ref, update } from "firebase/database";
import { useLocalSearchParams } from 'expo-router';
import { Surfer } from '@/types/user';

const SurferDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [surfer, setSurfer] = useState<Surfer | null>(null);
  const [editedSurfer, setEditedSurfer] = useState<Surfer | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchSurfer = async () => {
      const db = getDatabase();
      const surferRef = ref(db, `users/surfers/${id}`);
      const snapshot = await get(surferRef);
      const data = snapshot.val();
      setSurfer(data);
      setEditedSurfer(data);
    };

    fetchSurfer();
  }, [id]);

  if (!surfer || !editedSurfer) {
    return <Text>Loading...</Text>;
  }

  const handleSave = async () => {
    // update the database with editedSurfer changes
    const db = getDatabase();
    const surferRef = ref(db, `users/surfers/${id}`);
    await update(surferRef, editedSurfer);
    setSurfer(editedSurfer);
    setEditing(false);
  };

  return (
    <View style={styles.container}>
      {editing ? (
        <>
          <Text style={styles.label}>גיל:</Text>
          <TextInput
            style={styles.input}
            value={editedSurfer.age?.toString()}
            keyboardType="numeric"
            onChangeText={(text) =>
              setEditedSurfer({ ...editedSurfer, age: Number(text) })
            }
          />
          <Text style={styles.label}>אימייל:</Text>
          <TextInput
            style={styles.input}
            value={editedSurfer.email}
            onChangeText={(text) =>
              setEditedSurfer({ ...editedSurfer, email: text })
            }
          />
          <Text style={styles.label}>טלפון:</Text>
          <TextInput
            style={styles.input}
            value={editedSurfer.phoneNumber}
            keyboardType="phone-pad"
            onChangeText={(text) =>
              setEditedSurfer({ ...editedSurfer, phoneNumber: text })
            }
          />
          <Text style={styles.label}>שם מלא:</Text>
          <TextInput
            style={styles.input}
            value={editedSurfer.fullName}
            onChangeText={(text) =>
              setEditedSurfer({ ...editedSurfer, fullName: text })
            }
          />
          <Text style={styles.label}>גובה:</Text>
          <TextInput
            style={styles.input}
            value={editedSurfer.height?.toString()}
            keyboardType="numeric"
            onChangeText={(text) =>
              setEditedSurfer({ ...editedSurfer, height: Number(text) })
            }
          />
          <Text style={styles.label}>מין:</Text>
          <TextInput
            style={styles.input}
            value={editedSurfer.sex}
            onChangeText={(text) =>
              setEditedSurfer({ ...editedSurfer, sex: text })
            }
          />
          <Text style={styles.label}>איש קשר בחירום:</Text>
          <TextInput
            style={styles.input}
            value={editedSurfer.emeregencyContactName}
            onChangeText={(text) =>
              setEditedSurfer({ ...editedSurfer, emeregencyContactName: text })
            }
          />
          <Text style={styles.label}>טלפון איש קשר בחירום:</Text>
          <TextInput
            style={styles.input}
            value={editedSurfer.emeregencyContactPhoneNumber}
            keyboardType="phone-pad"
            onChangeText={(text) =>
              setEditedSurfer({ ...editedSurfer, emeregencyContactPhoneNumber: text })
            }
          />
          <View style={styles.buttonRow}>
            <Button title="ביטול" onPress={() => {
              setEditedSurfer(surfer);
              setEditing(false);
            }} />
            <Button title="שמור" onPress={handleSave} />
          </View>
        </>
      ) : (
        <>
          <Text style={styles.label}>גיל: {surfer.age}</Text>
          <Text style={styles.label}>אימייל: {surfer.email}</Text>
          <Text style={styles.label}>טלפון: {surfer.phoneNumber}</Text>
          <Text style={styles.label}>שם מלא: {surfer.fullName}</Text>
          <Text style={styles.label}>גובה: {surfer.height}</Text>
          <Text style={styles.label}>מין: {surfer.sex}</Text>
          <Text style={styles.label}>איש קשר בחירום: {surfer.emeregencyContactName}</Text>
          <Text style={styles.label}>טלפון איש קשר בחירום: {surfer.emeregencyContactPhoneNumber}</Text>
          <Button title="ערוך" onPress={() => setEditing(true)} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
  },
  input: {
    fontSize: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default SurferDetails;