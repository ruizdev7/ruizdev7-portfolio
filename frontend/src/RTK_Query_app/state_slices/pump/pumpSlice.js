import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk para obtener las bombas
export const fetchPumps = createAsyncThunk("pump/fetchPumps", async () => {
  const response = await fetch("/api/v1/pumps");
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
});

const pumpSlice = createSlice({
  name: "pump",
  initialState: {
    pumps: [],
    isLoading: false,
    isFetching: false,
    isSuccess: false,
    isError: false,
    error: null,
    lastSyncTime: null,
  },
  reducers: {
    clearPumps: (state) => {
      state.pumps = [];
      state.isSuccess = false;
    },
    setSyncState: (state, action) => {
      state.isFetching = action.payload === "syncing";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPumps.pending, (state) => {
        state.isLoading = true;
        state.isFetching = true;
        state.isError = false;
        state.error = null;
      })
      .addCase(fetchPumps.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isFetching = false;
        state.isSuccess = true;
        state.isError = false;
        state.error = null;
        state.pumps = action.payload.Pumps || [];
        state.lastSyncTime = new Date().toISOString();
      })
      .addCase(fetchPumps.rejected, (state, action) => {
        state.isLoading = false;
        state.isFetching = false;
        state.isSuccess = false;
        state.isError = true;
        state.error = action.error.message;
      });
  },
});

export const { clearPumps, setSyncState } = pumpSlice.actions;
export default pumpSlice.reducer;
