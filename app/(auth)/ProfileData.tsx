import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { TextInput, Button, RadioButton } from 'react-native-paper';
import { getFirestore, doc, updateDoc, Timestamp, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { saveUserProfile } from '../../services/calorie';
import app from '../../firebase/firebaseConfig';
import { useRouter } from 'expo-router';

const db = getFirestore(app);
const auth = getAuth(app);

const ProfileData = () => {
    const router = useRouter();
    const [poids, setPoids] = useState('');
    const [taille, setTaille] = useState('');
    const [age, setAge] = useState('');
    const [sexe, setSexe] = useState('homme');
    const [niveauActivite, setNiveauActivite] = useState('sedentaire');
    const [nomComplet, setNomComplet] = useState('');
    const [objectifPas, setObjectifPas] = useState('10000');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = auth.currentUser;
                if (!user) {
                    Alert.alert('Erreur', 'Aucun utilisateur connecté.');
                    return;
                }

                const userDocRef = doc(db, 'utilisateurs', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData.nomComplet) {
                        setNomComplet(userData.nomComplet);
                    }
                    
                    if (userData.poids) setPoids(userData.poids.toString());
                    if (userData.taille) setTaille(userData.taille.toString());
                    if (userData.age) setAge(userData.age.toString());
                    if (userData.sexe) setSexe(userData.sexe);
                    if (userData.niveauActivite) setNiveauActivite(userData.niveauActivite);
                    if (userData.ObjectifPas) setObjectifPas(userData.ObjectifPas.toString());
                }
            } catch (error: any) {
                console.error("Erreur lors de la récupération du profil:", error);
            }
        };

        fetchUserData();
    }, []);

    const handleSaveProfile = async () => {
        try {
            if (!poids || !taille || !age) {
                Alert.alert('Erreur', 'Tous les champs doivent être remplis.');
                return;
            }

            const user = auth.currentUser;
            if (!user) {
                Alert.alert('Erreur', 'Aucun utilisateur connecté.');
                return;
            }

            const userNomComplet = nomComplet || 'Utilisateur';
            
            const caloriesNecessaires = await saveUserProfile(
                userNomComplet, 
                poids,
                taille,
                age,
                sexe,
                niveauActivite
            );

            const userDocRef = doc(db, 'utilisateurs', user.uid);
            await updateDoc(userDocRef, {
                poids: parseFloat(poids), 
                taille: parseFloat(taille), 
                age: parseInt(age, 10), 
                sexe: sexe,
                niveauActivite: niveauActivite,
                caloriesNecessaires: caloriesNecessaires,
                ObjectifPas: parseInt(objectifPas, 10) || 10000,
                derniereModification: Timestamp.fromDate(new Date()), 
            });

            Alert.alert('Succès', `Votre besoin calorique quotidien est de ${caloriesNecessaires} kcal.`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            router.push({
                                pathname: "/home",
                                params: { calories: caloriesNecessaires }
                            });
                        }
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert('Erreur', error.message || 'Une erreur est survenue.');
        }
    };

    return (    
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.inner}>
                    <Text style={styles.title}>Complétez vos informations</Text>

                    <TextInput
                        label="Poids (kg)"
                        value={poids}
                        onChangeText={(text) => setPoids(text.replace(/[^0-9]/g, ''))}
                        keyboardType="numeric"
                        style={styles.input}
                    />

                    <TextInput
                        label="Taille (cm)"
                        value={taille}
                        onChangeText={(text) => setTaille(text.replace(/[^0-9]/g, ''))} 
                        keyboardType="numeric"
                        style={styles.input}
                    />

                    <TextInput
                        label="Âge (ans)"
                        value={age}
                        onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))} 
                        keyboardType="numeric"
                        style={styles.input}
                    />

                    <Text style={styles.label}>Sexe</Text>
                    <RadioButton.Group onValueChange={setSexe} value={sexe}>
                        <View style={styles.radioGroup}>
                            <RadioButton.Item label="Homme" value="homme" />
                            <RadioButton.Item label="Femme" value="femme" />
                        </View>
                    </RadioButton.Group>

                    <Text style={styles.label}>Niveau d'activité</Text>
                    <RadioButton.Group onValueChange={setNiveauActivite} value={niveauActivite}>
                        <View style={styles.radioGroup}>
                            <RadioButton.Item label="Sédentaire" value="sedentaire" />
                            <RadioButton.Item label="Légère" value="legere" />
                            <RadioButton.Item label="Modéré" value="moderee" />
                            <RadioButton.Item label="Intense" value="intense" />
                        </View>
                    </RadioButton.Group>

                    <TextInput
                        label="Objectif de pas quotidien"
                        value={objectifPas}
                        onChangeText={(text) => setObjectifPas(text.replace(/[^0-9]/g, ''))}
                        keyboardType="numeric"
                        style={styles.input}
                    />

                    <Button mode="contained" onPress={handleSaveProfile} style={styles.button}>
                        Enregistrer
                    </Button>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        marginBottom: 15,
    },
    label: {
        marginBottom: 5,
        fontSize: 16,
        color: '#555',
    },
    radioGroup: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom: 15,
    },
    button: {
        marginTop: 20,
        width: '100%',
    },
});

export default ProfileData;