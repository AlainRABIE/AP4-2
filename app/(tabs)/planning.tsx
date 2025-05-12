"use client";

import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated
} from 'react-native';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebase/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function PlanningScreen() {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSaveButtonVisible, setSaveButtonVisible] = useState(false);
  const [saveButtonOpacity] = useState(new Animated.Value(0));
  const [hasChanges, setHasChanges] = useState(false);
  
  const STATUS = {
    UNDEFINED: 0,
    AVAILABLE: 1,
    BUSY: 2
  };

  useEffect(() => {
    if (hasChanges) {
      setSaveButtonVisible(true);
      Animated.timing(saveButtonOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    } else {
      Animated.timing(saveButtonOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start(() => {
        setSaveButtonVisible(false);
      });
    }
  }, [hasChanges]);

  const getDatesForSelectedWeek = () => {
    const dates = [];
    const today = new Date();
    const dayOfWeek = today.getDay(); 
    const startDate = new Date(today);
    
    startDate.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); 
    startDate.setDate(startDate.getDate() + (currentWeekOffset * 7));

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour}:00`);
    }
    return slots;
  };

  const dates = getDatesForSelectedWeek();
  const timeSlots = getTimeSlots();
  
  const [availability, setAvailability] = useState(() => {
    return timeSlots.map(() => Array(7).fill(STATUS.UNDEFINED));
  });
  
  const [originalAvailability, setOriginalAvailability] = useState(() => {
    return timeSlots.map(() => Array(7).fill(STATUS.UNDEFINED));
  });

  const toggleStatus = (timeIndex: number, dateIndex: number) => {
    const newAvailability = [...availability];
    const currentStatus = newAvailability[timeIndex][dateIndex];
    const nextStatus = (currentStatus + 1) % 3;
    newAvailability[timeIndex][dateIndex] = nextStatus;
    setAvailability(newAvailability);
    
    checkForChanges(newAvailability);
  };

  const checkForChanges = (newAvailability: any[][]) => {
    for (let i = 0; i < timeSlots.length; i++) {
      for (let j = 0; j < 7; j++) {
        if (newAvailability[i][j] !== originalAvailability[i][j]) {
          setHasChanges(true);
          return;
        }
      }
    }
    setHasChanges(false);
  };

  const goToPreviousWeek = () => {
    if (hasChanges) {
      Alert.alert(
        "Modifications non enregistrées",
        "Vous avez des modifications non enregistrées. Voulez-vous les enregistrer avant de changer de semaine ?",
        [
          { 
            text: "Annuler", 
            style: "cancel" 
          },
          {
            text: "Ignorer",
            onPress: () => {
              setCurrentWeekOffset(currentWeekOffset - 1);
              setHasChanges(false);
            }
          },
          { 
            text: "Enregistrer", 
            onPress: () => {
              saveAvailability().then(() => {
                setCurrentWeekOffset(currentWeekOffset - 1);
              });
            } 
          }
        ]
      );
    } else {
      setCurrentWeekOffset(currentWeekOffset - 1);
    }
  };

  const goToNextWeek = () => {
    if (hasChanges) {
      Alert.alert(
        "Modifications non enregistrées",
        "Vous avez des modifications non enregistrées. Voulez-vous les enregistrer avant de changer de semaine ?",
        [
          { 
            text: "Annuler", 
            style: "cancel" 
          },
          {
            text: "Ignorer",
            onPress: () => {
              setCurrentWeekOffset(currentWeekOffset + 1);
              setHasChanges(false);
            }
          },
          { 
            text: "Enregistrer", 
            onPress: () => {
              saveAvailability().then(() => {
                setCurrentWeekOffset(currentWeekOffset + 1);
              });
            } 
          }
        ]
      );
    } else {
      setCurrentWeekOffset(currentWeekOffset + 1);
    }
  };

  const goToCurrentWeek = () => {
    if (hasChanges && currentWeekOffset !== 0) {
      Alert.alert(
        "Modifications non enregistrées",
        "Vous avez des modifications non enregistrées. Voulez-vous les enregistrer avant de changer de semaine ?",
        [
          { 
            text: "Annuler", 
            style: "cancel" 
          },
          {
            text: "Ignorer",
            onPress: () => {
              setCurrentWeekOffset(0);
              setHasChanges(false);
            }
          },
          { 
            text: "Enregistrer", 
            onPress: () => {
              saveAvailability().then(() => {
                setCurrentWeekOffset(0);
              });
            } 
          }
        ]
      );
    } else {
      setCurrentWeekOffset(0);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const loadAvailabilities = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert('Erreur', 'Vous devez être connecté pour accéder à vos disponibilités');
        return;
      }

      const newAvailability = timeSlots.map(() => Array(7).fill(STATUS.UNDEFINED));

      for (let dateIndex = 0; dateIndex < dates.length; dateIndex++) {
        const currentDate = dates[dateIndex];
        const cleanDate = new Date(currentDate);
        cleanDate.setHours(0, 0, 0, 0);
        
        for (let timeIndex = 0; timeIndex < timeSlots.length; timeIndex++) {
          const timeSlot = timeSlots[timeIndex];
          
          const slotDateTime = new Date(currentDate);
          const [hours, minutes] = timeSlot.split(':');
          slotDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10) || 0, 0, 0);
          
          const docId = `${user.uid}_${cleanDate.toISOString().split('T')[0]}_${timeSlot}`;
          
          try {
            const docRef = doc(db, 'disponibilite', docId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.dispo === 1) {
                newAvailability[timeIndex][dateIndex] = STATUS.AVAILABLE;
              } else if (data.dispo === 0) {
                newAvailability[timeIndex][dateIndex] = STATUS.BUSY;
              }
            }
          } catch (err) {
            console.error(`Erreur lors de la récupération du document ${docId}:`, err);
          }
        }
      }
      
      setAvailability(newAvailability);
      setOriginalAvailability(JSON.parse(JSON.stringify(newAvailability)));
      setHasChanges(false);
      
    } catch (error) {
      console.error('Erreur lors du chargement des disponibilités:', error);
      Alert.alert('Erreur', 'Impossible de charger les disponibilités');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailabilities();
  }, [currentWeekOffset]);

  const saveAvailability = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert('Erreur', 'Vous devez être connecté pour enregistrer vos disponibilités');
        return;
      }

      for (let dateIndex = 0; dateIndex < dates.length; dateIndex++) {
        const currentDate = dates[dateIndex];
        const cleanDate = new Date(currentDate);
        cleanDate.setHours(0, 0, 0, 0);
        
        for (let timeIndex = 0; timeIndex < timeSlots.length; timeIndex++) {
          const timeSlot = timeSlots[timeIndex];
          const status = availability[timeIndex][dateIndex];
          
          const slotDateTime = new Date(currentDate);
          const [hours, minutes] = timeSlot.split(':');
          slotDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10) || 0, 0, 0);
          
          const docId = `${user.uid}_${cleanDate.toISOString().split('T')[0]}_${timeSlot}`;
          
          if (status === STATUS.AVAILABLE) {
            await setDoc(doc(db, 'disponibilite', docId), {
              coach: doc(db, 'utilisateurs', user.uid),
              dates: Timestamp.fromDate(slotDateTime),
              dispo: 1 
            });
          } else if (status === STATUS.BUSY) {
            await setDoc(doc(db, 'disponibilite', docId), {
              coach: doc(db, 'utilisateurs', user.uid),
              dates: Timestamp.fromDate(slotDateTime),
              dispo: 0  
            });
          } else {
            try {
              const existingDoc = await getDoc(doc(db, 'disponibilite', docId));
              if (existingDoc.exists()) {
                await setDoc(doc(db, 'disponibilite', docId), {
                  coach: doc(db, 'utilisateurs', user.uid),
                  dates: Timestamp.fromDate(slotDateTime),
                  dispo: null 
                });
              }
            } catch (err) {
              console.error('Erreur lors de la vérification du document existant:', err);
            }
          }
        }
      }
      
      setOriginalAvailability(JSON.parse(JSON.stringify(availability)));
      setHasChanges(false);
      
      Alert.alert('Succès', 'Vos disponibilités ont été enregistrées !');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des disponibilités:', error);
      Alert.alert('Erreur', 'Un problème est survenu lors de l\'enregistrement des disponibilités');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getCellStyle = (status: any) => {
    switch(status) {
      case STATUS.AVAILABLE:
        return styles.availableCell;
      case STATUS.BUSY:
        return styles.busyCell;
      default:
        return {};
    }
  };

  const getCellText = (status: any) => {
    switch(status) {
      case STATUS.AVAILABLE:
        return '✓';
      case STATUS.BUSY:
        return '✗';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Planning de Disponibilités</Text>
        </View>
        
        <View style={styles.weekNavigation}>
          <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color="#3b82f6" />
            <Text style={styles.navButtonText}>Précédente</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={goToCurrentWeek} style={styles.currentWeekButton}>
            <Text style={styles.currentWeekText}>Aujourd'hui</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={goToNextWeek} style={styles.navButton}>
            <Text style={styles.navButtonText}>Suivante</Text>
            <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.periodContainer}>
          <Text style={styles.periodText}>
            {formatMonthYear(dates[0])}
            {dates[0].getMonth() !== dates[6].getMonth() ? 
              ` - ${formatMonthYear(dates[6])}` : 
              ''
            }
          </Text>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6A88" />
            <Text style={styles.loadingText}>Chargement des disponibilités...</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableContainer}>
            <View>
              <View style={styles.headerRow}>
                <View style={styles.headerCell}>
                  <Text style={styles.headerText}>Horaire</Text>
                </View>
                {dates.map((date, index) => (
                  <View key={index} style={[
                    styles.headerCell,
                    new Date().toDateString() === date.toDateString() ? styles.todayColumn : {}
                  ]}>
                    <Text style={styles.headerText}>{formatDate(date)}</Text>
                  </View>
                ))}
              </View>
              
              {timeSlots.map((time, timeIndex) => (
                <View key={timeIndex} style={styles.row}>
                  <View style={styles.timeCell}>
                    <Text style={styles.timeText}>{time}</Text>
                  </View>
                  {dates.map((date, dateIndex) => (
                    <TouchableOpacity 
                      key={dateIndex}
                      style={[
                        styles.cell,
                        new Date().toDateString() === date.toDateString() ? styles.todayColumn : {},
                        getCellStyle(availability[timeIndex][dateIndex])
                      ]}
                      onPress={() => toggleStatus(timeIndex, dateIndex)}
                    >
                      <Text style={availability[timeIndex][dateIndex] === STATUS.BUSY ? styles.busyText : styles.availableText}>
                        {getCellText(availability[timeIndex][dateIndex])}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={styles.undefinedLegend}></View>
            <Text style={styles.legendText}>Non défini</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.availableLegend}></View>
            <Text style={styles.legendText}>Disponible</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.busyLegend}></View>
            <Text style={styles.legendText}>Occupé</Text>
          </View>
        </View>

        {isSaveButtonVisible && (
          <Animated.View style={[styles.saveButtonContainer, { opacity: saveButtonOpacity }]}>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={saveAvailability}
              disabled={loading}
            >
              <Ionicons name="save" size={22} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  navButtonText: {
    color: '#3b82f6',
    fontWeight: '500',
    fontSize: 16,
  },
  currentWeekButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  currentWeekText: {
    fontWeight: '600',
    color: '#4b5563',
  },
  periodContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  periodText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  tableContainer: {
    flex: 1,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
  },
  row: {
    flexDirection: 'row',
  },
  headerCell: {
    width: 90,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#4b5563',
  },
  timeCell: {
    width: 90,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  cell: {
    width: 90,
    height: 50,
    padding: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayColumn: {
    backgroundColor: '#f0f9ff', 
  },
  availableCell: {
    backgroundColor: '#d1fae5', 
  },
  busyCell: {
    backgroundColor: '#fee2e2', 
  },
  availableText: {
    color: '#059669',
    fontSize: 18,
    fontWeight: 'bold',
  },
  busyText: {
    color: '#dc2626',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeText: {
    textAlign: 'center',
    color: '#4b5563',
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  undefinedLegend: {
    width: 16,
    height: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 8,
    borderRadius: 4,
  },
  availableLegend: {
    width: 16,
    height: 16,
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 8,
    borderRadius: 4,
  },
  busyLegend: {
    width: 16,
    height: 16,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 14,
    color: '#4b5563',
  },
  saveButtonContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6A88',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 3,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF6A88',
  },
});