import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import app from '../firebase/firebaseConfig';

const auth = getAuth(app);
const db = getFirestore(app);

export const register = async (email: string, password: string, nomComplet: string, departement: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('Utilisateur inscrit avec succès :', user);

    await setDoc(doc(db, 'utilisateurs', user.uid), {
      id: user.uid,
      email: user.email,
      nomComplet: nomComplet,
      role: 'utilisateur', 
      dateCreation: new Date(),
      derniereConnexion: new Date(),
      urlAvatar: '',
    });

    return user;
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription :', error.message);
    throw new Error(error.message);
  }
};

export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Utilisateur connecté avec succès :', user);
    
    const userDocRef = doc(db, 'utilisateurs', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error("Données utilisateur introuvables");
    }
    
    const userData = userDoc.data();
    
    await setDoc(userDocRef, { derniereConnexion: new Date() }, { merge: true });
    
    return {
      authUser: user,
      userData: userData
    };
  } catch (error: any) {
    console.error('Erreur lors de la connexion :', error.message);
    throw new Error(error.message);
  }
};

export const getUserData = async (userId: string) => {
  try {
    const userDocRef = doc(db, 'utilisateurs', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error("Données utilisateur introuvables");
    }
    
    return userDoc.data();
  } catch (error: any) {
    console.error('Erreur lors de la récupération des données utilisateur :', error.message);
    throw new Error(error.message);
  }
};

export const updateUserData = async (userId: string, data: any) => {
  try {
    const userDocRef = doc(db, 'utilisateurs', userId);
    await updateDoc(userDocRef, {
      ...data,
      updatedAt: new Date()
    });
    return true;
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour des données utilisateur :', error.message);
    throw new Error(error.message);
  }
};