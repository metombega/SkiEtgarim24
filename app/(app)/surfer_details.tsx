import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { get, getDatabase, ref, update } from "firebase/database";
import { useLocalSearchParams } from 'expo-router';
import { Surfer } from '@/types/user';

const SurferDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [surfer, setSurfer] = useState<Surfer | null>(null);
  const [editedSurfer, setEditedSurfer] = useState<Surfer | null>(null);
  const [abilities, setAbilities] = useState<any>(null);
  const [editedAbilities, setEditedAbilities] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      const db = getDatabase();
      // Fetch surfer details
      const surferRef = ref(db, `users/surfers/${id}`);
      const snapshot = await get(surferRef);
      const data = snapshot.val();
      setSurfer(data);
      setEditedSurfer(data);

      // Fetch abilities from the sub-folder
      const abilitiesRef = ref(db, `users/surfers/${id}/abilities`);
      const abilitiesSnap = await get(abilitiesRef);
      const abilitiesData = abilitiesSnap.val();
      setAbilities(abilitiesData);
      setEditedAbilities(abilitiesData);
    };

    fetchData();
  }, [id]);

  if (!surfer || !editedSurfer) {
    return <Text>Loading...</Text>;
  }

  const handleSave = async () => {
    const db = getDatabase();
    const surferRef = ref(db, `users/surfers/${id}`);
    await update(surferRef, editedSurfer);
    
    // Update abilities in a single update call
    const abilitiesRef = ref(db, `users/surfers/${id}/abilities`);
    await update(abilitiesRef, editedAbilities);

    setSurfer(editedSurfer);
    setAbilities(editedAbilities);
    setEditing(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
          {/* New Fields */}
          <Text style={styles.label}>מידת ישיבה:</Text>
          <TextInput
            style={styles.input}
            value={editedSurfer.sittingSizeMessure?.toString()}
            keyboardType="numeric"
            onChangeText={(text) =>
              setEditedSurfer({ ...editedSurfer, sittingSizeMessure: Number(text) })
            }
          />
          <Text style={styles.label}>מיקום ישיבה:</Text>
          <TextInput
            style={styles.input}
            value={editedSurfer.sittingPosition?.toString()}
            keyboardType="numeric"
            onChangeText={(text) =>
              setEditedSurfer({ ...editedSurfer, sittingPosition: Number(text) })
            }
          />
          <Text style={styles.label}>מידת חגורת ציפה:</Text>
          <TextInput
            style={styles.input}
            value={editedSurfer.floatingBeltSize}
            onChangeText={(text) =>
              setEditedSurfer({ ...editedSurfer, floatingBeltSize: text })
            }
          />
          <Text style={styles.label}>שנת הצטרפות:</Text>
          <TextInput
            style={styles.input}
            value={editedSurfer.joinYear?.toString()}
            keyboardType="numeric"
            onChangeText={(text) =>
              setEditedSurfer({ ...editedSurfer, joinYear: Number(text) })
            }
          />
          <Text style={styles.label}>שנות ותק:</Text>
          <TextInput
            style={styles.input}
            value={editedSurfer.senioretyYears?.toString()}
            keyboardType="numeric"
            onChangeText={(text) =>
              setEditedSurfer({ ...editedSurfer, senioretyYears: Number(text) })
            }
          />
          <Text style={styles.label}>סוג חבל:</Text>
          <TextInput
            style={styles.input}
            value={editedSurfer.ropeType}
            onChangeText={(text) =>
              setEditedSurfer({ ...editedSurfer, ropeType: text })
            }
          />
          <Text style={styles.label}>מהירות גלישה:</Text>
          <TextInput
            style={styles.input}
            value={editedSurfer.surfingSpeed?.toString()}
            keyboardType="numeric"
            onChangeText={(text) =>
              setEditedSurfer({ ...editedSurfer, surfingSpeed: Number(text) })
            }
          />
          <Text style={styles.label}>ציוד מיוחד:</Text>
          <TextInput
            style={styles.input}
            value={editedSurfer.specialEquipment}
            onChangeText={(text) =>
              setEditedSurfer({ ...editedSurfer, specialEquipment: text })
            }
          />
          <View style={styles.switchRow}>
            <Text style={styles.label}>רתמה לכתף: </Text>
            <Switch
              value={editedSurfer.shoulderHarness}
              onValueChange={(val) =>
                setEditedSurfer({ ...editedSurfer, shoulderHarness: val })
              }
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.label}>שייט: </Text>
            <Switch
              value={editedSurfer.paddle}
              onValueChange={(val) =>
                setEditedSurfer({ ...editedSurfer, paddle: val })
              }
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.label}>צפצופים: </Text>
            <Switch
              value={editedSurfer.floats}
              onValueChange={(val) =>
                setEditedSurfer({ ...editedSurfer, floats: val })
              }
            />
          </View>
          {/* Abilities Editable Table */}
          <Text style={styles.label}>יכולות:</Text>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.headerCell]}>סוג</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>מוסמך</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>הערות</Text>
            </View>
            {editedAbilities && Object.keys(editedAbilities).map((abilityKey) => (
              <View key={abilityKey} style={styles.tableRow}>
                <Text style={styles.tableCell}>{editedAbilities[abilityKey].type}</Text>
                <View style={styles.tableCell}>
                  <Switch
                    value={editedAbilities[abilityKey].exists}
                    onValueChange={(val) =>
                      setEditedAbilities({
                        ...editedAbilities,
                        [abilityKey]: { ...editedAbilities[abilityKey], exists: val },
                      })
                    }
                  />
                </View>
                <View style={styles.tableCell}>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: "#ccc", padding: 5 }}
                    value={editedAbilities[abilityKey].comments}
                    onChangeText={(text) =>
                      setEditedAbilities({
                        ...editedAbilities,
                        [abilityKey]: { ...editedAbilities[abilityKey], comments: text },
                      })
                    }
                  />
                </View>
              </View>
            ))}
          </View>
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
          {/* New Fields */}
          <Text style={styles.label}>מידת ישיבה: {surfer.sittingSizeMessure}</Text>
          <Text style={styles.label}>מיקום ישיבה: {surfer.sittingPosition}</Text>
          <Text style={styles.label}>מידת חגורת ציפה: {surfer.floatingBeltSize}</Text>
          <Text style={styles.label}>שנת הצטרפות: {surfer.joinYear}</Text>
          <Text style={styles.label}>שנות ותק: {surfer.senioretyYears}</Text>
          <Text style={styles.label}>סוג חבל: {surfer.ropeType}</Text>
          <Text style={styles.label}>מהירות גלישה: {surfer.surfingSpeed}</Text>
          <Text style={styles.label}>ציוד מיוחד: {surfer.specialEquipment}</Text>
          <Text style={styles.label}>רתמה לכתף: {surfer.shoulderHarness ? 'כן' : 'לא'}</Text>
          <Text style={styles.label}>שייט: {surfer.paddle ? 'כן' : 'לא'}</Text>
          <Text style={styles.label}>מצופים: {surfer.floats ? 'כן' : 'לא'}</Text>
          <Text style={styles.label}>יכולות:</Text>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.headerCell]}>סוג</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>מוסמך</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>הערות</Text>
            </View>
            {abilities && Object.keys(abilities).map((abilityKey) => (
              <View key={abilityKey} style={styles.tableRow}>
                <Text style={styles.tableCell}>{abilities[abilityKey].type}</Text>
                <Text style={styles.tableCell}>{abilities[abilityKey].exists ? 'כן' : 'לא'}</Text>
                <Text style={styles.tableCell}>{abilities[abilityKey].comments}</Text>
              </View>
            ))}
          </View>
          <Button title="ערוך" onPress={() => setEditing(true)} />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    fontSize: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  switchRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 10,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row-reverse',
    backgroundColor: '#f0f0f0',
    paddingVertical: 5,
  },
  tableRowWrapper: {
    position: 'relative',
  },
  tableRow: {
    flexDirection: 'row-reverse',
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 5,
  },
  tableCell: {
    flexDirection: 'row-reverse',
    flex: 1,
    paddingHorizontal: 5,
    textAlign: 'right',
  },
  headerCell: {
    fontWeight: 'bold',
  },
  removeIcon: {
    position: 'absolute',
    right: -40, // adjust as needed
    top: '50%',
    transform: [{ translateY: -12 }],
  },
});

export default SurferDetails;