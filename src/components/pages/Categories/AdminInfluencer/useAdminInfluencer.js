import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSelector } from "react-redux";



export const useAdminInfluencer = () => {
  const [AdminInfluencerUsers, setAdminInfluencerUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { userId, token, username } = useSelector((state) => state.user);

  const API_URL = 'http://localhost:5000/appUser/admin-influencers';

 // Admin influencerları fetch eden bağımsız bir fonksiyon
 const fetchAdminInfluencers = useCallback(async () => {
  setLoading(true);
  try {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${storedUser.token}`,
      },
    });

    const isAdmin = storedUser.role === "admin";
    const influencersData = response.data.map(influencer => ({
      ...influencer,
      isFavorite: isAdmin ? influencer.isFavorite : false
    }));

    setAdminInfluencerUsers(influencersData);
  } catch (error) {
    console.error('Admin influencerları getirilirken hata oluştu:', error);
  } finally {
    setLoading(false);
  }
}, [API_URL]);


useEffect(() => {
  if (userId && token) {
    fetchAdminInfluencers();
  }
}, [fetchAdminInfluencers, token, userId, username]);
  

  const handleToggleFavorite = async (user) => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const isAdmin = storedUser.role === "admin";
    
    if (!isAdmin) {
      alert("This feature is available for premium users only.");
      return;
    }

    try {
      if (user.isFavorite) {
        await axios.delete(`${API_URL}/${user._id}/favorite`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await axios.put(`${API_URL}/${user._id}/favorite`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      // After toggling, update the local state
      setAdminInfluencerUsers(prevUsers =>
        prevUsers.map(u =>
          u._id === user._id ? { ...u, isFavorite: !u.isFavorite } : u
        )
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        await axios.delete(`${API_URL}/${userId}`, {
          headers: {
            Authorization: `Bearer ${storedUser.token}`,
          },
        });
        setAdminInfluencerUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      } catch (error) {
        console.error('Kullanıcı silinirken hata oluştu:', error);
      }
    }
  };

  const handleAddUser = async (newUser) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const response = await axios.post(API_URL, newUser, {
        headers: {
          Authorization: `Bearer ${storedUser.token}`,
        },
      });
      setAdminInfluencerUsers((prevUsers) => [...prevUsers, response.data]);

         // Yeni influencer eklendikten sonra listeyi güncelle
         await fetchAdminInfluencers();
    } catch (error) {
      console.error('Kullanıcı eklenirken hata oluştu:', error);
    }
  };

  return {
    AdminInfluencerUsers,
    handleToggleFavorite,
    handleDeleteUser,
    handleAddUser,
    loading,
  
  };
};
