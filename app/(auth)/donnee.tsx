import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, ScrollView, View, Text, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { TextInput, Button, Surface } from 'react-native-paper';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useRouter, router } from 'expo-router';
import app from '../../firebase/firebaseConfig';
import { StatusBar } from 'expo-status-bar';

const db = getFirestore(app);
const auth = getAuth(app);

const ProfileSetup = () => {
    const [nomComplet, setNomComplet] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            router.replace('/login');
        }
    }, []);

    const handleSaveProfile = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Erreur', 'Aucun utilisateur trouvé.');
            return;
        }

        if (!nomComplet.trim()) {
            Alert.alert('Attention', 'Veuillez saisir votre nom complet');
            return;
        }

        setLoading(true);
        try {
            const userData = {
                nomComplet: nomComplet.trim(),
                email: user.email || '',
                id: user.uid,
                role: 'utilisateur', 
                dateCreation: new Date(),
                dateModification: new Date(),
                derniereConnexion: new Date(),
                derniereModification: new Date(),
            };

            await setDoc(
                doc(db, 'utilisateurs', user.uid),
                userData,
                { merge: true }
            );

            console.log('Profil enregistré:', userData);
            router.replace('/ProfileData');
            Alert.alert('Succès', 'Profil mis à jour avec succès!');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue.';
            Alert.alert('Erreur', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
            keyboardVerticalOffset={100}
        >
            <StatusBar style="auto" />
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <Surface style={styles.card}>
                    <Text style={styles.title}>Complétez votre Profil</Text>

                    <TextInput
                        label="Nom Complet"
                        value={nomComplet}
                        onChangeText={setNomComplet}
                        style={styles.input}
                        mode="outlined"
                        outlineColor="#5E72E4"
                        activeOutlineColor="#5E72E4"
                        left={<TextInput.Icon icon="account" />}
                        autoCapitalize="words"
                    />

                    {loading ? (
                        <ActivityIndicator animating={true} color="#5E72E4" size="large" style={styles.loader} />
                    ) : (
                        <Button
                            mode="contained"
                            onPress={handleSaveProfile}
                            style={styles.button}
                            buttonColor="#5E72E4"
                            disabled={loading}
                        >
                            Enregistrer
                        </Button>
                    )}
                </Surface>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        padding: 24,
        borderRadius: 12,
        width: '95%',
        maxWidth: 500,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    title: {
        fontSize: 28,
        marginBottom: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#1A365D',
    },
    input: {
        width: '100%',
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    button: {
        marginTop: 20,
        width: '100%',
        paddingVertical: 6,
        borderRadius: 8,
    },
    loader: {
        marginTop: 20,
    },
});

export default ProfileSetup;