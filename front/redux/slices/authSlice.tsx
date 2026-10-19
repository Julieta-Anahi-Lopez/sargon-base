// redux/slices/authSlice.tsx
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthState } from '@/types';

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false
};

// Cargar datos desde localStorage de manera segura
const loadFromStorage = () => {
  if (typeof window === 'undefined') {
    return { token: null, refreshToken: null, user: null };
  }
  
  try {
    const token = localStorage.getItem('auth_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    
    return { token, refreshToken, user };
  } catch {
    return { token: null, refreshToken: null, user: null };
  }
};

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async () => {
    const { token, refreshToken, user } = loadFromStorage();

    if (token && isTokenExpired(token)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      document.cookie = 'auth_token=; path=/; max-age=0';
      return { token: null, refreshToken: null, user: null };
    }

    if (token) {
      // Restore cookie so the middleware recognises the session after a page refresh
      document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    }

    return { token, refreshToken, user };
  }
);

// Acción asíncrona para login
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, clave }: { email: string; clave: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, clave }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.detail || 'Error en el inicio de sesión');
      }

      // Persistir sesión
      localStorage.setItem('auth_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Cookie para que el middleware de Next.js pueda leer el token
      document.cookie = `auth_token=${data.access}; path=/; max-age=${60 * 60 * 24}`;

      return {
        token: data.access,
        refreshToken: data.refresh,
        user: data.user,
      };
    } catch (error) {
      return rejectWithValue('Error de conexión con el servidor');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        // Eliminar cookie de autenticación para el middleware
        document.cookie = 'auth_token=; path=/; max-age=0';
      }
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    restoreAuth: (state) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        const userString = localStorage.getItem('user');

        if (token && userString) {
          state.token = token;
          state.refreshToken = localStorage.getItem('refresh_token') || null;
          state.user = JSON.parse(userString);
          state.isAuthenticated = true;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ token: string; refreshToken: string; user: User }>) => {
        state.loading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Initialize auth cases
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        const { token, refreshToken, user } = action.payload;
        
        if (token && user) {
          state.token = token;
          state.refreshToken = refreshToken;
          state.user = user;
          state.isAuthenticated = true;
        }
        
        state.loading = false;
        state.initialized = true;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.initialized = true;
      });
  },
});

export const { logout, clearError, restoreAuth } = authSlice.actions;
export default authSlice.reducer;