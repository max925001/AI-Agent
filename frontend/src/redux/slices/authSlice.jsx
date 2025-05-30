import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axiosInstance from "../../helpers/axiosInstance";

const initialState = {
  isLoggedIn: localStorage.getItem('isLoggedIn') === 'true' || false,
  data: JSON.parse(localStorage.getItem('data')) || {},
  role: localStorage.getItem('role') || "",
  assistantResponse: null, // New state to store assistant response
  assistantLoading: false, // New state to track loading status
  assistantError: null, // New state to track errors
};

export const createAccount = createAsyncThunk("/auth/signup", async (data) => {
  try {
    const res = axiosInstance.post("user/register", data);
    toast.promise(res, {
      loading: "Creating your account...",
      success: (response) => response?.data?.message || "Account created successfully",
      error: "Failed to create account",
    });
    return (await res).data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Something went wrong");
    throw error;
  }
});

export const login = createAsyncThunk("/auth/login", async (data) => {
  try {
    const res = axiosInstance.post("user/login", data);
    toast.promise(res, {
      loading: "Authenticating...",
      success: (response) => response?.data?.message || "Logged in successfully",
      error: "Failed to log in",
    });
    return (await res).data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Something went wrong");
    throw error;
  }
});

export const logout = createAsyncThunk("/auth/logout", async () => {
  try {
    const res = axiosInstance.post("user/logout");
    toast.promise(res, {
      loading: "Logging out...",
      success: (response) => response?.data?.message || "Logged out successfully",
      error: "Failed to log out",
    });
    return (await res).data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Something went wrong");
    throw error;
  }
});

export const getUserData = createAsyncThunk("/user/details", async () => {
  try {
    const res = await axiosInstance.get("user/getuserdetails");
    return res.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to fetch user data");
    throw error;
  }
});

export const updateAssistant = createAsyncThunk("/user/updateAssistant", async (data) => {
  try {
    const res = axiosInstance.put("user/updateuserdetails", data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    toast.promise(res, {
      loading: "Updating assistant details...",
      success: (response) => response?.data?.message || "Assistant updated successfully",
      error: "Failed to update assistant",
    });
    return (await res).data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Something went wrong");
    throw error;
  }
});

export const askAssistant = createAsyncThunk("/assistant/ask", async (command) => {
  try {
    const res = await axiosInstance.post("user/asktoassistant", { command });
    return res.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.response || "Failed to get assistant response";
    toast.error(errorMessage);
    throw error;
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAssistantResponse: (state) => {
      state.assistantResponse = null;
      state.assistantError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAccount.fulfilled, (state, action) => {
        if (action?.payload?.user) {
          localStorage.setItem("data", JSON.stringify(action.payload.user));
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("role", "USER");
          state.isLoggedIn = true;
          state.data = action.payload.user;
          state.role = "USER";
        } else {
          localStorage.removeItem("data");
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("role");
          state.isLoggedIn = false;
          state.data = {};
          state.role = "";
        }
      })
      .addCase(login.fulfilled, (state, action) => {
        if (action?.payload?.user) {
          localStorage.setItem("data", JSON.stringify(action.payload.user));
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("role", "USER");
          state.isLoggedIn = true;
          state.data = action.payload.user;
          state.role = "USER";
        } else {
          localStorage.removeItem("data");
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("role");
          state.isLoggedIn = false;
          state.data = {};
          state.role = "";
        }
      })
      .addCase(logout.fulfilled, (state) => {
        localStorage.clear();
        state.isLoggedIn = false;
        state.data = {};
        state.role = "";
        state.assistantResponse = null;
        state.assistantError = null;
      })
      .addCase(getUserData.fulfilled, (state, action) => {
        if (!action?.payload?.user) return;

        localStorage.setItem("data", JSON.stringify(action.payload.user));
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", "USER");
        state.isLoggedIn = true;
        state.data = action.payload.user;
        state.role = "USER";
      })
      .addCase(updateAssistant.fulfilled, (state, action) => {
        if (action?.payload?.user) {
          localStorage.setItem("data", JSON.stringify(action.payload.user));
          state.data = action.payload.user;
        }
      })
      .addCase(askAssistant.pending, (state) => {
        state.assistantLoading = true;
        state.assistantError = null;
        state.assistantResponse = null;
      })
      .addCase(askAssistant.fulfilled, (state, action) => {
        state.assistantLoading = false;
        state.assistantResponse = action.payload;
        state.assistantError = null;
      })
      .addCase(askAssistant.rejected, (state, action) => {
        state.assistantLoading = false;
        state.assistantResponse = null;
        state.assistantError = action.error.message;
      });
  },
});

export const { clearAssistantResponse } = authSlice.actions;
export default authSlice.reducer;