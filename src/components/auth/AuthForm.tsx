
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [referralName, setReferralName] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { signUp, signIn, resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        await resetPassword(email);
        toast({
          title: "Reset link sent!",
          description: "Check your email for the password reset link",
        });
        setIsForgotPassword(false);
      } else if (isSignUp) {
        await signUp(email, password, fullName, referralName);
        toast({
          title: "Account created successfully!",
          description: "Welcome to BoostMySites AI Services",
        });
      } else {
        await signIn(email, password);
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
            {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {isForgotPassword
              ? 'Enter your email to receive a password reset link'
              : isSignUp
                ? 'Join BoostMySites and access premium AI services'
                : 'Sign in to your BoostMySites account'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && !isForgotPassword && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={isSignUp}
                    className="transition-all-smooth focus:scale-[1.02]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referralName">Referral Name (Optional)</Label>
                  <Input
                    id="referralName"
                    type="text"
                    placeholder="Who referred you?"
                    value={referralName}
                    onChange={(e) => setReferralName(e.target.value)}
                    className="transition-all-smooth focus:scale-[1.02]"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transition-all-smooth focus:scale-[1.02]"
              />
            </div>

            {!isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="transition-all-smooth focus:scale-[1.02]"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full gradient-primary hover:scale-[1.02] transition-all-smooth"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {!isForgotPassword && !isSignUp && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsForgotPassword(true)}
                className="text-sm hover:text-primary transition-all-smooth"
              >
                Forgot Password?
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={() => {
                if (isForgotPassword) {
                  setIsForgotPassword(false);
                } else {
                  setIsSignUp(!isSignUp);
                }
              }}
              className="text-sm hover:text-primary transition-all-smooth"
            >
              {isForgotPassword
                ? 'Back to Sign In'
                : isSignUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
