import { combineReducers, createSlice } from '@reduxjs/toolkit';

const appSlice = createSlice({
  name: 'app',
  initialState: {},
  reducers: {},
});

export const rootReducer = combineReducers({
  app: appSlice.reducer,
});