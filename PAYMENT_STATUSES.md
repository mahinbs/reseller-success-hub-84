# Payment Status Documentation

## 🔄 **Payment Status Flow**

### **Internal Statuses (Server-side only)**
These statuses are used internally but **NOT shown to customers**:

- ⏳ **`pending`** - Order created, payment not started
- 🔄 **`processing`** - Payment in progress (Razorpay processing)

### **Customer-Visible Statuses**
These are the **final statuses** shown to customers:

- ✅ **`completed`** - Payment successful, order fulfilled
- ❌ **`failed`** - Payment failed, order cancelled
- 🚫 **`cancelled`** - Order cancelled by user or system

## 🎯 **Why Hide Intermediate Statuses?**

### **Better User Experience**
- ✅ Customers see only **actionable** statuses
- ✅ No confusion about "processing" orders
- ✅ Clear final outcomes

### **Prevents User Confusion**
- ❌ "Why is my order still processing?" 
- ❌ "Do I need to pay again?"
- ❌ "Is my payment stuck?"

## 💻 **Implementation**

### **Database Query (CustomerDashboard)**
```javascript
// Only fetch final statuses
.in('payment_status', ['completed', 'cancelled', 'failed'])
```

### **Status Badge Colors**
```javascript
variant={
  purchase.payment_status === 'completed' ? 'default' :      // Green
  purchase.payment_status === 'failed' ? 'destructive' :     // Red  
  'secondary'                                                 // Gray (cancelled)
}
```

### **Status Flow Example**
```
User clicks "Pay" 
    ↓
Order: "pending" (hidden from user)
    ↓
Payment processing: "processing" (hidden from user)
    ↓
Final result: "completed" ✅ (shown to user)
```

## 🔧 **For Developers**

### **When to Use Each Status**

1. **`pending`** - Initial order creation
2. **`processing`** - During Razorpay payment flow
3. **`completed`** - Payment verified successfully
4. **`failed`** - Payment verification failed
5. **`cancelled`** - Order expired or cancelled

### **Real-time Updates**
- ⚡ Webhooks update status automatically
- ⚡ Client polls for status changes
- ⚡ Users see immediate feedback

### **Error Handling**
- Failed payments → Clear error messages
- Expired orders → Automatic cleanup
- Network issues → Retry mechanisms

## 🎨 **UI Guidelines**

### **Status Colors**
- **Completed**: Green (success)
- **Failed**: Red (error/destructive)  
- **Cancelled**: Gray (neutral/secondary)

### **Status Messages**
- ✅ "Payment Successful" 
- ❌ "Payment Failed"
- 🚫 "Order Cancelled"

### **Icons**
- ✅ CheckCircle (completed)
- ❌ XCircle (failed)
- 🚫 Ban (cancelled)

---

**🎯 Result: Clean, professional purchase history that customers can easily understand!** 