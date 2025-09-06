import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@shared/schema';

interface UserState {
  currentUser: User | null;
  isLoading: boolean;
}

const initialState: UserState = {
  currentUser: null,
  isLoading: true,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.isLoading = false;
    },
  },
});

export const { setUser, setLoading, clearUser } = userSlice.actions;

export default userSlice.reducer;
