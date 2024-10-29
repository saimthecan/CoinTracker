import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSelector } from "react-redux";




export const useAppUser = () => {


  const [AppUserUsers, setAppUserUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state burada ekleniyor

 // Redux store'dan user bilgilerini alıyoruz
 const { userId, token } = useSelector((state) => state.user);


  const API_URL = 'https://cointracker-backend-7786c0daa55a.herokuapp.com/appUser';

 // Kullanıcıya özel influencerları çekmek için kullanılan fetch fonksiyonu
   // Influencer'ları çeken fonksiyon
   const fetchUserInfluencers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/${userId}/influencers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const influencers = response.data.filter(user => user.category !== 'admin'); // Admin influencer'ları filtrele
      setAppUserUsers(influencers);
    } catch (error) {
      console.error('Error fetching influencers:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, token, API_URL]);

    // İlk yüklemede influencer'ları çek
    useEffect(() => {
      if (userId && token) {
        fetchUserInfluencers();
      }
    }, [fetchUserInfluencers, userId, token]);

  

  // Favori durumu toggle etme fonksiyonu
  const handleToggleFavorite = async (user) => {
    try {
      if (user.isFavorite) {
        await axios.delete(`${API_URL}/${userId}/influencers/${user._id}/favorite`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } else {
        await axios.put(`${API_URL}/${userId}/influencers/${user._id}/favorite`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
      // Influencer'ları yeniden çekmek
      await fetchUserInfluencers();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

 // Deleting an influencer
 const handleDeleteUser = async (influencerId) => {
  if (window.confirm('Bu influencerı silmek istediğinize emin misiniz?')) {
    try {
      await axios.delete(
        `${API_URL}/${userId}/influencer/${influencerId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setAppUserUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== influencerId)
      );
      
    } catch (error) {
      console.error('Influencer silinirken hata oluştu:', error);
    }
  }
};


// Adding a new influencer
const handleAddUser = async (newInfluencer) => {
  try {
  
    const response = await axios.post(
      `${API_URL}/${userId}/influencers`, // Corrected URL
      newInfluencer,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    const addedInfluencer = response.data;
    setAppUserUsers((prevUsers) => [...prevUsers, addedInfluencer]);

      // Yeni influencer eklendikten sonra listeyi yeniden fetch et
      await fetchUserInfluencers();
  } catch (error) {
    console.error('Influencer eklenirken hata oluştu:', error);
  }
};

  return {
    AppUserUsers,
    fetchUserInfluencers,
    handleToggleFavorite,
    handleDeleteUser,
    handleAddUser,
    loading,
  };
};
