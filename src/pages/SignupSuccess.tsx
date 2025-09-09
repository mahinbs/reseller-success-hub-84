import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Home, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SignupSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Signup Successful!
          </h1>
          
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Thank you for your slot booking request. We have received your information 
            and will review your submission within 2-3 business days. You will be contacted 
            via the email or phone number you provided.
          </p>
          
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={() => navigate('/')}
              variant="default"
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
            
            <Button 
              onClick={() => navigate('/slot-signup')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              New Request
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}