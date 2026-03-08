import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get("/auth/me");
                if (response.data?.user) {
                    setUser(response.data.user);
                }
            }
            catch (error) {
                setUser(null); // Not authenticated or invalid token
            }
            finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);
    const signUp = async (email, password, name) => {
        try {
            const response = await api.post("/auth/register", { email, password, name });
            setUser(response.data.user);
            return { error: null };
        }
        catch (error) {
            const msg = error.response?.data?.error || "Signup failed";
            return { error: new Error(msg) };
        }
    };
    const signIn = async (email, password) => {
        try {
            const response = await api.post("/auth/login", { email, password });
            setUser(response.data.user);
            return { error: null };
        }
        catch (error) {
            const msg = error.response?.data?.error || "Invalid login credentials";
            return { error: new Error(msg) };
        }
    };
    const signOut = async () => {
        try {
            await api.post("/auth/logout");
            setUser(null);
        }
        catch (error) {
            console.error("Logout error", error);
        }
    };
    return (<AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>);
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
