import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { SignaturePad } from '@/components/SignaturePad';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';
export default function SlotSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: ''
  });
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [governmentId, setGovernmentId] = useState<File | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    toast
  } = useToast();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentProof(file);
    }
  };

  const handleGovernmentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGovernmentId(file);
    }
  };
  const handleSignatureChange = (signatureData: string | null) => {
    setSignature(signatureData);
  };
  const dataURLtoFile = (dataURL: string, filename: string): File => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {
      type: mime
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      toast({
        title: "Error",
        description: "Please accept the Terms & Conditions to continue",
        variant: "destructive"
      });
      return;
    }
    if (!formData.fullName || !formData.email || !formData.phone || !formData.city) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!governmentId) {
      toast({
        title: "Error",
        description: "Please upload your Aadhaar card copy",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const submitFormData = new FormData();
      submitFormData.append('fullName', formData.fullName);
      submitFormData.append('email', formData.email);
      submitFormData.append('phone', formData.phone);
      submitFormData.append('city', formData.city);
      if (paymentProof) {
        submitFormData.append('paymentProof', paymentProof);
      }
      if (governmentId) {
        submitFormData.append('governmentId', governmentId);
      }
      if (signature) {
        const signatureFile = dataURLtoFile(signature, 'signature.png');
        submitFormData.append('signature', signatureFile);
      }
      const response = await fetch('https://hguacltdrmckpcvycxzx.supabase.co/functions/v1/slot-signup-submit', {
        method: 'POST',
        body: submitFormData,
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit form');
      }
      toast({
        title: "Success!",
        description: "Your slot booking request has been submitted successfully."
      });
      navigate('/signup-success');
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit form. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Sign-Up Form</h1>
          <p className="text-lg text-muted-foreground">
            Fill out the form below to request a slot booking. All fields marked with * are required.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Please provide your accurate contact details for processing your request.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Enter your full name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="Enter your phone number" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="Enter your city" required />
                </div>
              </div>

              {/* Payment Proof Upload */}
              <div className="space-y-2">
                <Label htmlFor="paymentProof">Payment Proof (Optional)</Label>
                <div className="border-2 border-dashed border-input rounded-lg p-4 text-center">
                  <input id="paymentProof" type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                  <label htmlFor="paymentProof" className="cursor-pointer flex flex-col items-center space-y-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {paymentProof ? paymentProof.name : "Click to upload payment proof"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Supports: Images, PDF (Max 10MB)
                    </span>
                  </label>
                </div>
              </div>

              {/* Government ID Upload */}
              <div className="space-y-2">
                <Label htmlFor="governmentId">Government ID (Aadhaar Card Copy) *</Label>
                <div className="border-2 border-dashed border-input rounded-lg p-4 text-center">
                  <input id="governmentId" type="file" accept="image/*,.pdf" onChange={handleGovernmentIdChange} className="hidden" />
                  <label htmlFor="governmentId" className="cursor-pointer flex flex-col items-center space-y-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {governmentId ? governmentId.name : "Click to upload Aadhaar card copy"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Supports: Images, PDF (Max 10MB)
                    </span>
                  </label>
                </div>
              </div>

              {/* Digital Signature */}
              <div className="space-y-2">
                <Label>Digital Signature (Optional)</Label>
                <SignaturePad onSignatureChange={handleSignatureChange} />
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-center space-x-2">
                <Checkbox id="acceptTerms" checked={acceptedTerms} onCheckedChange={checked => setAcceptedTerms(!!checked)} />
                <Label htmlFor="acceptTerms" className="text-sm">
                  I accept the{' '}
                  <a href="/terms" target="_blank" className="text-primary hover:underline">
                    Terms & Conditions
                  </a>
                </Label>
              </div>

              {/* Important Notice */}
              <Alert>
                <AlertDescription>
                  <strong>Important:</strong> By submitting this form, you acknowledge that all information provided is accurate and complete. 
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting || !acceptedTerms} size="lg">
                {isSubmitting ? "Submitting..." : "Complete Signup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>;
}