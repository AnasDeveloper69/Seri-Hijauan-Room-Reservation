import { useState } from "react";
import { KeyboardAvoidingView, Platform, View, StyleSheet, Text, TouchableOpacity, Alert, TouchableWithoutFeedback, Keyboard, ScrollView } from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import { useRouter } from "expo-router";
import { Account, ID } from "react-native-appwrite";
import { client } from "../appwrite";

export default function AuthScreen() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [secureText, setSecureText] = useState(true);
    const [errors, setErrors] = useState({ username: "", email: "", password: "" });

    // Clear form when switching auth modes
    const clearForm = () => {
        setUsername("");
        setEmail("");
        setPassword("");
        setErrors({ username: "", email: "", password: "" });
    };

    // Validate username
    const validateUsername = (username: string) => {
        return username.length >= 3;
    };

    // Validate email format (only for signup)
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Validate password strength
    const validatePassword = (password: string) => {
        return password.length >= 8;
    };

    // Handle form validation
    const validateForm = () => {
        let valid = true;
        const newErrors = { username: "", email: "", password: "" };

        if (!username.trim()) {
            newErrors.username = "Username is required";
            valid = false;
        } else if (!validateUsername(username)) {
            newErrors.username = "Username must be at least 3 characters";
            valid = false;
        }

        // Email is only required for signup
        if (!isLogin) {
            if (!email.trim()) {
                newErrors.email = "Email is required";
                valid = false;
            } else if (!validateEmail(email)) {
                newErrors.email = "Please enter a valid email";
                valid = false;
            }
        }

        if (!password.trim()) {
            newErrors.password = "Password is required";
            valid = false;
        } else if (!validatePassword(password)) {
            newErrors.password = "Password must be at least 8 characters";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    // Handle user registration
    const handleSignUp = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const account = new Account(client);
            
            // Check if there's an active session and delete it
            try {
                await account.deleteSession('current');
            } catch (error) {
                // No active session, continue with registration
            }
            
            // Create account with email (Appwrite requires email)
            await account.create(
                ID.unique(),
                email.trim(),
                password,
                username.trim() // Username is stored as the name
            );

            // Auto login after registration
            await account.createEmailPasswordSession(email.trim(), password);
            
            Alert.alert("Success", "Account created successfully!");
            router.push("/(tabs)/home");
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to create account");
            console.error("Sign up error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle user login with username
    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const account = new Account(client);
            
            // Check if there's an active session and delete it
            try {
                await account.deleteSession('current');
            } catch (error) {
                // No active session, continue with login
            }
            
            // For login, we need to convert username to email
            // Since Appwrite requires email for login, you'll need to either:
            // 1. Store username-email mapping in your database
            // 2. Ask users to enter email during login
            // For now, we'll treat username as email
            const loginEmail = username.includes('@') ? username : `${username}@yourdomain.com`;
            
            await account.createEmailPasswordSession(loginEmail.trim(), password);
            
            Alert.alert("Success", "Logged in successfully!");
            router.push("/(tabs)/home");
        } catch (error: any) {
            Alert.alert("Error", "Invalid username or password");
            console.error("Login error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Toggle between login and signup
    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        clearForm();
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView style={styles.container}>
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        <Text style={styles.title}>
                            {isLogin ? "Welcome Back" : "Create Account"}
                        </Text>
                        <Text style={styles.subtitle}>
                            {isLogin 
                                ? "Sign in to continue" 
                                : "Sign up to get started"}
                        </Text>

                        <TextInput
                            label="Email"
                            value={username}
                            onChangeText={(text) => {
                                setUsername(text);
                                setErrors({ ...errors, username: "" });
                            }}
                            autoCapitalize="none"
                            placeholder="johndoe"
                            mode="outlined"
                            style={styles.input}
                            error={!!errors.username}
                            disabled={loading}
                            onSubmitEditing={Keyboard.dismiss}
                            returnKeyType="next"
                        />
                        <HelperText type="error" visible={!!errors.username}>
                            {errors.username}
                        </HelperText>

                        {!isLogin && (
                            <>
                                <TextInput
                                    label="Email"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        setErrors({ ...errors, email: "" });
                                    }}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    placeholder="john@example.com"
                                    mode="outlined"
                                    style={styles.input}
                                    error={!!errors.email}
                                    disabled={loading}
                                    onSubmitEditing={Keyboard.dismiss}
                                    returnKeyType="next"
                                />
                                <HelperText type="error" visible={!!errors.email}>
                                    {errors.email}
                                </HelperText>
                            </>
                        )}

                        <TextInput
                            label="Password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setErrors({ ...errors, password: "" });
                            }}
                            autoCapitalize="none"
                            placeholder="Enter your password"
                            mode="outlined"
                            secureTextEntry={secureText}
                            right={
                                <TextInput.Icon
                                    icon={secureText ? "eye-off" : "eye"}
                                    onPress={() => setSecureText(!secureText)}
                                />
                            }
                            style={styles.input}
                            error={!!errors.password}
                            disabled={loading}
                            onSubmitEditing={isLogin ? handleLogin : handleSignUp}
                            returnKeyType="done"
                        />
                        <HelperText type="error" visible={!!errors.password}>
                            {errors.password}
                        </HelperText>

                        <Button
                            mode="contained"
                            onPress={isLogin ? handleLogin : handleSignUp}
                            style={styles.btnLogin}
                            loading={loading}
                            disabled={loading}
                        >
                            {isLogin ? "Login" : "Sign Up"}
                        </Button>

                        <View style={styles.toggleContainer}>
                            <Text style={styles.toggleText}>
                                {isLogin ? "New User? " : "Already have an account? "}
                            </Text>
                            <TouchableOpacity onPress={toggleAuthMode} disabled={loading}>
                                <Text style={styles.toggleLink}>
                                    {isLogin ? "Sign Up" : "Login"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#111827",
    },
    subtitle: {
        fontSize: 16,
        color: "#6B7280",
        marginBottom: 32,
    },
    input: {
        marginBottom: 4,
        backgroundColor: "#FFFFFF",
    },
    btnLogin: {
        backgroundColor: "#2563EB",
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 16,
    },
    toggleContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 24,
        alignItems: "center",
    },
    toggleText: {
        color: "#6B7280",
        fontSize: 14,
    },
    toggleLink: {
        color: "#2563EB",
        fontSize: 14,
        fontWeight: "600",
    },
});