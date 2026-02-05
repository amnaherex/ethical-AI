    import React, { useState } from 'react';
    import { useNavigate, Link } from 'react-router-dom';
    import { 
        ShieldCheck, 
        Mail, 
        Lock, 
        Eye, 
        EyeOff, 
        Loader2,
        ArrowRight,
    } from 'lucide-react';

    import { useAuth } from '../contexts/AuthContext';
    import { Button } from "../components/ui/button";
    import { Input } from "../components/ui/input";
    import { Label } from "../components/ui/label";
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
    import { Alert, AlertDescription } from "../components/ui/alert";

    export default function LoginPage() {
        // Navigation hook - allows us to redirect users after login
        const navigate = useNavigate();
        
        // Authentication hook - provides login function from context
        const { login } = useAuth();

        // Form state management - tracks user input
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        
        // UI state - controls password visibility toggle
        const [showPassword, setShowPassword] = useState(false);
        
        // Error handling state - displays error messages to user
        const [error, setError] = useState('');
        
        // Loading state - shows spinner during API call
        const [isLoading, setIsLoading] = useState(false);

        /**
         * Handles form submission
         * @param e - Form event to prevent default browser behavior
         */
        const handleSubmit = async (e: React.FormEvent) => {
            // Prevent page reload on form submit
            e.preventDefault();
            
            // Clear any previous errors
            setError('');
            
            // Show loading spinner
            setIsLoading(true);

            try {
                // Attempt to log in with provided credentials
                await login(email, password);
                
                // On success, redirect to dashboard
                navigate('/dashboard');
            } catch (err: unknown) {
                // On failure, show error message
                setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
            } finally {
                // Always hide loading spinner after attempt
                setIsLoading(false);
            }
        };

        return (
        <div className='w-screen h-screen flex p-2 bg-slate-50'>
            {/* Left Side: Brand Panel (approx 45%) */}
            <div className='hidden lg:flex w-[45%] h-full bg-radial-[at_50%_89%] from-sky-200 via-blue-600 to-indigo-900 items-center justify-between flex-col text-white p-12 rounded-xl shadow-inner'>
                <div className='flex flex-col items-center text-center gap-6 mt-20'>
                    <h1 className='text-6xl font-bold tracking-tight'>Welcome To Ethical AI</h1>
                    <h4 className='text-xl text-sky-100 opacity-90'>Engineering Trust into Every Prediction</h4>
                </div>

                {/* Bottom Glass Card */}
                <div className='glass-card p-8 mb-10 text-center max-w-md'>
                    <p className='font-medium leading-relaxed'>
                        The comprehensive Ethical AI Requirements Engineering Platform.
                        Validate your models for fairness, transparency, and privacy ensuring accountability from development to deployment.
                    </p>
                </div>
            </div>

            {/* Right Side: Login Form (approx 55%) */}
            <div className='flex-1 h-full flex items-center justify-center p-4'>
                <Card className='w-full max-w-[500px] border-none shadow-2xl py-8'>
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className='text-3xl font-bold tracking-tight'>Welcome Back!</CardTitle>
                        <CardDescription className='text-muted-foreground'>
                            Add Your Details To Login
                        </CardDescription>
                    </CardHeader>

                    <CardContent className='flex flex-col items-center pt-6'>
                        {error && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className='w-[85%] flex flex-col gap-6'>
                            <div className="space-y-2">
                                <Label htmlFor="Email">Email address</Label>
                                <Input 
                                    type="email" 
                                    id="Email" 
                                    placeholder="workmail@gmail.com"
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    className='border-slate-200 focus:ring-blue-500' 
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="Password">Password</Label>
                                    <Link to="#" className="text-xs text-blue-600 hover:underline">Forgot Password?</Link>
                                </div>
                                <div className='relative'>
                                    <Input 
                                        type={showPassword ? "text" : "password"} 
                                        id="Password" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        className='border-slate-200 pr-10' 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)} 
                                        className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                disabled={isLoading}
                                className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 mt-2'
                            >
                                {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Log in"}
                            </Button>
                        </form>
                        
                        <p className="mt-6 text-sm text-slate-500">
                            Don't have an account? <Link to="/Register" className="text-blue-600 font-semibold hover:underline">Sign up</Link>
                        </p>    
                    </CardContent>
                </Card>
            </div>
        </div>
    );
    }