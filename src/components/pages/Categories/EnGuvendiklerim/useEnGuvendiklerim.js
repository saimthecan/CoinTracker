import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from "../../../../../src/context/UserContext";

const API_URL = 'https://calm-harbor-22861-fa5a63bab33f.herokuapp.com/users';

export const useEnGuvendiklerim = () => {
  const [enGuvendiklerimUsers, setEnGuvendiklerimUsers] = useState([]);
  const { addUserToSelected, removeUserFromSelected, isUserSelected } = useContext(UserContext);

  // Fetch users belonging to 'en_güvendiklerim' category
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(API_URL);
        const users = response.data;
        const enGuvendiklerim = users.filter((user) => user.category === 'en_güvendiklerim');
        setEnGuvendiklerimUsers(enGuvendiklerim);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Handle toggling favorite status
  const handleToggleFavorite = (user) => {
    if (isUserSelected(user._id)) {
      removeUserFromSelected(user._id);
    } else {
      addUserToSelected(user);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      try {
        await axios.delete(`${API_URL}/${userId}`);
        setEnGuvendiklerimUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      } catch (error) {
        console.error('Kullanıcı silinirken hata oluştu:', error);
      }
    }
  };

  // Handle adding a new user
  const handleAddUser = async (newUser) => {
    try {
      const response = await axios.post(API_URL, newUser);
      const addedUser = response.data;
      setEnGuvendiklerimUsers((prevUsers) => [...prevUsers, addedUser]);
    } catch (error) {
      console.error('Kullanıcı eklenirken hata oluştu:', error);
    }
  };

  return {
    enGuvendiklerimUsers,
    handleToggleFavorite,
    handleDeleteUser,
    handleAddUser,
    isUserSelected, 
  };
};
