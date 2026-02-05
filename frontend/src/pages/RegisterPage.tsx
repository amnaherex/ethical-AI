import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
    Mail, 
    Lock, 
    User, 
    Eye, 
    EyeOff, 
    ShieldCheck, 
    Loader2 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// shadcn UI components
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();

    // Logic preserved exactly: individual state hooks
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Logic preserved exactly: identical handleSubmit implementation
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);

        try {
            await register(email, password, name);
            navigate('/dashboard');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(135deg,#0a0a0f_0%,#1a1a2e_50%,#0a0a0f_100%)] relative overflow-hidden py-16 px-4">
            {/* Background radial glow - mapping the MUI ::before logic */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(118,75,162,0.15)_0%,transparent_70%)] rounded-full pointer-events-none" />
            
            <div className="w-full max-w-sm z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] mb-4 shadow-lg shadow-indigo-500/20">
                        <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent pb-1">
                        Create Account
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">Join the Ethical AI Platform</p>
                </div>

                <Card className="bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-[20px] border-white/10 shadow-2xl">
                    <CardContent className="p-8">
                        <h2 className="text-xl font-semibold mb-6 text-white">Sign Up</h2>

                        {error && (
                            <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-900/50">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                                <Input
                                    placeholder="Full Name"
                                    className="pl-10 bg-transparent border-white/10 text-white focus-visible:ring-indigo-500"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                                <Input
                                    type="email"
                                    placeholder="Email"
                                    className="pl-10 bg-transparent border-white/10 text-white focus-visible:ring-indigo-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    className="pl-10 pr-10 bg-transparent border-white/10 text-white focus-visible:ring-indigo-500"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                                <p className="text-[12px] text-slate-500 mt-1 ml-1">Minimum 8 characters</p>
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Confirm Password"
                                    className="pl-10 bg-transparent border-white/10 text-white focus-visible:ring-indigo-500"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-lg shadow-indigo-600/20"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-slate-400">Already have an account? </span>
                            <RouterLink 
                                to="/login" 
                                className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                Sign In
                            </RouterLink>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}