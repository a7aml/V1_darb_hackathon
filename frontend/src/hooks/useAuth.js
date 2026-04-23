import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser, signupUser, googleAuth } from "../api/auth";
import { saveSession, clearSession, getUser, getToken } from "../utils/storage";

const useAuth = () => {
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);

  const currentUser = getUser();
  const isLoggedIn  = !!getToken();

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      saveSession(data.token, data.user);
      toast.success(`Welcome back, ${data.user.full_name.split(" ")[0]}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signup = async ({ email, password, full_name }) => {
    setLoading(true);
    try {
      await signupUser({ email, password, full_name });
      toast.success("Account created! Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (googleToken) => {
    setLoading(true);
    try {
      const data = await googleAuth(googleToken);
      saveSession(data.token, data.user);
      toast.success(`Welcome, ${data.user.full_name.split(" ")[0]}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearSession();
    toast.success("Logged out.");
    navigate("/login");
  };

  return { login, signup, loginWithGoogle, logout, loading, currentUser, isLoggedIn };
};

export default useAuth;