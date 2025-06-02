""

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
  Platform
} from 'react-native';
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Rendezvous {
  id: string;
  date: Timestamp;
  horaire: string;
  statut: string;
  coach: {
    id: string;
    nomComplet?: string;
    specialite?: string;
    photoURL?: string;
    email?: string;
  };
  dateCreation: Timestamp;
  formattedDate?: string;
}

export default function RendezvousClientScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rendezvous, setRendezvous] = useState<Rendezvous[]>([]);
  const [filteredRendezvous, setFilteredRendezvous] = useState<Rendezvous[]>([]);
  const [filter, setFilter] = useState('upcoming');
  const [error, setError] = useState<string | null>(null);
  const [expandedRdv, setExpandedRdv] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchRendezvous();
  }, []);

  useEffect(() => {
    filterRendezvous();
  }, [filter, rendezvous]);

  const fetchRendezvous = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError("Vous devez être connecté pour voir vos rendez-vous");
        setLoading(false);
        return;
      }

      const rdvRef = collection(db, 'rendezvous');
      const q = query(rdvRef, where('client', '==', doc(db, 'utilisateurs', user.uid)));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setRendezvous([]);
        setLoading(false);
        return;
      }

      const rdvPromises = querySnapshot.docs.map(async (rdvDoc) => {
        const rdvData = rdvDoc.data();
        let coachData: any = { id: '' };

        try {
          if (rdvData.coach) {
            const coachRef = rdvData.coach;
            const coachDoc = await getDoc(coachRef);
            if (coachDoc.exists()) {
              const coachDocData = coachDoc.data() as Record<string, any>;
              coachData = {
                id: coachDoc.id,
                nomComplet: coachDocData.nomComplet || coachDocData.name || 'Coach',
                specialite: coachDocData.specialite || coachDocData.speciality || 'Général',
                photoURL: coachDocData.photoURL || coachDocData.image || null,
                email: coachDocData.email || 'Non renseigné'
              };
            }
          }
        } catch (err) {
          console.error("Erreur lors de la récupération des détails du coach:", err);
        }

        const date = rdvData.date.toDate();
        const formattedDate = formatDate(date);

        return {
          id: rdvDoc.id,
          date: rdvData.date,
          horaire: rdvData.horaire,
          statut: rdvData.statut || 'confirmé',
          coach: coachData,
          dateCreation: rdvData.dateCreation,
          formattedDate
        };
      });

      const rdvList = await Promise.all(rdvPromises);

      rdvList.sort((a, b) => {
        const dateA = a.date.toDate();
        const dateB = b.date.toDate();
        
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        
        const timeA = a.horaire.split(':').map(Number);
        const timeB = b.horaire.split(':').map(Number);
        
        if (timeA[0] !== timeB[0]) {
          return timeA[0] - timeB[0];
        }
        
        return (timeA[1] || 0) - (timeB[1] || 0);
      });

      setRendezvous(rdvList);
      setError(null);

    } catch (err) {
      console.error("Erreur lors de la récupération des rendez-vous:", err);
      setError("Impossible de charger vos rendez-vous");
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const filterRendezvous = () => {
    if (!rendezvous.length) {
      setFilteredRendezvous([]);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
      case 'upcoming':
        setFilteredRendezvous(rendezvous.filter(rdv => {
          const rdvDate = rdv.date.toDate();
          rdvDate.setHours(0, 0, 0, 0);
          return rdvDate.getTime() >= today.getTime() && rdv.statut !== 'annulé';
        }));
        break;
      case 'past':
        setFilteredRendezvous(rendezvous.filter(rdv => {
          const rdvDate = rdv.date.toDate();
          rdvDate.setHours(0, 0, 0, 0);
          return rdvDate.getTime() < today.getTime() && rdv.statut !== 'annulé';
        }));
        break;
      case 'cancelled':
        setFilteredRendezvous(rendezvous.filter(rdv => rdv.statut === 'annulé'));
        break;
      default: 
        setFilteredRendezvous(rendezvous);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRendezvous();
  };

  const toggleRdvDetails = (rdvId: string) => {
    if (expandedRdv === rdvId) {
      setExpandedRdv(null);
    } else {
      setExpandedRdv(rdvId);
    }
  };

  const groupedRendezvous = filteredRendezvous.reduce((groups, rdv) => {
    const date = rdv.formattedDate || '';
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(rdv);
    return groups;
  }, {} as Record<string, Rendezvous[]>);

  if (loading && !refreshing) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#FF6A88" />
        <Text style={styles.loadingText}>Chargement de vos rendez-vous...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <MaterialIcons name="error-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRendezvous}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Rendez-vous</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <MaterialIcons name="list" size={18} color={filter === 'all' ? 'white' : '#64748B'} />
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>Tous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'upcoming' && styles.activeFilter]}
          onPress={() => setFilter('upcoming')}
        >
          <MaterialIcons name="event" size={18} color={filter === 'upcoming' ? 'white' : '#64748B'} />
          <Text style={[styles.filterText, filter === 'upcoming' && styles.activeFilterText]}>À venir</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'past' && styles.activeFilter]}
          onPress={() => setFilter('past')}
        >
          <MaterialIcons name="history" size={18} color={filter === 'past' ? 'white' : '#64748B'} />
          <Text style={[styles.filterText, filter === 'past' && styles.activeFilterText]}>Passés</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'cancelled' && styles.activeFilter]}
          onPress={() => setFilter('cancelled')}
        >
          <MaterialIcons name="cancel" size={18} color={filter === 'cancelled' ? 'white' : '#64748B'} />
          <Text style={[styles.filterText, filter === 'cancelled' && styles.activeFilterText]}>Annulés</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity 
        style={styles.newAppointmentButton}
        onPress={() => router.push('/coach')}
      >
        <MaterialIcons name="add-circle" size={20} color="white" />
        <Text style={styles.newAppointmentText}>Prendre un nouveau rendez-vous</Text>
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6A88']} />
        }
      >
        {filteredRendezvous.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="calendar-times" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>
              Aucusn rendez-vous {filter === 'upcoming' ? "à venir" : filter === 'past' ? "passé" : filter === 'cancelled' ? "annulé" : ""}.
            </Text>
            {filter !== 'upcoming' && (
              <TouchableOpacity 
                style={styles.switchFilterButton}
                onPress={() => setFilter('upcoming')}
              >
                <Text style={styles.switchFilterText}>Voir les rendez-vous à venir</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          Object.entries(groupedRendezvous).map(([date, rdvs]) => (
            <View key={date} style={styles.dateGroup}>
              <View style={styles.dateHeader}>
                <MaterialIcons name="event" size={20} color="#0F172A" />
                <Text style={styles.dateHeaderText}>{date}</Text>
              </View>
              
              {rdvs.map((rdv) => (
                <TouchableOpacity 
                  key={rdv.id} 
                  style={styles.appointmentCard}
                  onPress={() => toggleRdvDetails(rdv.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.appointmentHeader}>
                    <View style={styles.timeContainer}>
                      <MaterialIcons name="access-time" size={16} color="#64748B" />
                      <Text style={styles.timeText}>{rdv.horaire}</Text>
                    </View>
                    
                    <View 
                      style={[
                        styles.statusBadge,
                        rdv.statut === 'confirmé' ? styles.confirmedStatus : 
                        rdv.statut === 'annulé' ? styles.cancelledStatus : 
                        rdv.statut === 'terminé' ? styles.completedStatus : 
                        styles.pendingStatus
                      ]}
                    >
                      <Text style={styles.statusText}>{rdv.statut}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.coachContainer}>
                    <Image 
                      source={
                        rdv.coach.photoURL 
                          ? { uri: rdv.coach.photoURL } 
                          : require('../../assets/images/default-avatar.png')
                      } 
                      style={styles.coachAvatar}
                    />
                    
                    <View style={styles.coachInfo}>
                      <Text style={styles.coachName}>{rdv.coach.nomComplet}</Text>
                      <Text style={styles.coachSpeciality}>{rdv.coach.specialite}</Text>
                    </View>
                    
                    <MaterialIcons 
                      name={expandedRdv === rdv.id ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                      size={24} 
                      color="#64748B" 
                    />
                  </View>
                  
                  {expandedRdv === rdv.id && (
                    <View style={styles.expandedInfo}>
                      <Text style={styles.expandedInfoTitle}>Détails du rendez-vous</Text>
                      <Text style={styles.expandedInfoText}>Date: {rdv.formattedDate}</Text>
                      <Text style={styles.expandedInfoText}>Heure: {rdv.horaire}</Text>
                      <Text style={styles.expandedInfoText}>Statut: {rdv.statut}</Text>
                      <Text style={styles.expandedInfoText}>Coach: {rdv.coach.nomComplet}</Text>
                      <Text style={styles.expandedInfoText}>Spécialité: {rdv.coach.specialite}</Text>
                      <Text style={styles.expandedInfoText}>Réservé le: {rdv.dateCreation.toDate().toLocaleDateString('fr-FR')}</Text>
                      
                      {rdv.statut === 'confirmé' && new Date() < rdv.date.toDate() && (
                        <View style={styles.actionsContainer}>
                          <TouchableOpacity
                              style={[styles.actionButton, styles.coachProfileButton]}
                              onPress={() => router.push({
                                pathname: "/coach",
                                params: { coachId: rdv.coach.id }
                              })}
                            >
                            <MaterialIcons name="person" size={16} color="white" />
                            <Text style={styles.actionButtonText}>Voir le profil du coach</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  filtersContainer: {
    maxHeight: 60,
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#FF6A88',
  },
  filterText: {
    color: '#64748B',
    marginLeft: 4,
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
  },
  newAppointmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  newAppointmentText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#64748B',
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  switchFilterButton: {
    backgroundColor: '#FF6A88',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  switchFilterText: {
    color: 'white',
    fontWeight: '600',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#64748B',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    textAlign: 'center',
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
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    marginBottom: 12,
  },
  dateHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confirmedStatus: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  cancelledStatus: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  completedStatus: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  pendingStatus: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  coachContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  coachAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  coachInfo: {
    flex: 1,
    marginLeft: 12,
  },
  coachName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  coachSpeciality: {
    fontSize: 12,
    color: '#64748B',
  },
  expandedInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  expandedInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  expandedInfoText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  coachProfileButton: {
    backgroundColor: '#3B82F6',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
});