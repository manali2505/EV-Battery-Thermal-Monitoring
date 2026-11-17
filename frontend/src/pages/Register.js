
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    async function handleRegister(event) {
        event.preventDefault();

        setMessage("");
        setError("");

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/api/auth/register", {
                username,
                password
            });

            setMessage(
                response.data.message || "Registration successful! Please log in."
            );

            setUsername("");
            setPassword("");

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Registration failed. Please try another username."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
    <div className="auth-card">
      
                <h2>Create Account</h2>

                <form onSubmit={handleRegister}>
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
                        minLength="8"
                    />

                    {message && <p className="auth-success">{message}</p>}

{error && <p className="auth-error">{error}</p>}

                   
                    <button type="submit" disabled={loading}>
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <p>
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
