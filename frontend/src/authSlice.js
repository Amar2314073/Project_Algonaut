// authSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient'

// localStorage se initial state load karein
const getInitialState = () => {
  const storedAuth = localStorage.getItem('auth');
  if (storedAuth) {
    const parsedAuth = JSON.parse(storedAuth);
    return {
      user: parsedAuth.user || null,
      isAuthenticated: parsedAuth.isAuthenticated || false,
      loading: false,
      error: null
    };
  }
  return {
    user: null,
    isAuthenticated: false,
    loading: true, // Start with loading true
    error: null
  };
};

// Register
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/register', userData);
      const user = response.data.user;
      // Save to localStorage
      localStorage.setItem('auth', JSON.stringify({
        user: user,
        isAuthenticated: true
      }));
      return user;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/login', credentials);
      const user = response.data.user;
      // Save to localStorage
      localStorage.setItem('auth', JSON.stringify({
        user: user,
        isAuthenticated: true
      }));
      return user;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Check Auth
export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/user/check');
      // Save to localStorage
      localStorage.setItem('auth', JSON.stringify({
        user: data.user,
        isAuthenticated: true
      }));
      return data.user;
    } catch (error) {
      // Clear localStorage on auth failure
      localStorage.removeItem('auth');
      return rejectWithValue(error);
    }
  }
);

// Logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/user/logout');
      // Clear localStorage
      localStorage.removeItem('auth');
      return null;
    } catch (error) {
      localStorage.removeItem('auth');
      return rejectWithValue(error);
    }
  }
);

// Update User Profile
export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async (updatedData, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.put('/user/updateProfile', updatedData);
      // Update localStorage
      const storedAuth = localStorage.getItem('auth');
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        authData.user = data.user;
        localStorage.setItem('auth', JSON.stringify(authData));
      }
      return data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
      })

      // Login
      .addCase(loginUser.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
      })

      // Check Auth
      .addCase(checkAuth.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
      })

      // Logout
      .addCase(logoutUser.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
      })

      // Update User
      .addCase(updateUser.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update profile';
      });
  }
});

export default authSlice.reducer;