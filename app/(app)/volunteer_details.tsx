import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { get, getDatabase, ref, update } from "firebase/database";
import { useLocalSearchParams } from 'expo-router';
import { Volunteer } from '@/types/user';

const VolunteerDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [editedVolunteer, setEditedVolunteer] = useState<Volunteer | null>(null);
  const [abilities, setAbilities] = useState<any>(null);
  const [editedAbilities, setEditedAbilities] = useState<any>(null);
  const [certifications, setCertifications] = useState<any>(null);
  const [editedCertifications, setEditedCertifications] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      const db = getDatabase();
      // Fetch volunteer details
      const volunteerRef = ref(db, `users/ski-team/${id}`);
      const snapshot = await get(volunteerRef);
      const data = snapshot.val();
      setVolunteer(data);
      setEditedVolunteer(data);

      // Fetch abilities from the sub-folder
      const abilitiesRef = ref(db, `users/ski-team/${id}/abilities`);
      const abilitiesSnap = await get(abilitiesRef);
      const abilitiesData = abilitiesSnap.val();
      setAbilities(abilitiesData);
      setEditedAbilities(abilitiesData);

        // Fetch certifications from the sub-folder
        const certificationsRef = ref(db, `users/ski-team/${id}/certifications`);
        const certificationsSnap = await get(certificationsRef);
        const certificationsData = certificationsSnap.val();
        setCertifications(certificationsData);
        setEditedCertifications(certificationsData);
    };

    fetchData();
  }, [id]);

  if (!volunteer || !editedVolunteer) {
    return <Text>Loading...</Text>;
  }

  const handleSave = async () => {
    const db = getDatabase();
    const volunteerRef = ref(db, `users/ski-team/${id}`);
    await update(volunteerRef, editedVolunteer);
    
    // Update abilities in a single update call
    const abilitiesRef = ref(db, `users/ski-team/${id}/abilities`);
    await update(abilitiesRef, editedAbilities);

    // Update certifications in a single update call
    const certificationsRef = ref(db, `users/ski-team/${id}/certifications`);
    await update(certificationsRef, editedCertifications);

    setVolunteer(editedVolunteer);
    setAbilities(editedAbilities);
    setCertifications(editedCertifications);
    setEditing(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {editing ? (
        <>
          <Text style={styles.label}>גיל:</Text>
          <TextInput
            style={styles.input}
            value={editedVolunteer.age?.toString()}
            keyboardType="numeric"
            onChangeText={(text) =>
              setEditedVolunteer({ ...editedVolunteer, age: Number(text) })
            }
          />
          <Text style={styles.label}>אימייל:</Text>
          <TextInput
            style={styles.input}
            value={editedVolunteer.email}
            onChangeText={(text) =>
              setEditedVolunteer({ ...editedVolunteer, email: text })
            }
          />
          <Text style={styles.label}>טלפון:</Text>
          <TextInput
            style={styles.input}
            value={editedVolunteer.phoneNumber}
            keyboardType="phone-pad"
            onChangeText={(text) =>
              setEditedVolunteer({ ...editedVolunteer, phoneNumber: text })
            }
          />
          <Text style={styles.label}>שם מלא:</Text>
          <TextInput
            style={styles.input}
            value={editedVolunteer.fullName}
            onChangeText={(text) =>
              setEditedVolunteer({ ...editedVolunteer, fullName: text })
            }
          />
          <Text style={styles.label}>גובה:</Text>
          <TextInput
            style={styles.input}
            value={editedVolunteer.height?.toString()}
            keyboardType="numeric"
            onChangeText={(text) =>
              setEditedVolunteer({ ...editedVolunteer, height: Number(text) })
            }
          />
          <Text style={styles.label}>מין:</Text>
          <TextInput
            style={styles.input}
            value={editedVolunteer.sex}
            onChangeText={(text) =>
              setEditedVolunteer({ ...editedVolunteer, sex: text })
            }
          />
          <Text style={styles.label}>איש קשר בחירום:</Text>
          <TextInput
            style={styles.input}
            value={editedVolunteer.emeregencyContactName}
            onChangeText={(text) =>
              setEditedVolunteer({ ...editedVolunteer, emeregencyContactName: text })
            }
          />
          <Text style={styles.label}>טלפון איש קשר בחירום:</Text>
          <TextInput
            style={styles.input}
            value={editedVolunteer.emeregencyContactPhoneNumber}
            keyboardType="phone-pad"
            onChangeText={(text) =>
              setEditedVolunteer({ ...editedVolunteer, emeregencyContactPhoneNumber: text })
            }
          />
          {/* New Fields */}
          <Text style={styles.label}>מידת ישיבה:</Text>
          <TextInput
            style={styles.input}
            value={editedVolunteer.sittingSizeMessure?.toString()}
            keyboardType="numeric"
            onChangeText={(text) =>
              setEditedVolunteer({ ...editedVolunteer, sittingSizeMessure: Number(text) })
            }
          />
          <Text style={styles.label}>מיקום ישיבה:</Text>
          <TextInput
            style={styles.input}
            value={editedVolunteer.sittingPosition?.toString()}
            keyboardType="numeric"
            onChangeText={(text) =>
              setEditedVolunteer({ ...editedVolunteer, sittingPosition: Number(text) })
            }
          />
          <Text style={styles.label}>מידת חגורת ציפה:</Text>
          <TextInput
            style={styles.input}
            value={editedVolunteer.floatingBeltSize}
            onChangeText={(text) =>
              setEditedVolunteer({ ...editedVolunteer, floatingBeltSize: text })
            }
          />
          <Text style={styles.label}>שנת הצטרפות:</Text>
          <TextInput
            style={styles.input}
            value={editedVolunteer.joinYear?.toString()}
            keyboardType="numeric"
            onChangeText={(text) =>
              setEditedVolunteer({ ...editedVolunteer, joinYear: Number(text) })
            }
          />
          <Text style={styles.label}>שנות ותק:</Text>
          <TextInput
            style={styles.input}
            value={editedVolunteer.senioretyYears?.toString()}
            keyboardType="numeric"
            onChangeText={(text) =>
              setEditedVolunteer({ ...editedVolunteer, senioretyYears: Number(text) })
            }
          />
          {/* Abilities Editable Table */}
          <Text style={styles.label}>יכולות:</Text>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.headerCell]}>סוג</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>דירוג</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>הערות</Text>
            </View>
            {editedAbilities && Object.keys(editedAbilities).map((abilityKey) => (
              <View key={abilityKey} style={styles.tableRow}>
                <Text style={styles.tableCell}>{editedAbilities[abilityKey].type}</Text>
                <View style={styles.tableCell}>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: "#ccc", padding: 5, textAlign: 'right'}}
                    value={editedAbilities[abilityKey].rank?.toString()}
                    keyboardType="numeric"
                    onChangeText={(text) =>
                      setEditedAbilities({
                        ...editedAbilities,
                        [abilityKey]: { ...editedAbilities[abilityKey], rank: Number(text) },
                      })
                    }
                  />
                </View>
                <View style={styles.tableCell}>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: "#ccc", padding: 5, textAlign: 'right'}}
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
          {/* Certifications Editable Table */}
          <Text style={styles.label}>יכולות:</Text>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.headerCell]}>סוג</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>מוסמך</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>הערות</Text>
            </View>
            {editedCertifications && Object.keys(editedCertifications).map((certificationKey) => (
              <View key={certificationKey} style={styles.tableRow}>
                <Text style={styles.tableCell}>{editedCertifications[certificationKey].type}</Text>
                <View style={styles.tableCell}>
                  <Switch
                    value={editedCertifications[certificationKey].exists}
                    onValueChange={(val) =>
                      setEditedCertifications({
                        ...editedCertifications,
                        [certificationKey]: { ...editedCertifications[certificationKey], exists: val },
                      })
                    }
                  />
                </View>
                <View style={styles.tableCell}>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: "#ccc", padding: 5, textAlign: 'right'}}
                    value={editedCertifications[certificationKey].comments}
                    onChangeText={(text) =>
                      setEditedCertifications({
                        ...editedCertifications,
                        [certificationKey]: { ...editedCertifications[certificationKey], comments: text },
                      })
                    }
                  />
                </View>
              </View>
            ))}
          </View>
          <View style={styles.buttonRow}>
            <Button title="ביטול" onPress={() => {
              setEditedVolunteer(volunteer);
              setEditing(false);
            }} />
            <Button title="שמור" onPress={handleSave} />
          </View>
        </>
      ) : (
        <>
          <Text style={styles.label}>גיל: {volunteer.age}</Text>
          <Text style={styles.label}>אימייל: {volunteer.email}</Text>
          <Text style={styles.label}>טלפון: {volunteer.phoneNumber}</Text>
          <Text style={styles.label}>שם מלא: {volunteer.fullName}</Text>
          <Text style={styles.label}>גובה: {volunteer.height}</Text>
          <Text style={styles.label}>מין: {volunteer.sex}</Text>
          <Text style={styles.label}>איש קשר בחירום: {volunteer.emeregencyContactName}</Text>
          <Text style={styles.label}>טלפון איש קשר בחירום: {volunteer.emeregencyContactPhoneNumber}</Text>
          {/* New Fields */}
          <Text style={styles.label}>מידת ישיבה: {volunteer.sittingSizeMessure}</Text>
          <Text style={styles.label}>מיקום ישיבה: {volunteer.sittingPosition}</Text>
          <Text style={styles.label}>מידת חגורת ציפה: {volunteer.floatingBeltSize}</Text>
          <Text style={styles.label}>שנת הצטרפות: {volunteer.joinYear}</Text>
          <Text style={styles.label}>שנות ותק: {volunteer.senioretyYears}</Text>
          <Text style={styles.label}>יכולות:</Text>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.headerCell]}>סוג</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>דירוג</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>הערות</Text>
            </View>
            {abilities && Object.keys(abilities).map((abilityKey) => (
              <View key={abilityKey} style={styles.tableRow}>
                <Text style={styles.tableCell}>{abilities[abilityKey].type}</Text>
                <Text style={styles.tableCell}>{abilities[abilityKey].rank}</Text>
                <Text style={styles.tableCell}>{abilities[abilityKey].comments}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.label}>הסמכות:</Text>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.headerCell]}>סוג</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>מוסמך</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>הערות</Text>
            </View>
            {certifications && Object.keys(certifications).map((certificationKey) => (
              <View key={certificationKey} style={styles.tableRow}>
                <Text style={styles.tableCell}>{certifications[certificationKey].type}</Text>
                <Text style={styles.tableCell}>{certifications[certificationKey].exists ? 'כן' : 'לא'}</Text>
                <Text style={styles.tableCell}>{certifications[certificationKey].comments}</Text>
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

export default VolunteerDetails;