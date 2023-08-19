/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  credentials: {
    password: '',
    username: '',
    url: '',
  },
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.credentials = action.payload;
    },
  },
});

export const {
  setCredentials,
} = userSlice.actions;

export default userSlice.reducer;
