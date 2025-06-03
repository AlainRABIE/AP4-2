import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  collection,
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { getAuth } from 'firebase/auth';

interface Availability {
  id: string;
  coach: string;
  dates: Timestamp;
  dispo: number; 
  horaire?: string;
  horaires?: string[]; 
  docIds?: { [horaire: string]: string }; 
}

interface User {
  id: string;
  email: string;
  nomComplet?: string;
}

export default function RendezVousScreen() {
  const router = useRouter();
  const { coachId, coachName } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [coachDetails, setCoachDetails] = useState<any>(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      fetchUserDetails(user.uid);
    } else {
      setError("Vous devez être connecté pour prendre rendez-vous");
    }
  }, []);

  const fetchUserDetails = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'utilisateurs', userId));
      if (userDoc.exists()) {
        setCurrentUser({
          id: userDoc.id,
          email: userDoc.data().email,
          nomComplet: userDoc.data().nomComplet
        });
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des détails de l'utilisateur:", err);
    }
  };

  useEffect(() => {
    if (coachId) {
      fetchCoachDetails(coachId as string);
      fetchCoachAvailability(coachId as string);
    } else {
      setError("Aucun coach sélectionné");
      setLoading(false);
    }
  }, [coachId]);

  const fetchCoachDetails = async (id: string) => {
    try {
      const coachDoc = await getDoc(doc(db, 'utilisateurs', id));
      if (coachDoc.exists()) {
        setCoachDetails({
          id: coachDoc.id,
          ...coachDoc.data()
        });
      } else {
        setError("Coach non trouvé");
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des détails du coach:", err);
      setError("Erreur lors de la récupération des détails du coach");
    }
  };

  const fetchCoachAvailability = async (coachId: string) => {
    try {
      setLoading(true);
      
      const availabilityRef = collection(db, 'disponibilite');
      const q = query(
        availabilityRef, 
        where('coach', '==', doc(db, 'utilisateurs', coachId)),
        where('dispo', '==', 1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError("Aucune disponibilité pour ce coach");
        setLoading(false);
        return;
      }
      
      const availabilityByDate = new Map();
      
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const dateObj = data.dates.toDate();
        const dateStr = dateObj.toISOString().split('T')[0]; 
        
        const docId = docSnapshot.id;
        const horaireParts = docId.split('_');
        let horaire = '';
        
        if (horaireParts.length >= 3) {
          horaire = horaireParts[horaireParts.length - 1];
        }
        
        if (!horaire && data.horaire) {
          horaire = data.horaire;
        }
        
        if (!availabilityByDate.has(dateStr)) {
          availabilityByDate.set(dateStr, {
            id: dateStr, 
            coach: data.coach.path.split('/').pop(),
            dates: data.dates,
            dispo: 1,
            horaires: [horaire], 
            docIds: {[horaire]: docSnapshot.id} 
          });
        } else {
          const existingData = availabilityByDate.get(dateStr);
          existingData.horaires.push(horaire);
          existingData.docIds = {...existingData.docIds, [horaire]: docSnapshot.id}; 
          availabilityByDate.set(dateStr, existingData);
        }
      });
      
      const availabilityData = Array.from(availabilityByDate.values())
        .sort((a, b) => a.dates.seconds - b.dates.seconds);
      
      setAvailabilities(availabilityData);
      
      if (availabilityData.length > 0) {
        const firstDate = formatDate(availabilityData[0].dates.toDate());
        setSelectedDate(firstDate);
      }
      
    } catch (err) {
      console.error("Erreur lors de la récupération des disponibilités:", err);
      setError("Erreur lors de la récupération des disponibilités");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('fr-FR', options);
  };

  const isDateSelected = (date: string): boolean => {
    return selectedDate === date;
  };

  const isTimeSelected = (time: string): boolean => {
    return selectedTime === time;
  };

  const bookAppointment = async () => {
    if (!currentUser || !selectedDate || !selectedTime || !coachId) {
      Alert.alert('Erreur', 'Veuillez sélectionner une date et un horaire');
      return;
    }
    
    try {
      setBookingInProgress(true);
      
      const selectedAvailability = availabilities.find(
        avail => formatDate(avail.dates.toDate()) === selectedDate
      );
      
      if (!selectedAvailability) {
        throw new Error("Disponibilité non trouvée");
      }

      const dateObj = selectedAvailability.dates.toDate();
      const dateStr = dateObj.toISOString().split('T')[0];
      const docId = selectedAvailability.docIds?.[selectedTime];

      if (!docId) {
        console.error(`Document ID introuvable pour l'horaire: ${selectedTime}`);
        throw new Error("Créneau horaire introuvable dans la base de données");
      }
      
      console.log(`Mise à jour du créneau: ${docId} à dispo=0`);
      
      const rdvRef = await addDoc(collection(db, 'rendezvous'), {
        coach: doc(db, 'utilisateurs', coachId as string),
        client: doc(db, 'utilisateurs', currentUser.id),
        date: selectedAvailability.dates,
        horaire: selectedTime,
        statut: 'confirmé',
        dateCreation: Timestamp.now()
      });
      
      console.log(`Rendez-vous créé avec ID: ${rdvRef.id}`);
      
      const dispoRef = doc(db, 'disponibilite', docId);

      const dispoDoc = await getDoc(dispoRef);
      if (dispoDoc.exists()) {
        await setDoc(dispoRef, {
          coach: doc(db, 'utilisateurs', coachId as string),
          dates: selectedAvailability.dates,
          dispo: 0,
          horaire: selectedTime
        }, { merge: true });
        console.log(`Document existant mis à jour avec dispo=0`);
      } else {
        console.error(`Document non trouvé: ${docId}`);
        throw new Error("Créneau horaire introuvable dans la base de données");
      }
      
      const updatedAvailabilities = availabilities.map(availability => {
        if (formatDate(availability.dates.toDate()) === selectedDate) {
          const updatedHoraires = availability.horaires?.filter(horaire => horaire !== selectedTime) || [];
          return {
            ...availability,
            horaires: updatedHoraires
          };
        }
        return availability;
      });
      
      const filteredAvailabilities = updatedAvailabilities.filter(
        availability => availability.horaires && availability.horaires.length > 0
      );
      
      setAvailabilities(filteredAvailabilities);
      setSelectedTime(null);
      
      Alert.alert(
        'Succès',
        `Votre rendez-vous avec ${coachName || 'le coach'} a été confirmé pour le ${selectedDate} à ${selectedTime}.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
      
    } catch (err) {
      console.error("Erreur lors de la réservation du rendez-vous:", err);
      Alert.alert('Erreur', "Impossible de réserver ce rendez-vous. Veuillez réessayer.");
    } finally {
      setBookingInProgress(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6A88" />
        <Text style={styles.loadingText}>Chargement des disponibilités...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.title}>Prendre rendez-vous</Text>
        </View>
        
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => {
            if (coachId) {
              setError(null);
              setLoading(true);
              fetchCoachAvailability(coachId as string);
            } else {
              router.back();
            }
          }}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Prendre rendez-vous</Text>
      </View>
      
      <View style={styles.coachInfoCard}>
        <Text style={styles.coachName}>
          {coachName || coachDetails?.nomComplet || 'Coach'}
        </Text>
        {coachDetails?.speciality && (
          <View style={styles.specialityContainer}>
            <MaterialIcons name="fitness-center" size={16} color="#22C55E" />
            <Text style={styles.specialityText}>{coachDetails.speciality}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.sectionTitle}>Choisissez une date</Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.datesContainer}
      >
        {availabilities.length === 0 ? (
          <Text style={styles.noDataText}>Aucune date disponible</Text>
        ) : (
          availabilities.map((availability) => {
            const formattedDate = formatDate(availability.dates.toDate());
            return (
              <TouchableOpacity
                key={availability.id}
                style={[
                  styles.dateCard,
                  isDateSelected(formattedDate) && styles.selectedDateCard
                ]}
                onPress={() => {
                  setSelectedDate(formattedDate);
                  setSelectedTime(null);
                }}
              >
                <Text style={[
                  styles.dateText,
                  isDateSelected(formattedDate) && styles.selectedDateText
                ]}>
                  {formattedDate}
                </Text>
                <Text style={[
                  styles.availabilityCount,
                  isDateSelected(formattedDate) && styles.selectedDateText
                ]}>
                  {availability.horaires ? `${availability.horaires.length} créneau${availability.horaires.length > 1 ? 'x' : ''}` : 'Disponible'}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
      
      <Text style={styles.sectionTitle}>Choisissez un horaire</Text>
      
      <ScrollView contentContainerStyle={styles.timesContainer}>
        {!selectedDate ? (
          <Text style={styles.noDataText}>Sélectionnez une date</Text>
        ) : (
          (() => {
            const selectedAvailability = availabilities.find(
              avail => formatDate(avail.dates.toDate()) === selectedDate
            );
            
            if (!selectedAvailability || selectedAvailability.dispo === 0) {
              return <Text style={styles.noDataText}>Aucun horaire disponible pour cette date</Text>;
            }
            
            return (
              <View style={styles.timeGrid}>
                {selectedAvailability.horaires && selectedAvailability.horaires.map((horaire) => (
                  <TouchableOpacity
                    key={horaire}
                    style={[
                      styles.timeCard,
                      isTimeSelected(horaire) && styles.selectedTimeCard
                    ]}
                    onPress={() => setSelectedTime(horaire)}
                  >
                    <Text style={[
                      styles.timeText,
                      isTimeSelected(horaire) && styles.selectedTimeText
                    ]}>
                      {horaire}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })()
        )}
      </ScrollView>
      
      <TouchableOpacity
        style={[
          styles.confirmButton,
          (!selectedDate || !selectedTime) && styles.disabledButton
        ]}
        disabled={!selectedDate || !selectedTime || bookingInProgress}
        onPress={bookAppointment}
      >
        {bookingInProgress ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <MaterialIcons name="check-circle" size={24} color="white" />
            <Text style={styles.confirmButtonText}>
              Confirmer le rendez-vous
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: Platform.OS === 'ios' ? 40 : 20,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  coachInfoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  coachName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  specialityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialityText: {
    fontSize: 14,
    color: '#22C55E',
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  datesContainer: {
    paddingBottom: 10,
    paddingRight: 20,
  },
  dateCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedDateCard: {
    backgroundColor: '#FF6A88',
  },
  dateText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    marginBottom: 4,
  },
  selectedDateText: {
    color: 'white',
  },
  availabilityCount: {
    fontSize: 12,
    color: '#64748B',
  },
  timesContainer: {
    paddingBottom: 20,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    margin: 6,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedTimeCard: {
    backgroundColor: '#FF6A88',
  },
  timeText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  selectedTimeText: {
    color: 'white',
  },
  confirmButton: {
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 'auto',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: '#FF6A88',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  noDataText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
});
