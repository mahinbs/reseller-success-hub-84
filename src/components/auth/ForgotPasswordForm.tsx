import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await resetPassword(email);
      toast({
        title: "Reset link sent!",
        description: "Check your email for the password reset link",
      });
      setEmailSent(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while sending the reset link",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
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
              Check Your Email
            </CardTitle>
            <CardDescription>
              We've sent a password reset link to <strong>{email}</strong>
              <br />
              Click the link in your email to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="w-full"
              >
                Try Different Email
              </Button>
              <Button
                onClick={() => navigate('/auth')}
                variant="ghost"
                className="w-full text-sm hover:text-primary transition-all-smooth"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </div>
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
            Reset Your Password
          </CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transition-all-smooth focus:scale-[1.02]"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full gradient-primary hover:scale-[1.02] transition-all-smooth"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/auth')}
              className="text-sm hover:text-primary transition-all-smooth"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 