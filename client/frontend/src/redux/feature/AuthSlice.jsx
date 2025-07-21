import { createSlice} from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
    initialState: {
        loading: false,
        user: null,
    },
    reducers: {
        loadingStatus: (state, action) => {
            state.loading = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        
    }
});
const jobSlice = createSlice({
  name: 'job',
  initialState: {
    job: null,
  },
  reducers: {
    setJob: (state, action) => {
      state.job = action.payload;
    }
}
});


export const { loadingStatus, setUser } = authSlice.actions;
export const { setJob } = jobSlice.actions;
export const jobReducer = jobSlice.reducer;
export const authReducer = authSlice.reducer;