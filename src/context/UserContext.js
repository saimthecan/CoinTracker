// src/context/UserContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);

  const API_URL = "https://calm-harbor-22861-fa5a63bab33f.herokuapp.com";

  // Favori kullanıcıları çekme fonksiyonu
  const fetchFavorites = useCallback(async () => {
    try {
      const response = await axios.get('https://calm-harbor-22861-fa5a63bab33f.herokuapp.com/users?favorite=true');
      console.log('Favori kullanıcılar:', response.data);  // API cevabını burada kontrol ediyoruz
      setSelectedUsers(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  }, []); // Boş bağımlılık dizisi, fonksiyonun sadece bir kez oluşturulmasını sağlar

  // İlk sayfa yüklemesinde favori kullanıcıları çek
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]); // fetchFavorites artık sabit bir fonksiyon referansına sahip

  const addUserToSelected = async (user) => {
    try {
      await axios.put(`https://calm-harbor-22861-fa5a63bab33f.herokuapp.com/users/${user._id}/favorite`);
      fetchFavorites(); // Favori listesini güncelle
    } catch (error) {
      console.error('Error adding user to favorites:', error);
    }
  };

  const removeUserFromSelected = async (userId) => {
    try {
      await axios.delete(`https://calm-harbor-22861-fa5a63bab33f.herokuapp.com/users/${userId}/favorite`);
      fetchFavorites(); // Favori listesini güncelle
    } catch (error) {
      console.error('Error removing user from favorites:', error);
    }
  };

  // Kullanıcının favori olup olmadığını kontrol etme
  const isUserSelected = (userId) => {
    return selectedUsers.some(user => user._id === userId);
  };

  return (
    <UserContext.Provider value={{
      selectedUsers,
      addUserToSelected,
      removeUserFromSelected,
      isUserSelected,
      fetchFavorites  // fetchFavorites fonksiyonunu dışa aktarıyoruz
    }}>
      {children}
    </UserContext.Provider>
  );
};
