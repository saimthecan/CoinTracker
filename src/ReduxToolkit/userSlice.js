import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchUserByToken = createAsyncThunk(
  'user/fetchByToken',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get('https://cointracker-backend-7786c0daa55a.herokuapp.com/api/user', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Unable to fetch user');
    }
  }
);

export const loginUser = createAsyncThunk(
  'user/login',
  async ({ username, password }, { rejectWithValue }) => { // dispatch'i kaldırdık
    try {
      const response = await axios.post('https://cointracker-backend-7786c0daa55a.herokuapp.com/login', {
        username,
        password,
      });
      if (response.data && response.data.token) {
        const userData = {
          username: response.data.username, // doğrudan username bilgisini alıyoruz
          token: response.data.token,
          userId: response.data.userId, // userId'yi de ekliyoruz
        };
        // dispatch(setUser(userData)); // Bunu kaldırıyoruz
        localStorage.setItem('user', JSON.stringify(userData));
        return userData; // response.data yerine userData'yı return ediyoruz
      } else {
        throw new Error('No user data returned');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { dispatch }) => {
    // localStorage'dan kullanıcı bilgisini sil
    localStorage.removeItem('user');

    // Redux state'ini temizle
    dispatch(clearUser());
  }
);

const initialState = {
  user: null,
  token: null,
  userId: null,
  status: 'idle',
  role: null,
  isAuthenticated: false,
  isLoading: true, // Başlangıçta false yapıyoruz
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.username;
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      state.role = action.payload.role;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      state.userId = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setAuthLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.username;
        state.token = action.payload.token;
        state.userId = action.payload.userId;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload || 'Login failed';
        state.isLoading = false;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.userId = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload || 'Logout failed';
        state.isLoading = false;
      })
      .addCase(fetchUserByToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserByToken.fulfilled, (state, action) => {
        state.user = action.payload.username;
        state.token = action.payload.token;
        state.userId = action.payload.userId;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchUserByToken.rejected, (state, action) => {
        state.error = action.payload || 'Fetch user failed';
        state.isLoading = false;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, clearUser, setAuthLoading } = userSlice.actions;
export default userSlice.reducer;
