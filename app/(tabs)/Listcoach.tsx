import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { collection, getDocs, query, where, updateDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';

interface Coach {
  id: string;
  email: string;
  nomComplet?: string;
  role: string;
  speciality?: string;
  experience?: number;
  rating?: number;
  image?: string;
  dateInscription?: any;
}

export default function CoachScreen() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [filteredCoaches, setFilteredCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'rating'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchCoaches();
  }, []);

  useEffect(() => {
    filterAndSortCoaches();
  }, [searchQuery, sortBy, sortDirection, coaches]);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'utilisateurs');
      
      const q = query(usersRef, where('role', '==', 'coach'));
      const querySnapshot = await getDocs(q);
      
      const coachesData: Coach[] = [];
      querySnapshot.forEach((doc) => {
        coachesData.push({
          id: doc.id,
          ...doc.data() as Omit<Coach, 'id'>
        });
      });
      
      setCoaches(coachesData);
      setFilteredCoaches(coachesData);
    } catch (error) {
      console.error('Erreur lors de la récupération des coachs:', error);
      Alert.alert('Erreur', 'Impossible de charger la liste des coachs.');
    } finally {
      setLoading(false);
    }
  };

  const createCoach = async (coachData: Partial<Coach>) => {
    try {
      const newCoachRef = doc(collection(db, 'utilisateurs'));
      await setDoc(newCoachRef, {
        ...coachData,
        role: 'coach',
        dateInscription: new Date(),
      });
      fetchCoaches(); 
      Alert.alert('Succès', 'Le coach a été créé avec succès.');
    } catch (error) {
      console.error('Erreur lors de la création du coach:', error);
      Alert.alert('Erreur', "Impossible de créer le coach.");
    }
  };

  const updateCoach = async (coachId: string, updatedData: Partial<Coach>) => {
    try {
      const coachRef = doc(db, 'utilisateurs', coachId);
      await updateDoc(coachRef, updatedData);
      fetchCoaches(); 
      Alert.alert('Succès', 'Les informations du coach ont été mises à jour.');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du coach:', error);
      Alert.alert('Erreur', "Impossible de mettre à jour le coach.");
    }
  };

  const deleteCoach = async (coachId: string) => {
    try {
      const coachRef = doc(db, 'utilisateurs', coachId);
      await deleteDoc(coachRef);
      setCoaches(prevCoaches => prevCoaches.filter(coach => coach.id !== coachId));
      Alert.alert('Succès', 'Le coach a été supprimé avec succès.');
    } catch (error) {
      console.error('Erreur lors de la suppression du coach:', error);
      Alert.alert('Erreur', "Impossible de supprimer le coach.");
    }
  };

  const filterAndSortCoaches = () => {
    let result = coaches.filter(coach => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (coach.email?.toLowerCase().includes(searchLower) || false) || 
        (coach.nomComplet?.toLowerCase().includes(searchLower) || false) ||
        (coach.speciality?.toLowerCase().includes(searchLower) || false)
      );
    });

    result.sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = a.nomComplet || a.email || '';
        const nameB = b.nomComplet || b.email || '';
        return sortDirection === 'asc'
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      } else if (sortBy === 'date') {
        const dateA = a.dateInscription?.toDate?.() || new Date(0);
        const dateB = b.dateInscription?.toDate?.() || new Date(0);
        return sortDirection === 'asc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      } else { 
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return sortDirection === 'asc'
          ? ratingA - ratingB
          : ratingB - ratingA;
      }
    });

    setFilteredCoaches(result);
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const demoteToUser = async (coachId: string) => {
    try {
      const coachRef = doc(db, 'utilisateurs', coachId);
      await updateDoc(coachRef, { role: 'utilisateur' });
      
      setCoaches(prevCoaches => prevCoaches.filter(coach => coach.id !== coachId));
      
      Alert.alert('Succès', 'Le coach a été rétrogradé au rôle d\'utilisateur.');
    } catch (error) {
      console.error('Erreur lors de la rétrogradation du coach:', error);
      Alert.alert('Erreur', "Impossible de modifier le rôle du coach.");
    }
  };

  const renderStars = (rating: number = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<MaterialIcons key={i} name="star" size={16} color="#FFB800" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<MaterialIcons key={i} name="star-half" size={16} color="#FFB800" />);
      } else {
        stars.push(<MaterialIcons key={i} name="star-outline" size={16} color="#FFB800" />);
      }
    }
    
    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  const renderCoachItem = ({ item }: { item: Coach }) => (
    <TouchableOpacity
      style={styles.coachCard}
      onPress={() => {
        Alert.alert(
          'Options',
          `Choisir une action pour ${item.nomComplet || item.email}`,
          [
            {
              text: 'Détails',
              onPress: () => Alert.alert('Détails Coach', 
                `ID: ${item.id}\n` + 
                `Email: ${item.email}\n` +
                `Nom: ${item.nomComplet || 'Non spécifié'}\n` +
                `Spécialité: ${item.speciality || 'Non spécifiée'}\n` +
                `Expérience: ${item.experience || 0} ans`
              )
            },
            {
              text: 'Modifier',
              onPress: () => {
                updateCoach(item.id, { nomComplet: 'Nom Modifié' });
              }
            },
            {
              text: 'Supprimer',
              onPress: () => {
                Alert.alert(
                  'Confirmer',
                  `Êtes-vous sûr de vouloir supprimer ce coach?`,
                  [
                    { text: 'Annuler' },
                    { text: 'Confirmer', onPress: () => deleteCoach(item.id) }
                  ]
                );
              }
            },
            {
              text: 'Rétrograder',
              onPress: () => {
                Alert.alert(
                  'Confirmer',
                  `Êtes-vous sûr de vouloir rétrograder ${item.nomComplet || item.email} au rôle d'utilisateur?`,
                  [
                    { text: 'Annuler' },
                    { text: 'Confirmer', onPress: () => demoteToUser(item.id) }
                  ]
                );
              }
            },
            { text: 'Annuler', style: 'cancel' }
          ]
        );
      }}
    >
      <View style={styles.coachInfo}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.coachImage} />
        ) : (
          <View style={styles.coachIcon}>
            <Text style={styles.coachInitial}>
              {(item.nomComplet?.[0] || item.email?.[0] || 'C').toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.coachDetails}>
          <Text style={styles.coachName}>{item.nomComplet || 'Coach sans nom'}</Text>
          <Text style={styles.coachEmail}>{item.email}</Text>
          
          <View style={styles.coachMeta}>
            {item.speciality && (
              <View style={styles.tagContainer}>
                <MaterialIcons name="fitness-center" size={12} color="#22C55E" />
                <Text style={styles.tagText}>{item.speciality}</Text>
              </View>
            )}
            
            {item.experience !== undefined && (
              <View style={styles.tagContainer}>
                <MaterialIcons name="history" size={12} color="#3B82F6" />
                <Text style={styles.tagText}>{item.experience} an{item.experience > 1 ? 's' : ''}</Text>
              </View>
            )}
          </View>
          
          {item.rating && renderStars(item.rating)}
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
    </TouchableOpacity>
  );

  const renderListHeader = () => (
    <View>
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un coach..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#94A3B8"
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sortContainer}>
        <Text style={styles.sortText}>Trier par:</Text>
        <TouchableOpacity 
          style={[styles.sortButton, sortBy === 'name' && styles.activeSortButton]}
          onPress={() => {
            if (sortBy === 'name') toggleSortDirection();
            else setSortBy('name');
          }}
        >
          <Text style={[styles.sortButtonText, sortBy === 'name' && styles.activeSortButtonText]}>
            Nom {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sortButton, sortBy === 'rating' && styles.activeSortButton]}
          onPress={() => {
            if (sortBy === 'rating') toggleSortDirection();
            else setSortBy('rating');
          }}
        >
          <Text style={[styles.sortButtonText, sortBy === 'rating' && styles.activeSortButtonText]}>
            Note {sortBy === 'rating' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sortButton, sortBy === 'date' && styles.activeSortButton]}
          onPress={() => {
            if (sortBy === 'date') toggleSortDirection();
            else setSortBy('date');
          }}
        >
          <Text style={[styles.sortButtonText, sortBy === 'date' && styles.activeSortButtonText]}>
            Date {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coachs</Text>
      {renderListHeader()}
      
      {loading ? (
        <ActivityIndicator size="large" color="#FF6A88" style={styles.loader} />
      ) : filteredCoaches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="fitness-center" size={48} color="#CBD5E1" />
          <Text style={styles.emptyText}>
            {searchQuery ? "Aucun coach ne correspond à votre recherche" : "Aucun coach trouvé"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCoaches}
          keyExtractor={(item) => item.id}
          renderItem={renderCoachItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#0F172A',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
  },
  sortContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 16,
  },
  sortText: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 8,
    marginBottom: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    marginBottom: 8,
  },
  activeSortButton: {
    backgroundColor: '#FFE4ED',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#64748B',
  },
  activeSortButtonText: {
    color: '#FF6A88',
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 16,
  },
  coachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coachImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  coachIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFE4ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  coachInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6A88',
  },
  coachDetails: {
    flex: 1,
  },
  coachName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  coachEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  coachMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 4,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
    textAlign: 'center',
  },
});