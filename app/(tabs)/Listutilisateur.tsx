import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { db } from '../../firebase/firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface User {
  id: string;
  email: string;
  nomComplet?: string;
  role: string;
  dateInscription?: any;
}

export default function UtilisateursScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [searchQuery, sortBy, sortDirection, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'utilisateurs');
      
      const q = query(usersRef, where('role', '==', 'utilisateur'));
      const querySnapshot = await getDocs(q);
      
      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({
          id: doc.id,
          ...doc.data() as Omit<User, 'id'>
        });
      });
      
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      Alert.alert('Erreur', 'Impossible de charger la liste des utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let result = users.filter(user => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (user.email?.toLowerCase().includes(searchLower) || false) || 
        (user.nomComplet?.toLowerCase().includes(searchLower) || false)
      );
    });

    result.sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = a.nomComplet || a.email || '';
        const nameB = b.nomComplet || b.email || '';
        return sortDirection === 'asc'
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      } else { 
        const dateA = a.dateInscription?.toDate?.() || new Date(0);
        const dateB = b.dateInscription?.toDate?.() || new Date(0);
        return sortDirection === 'asc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
    });

    setFilteredUsers(result);
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const promoteToCoach = async (userId: string) => {
    try {
      const userRef = doc(db, 'utilisateurs', userId);
      await updateDoc(userRef, { role: 'coach' });
      
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      Alert.alert('Succès', 'L\'utilisateur a été promu au rôle de coach.');
    } catch (error) {
      console.error('Erreur lors de la promotion au rôle de coach:', error);
      Alert.alert('Erreur', "Impossible de modifier le rôle de l'utilisateur.");
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        'Email envoyé',
        `Un email de réinitialisation de mot de passe a été envoyé à ${email}.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
      let errorMessage = 'Impossible d\'envoyer l\'email de réinitialisation.';
      
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'auth/user-not-found') {
          errorMessage = 'Aucun utilisateur trouvé avec cet email.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'L\'adresse email est invalide.';
        }
      }
      
      Alert.alert('Erreur', errorMessage);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => {
        Alert.alert(
          'Options',
          `Choisir une action pour ${item.nomComplet || item.email}`,
          [
            {
              text: 'Détails',
              onPress: () => Alert.alert('Détails', `ID: ${item.id}\nEmail: ${item.email}\nRôle: ${item.role}`)
            },
            {
              text: 'Modifier',
              onPress: () => {
                router.push(`/client/Editutilisateur?id=${item.id}`);
              }
            },
            {
              text: 'Réinitialiser mot de passe',
              onPress: () => {
                Alert.alert(
                  'Confirmer',
                  `Envoyer un email de réinitialisation de mot de passe à ${item.email}?`,
                  [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Envoyer', onPress: () => sendPasswordReset(item.email) }
                  ]
                );
              }
            },
            {
              text: 'Promouvoir en coach',
              onPress: () => {
                Alert.alert(
                  'Confirmer',
                  `Êtes-vous sûr de vouloir promouvoir cet utilisateur au rôle de coach?`,
                  [
                    { text: 'Annuler' },
                    { text: 'Confirmer', onPress: () => promoteToCoach(item.id) }
                  ]
                );
              }
            },
            { text: 'Annuler', style: 'cancel' }
          ]
        );
      }}
    >
      <View style={styles.userInfo}>
        <View style={styles.userIcon}>
          <Text style={styles.userInitial}>
            {(item.nomComplet?.[0] || item.email?.[0] || '?').toUpperCase()}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.nomComplet || 'Utilisateur sans nom'}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleText}>Utilisateur</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => router.push(`/client/Editutilisateur?id=${item.id}`)}
        >
          <MaterialIcons name="edit" size={18} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={() => {
            Alert.alert(
              'Réinitialiser mot de passe',
              `Envoyer un email de réinitialisation à ${item.email}?`,
              [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Envoyer', onPress: () => sendPasswordReset(item.email) }
              ]
            );
          }}
        >
          <MaterialIcons name="lock-reset" size={18} color="#F59E0B" />
        </TouchableOpacity>
        <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );

  const renderListHeader = () => (
    <View>
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un utilisateur..."
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
      <Text style={styles.title}>Utilisateurs</Text>
      {renderListHeader()}
      
      {loading ? (
        <ActivityIndicator size="large" color="#FF6A88" style={styles.loader} />
      ) : filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="person-outline" size={48} color="#CBD5E1" />
          <Text style={styles.emptyText}>
            {searchQuery ? "Aucun utilisateur ne correspond à votre recherche" : "Aucun utilisateur trouvé"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
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
    alignItems: 'center',
    marginBottom: 16,
  },
  sortText: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
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
  userCard: {
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5EDFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  roleTag: {
    backgroundColor: '#E5EDFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
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
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
  },
  resetButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
  },
});