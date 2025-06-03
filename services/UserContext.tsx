import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

export interface User {
  uid: string;
  email: string;
  nomComplet?: string;
  departement?: string;
  poids?: string;
  taille?: string;
  age?: string;
  sexe?: string;
  niveauActivite?: string;
  caloriesNecessaires?: string;
  urlAvatar?: string;
  role?: string;
  ObjectifPas?: number;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "utilisateurs", firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              nomComplet: userData.nomComplet,
              departement: userData.departement,
              poids: userData.poids,
              taille: userData.taille,
              age: userData.age,
              sexe: userData.sexe,
              niveauActivite: userData.niveauActivite,
              caloriesNecessaires: userData.caloriesNecessaires,
              urlAvatar: userData.photoURL || userData.urlAvatar,
              role: userData.role,
              ObjectifPas: userData.ObjectifPas
            });
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
            });
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur:", error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};