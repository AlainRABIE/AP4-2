import { getAuth } from 'firebase/auth';
import { getUserData } from './auth';
import app from '../firebase/firebaseConfig';

export const getCurrentUserRole = async (): Promise<string | null> => {
  const auth = getAuth(app);
  const user = auth.currentUser;
  
  if (!user) {
    return null;
  }
  
  try {
    const userData = await getUserData(user.uid);
    return userData?.role || null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
};

export const hasRole = async (role: string): Promise<boolean> => {
  const userRole = await getCurrentUserRole();
  return userRole === role;
};

export const isAdmin = async (): Promise<boolean> => {
  return await hasRole('admin');
};

export const isCoach = async (): Promise<boolean> => {
  return await hasRole('coach');
};

export const handleRoleBasedRedirection = async (router: any): Promise<void> => {
  try {
    const userRole = await getCurrentUserRole();
    
    if (userRole === 'coach') {
      router.replace('/coach/Forfait');
    }
    
  } catch (error) {
    console.error('Error during role-based redirection:', error);
  }
};
