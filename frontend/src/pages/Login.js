
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleLogin(event) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/api/auth/login", {
                username,
                password
            });

            login(response.data.accessToken);
            navigate("/");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Invalid username or password."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
    <div className="auth-card">
        
                <h2>User Login</h2>

                <form onSubmit={handleLogin}>
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
{error && <p className="auth-error">{error}</p>}
                 

                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p>
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
