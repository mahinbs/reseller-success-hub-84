import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePayment } from '@/hooks/usePayment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    CheckCircle,
    Download,
    Mail,
    Calendar,
    CreditCard,
    Package,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { formatCurrency } from '@/lib/gstUtils';
import { Purchase } from '@/lib/paymentUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const { user } = useAuth();
    const { getPurchase } = usePayment();
    const { toast } = useToast();

    // Check if we're in dashboard context
    const isInDashboard = location.pathname.startsWith('/dashboard');

    const [purchase, setPurchase] = useState<Purchase | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const purchaseId = searchParams.get('purchase');

    useEffect(() => {
        if (!user) {
            navigate('/auth', { replace: true });
            return;
        }

        if (!purchaseId) {
            navigate(isInDashboard ? '/dashboard/cart' : '/cart', { replace: true });
            return;
        }

        loadPurchaseDetails();
    }, [user, purchaseId, navigate]);

    const loadPurchaseDetails = async () => {
        if (!purchaseId) return;

        setIsLoading(true);
        try {
            const purchaseData = await getPurchase(purchaseId);
            if (!purchaseData) {
                setError('Purchase not found');
                return;
            }

            if (purchaseData.payment_status !== 'completed') {
                setError('Payment not completed');
                return;
            }

            setPurchase(purchaseData);
        } catch (error) {
            setError('Failed to load purchase details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadInvoice = async () => {
        if (!purchase?.id) return;

        try {
            setIsLoading(true);

            // Calculate amounts
            const subtotal = purchase.items?.reduce((sum, item) => sum + Number(item.price), 0) || 0;
            const gstAmount = subtotal * 0.18;
            const total = subtotal + gstAmount;

            // Helper function to format currency
            const formatINR = (amount: number): string => {
                return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            };

            // Create PDF with multi-page support
            const pdf = new jsPDF();
            const pageWidth = pdf.internal.pageSize.width;
            const pageHeight = pdf.internal.pageSize.height;
            const marginBottom = 40; // Space for footer
            const marginTop = 70; // Space for header on new pages
            let yPosition = 25;
            let currentPage = 1;

            // Helper function to add page header
            const addPageHeader = (isFirstPage = false) => {
                if (!isFirstPage) {
                    // Header for continuation pages
                    pdf.setFillColor(67, 56, 202);
                    pdf.rect(0, 0, pageWidth, 50, 'F');

                    pdf.setFontSize(20);
                    pdf.setFont('helvetica', 'bold');
                    pdf.setTextColor(255, 255, 255);
                    pdf.text('BoostMySites', 20, 25);

                    pdf.setFontSize(10);
                    pdf.setFont('helvetica', 'normal');
                    pdf.text('Invoice Continuation', 20, 35);

                    // Page number
                    pdf.text(`Page ${currentPage}`, pageWidth - 40, 35);

                    return 60; // Return Y position after header
                }
                return yPosition;
            };

            // Helper function to check if we need a new page
            const checkPageBreak = (requiredSpace: number) => {
                if (yPosition + requiredSpace > pageHeight - marginBottom) {
                    pdf.addPage();
                    currentPage++;
                    yPosition = addPageHeader(false);
                    return true;
                }
                return false;
            };

            // Helper function to add footer to each page
            const addPageFooter = () => {
                const footerY = pageHeight - 30;

                // Footer background
                pdf.setFillColor(249, 250, 251);
                pdf.rect(0, footerY - 5, pageWidth, 35, 'F');

                pdf.setFontSize(8);
                pdf.setTextColor(107, 114, 128);
                pdf.setFont('helvetica', 'normal');

                // Left side - company info
                pdf.text('BoostMySites - AI-Powered Digital Services', 20, footerY + 5);
                pdf.text('Email: support@boostmysites.com | Phone: +91 XXX XXX XXXX', 20, footerY + 12);

                // Right side - page number
                pdf.text(`Page ${currentPage}`, pageWidth - 30, footerY + 5);

                // Generation timestamp
                const invoiceNumber = purchase.id.slice(-8).toUpperCase();
                pdf.text(`Generated: ${new Date().toLocaleString('en-IN')} | Invoice: ${invoiceNumber}`, 20, footerY + 19);
            };

            // Modern header with gradient effect
            pdf.setFillColor(67, 56, 202); // Indigo-600
            pdf.rect(0, 0, pageWidth, 60, 'F');

            // Company logo area (mock)
            pdf.setFillColor(255, 255, 255);
            pdf.rect(20, 15, 8, 8, 'F');

            // Company Name
            pdf.setFontSize(32);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            pdf.text('BoostMySites', 35, yPosition + 5);

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text('AI-Powered Digital Services', 35, yPosition + 15);

            // Invoice title with accent
            yPosition = 80;
            pdf.setFontSize(28);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(31, 41, 55); // Gray-800
            pdf.text('INVOICE', 20, yPosition);

            // Professional details card
            yPosition += 25;
            pdf.setDrawColor(229, 231, 235); // Gray-200
            pdf.setLineWidth(1);
            pdf.rect(20, yPosition - 5, pageWidth - 40, 45);
            pdf.setFillColor(249, 250, 251); // Gray-50
            pdf.rect(20, yPosition - 5, pageWidth - 40, 45, 'F');

            const invoiceNumber = purchase.id.slice(-8).toUpperCase();
            const invoiceDate = new Date().toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            yPosition += 10;
            pdf.setFontSize(11);
            pdf.setTextColor(31, 41, 55);

            // Left column
            pdf.setFont('helvetica', 'bold');
            pdf.text('Invoice Number:', 30, yPosition);
            pdf.setFont('helvetica', 'normal');
            pdf.text(invoiceNumber, 30, yPosition + 8);

            pdf.setFont('helvetica', 'bold');
            pdf.text('Invoice Date:', 30, yPosition + 18);
            pdf.setFont('helvetica', 'normal');
            pdf.text(invoiceDate, 30, yPosition + 26);

            // Right column
            pdf.setFont('helvetica', 'bold');
            pdf.text('Payment Status:', pageWidth - 110, yPosition);
            pdf.setTextColor(16, 185, 129); // Green-500
            pdf.setFont('helvetica', 'bold');
            pdf.text('✓ ' + purchase.payment_status.toUpperCase(), pageWidth - 110, yPosition + 8);

            pdf.setTextColor(31, 41, 55);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Payment Method:', pageWidth - 110, yPosition + 18);
            pdf.setFont('helvetica', 'normal');
            pdf.text(purchase.payment_method?.toUpperCase() || 'UPI', pageWidth - 110, yPosition + 26);

            // Bill To section
            yPosition += 55;
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(67, 56, 202);
            pdf.text('BILL TO:', 20, yPosition);

            yPosition += 12;
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(31, 41, 55);
            pdf.text('Valued Customer', 20, yPosition);

            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(107, 114, 128);
            pdf.setFontSize(10);
            pdf.text('Customer ID: ' + purchase.user_id.slice(-8).toUpperCase(), 20, yPosition + 8);

            // Items table with modern design and pagination
            yPosition += 30;

            // Check if we need space for table header
            checkPageBreak(50);

            // Table header
            pdf.setFillColor(67, 56, 202);
            pdf.rect(20, yPosition - 5, pageWidth - 40, 18, 'F');
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            pdf.text('ITEM DESCRIPTION', 30, yPosition + 5);
            pdf.text('AMOUNT', pageWidth - 70, yPosition + 5);

            // Table rows with pagination support
            yPosition += 18;
            pdf.setTextColor(31, 41, 55);

            purchase.items?.forEach((item, index) => {
                const rowHeight = 18;

                // Check if we need a new page for this row
                if (checkPageBreak(rowHeight + 10)) {
                    // Re-add table header on new page
                    pdf.setFillColor(67, 56, 202);
                    pdf.rect(20, yPosition - 5, pageWidth - 40, 18, 'F');
                    pdf.setFontSize(12);
                    pdf.setFont('helvetica', 'bold');
                    pdf.setTextColor(255, 255, 255);
                    pdf.text('ITEM DESCRIPTION (Continued)', 30, yPosition + 5);
                    pdf.text('AMOUNT', pageWidth - 70, yPosition + 5);
                    yPosition += 18;
                    pdf.setTextColor(31, 41, 55);
                }

                // Row background
                if (index % 2 === 0) {
                    pdf.setFillColor(248, 250, 252);
                    pdf.rect(20, yPosition - 3, pageWidth - 40, rowHeight, 'F');
                }

                // Item details with description wrapping for long names
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'normal');

                // Handle long item names by wrapping text
                const maxLineWidth = 120; // Max width for item name
                const itemNameLines = pdf.splitTextToSize(item.name, maxLineWidth);
                const linesCount = Array.isArray(itemNameLines) ? itemNameLines.length : 1;
                const actualRowHeight = Math.max(rowHeight, linesCount * 6 + 6);

                // Adjust row background for multi-line items
                if (linesCount > 1 && index % 2 === 0) {
                    pdf.setFillColor(248, 250, 252);
                    pdf.rect(20, yPosition - 3, pageWidth - 40, actualRowHeight, 'F');
                }

                // Add item name (potentially multi-line)
                if (Array.isArray(itemNameLines)) {
                    itemNameLines.forEach((line: string, lineIndex: number) => {
                        pdf.text(line, 30, yPosition + 8 + (lineIndex * 6));
                    });
                } else {
                    pdf.text(itemNameLines, 30, yPosition + 8);
                }

                // Add amount
                pdf.setFont('helvetica', 'bold');
                pdf.text(formatINR(Number(item.price)), pageWidth - 70, yPosition + 8);

                yPosition += actualRowHeight;
            });

            // Totals section with pagination support
            yPosition += 20;

            // Check if we need space for totals section
            checkPageBreak(100);

            const totalsX = pageWidth - 120;
            const amountX = pageWidth - 40;

            // Background for totals
            pdf.setFillColor(249, 250, 251);
            pdf.rect(totalsX - 20, yPosition - 10, 140, 60, 'F');
            pdf.setDrawColor(229, 231, 235);
            pdf.rect(totalsX - 20, yPosition - 10, 140, 60);

            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(107, 114, 128);
            pdf.text('Subtotal:', totalsX, yPosition);
            pdf.setTextColor(31, 41, 55);
            pdf.text(formatINR(subtotal), amountX, yPosition);

            yPosition += 12;
            pdf.setTextColor(107, 114, 128);
            pdf.text('GST (18%):', totalsX, yPosition);
            pdf.setTextColor(31, 41, 55);
            pdf.text(formatINR(gstAmount), amountX, yPosition);

            // Total line
            yPosition += 8;
            pdf.setLineWidth(1);
            pdf.setDrawColor(67, 56, 202);
            pdf.line(totalsX, yPosition, amountX + 20, yPosition);

            yPosition += 12;
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            pdf.setTextColor(67, 56, 202);
            pdf.text('TOTAL:', totalsX, yPosition);
            pdf.text(formatINR(total), amountX, yPosition);

            // Payment confirmation badge
            yPosition += 35;

            // Check if we need space for payment confirmation
            checkPageBreak(40);

            pdf.setFillColor(16, 185, 129);
            pdf.rect(20, yPosition - 8, pageWidth - 40, 25, 'F');
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            pdf.text('✓ PAYMENT SUCCESSFULLY COMPLETED', pageWidth / 2 - 80, yPosition + 5);

            // Thank you section
            yPosition += 40;

            // Check if we need space for thank you section
            checkPageBreak(60);

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(31, 41, 55);
            pdf.text('Thank you for choosing BoostMySites!', 20, yPosition);

            yPosition += 10;
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(107, 114, 128);
            pdf.text('Your AI services are being activated and our team will contact you within 24 hours.', 20, yPosition);

            yPosition += 15;
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(67, 56, 202);
            pdf.text('NEED HELP?', 20, yPosition);

            yPosition += 8;
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(107, 114, 128);
            pdf.text('Email: support@boostmysites.com  •  Phone: +91 XXX XXX XXXX', 20, yPosition);

            // Payment details section
            yPosition += 25;
            checkPageBreak(50);

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(67, 56, 202);
            pdf.text('PAYMENT DETAILS', 20, yPosition);

            yPosition += 15;
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(31, 41, 55);

            if (purchase.razorpay_payment_id) {
                pdf.setFont('helvetica', 'bold');
                pdf.text('Transaction ID:', 20, yPosition);
                pdf.setFont('helvetica', 'normal');
                pdf.text(purchase.razorpay_payment_id, 80, yPosition);
                yPosition += 8;
            }

            if (purchase.razorpay_order_id) {
                pdf.setFont('helvetica', 'bold');
                pdf.text('Order ID:', 20, yPosition);
                pdf.setFont('helvetica', 'normal');
                pdf.text(purchase.razorpay_order_id, 80, yPosition);
                yPosition += 8;
            }

            pdf.setFont('helvetica', 'bold');
            pdf.text('Payment Gateway:', 20, yPosition);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Razorpay (Secure)', 80, yPosition);

            // Terms and conditions section
            yPosition += 25;
            checkPageBreak(80);

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(67, 56, 202);
            pdf.text('TERMS & CONDITIONS', 20, yPosition);

            yPosition += 15;
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(107, 114, 128);

            const terms = [
                '1. All services will be activated within 24-48 hours of payment confirmation.',
                '2. Refunds are available within 7 days if services have not been activated.',
                '3. Support is provided via email and phone during business hours (9 AM - 6 PM IST).',
                '4. Service delivery timelines may vary based on project complexity.',
                '5. Client cooperation is required for timely delivery of custom services.'
            ];

            terms.forEach((term, index) => {
                // Check if we need a new page for this term
                checkPageBreak(12);
                pdf.text(term, 20, yPosition);
                yPosition += 10;
            });

            // Summary for multi-page invoices
            const totalPages = currentPage;
            if (totalPages > 1) {
                // Add summary on first page
                pdf.setPage(1);

                // Find a good position for summary (after Bill To section)
                const summaryY = 180;

                // Summary box
                pdf.setFillColor(240, 245, 255);
                pdf.setDrawColor(67, 56, 202);
                pdf.rect(pageWidth - 140, summaryY, 120, 60, 'FD');

                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(67, 56, 202);
                pdf.text('INVOICE SUMMARY', pageWidth - 135, summaryY + 12);

                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(31, 41, 55);
                pdf.text(`Items: ${purchase.items?.length || 0}`, pageWidth - 135, summaryY + 25);
                pdf.text(`Subtotal: ${formatINR(subtotal)}`, pageWidth - 135, summaryY + 35);
                pdf.text(`GST: ${formatINR(gstAmount)}`, pageWidth - 135, summaryY + 45);

                pdf.setFont('helvetica', 'bold');
                pdf.text(`Total: ${formatINR(total)}`, pageWidth - 135, summaryY + 55);
            }

            // Add footer to all pages with correct page numbers
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);

                // Add footer with correct page number
                const footerY = pageHeight - 30;

                // Footer background
                pdf.setFillColor(249, 250, 251);
                pdf.rect(0, footerY - 5, pageWidth, 35, 'F');

                pdf.setFontSize(8);
                pdf.setTextColor(107, 114, 128);
                pdf.setFont('helvetica', 'normal');

                // Left side - company info
                pdf.text('BoostMySites - AI-Powered Digital Services', 20, footerY + 5);
                pdf.text('Email: support@boostmysites.com | Phone: +91 XXX XXX XXXX', 20, footerY + 12);

                // Right side - page number
                pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 50, footerY + 5);

                // Generation timestamp
                const invoiceNumber = purchase.id.slice(-8).toUpperCase();
                pdf.text(`Generated: ${new Date().toLocaleString('en-IN')} | Invoice: ${invoiceNumber}`, 20, footerY + 19);
            }

            // Generate and download
            const filename = `invoice-${invoiceNumber}.pdf`;
            pdf.save(filename);

            toast({
                title: "Invoice Downloaded",
                description: "Your PDF invoice has been downloaded successfully.",
            });
        } catch (error) {
            console.error('Error downloading invoice:', error);
            toast({
                title: "Download Failed",
                description: "Failed to download invoice. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailInvoice = async () => {
        if (!purchase?.id) return;

        try {
            setIsLoading(true);
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                toast({
                    title: "Authentication Required",
                    description: "Please log in to email your invoice.",
                    variant: "destructive",
                });
                return;
            }

            const { data, error } = await supabase.functions.invoke('send-invoice-email', {
                body: {
                    purchase_id: purchase.id,
                    email_type: 'manual'
                },
                headers: { Authorization: `Bearer ${session.access_token}` },
            });

            if (error) {
                throw new Error(error.message);
            }

            if (data.success) {
                toast({
                    title: "Invoice Emailed",
                    description: "Your invoice has been sent to your email address.",
                });
            } else {
                // Handle graceful email service unavailability
                toast({
                    title: "Email Service Unavailable",
                    description: data.message || "Please download the PDF invoice instead.",
                    variant: "default", // Not destructive since it's expected
                });
            }
        } catch (error) {
            console.error('Error emailing invoice:', error);
            toast({
                title: "Email Failed",
                description: "Failed to send invoice email. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Loading order details...</h2>
                    <p className="text-muted-foreground">Please wait while we fetch your purchase information</p>
                </div>
            </div>
        );
    }

    if (error || !purchase) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-6">
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="h-8 w-8 text-destructive" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
                        <p className="text-muted-foreground mb-4">
                            {error || 'We couldn\'t find the order you\'re looking for.'}
                        </p>
                        <Button onClick={() => navigate('/dashboard')} className="gradient-primary">
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-primary/5 py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-green-600 mb-2">Payment Successful!</h1>
                    <p className="text-xl text-muted-foreground">
                        Thank you for your purchase. Your order has been confirmed.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Information */}
                        <Card className="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Order Information
                                </CardTitle>
                                <CardDescription>Your purchase details and confirmation</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Order ID</p>
                                        <p className="font-mono text-sm">{purchase.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Payment ID</p>
                                        <p className="font-mono text-sm">{purchase.razorpay_payment_id || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                                        <p className="capitalize">{purchase.payment_method || 'Razorpay'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                                        <p>{new Date().toLocaleDateString('en-IN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Purchased Items */}
                                <div>
                                    <h4 className="font-medium mb-3">Items Purchased</h4>
                                    <div className="space-y-3">
                                        {purchase.items.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                                <div className="flex-1">
                                                    <h5 className="font-medium">{item.name}</h5>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant={item.type === 'bundle' ? 'default' : 'secondary'} className="text-xs">
                                                            {item.type === 'bundle' ? 'Bundle' : 'Service'}
                                                        </Badge>
                                                        {item.billing_period && (
                                                            <span className="text-xs text-muted-foreground">
                                                                /{item.billing_period}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{formatCurrency(item.price)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Next Steps */}
                        <Card className="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ArrowRight className="h-5 w-5" />
                                    What's Next?
                                </CardTitle>
                                <CardDescription>Here's what you can expect from us</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <Mail className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <h5 className="font-medium">Email Confirmation</h5>
                                            <p className="text-sm text-muted-foreground">
                                                You'll receive an email confirmation with your order details and invoice within 5 minutes.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <Calendar className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <h5 className="font-medium">Service Activation</h5>
                                            <p className="text-sm text-muted-foreground">
                                                Our team will contact you within 24 hours to initiate your services and provide access credentials.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <Package className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <h5 className="font-medium">Dashboard Access</h5>
                                            <p className="text-sm text-muted-foreground">
                                                Track your services, downloads, and support tickets from your customer dashboard.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary & Actions */}
                    <div className="space-y-6">
                        {/* Payment Summary */}
                        <Card className="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Payment Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    {(() => {
                                        // Calculate proper amounts accounting for coupon
                                        const itemsSubtotal = purchase.items?.reduce((sum, item) => sum + Number(item.price), 0) || 0;
                                        const couponDiscount = Number(purchase.coupon_discount || 0);
                                        const discountedSubtotal = itemsSubtotal - couponDiscount;
                                        const gstAmount = itemsSubtotal * 0.18;  // GST always calculated on original price
                                        const finalTotal = discountedSubtotal + gstAmount;

                                        return (
                                            <>
                                                <div className="flex justify-between text-sm">
                                                    <span>Subtotal</span>
                                                    <span>{formatCurrency(itemsSubtotal)}</span>
                                                </div>
                                                {couponDiscount > 0 && (
                                                    <div className="flex justify-between text-sm text-green-600 font-medium">
                                                        <span>Coupon Discount ({purchase.coupon_code})</span>
                                                        <span>-{formatCurrency(couponDiscount)}</span>
                                                    </div>
                                                )}
                                                {purchase.coupon_free_months && purchase.coupon_free_months > 0 && (
                                                    <div className="bg-green-50 p-2 rounded-lg border border-green-200">
                                                        <div className="flex justify-between text-sm text-green-700 font-medium">
                                                            <span>🎉 Free Months Bonus</span>
                                                            <span>{purchase.coupon_free_months} month(s)</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-sm text-muted-foreground">
                                                    <span>GST (18%)</span>
                                                    <span>{formatCurrency(gstAmount)}</span>
                                                </div>
                                                <Separator />
                                                <div className="flex justify-between text-lg font-semibold">
                                                    <span>Total Paid</span>
                                                    <span className="text-green-600">{formatCurrency(Math.max(finalTotal, 1))}</span>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>

                                <div className="space-y-3 pt-4">
                                    {/* <Button
                                        onClick={handleDownloadInvoice}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Invoice PDF
                                    </Button> */}

                                    <Button
                                        onClick={handleEmailInvoice}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Mail className="mr-2 h-4 w-4" />
                                        Email Invoice
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <Card className="glass">
                            <CardContent className="pt-6">
                                <div className="space-y-3">
                                    <Button
                                        onClick={() => navigate('/dashboard')}
                                        className="w-full gradient-primary"
                                    >
                                        Go to Dashboard
                                    </Button>

                                    <Button
                                        onClick={() => navigate('/dashboard/services')}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Browse More Services
                                    </Button>

                                    <Button
                                        onClick={() => navigate('/dashboard/support')}
                                        variant="ghost"
                                        className="w-full"
                                    >
                                        Contact Support
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Support Info */}
                        <Card className="glass bg-gradient-to-r from-primary/5 to-primary/10">
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <h4 className="font-medium mb-2">Need Help?</h4>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Our support team is here to help you get started with your new services.
                                    </p>
                                    <p className="text-sm font-medium">
                                        📧 support@boostmysites.com<br />
                                        📞 +91 XXX XXX XXXX
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage; 