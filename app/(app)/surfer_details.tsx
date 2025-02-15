import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { get, getDatabase, ref, update } from "firebase/database";
import { useLocalSearchParams } from 'expo-router';
import { Surfer } from '@/types/user';
import Icon from 'react-native-vector-icons/FontAwesome';

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
    const db = getDatabase();
    const surferRef = ref(db, `users/surfers/${id}`);
    await update(surferRef, editedSurfer);
    setSurfer(editedSurfer);
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
          <Text style={styles.label}>יכולות:</Text>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.headerCell]}>סוג</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>הערות</Text>
              <Text style={[styles.tableCell, styles.headerCell]}></Text>
            </View>
            {editedSurfer.abilities && editedSurfer.abilities.map((ability, index) => (
              <View key={index} style={styles.tableRowWrapper}>
                <View style={styles.tableRow}>
                  <TextInput
                    style={styles.tableCell}
                    value={ability.type}
                    placeholder="סוג"
                    onChangeText={(text) => {
                      const newAbilities = [...editedSurfer.abilities];
                      newAbilities[index] = { ...newAbilities[index], type: text };
                      setEditedSurfer({ ...editedSurfer, abilities: newAbilities });
                    }}
                  />
                  <TextInput
                    style={styles.tableCell}
                    value={ability.comments}
                    placeholder="הערות"
                    onChangeText={(text) => {
                      const newAbilities = [...editedSurfer.abilities];
                      newAbilities[index] = { ...newAbilities[index], comments: text };
                      setEditedSurfer({ ...editedSurfer, abilities: newAbilities });
                    }}
                  />
                </View>
                  <TouchableOpacity onPress={() => {
                    const newAbilities = editedSurfer.abilities.filter((_, i) => i !== index);
                    setEditedSurfer({ ...editedSurfer, abilities: newAbilities });
                  }}>
                  <Icon name="trash" size={20} color="red" />
                  </TouchableOpacity>
              </View>
            ))}
            <Button
              title="Add Ability"
              onPress={() => {
                const newAbility = { type: '', exists: false, comments: '' };
                setEditedSurfer({
                  ...editedSurfer,
                  abilities: editedSurfer.abilities ? [...editedSurfer.abilities, newAbility] : [newAbility],
                });
              }}
            />
          </View>
          <Text style={styles.label}>ציוד מיוחד:</Text>
          <TextInput
            style={styles.input}
            value={editedSurfer.specialEquipment}
            onChangeText={(text) =>
              setEditedSurfer({ ...editedSurfer, specialEquipment: text })
            }
          />
          <View style={styles.switchRow}>
            <Text style={styles.label}>רתמה לכתף:</Text>
            <Switch
              value={editedSurfer.shoulderHarness}
              onValueChange={(val) =>
                setEditedSurfer({ ...editedSurfer, shoulderHarness: val })
              }
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.label}>שייט:</Text>
            <Switch
              value={editedSurfer.paddle}
              onValueChange={(val) =>
                setEditedSurfer({ ...editedSurfer, paddle: val })
              }
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.label}>צפצופים (floats):</Text>
            <Switch
              value={editedSurfer.floats}
              onValueChange={(val) =>
                setEditedSurfer({ ...editedSurfer, floats: val })
              }
            />
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
          <Text style={styles.label}>יכולות: {surfer.abilities ? surfer.abilities.join(', ') : ''}</Text>
          <Text style={styles.label}>ציוד מיוחד: {surfer.specialEquipment}</Text>
          <Text style={styles.label}>רתמה לכתף: {surfer.shoulderHarness ? 'כן' : 'לא'}</Text>
          <Text style={styles.label}>שייט: {surfer.paddle ? 'כן' : 'לא'}</Text>
          <Text style={styles.label}>מצופים: {surfer.floats ? 'כן' : 'לא'}</Text>
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 5,
  },
  tableRowWrapper: {
    position: 'relative',
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 5,
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 5,
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