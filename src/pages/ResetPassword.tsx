import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, CheckCircle, X } from 'lucide-react';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isValidSession, setIsValidSession] = useState(false);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { updatePassword, session } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        // Check if we have a valid session (user clicked reset link)
        // Also check URL params for access_token which indicates password reset flow
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const type = urlParams.get('type');

        // Always set valid session if we have URL params indicating password reset
        if (type === 'recovery' || accessToken || session) {
            setIsValidSession(true);
            return; // Don't set any redirect timer
        }

        // Only redirect if we have neither session nor reset tokens
        if (!session && !accessToken && type !== 'recovery') {
            const timer = setTimeout(() => {
                toast({
                    title: "Invalid Reset Link",
                    description: "Please request a new password reset link",
                    variant: "destructive",
                });
                navigate('/auth');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [session, navigate, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                title: "Passwords don't match",
                description: "Please make sure both passwords are identical",
                variant: "destructive",
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: "Password too short",
                description: "Password must be at least 6 characters long",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            await updatePassword(password);
            toast({
                title: "Password updated successfully!",
                description: "You can now sign in with your new password",
            });

            // Redirect to login page after successful password update
            setTimeout(() => {
                navigate('/auth');
            }, 2000);
        } catch (error: any) {
            toast({
                title: "Error updating password",
                description: error.message || "An error occurred while updating your password",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isValidSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary-light/10 p-4">
                <Card className="w-full max-w-md glass animate-slide-in">
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex items-center justify-center mb-4">
                            <img
                                src="https://res.cloudinary.com/dknafpppp/image/upload/v1753029599/F8AB7FD9-8833-4CB2-B517-27BE0B1C6BA7_2_copy_bzt39k.png"
                                alt="BoostMySites Logo"
                                className="w-12 h-12 rounded-lg"
                            />
                        </div>
                        <CardTitle className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                            Invalid Reset Link
                        </CardTitle>
                        <CardDescription>
                            This password reset link is invalid or has expired.
                            <br />
                            Redirecting you to request a new one...
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary-light/10 p-4">
            <Card className="w-full max-w-md glass animate-slide-in">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <img
                            src="https://res.cloudinary.com/dknafpppp/image/upload/v1753029599/F8AB7FD9-8833-4CB2-B517-27BE0B1C6BA7_2_copy_bzt39k.png"
                            alt="BoostMySites Logo"
                            className="w-12 h-12 rounded-lg"
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                        Set New Password
                    </CardTitle>
                    <CardDescription>
                        Enter your new password and confirm it below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="transition-all-smooth focus:scale-[1.02] pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm your new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="transition-all-smooth focus:scale-[1.02] pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {password && confirmPassword && (
                            <div className="flex items-center text-sm">
                                {password === confirmPassword ? (
                                    <div className="flex items-center text-green-600">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Passwords match
                                    </div>
                                ) : (
                                    <div className="flex items-center text-red-600">
                                        <X className="h-4 w-4 mr-2" />
                                        Passwords don't match
                                    </div>
                                )}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full gradient-primary hover:scale-[1.02] transition-all-smooth"
                            disabled={loading || password !== confirmPassword || password.length < 6}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Password
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/auth')}
                            className="text-sm hover:text-primary transition-all-smooth"
                        >
                            Back to Sign In
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPassword; 