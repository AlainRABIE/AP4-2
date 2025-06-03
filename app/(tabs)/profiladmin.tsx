import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import { getAuth, signOut } from 'firebase/auth';
import { getUserData } from '../../services/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from "../../services/UserContext";

export default function ProfileAdmin() {
  const { user } = useUser();
  const router = useRouter();
  const auth = getAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6A88" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#DC2626'; 
      case 'coach':
        return '#2563EB'; 
      default:
        return '#10B981';
    }
  };

  const formatRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'coach':
        return 'Coach';
      default:
        return 'Utilisateur';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <LinearGradient
          colors={['#FF6A88', '#FF8E53']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: user.urlAvatar || 'https://randomuser.me/api/portraits/men/32.jpg' }}
                style={styles.avatar}
              />
            </View>
            <Text style={styles.headerName}>{user.nomComplet || "Utilisateur"}</Text>
            <Text style={styles.headerEmail}>{user.email}</Text>

            <TouchableOpacity style={styles.headerLogoutButton} onPress={handleLogout}>
              <Text style={styles.headerLogoutText}>Déconnexion</Text>
              <Ionicons name="log-out-outline" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.contentContainer}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Informations du compte</Text>
            
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={24} color="#FF6A88" />
              <Text style={styles.infoLabel}>Nom complet</Text>
              <Text style={styles.infoValue}>{user.nomComplet || "Non renseigné"}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={24} color="#FF6A88" />
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={24} color="#FF6A88" />
              <Text style={styles.infoLabel}>Département</Text>
              <Text style={styles.infoValue}>{user.departement || "Non renseigné"}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Rôle utilisateur</Text>
            
            <View style={styles.roleContainer}>
              <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user.role || 'utilisateur') }]}>
                <Ionicons 
                  name={user.role === 'admin' ? "shield-checkmark" : user.role === 'coach' ? "fitness" : "person"} 
                  size={36} 
                  color="#FFF" 
                />
              </View>
              <View style={styles.roleInfo}>
                <Text style={styles.roleName}>{formatRoleText(user.role || 'utilisateur')}</Text>
                <Text style={styles.roleDescription}>
                  {user.role === 'admin' 
                    ? "Accès complet à la gestion de l'application et des utilisateurs" 
                    : user.role === 'coach' 
                      ? "Gestion des programmes d'entraînement et suivi des utilisateurs" 
                      : "Accès aux fonctionnalités standard de l'application"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 16,
    borderRadius: 75,
    padding: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  headerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  headerLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerLogoutText: {
    color: 'white',
    marginRight: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  contentContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 15,
    width: 100,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
  },
  roleBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});