"use client"

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
import { collection, query, where, getDocs, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

interface Rendezvous {
  id: string;
  date: Timestamp;
  horaire: string;
  statut: string;
  client: {
    id: string;
    nomComplet?: string;
    email?: string;
    photoURL?: string;
  };
  dateCreation: Timestamp;
  formattedDate?: string; 
}

export default function RendezvousCoachScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rendezvous, setRendezvous] = useState<Rendezvous[]>([]);
  const [filteredRendezvous, setFilteredRendezvous] = useState<Rendezvous[]>([]);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

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
      const q = query(rdvRef, where('coach', '==', doc(db, 'utilisateurs', user.uid)));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setRendezvous([]);
        setLoading(false);
        return;
      }

      const rdvPromises = querySnapshot.docs.map(async (rdvDoc) => {
        const rdvData = rdvDoc.data();
        let clientData: any = { id: rdvData.client.id };

        try {
          if (rdvData.client) {
            const clientRef = rdvData.client;
            const clientDoc = await getDoc(clientRef);
            if (clientDoc.exists()) {
              const clientDocData = clientDoc.data() as { 
                nomComplet?: string; 
                email?: string; 
                photoURL?: string;
              };
              clientData = {
                id: clientDoc.id,
                nomComplet: clientDocData.nomComplet || 'Client',
                email: clientDocData.email || 'Non renseigné',
                photoURL: clientDocData.photoURL || null
              };
            }
          }
        } catch (err) {
          console.error("Erreur lors de la récupération des détails du client:", err);
        }

        const date = rdvData.date.toDate();
        const formattedDate = formatDate(date);

        return {
          id: rdvDoc.id,
          date: rdvData.date,
          horaire: rdvData.horaire,
          statut: rdvData.statut || 'confirmé',
          client: clientData,
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
      case 'today':
        setFilteredRendezvous(rendezvous.filter(rdv => {
          const rdvDate = rdv.date.toDate();
          rdvDate.setHours(0, 0, 0, 0);
          return rdvDate.getTime() === today.getTime();
        }));
        break;
      case 'upcoming':
        setFilteredRendezvous(rendezvous.filter(rdv => {
          const rdvDate = rdv.date.toDate();
          rdvDate.setHours(0, 0, 0, 0);
          return rdvDate.getTime() >= today.getTime();
        }));
        break;
      case 'past':
        setFilteredRendezvous(rendezvous.filter(rdv => {
          const rdvDate = rdv.date.toDate();
          rdvDate.setHours(0, 0, 0, 0);
          return rdvDate.getTime() < today.getTime();
        }));
        break;
      default: 
        setFilteredRendezvous(rendezvous);
    }
  };

  const updateRendezvousStatus = async (rdvId: string, newStatus: string) => {
    try {
      setLoading(true);
      
      await updateDoc(doc(db, 'rendezvous', rdvId), {
        statut: newStatus
      });
      
      const updatedRdv = rendezvous.map(rdv => {
        if (rdv.id === rdvId) {
          return { ...rdv, statut: newStatus };
        }
        return rdv;
      });
      
      setRendezvous(updatedRdv);
      
      Alert.alert(
        'Succès',
        `Le rendez-vous a été marqué comme ${newStatus}.`
      );
      
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut:", err);
      Alert.alert(
        'Erreur',
        "Impossible de mettre à jour le statut du rendez-vous."
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRendezvous();
  };

  const toggleClientDetails = (clientId: string) => {
    if (expandedClient === clientId) {
      setExpandedClient(null);
    } else {
      setExpandedClient(clientId);
    }
  };

  const isFirstRdvOfDate = (index: number): boolean => {
    if (index === 0) return true;
    
    const currentRdv = filteredRendezvous[index];
    const prevRdv = filteredRendezvous[index - 1];
    
    const currentDate = currentRdv.date.toDate();
    const prevDate = prevRdv.date.toDate();
    
    currentDate.setHours(0, 0, 0, 0);
    prevDate.setHours(0, 0, 0, 0);
    
    return currentDate.getTime() !== prevDate.getTime();
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
        <Text style={styles.headerTitle}>Mess Rendez-vous</Text>
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
          style={[styles.filterButton, filter === 'today' && styles.activeFilter]}
          onPress={() => setFilter('today')}
        >
          <MaterialIcons name="today" size={18} color={filter === 'today' ? 'white' : '#64748B'} />
          <Text style={[styles.filterText, filter === 'today' && styles.activeFilterText]}>Aujourd'hui</Text>
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
      </ScrollView>

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
              Aucun rendez-vous {filter === 'today' ? "aujourd'hui" : filter === 'upcoming' ? "à venir" : filter === 'past' ? "passé" : ""}.
            </Text>
          </View>
        ) : (
          Object.entries(groupedRendezvous).map(([date, rdvs]) => (
            <View key={date} style={styles.dateGroup}>
              <View style={styles.dateHeader}>
                <MaterialIcons name="event" size={20} color="#0F172A" />
                <Text style={styles.dateHeaderText}>{date}</Text>
              </View>
              
              {rdvs.map((rdv, index) => (
                <View key={rdv.id} style={styles.appointmentCard}>
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
                  
                  <TouchableOpacity 
                    style={styles.clientContainer}
                    onPress={() => toggleClientDetails(rdv.client.id)}
                  >
                    <Image 
                      source={
                        rdv.client.photoURL 
                          ? { uri: rdv.client.photoURL } 
                          : require('../../assets/images/default-avatar.png')
                      } 
                      style={styles.clientAvatar}
                    />
                    
                    <View style={styles.clientInfo}>
                      <Text style={styles.clientName}>{rdv.client.nomComplet}</Text>
                      <Text style={styles.clientEmail}>{rdv.client.email}</Text>
                    </View>
                    
                    <MaterialIcons 
                      name={expandedClient === rdv.client.id ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                      size={24} 
                      color="#64748B" 
                    />
                  </TouchableOpacity>
                  
                  {expandedClient === rdv.client.id && (
                    <View style={styles.expandedInfo}>
                      <Text style={styles.expandedInfoTitle}>Détails du rendez-vous</Text>
                      <Text style={styles.expandedInfoText}>Date: {rdv.formattedDate}</Text>
                      <Text style={styles.expandedInfoText}>Heure: {rdv.horaire}</Text>
                      <Text style={styles.expandedInfoText}>Statut: {rdv.statut}</Text>
                      <Text style={styles.expandedInfoText}>Réservé le: {rdv.dateCreation.toDate().toLocaleDateString('fr-FR')}</Text>
                      
                      <View style={styles.actionsContainer}>
                        {rdv.statut !== 'terminé' && (
                          <TouchableOpacity
                            style={[styles.actionButton, styles.completeButton]}
                            onPress={() => updateRendezvousStatus(rdv.id, 'terminé')}
                          >
                            <MaterialIcons name="check-circle" size={16} color="white" />
                            <Text style={styles.actionButtonText}>Marquer comme terminé</Text>
                          </TouchableOpacity>
                        )}
                        
                        {rdv.statut !== 'annulé' && (
                          <TouchableOpacity
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={() => updateRendezvousStatus(rdv.id, 'annulé')}
                          >
                            <MaterialIcons name="cancel" size={16} color="white" />
                            <Text style={styles.actionButtonText}>Annuler</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}
                </View>
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
  clientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  clientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  clientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  clientEmail: {
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
  completeButton: {
    backgroundColor: '#22C55E',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
});