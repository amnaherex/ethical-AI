import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
 import { Label } from "../components/ui/label";
// Basic UI Components
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card,CardHeader,CardTitle, CardContent, CardDescription } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();

    // State Hooks
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await register(email, password, name);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex w-full h-screen p-2 ">
            {/* Left Side: Brand Panel (approx 45%) */}
           <div className='hidden lg:flex w-[45%] h-full bg-radial-[at_50%_89%] from-sky-200 via-blue-600 to-indigo-900 items-center justify-between flex-col text-white p-12 rounded-xl shadow-inner'>
                <div className='flex flex-col items-center text-center gap-6 mt-20'>
                    <h1 className='text-6xl font-bold'>Ethical AI</h1>
                    <h4 className='text-xl text-sky-100 opacity-90'>Engineering Trust into Every Prediction</h4>
                </div>

                {/* Bottom Glass Card */}
                <div className='glass-card p-8 mb-15 text-center max-w-md'>
                    <p className='font-medium '>
                        The comprehensive Ethical AI Requirements Engineering Platform.
                        Validate your models for fairness, transparency, and privacy ensuring accountability from development to deployment.
                    </p>
                </div>
            </div>
            
            <div className="  flex items-center justify-center flex-1">
                
                {/* Header Section */}
                <Card className="w-[500px] max-width-[800px] border-none  shadow-2xl">
                    <CardHeader className=''>
                        <CardTitle className='text-3xl'>
                            Create Account
                        </CardTitle>
                        <CardDescription>
                            Sign up to get started with Ethical AI
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        
                        {/* Error Handling */}
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            
                            {/* Full Name Field */}
                            <div className='space-y-1'>
                                <Label htmlFor="Name">Full Name</Label>
                                <Input
                                    id='Name'
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Email Field */}
                            <div className="space-y-1">
                                <Label htmlFor="Email">Email</Label>
                                <Input
                                    id="Email"
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Password Field */}
                            <div className="relative space-y-1">
                                    <Label htmlFor="Password">Password</Label>
                                <Input
                                    id="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button 
                                    type="button"
                                    className="absolute right-3 top-7"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Confirm Password Field */}
                            <div className='space-y-1'>
                                <Label htmlFor="ConfirmPassword">Confirm Password</Label>
                                <Input
                                    id="ConfirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-6 mt-2" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin" /> : 'Register'}
                            </Button>

                        </form>

                        {/* Footer Link */}
                        <div className="mt-4 text-center">
                            <p>
                                Already have an account?{" "}
                                <Link to="/login" className="text-blue-600 hover:underline">
                                    Sign In
                                </Link>
                            </p>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}



//     return (
//         <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(135deg,#0a0a0f_0%,#1a1a2e_50%,#0a0a0f_100%)] relative overflow-hidden py-16 px-4">
//             {/* Background radial glow - mapping the MUI ::before logic */}
//             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(118,75,162,0.15)_0%,transparent_70%)] rounded-full pointer-events-none" />
            
//             <div className="w-full max-w-sm z-10">
//                 <div className="text-center mb-8">
//                     <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] mb-4 shadow-lg shadow-indigo-500/20">
//                         <ShieldCheck className="h-8 w-8 text-white" />
//                     </div>
//                     <h1 className="text-4xl font-bold bg-gradient-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent pb-1">
//                         Create Account
//                     </h1>
//                     <p className="text-sm text-slate-400 mt-2">Join the Ethical AI Platform</p>
//                 </div>

//                 <Card className="bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-[20px] border-white/10 shadow-2xl">
//                     <CardContent className="p-8">
//                         <h2 className="text-xl font-semibold mb-6 text-white">Sign Up</h2>

//                         {error && (
//                             <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-900/50">
//                                 <AlertDescription>{error}</AlertDescription>
//                             </Alert>
//                         )}

//                         <form onSubmit={handleSubmit} className="space-y-4">
//                             <div className="relative">
//                                 <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
//                                 <Input
//                                     placeholder="Full Name"
//                                     className="pl-10 bg-transparent border-white/10 text-white focus-visible:ring-indigo-500"
//                                     value={name}
//                                     onChange={(e) => setName(e.target.value)}
//                                     required
//                                 />
//                             </div>

//                             <div className="relative">
//                                 <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
//                                 <Input
//                                     type="email"
//                                     placeholder="Email"
//                                     className="pl-10 bg-transparent border-white/10 text-white focus-visible:ring-indigo-500"
//                                     value={email}
//                                     onChange={(e) => setEmail(e.target.value)}
//                                     required
//                                 />
//                             </div>

//                             <div className="relative">
//                                 <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
//                                 <Input
//                                     type={showPassword ? 'text' : 'password'}
//                                     placeholder="Password"
//                                     className="pl-10 pr-10 bg-transparent border-white/10 text-white focus-visible:ring-indigo-500"
//                                     value={password}
//                                     onChange={(e) => setPassword(e.target.value)}
//                                     required
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={() => setShowPassword(!showPassword)}
//                                     className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
//                                 >
//                                     {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                                 </button>
//                                 <p className="text-[12px] text-slate-500 mt-1 ml-1">Minimum 8 characters</p>
//                             </div>

//                             <div className="relative">
//                                 <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
//                                 <Input
//                                     type={showPassword ? 'text' : 'password'}
//                                     placeholder="Confirm Password"
//                                     className="pl-10 bg-transparent border-white/10 text-white focus-visible:ring-indigo-500"
//                                     value={confirmPassword}
//                                     onChange={(e) => setConfirmPassword(e.target.value)}
//                                     required
//                                 />
//                             </div>

//                             <Button 
//                                 type="submit" 
//                                 className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-lg shadow-indigo-600/20"
//                                 disabled={isLoading}
//                             >
//                                 {isLoading ? (
//                                     <Loader2 className="h-5 w-5 animate-spin" />
//                                 ) : (
//                                     'Create Account'
//                                 )}
//                             </Button>
//                         </form>

//                         <div className="mt-6 text-center text-sm">
//                             <span className="text-slate-400">Already have an account? </span>
//                             <RouterLink 
//                                 to="/login" 
//                                 className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
//                             >
//                                 Sign In
//                             </RouterLink>
//                         </div>
//                     </CardContent>
//                 </Card>
//             </div>
//         </div>
//     );
// }