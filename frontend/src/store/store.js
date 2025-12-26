import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../authSlice';
import allProblemReducer from '../problemSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        allProblems: allProblemReducer
    }
})