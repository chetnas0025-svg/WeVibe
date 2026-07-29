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

  const login = (usernameOrEmail, password) => {
    // Default system credentials: user123 / pass123 or registered users
    if (
      (usernameOrEmail === 'user123' || usernameOrEmail === 'user@wevibes.com') &&
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
      localStorage.setItem('wevibes_user', JSON.stringify(userData));
      return { success: true };
    }

    // Check stored accounts from register
    const registeredUsers = JSON.parse(localStorage.getItem('wevibes_registered_users') || '[]');
    const matched = registeredUsers.find(
      u => (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password
    );

    if (matched) {
      const { password: _, ...userData } = matched;
      setUser(userData);
      localStorage.setItem('wevibes_user', JSON.stringify(userData));
      return { success: true };
    }

    return { success: false, message: 'Invalid username or password. Try user123 / pass123.' };
  };

  const register = (userData) => {
    const registeredUsers = JSON.parse(localStorage.getItem('wevibes_registered_users') || '[]');
    registeredUsers.push(userData);
    localStorage.setItem('wevibes_registered_users', JSON.stringify(registeredUsers));
    
    const { password: _, ...safeUser } = userData;
    setUser(safeUser);
    localStorage.setItem('wevibes_user', JSON.stringify(safeUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('wevibes_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
