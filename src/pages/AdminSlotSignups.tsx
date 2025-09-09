import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, Eye, Download, FileText, Signature, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

interface SlotSignup {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  payment_proof_url: string | null;
  government_id_url: string | null;
  signature_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminSlotSignups() {
  const [signups, setSignups] = useState<SlotSignup[]>([]);
  const [filteredSignups, setFilteredSignups] = useState<SlotSignup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSignup, setSelectedSignup] = useState<SlotSignup | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSignups();
  }, []);

  useEffect(() => {
    filterSignups();
  }, [searchTerm, signups]);

  const fetchSignups = async () => {
    try {
      const { data, error } = await supabase
        .from('slot_signups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setSignups(data || []);
    } catch (error) {
      console.error('Error fetching slot signups:', error);
      toast({
        title: "Error",
        description: "Failed to fetch slot signups",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterSignups = () => {
    if (!searchTerm) {
      setFilteredSignups(signups);
      return;
    }

    const filtered = signups.filter(signup =>
      signup.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signup.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signup.phone.includes(searchTerm) ||
      signup.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredSignups(filtered);
  };

  const getSignedUrl = async (filePath: string, fileName: string) => {
    try {
      const response = await supabase.functions.invoke('slot-signup-file-url', {
        body: { filePath, fileName }
      });

      if (response.error) {
        throw response.error;
      }

      return response.data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      toast({
        title: "Error",
        description: "Failed to get file URL",
        variant: "destructive"
      });
      return null;
    }
  };

  const viewFile = async (fileUrl: string | null, fileName: string) => {
    if (!fileUrl) return;
    
    try {
      const fileName = fileUrl.split('/').pop() || 'file';
      const signedUrl = await getSignedUrl(fileName, fileName);
      
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      toast({
        title: "Error",
        description: "Failed to view file",
        variant: "destructive"
      });
    }
  };

  const downloadFile = async (fileUrl: string | null, fileName: string) => {
    if (!fileUrl) return;
    
    try {
      const actualFileName = fileUrl.split('/').pop() || 'file';
      const signedUrl = await getSignedUrl(actualFileName, fileName);
      
      if (signedUrl) {
        const link = document.createElement('a');
        link.href = signedUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Slot Signups</h1>
        <p className="text-muted-foreground">Manage and view all slot signup submissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Signups</CardTitle>
          <CardDescription>Filter signups by name, email, phone, or city</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search signups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Badge variant="secondary">
              {filteredSignups.length} of {signups.length} signups
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Slot Signups ({filteredSignups.length})</CardTitle>
          <CardDescription>All submitted slot signup requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSignups.map((signup) => (
                  <TableRow key={signup.id}>
                    <TableCell className="font-medium">{signup.full_name}</TableCell>
                    <TableCell>{signup.email}</TableCell>
                    <TableCell>{signup.phone}</TableCell>
                    <TableCell>{signup.city}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {signup.government_id_url && (
                          <Badge variant="default">Gov ID</Badge>
                        )}
                        {signup.payment_proof_url && (
                          <Badge variant="secondary">Payment</Badge>
                        )}
                        {signup.signature_url && (
                          <Badge variant="outline">Signature</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(signup.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedSignup(signup)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Slot Signup Details</DialogTitle>
                            <DialogDescription>
                              Submitted on {format(new Date(signup.created_at), 'MMMM dd, yyyy at hh:mm a')}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedSignup && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                  <p className="text-sm">{selectedSignup.full_name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                                  <p className="text-sm">{selectedSignup.email}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                  <p className="text-sm">{selectedSignup.phone}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">City</label>
                                  <p className="text-sm">{selectedSignup.city}</p>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h4 className="font-medium">Uploaded Files</h4>
                                
                                {selectedSignup.government_id_url && (
                                  <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center space-x-3">
                                      <FileText className="w-5 h-5 text-blue-500" />
                                      <div>
                                        <p className="font-medium">Government ID (Aadhaar)</p>
                                        <p className="text-sm text-muted-foreground">Uploaded document</p>
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => viewFile(selectedSignup.government_id_url, 'government-id')}
                                      >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => downloadFile(selectedSignup.government_id_url, `${selectedSignup.full_name}-government-id`)}
                                      >
                                        <Download className="w-4 h-4 mr-1" />
                                        Download
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {selectedSignup.payment_proof_url && (
                                  <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center space-x-3">
                                      <CreditCard className="w-5 h-5 text-green-500" />
                                      <div>
                                        <p className="font-medium">Payment Proof</p>
                                        <p className="text-sm text-muted-foreground">Uploaded document</p>
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => viewFile(selectedSignup.payment_proof_url, 'payment-proof')}
                                      >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => downloadFile(selectedSignup.payment_proof_url, `${selectedSignup.full_name}-payment-proof`)}
                                      >
                                        <Download className="w-4 h-4 mr-1" />
                                        Download
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {selectedSignup.signature_url && (
                                  <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center space-x-3">
                                      <Signature className="w-5 h-5 text-purple-500" />
                                      <div>
                                        <p className="font-medium">Digital Signature</p>
                                        <p className="text-sm text-muted-foreground">Captured signature</p>
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => viewFile(selectedSignup.signature_url, 'signature')}
                                      >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => downloadFile(selectedSignup.signature_url, `${selectedSignup.full_name}-signature`)}
                                      >
                                        <Download className="w-4 h-4 mr-1" />
                                        Download
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {!selectedSignup.government_id_url && !selectedSignup.payment_proof_url && !selectedSignup.signature_url && (
                                  <p className="text-sm text-muted-foreground italic">No files uploaded</p>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredSignups.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No slot signups found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}