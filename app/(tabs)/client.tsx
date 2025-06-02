"";

import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

type Utilisateur = {
  id: string;
  nomComplet: string;
  email: string;
  age?: number;
  poids?: number;
  taille?: number;
  sexe?: string;
  departement?: string;
  abonnement?: string;
  urlAvatar?: string;
  derniereConnexion?: any;
};

export default function UtilisateursScreen() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchUtilisateurs() {
      try {
        setLoading(true);
        
        const utilisateursRef = collection(db, 'utilisateurs');
        const q = query(utilisateursRef, where("role", "==", "utilisateur"));
        const querySnapshot = await getDocs(q);
        
        const utilisateursData: Utilisateur[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          utilisateursData.push({
            id: doc.id,
            nomComplet: data.nomComplet || 'Sans nom',
            email: data.email || 'Pas d\'email',
            age: data.age,
            poids: data.poids,
            taille: data.taille,
            sexe: data.sexe,
            departement: data.departement,
            abonnement: data.abonnement,
            urlAvatar: data.urlAvatar,
            derniereConnexion: data.derniereConnexion,
          });
        });
        
        setUtilisateurs(utilisateursData);
      } catch (err) {
        console.error("Erreur lors de la récupération des utilisateurs:", err);
        setError("Impossible de charger les utilisateurs");
      } finally {
        setLoading(false);
      }
    }

    fetchUtilisateurs();
  }, []);

  const filteredUtilisateurs = utilisateurs.filter(user => 
    user.nomComplet.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.departement && user.departement.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Jamais connecté';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const getAvatarSource = (urlAvatar: string | undefined) => {
    return urlAvatar && urlAvatar.length > 0
      ? { uri: urlAvatar }
      : require('../../assets/images/default-avatar.png');
  };

  const renderUtilisateur = ({ item }: { item: Utilisateur }) => (
    <View style={styles.userCard}>
      <View style={styles.avatarContainer}>
        <Image 
          source={getAvatarSource(item.urlAvatar)}
          style={styles.avatar}
          defaultSource={require('../../assets/images/default-avatar.png')}
        />
        {item.abonnement && (
          <View style={[
            styles.abonnementBadge, 
            item.abonnement === "plus" ? styles.abonnementPlus : styles.abonnementBasic
          ]}>
            <Text style={styles.abonnementText}>{item.abonnement}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.nomComplet}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        
        <View style={styles.detailsContainer}>
          {item.age && (
            <Text style={styles.detailText}>{item.age} ans</Text>
          )}
          {item.sexe && (
            <Text style={styles.detailText}>{item.sexe === 'homme' ? '♂️' : '♀️'} {item.sexe}</Text>
          )}
          {item.departement && (
            <Text style={styles.detailText}>📍 {item.departement}</Text>
          )}
        </View>
        
        {item.poids && item.taille && (
          <Text style={styles.physicalInfo}>
            {item.poids} kg • {item.taille} cm
          </Text>
        )}
        
        <Text style={styles.lastConnection}>
          Dernière connexion: {formatDate(item.derniereConnexion)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Liste des Utilisateurs</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher un utilisateur..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        clearButtonMode="while-editing"
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
            }}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.resultCount}>{filteredUtilisateurs.length} utilisateurs trouvés</Text>
          <FlatList
            data={filteredUtilisateurs}
            renderItem={renderUtilisateur}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
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
    color: '#3b82f6',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultCount: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  listContent: {
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e5e7eb',
  },
  abonnementBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  abonnementPlus: {
    backgroundColor: '#4f46e5', 
  },
  abonnementBasic: {
    backgroundColor: '#10b981', 
  },
  abonnementText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  physicalInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  lastConnection: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});