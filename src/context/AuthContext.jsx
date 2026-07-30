import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('wevibes_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
  }, []);

  const login = (identifier, password) => {
    const idClean = identifier.trim();

    // 1. Default system credentials
    if (
      (idClean === 'user123' || idClean === 'user@wevibes.com' || idClean === '9876543210') &&
      password === 'pass123'
    ) {
      const userData = {
        username: 'user123',
        name: 'Rahul Sharma',
        email: 'user@wevibes.com',
        phone: '9876543210',
        joinedDate: 'July 2026'
      };
      setUser(userData);
      localStorage.getItem('wevibes_user')
      localStorage.setItem('wevibes_user', JSON.stringify(userData));
      return { success: true };
    }

    // 2. Check registered accounts list
    const registeredUsers = JSON.parse(localStorage.getItem('wevibes_registered_users') || '[]');
    const matched = registeredUsers.find(
      u => (u.email === idClean || u.phone === idClean || u.username === idClean) && u.password === password
    );

    if (matched) {
      const { password: _, ...userData } = matched;
      setUser(userData);
      localStorage.setItem('wevibes_user', JSON.stringify(userData));
      return { success: true };
    }

    return { success: false, message: 'Invalid credentials. Incorrect email, phone number, or password.' };
  };

  const register = (userData) => {
    const registeredUsers = JSON.parse(localStorage.getItem('wevibes_registered_users') || '[]');
    
    // Check duplicate
    const exists = registeredUsers.some(u => u.email === userData.email || u.phone === userData.phone);
    if (exists) {
      return { success: false, message: 'An account with this email or phone number already exists.' };
    }

    registeredUsers.push(userData);
    localStorage.setItem('wevibes_registered_users', JSON.stringify(registeredUsers));

    const { password: _, ...safeUser } = userData;
    setUser(safeUser);
    localStorage.setItem('wevibes_user', JSON.stringify(safeUser));
    return { success: true };
  };

  const resetPassword = (identifier, newPassword) => {
    const idClean = identifier.trim();
    const registeredUsers = JSON.parse(localStorage.getItem('wevibes_registered_users') || '[]');
    
    const userIndex = registeredUsers.findIndex(
      u => u.email === idClean || u.phone === idClean || u.username === idClean
    );

    if (userIndex !== -1) {
      registeredUsers[userIndex].password = newPassword;
      localStorage.setItem('wevibes_registered_users', JSON.stringify(registeredUsers));
      return { success: true };
    }

    // If demo account user123
    if (idClean === 'user123' || idClean === 'user@wevibes.com' || idClean === '9876543210') {
      const demoUser = {
        username: 'user123',
        name: 'Rahul Sharma',
        email: 'user@wevibes.com',
        phone: '9876543210',
        password: newPassword,
        joinedDate: 'July 2026'
      };
      registeredUsers.push(demoUser);
      localStorage.setItem('wevibes_registered_users', JSON.stringify(registeredUsers));
      return { success: true };
    }

    return { success: false, message: 'No registered account found for this email or phone number.' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('wevibes_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
