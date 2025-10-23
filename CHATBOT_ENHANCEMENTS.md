# Chatbot Enhancement Guide

This guide explains how to add advanced features to your ShopLite AI chatbot.

## 🎯 New Features

### 1. **Document & Image Upload**
- Upload product images for visual search
- Share receipts or order confirmations
- Upload documents for support queries
- Image analysis using Gemini Vision API

### 2. **Product Search Integration**
- Search products directly from chat
- Get product recommendations
- View product details in chat
- Add products to cart from chatbot

### 3. **Order Status Tracking**
- Check order status via chat
- View order history
- Track shipments
- Get delivery updates

### 4. **Quick Action Buttons**
- "Track my order"
- "Search products"
- "View cart"
- "Contact support"
- "Check deals"

### 5. **Chat History**
- Save conversations to localStorage
- Resume previous conversations
- Clear chat history
- Export chat history

### 6. **Voice Input**
- Speech-to-text for hands-free chat
- Multi-language voice support
- Voice commands

### 7. **Rich Message Types**
- Product cards with images
- Order summaries
- Interactive buttons
- Links and actions

## 📋 Implementation Steps

### Step 1: Update API Route

The chat API needs to handle:
- File uploads (images, documents)
- Product search queries
- Order status queries
- Vision API for image analysis

### Step 2: Enhanced Chatbot Component

Features to add:
- File upload button
- Quick action buttons
- Rich message rendering
- Voice input button
- Chat history management

### Step 3: Database Schema Updates

Add chat history collection:
```typescript
interface ChatHistory {
  userId: string
  sessionId: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}
```

## 🛠️ Technical Requirements

### New Dependencies

```bash
npm install --save @google/generative-ai
# For voice input
npm install --save react-speech-recognition
# For file upload
npm install --save react-dropzone
```

### Environment Variables

Add to `.env`:
```env
GEMINI_API_KEY=your-key-here  # Already exists
NEXT_PUBLIC_MAX_FILE_SIZE=5242880  # 5MB
```

## 📝 Code Examples

### 1. File Upload Handler

```typescript
const handleFileUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('message', input)

  const response = await fetch('/api/chat/upload', {
    method: 'POST',
    body: formData
  })

  const data = await response.json()
  return data.response
}
```

### 2. Product Search Integration

```typescript
const searchProducts = async (query: string) => {
  const response = await fetch(`/api/products?q=${query}`)
  const products = await response.json()

  return {
    type: 'product-list',
    products: products.slice(0, 3)
  }
}
```

### 3. Order Status Check

```typescript
const checkOrderStatus = async (orderId: string) => {
  const response = await fetch(`/api/orders/${orderId}`)
  const order = await response.json()

  return {
    type: 'order-status',
    order
  }
}
```

### 4. Voice Input

```typescript
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

const { transcript, listening, resetTranscript } = useSpeechRecognition()

const startListening = () => {
  SpeechRecognition.startListening({ continuous: true })
}

const stopListening = () => {
  SpeechRecognition.stopListening()
  setInput(transcript)
  resetTranscript()
}
```

## 🎨 Enhanced Message Types

### Product Card Message

```typescript
interface ProductMessage {
  type: 'product-card'
  product: {
    id: string
    title: string
    price: number
    image: string
  }
}
```

### Order Summary Message

```typescript
interface OrderMessage {
  type: 'order-summary'
  order: {
    id: string
    status: string
    total: number
    items: OrderItem[]
  }
}
```

### Action Buttons Message

```typescript
interface ActionMessage {
  type: 'actions'
  buttons: Array<{
    label: string
    action: string
  }>
}
```

## 🔧 API Endpoints to Create

### 1. File Upload Endpoint

**`POST /api/chat/upload`**

```typescript
export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  const message = formData.get('message') as string

  // Convert file to base64
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = buffer.toString('base64')

  // Call Gemini Vision API
  const result = await model.generateContent([
    {
      inlineData: {
        data: base64,
        mimeType: file.type
      }
    },
    message
  ])

  return NextResponse.json({
    response: result.response.text()
  })
}
```

### 2. Product Search Endpoint

**`POST /api/chat/search-products`**

```typescript
export async function POST(req: NextRequest) {
  const { query } = await req.json()

  const products = await Product.find({
    $text: { $search: query }
  }).limit(5)

  return NextResponse.json({ products })
}
```

### 3. Order Status Endpoint

**`POST /api/chat/check-order`**

```typescript
export async function POST(req: NextRequest) {
  const { orderId, userId } = await req.json()

  const order = await Order.findOne({
    _id: orderId,
    userId
  })

  return NextResponse.json({ order })
}
```

## 📱 Enhanced UI Components

### 1. Quick Action Buttons

```tsx
const QuickActions = ({ onAction }: { onAction: (action: string) => void }) => (
  <div className="flex flex-wrap gap-2 p-4">
    <Button
      size="sm"
      variant="outline"
      onClick={() => onAction('track-order')}
    >
      📦 Track Order
    </Button>
    <Button
      size="sm"
      variant="outline"
      onClick={() => onAction('search-products')}
    >
      🔍 Search Products
    </Button>
    <Button
      size="sm"
      variant="outline"
      onClick={() => onAction('view-cart')}
    >
      🛒 View Cart
    </Button>
  </div>
)
```

### 2. Product Card Component

```tsx
const ProductCard = ({ product }: { product: Product }) => (
  <div className="border rounded-lg p-3 space-y-2">
    <img src={product.image} alt={product.title} className="w-full h-32 object-cover rounded" />
    <h4 className="font-semibold text-sm">{product.title}</h4>
    <p className="text-primary font-bold">${product.price}</p>
    <Button size="sm" className="w-full">
      View Product
    </Button>
  </div>
)
```

### 3. File Upload Zone

```tsx
import { useDropzone } from 'react-dropzone'

const FileUpload = ({ onUpload }: { onUpload: (file: File) => void }) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf']
    },
    maxSize: 5242880, // 5MB
    onDrop: (files) => onUpload(files[0])
  })

  return (
    <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-4 cursor-pointer">
      <input {...getInputProps()} />
      <p className="text-sm text-center">
        Drop file here or click to upload
      </p>
    </div>
  )
}
```

## 🚀 Feature Priority

### High Priority (Implement First)
1. ✅ Quick Action Buttons
2. ✅ Product Search Integration
3. ✅ Chat History (localStorage)
4. ✅ File Upload UI

### Medium Priority
5. ⏳ Image Analysis (Gemini Vision)
6. ⏳ Order Status Tracking
7. ⏳ Rich Message Types

### Low Priority (Nice to Have)
8. ⏸️ Voice Input
9. ⏸️ Multi-language Support
10. ⏸️ Chat Export

## 🔒 Security Considerations

### File Upload
- Validate file types (images, PDFs only)
- Limit file size (max 5MB)
- Scan for malware
- Store files securely

### Privacy
- Don't store sensitive data in chat history
- Allow users to clear history
- Encrypt stored messages

### Rate Limiting
- Limit file uploads (5 per hour)
- Rate limit chat messages (30 per minute)
- Monitor API usage

## 📊 Analytics to Track

- Chat sessions per user
- Most common queries
- File upload usage
- Quick action clicks
- Product searches from chat
- Conversion rate from chat

## 🧪 Testing Checklist

- [ ] File upload works for images
- [ ] File upload works for PDFs
- [ ] Product search returns results
- [ ] Order status check works
- [ ] Quick actions trigger correctly
- [ ] Chat history persists
- [ ] Voice input works (if implemented)
- [ ] Mobile responsive
- [ ] Dark mode compatible
- [ ] Error handling works

## 📚 Resources

- [Gemini Vision API Docs](https://ai.google.dev/gemini-api/docs/vision)
- [React Dropzone](https://react-dropzone.js.org/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [File Upload Best Practices](https://web.dev/file-upload-best-practices/)

## 🎓 Next Steps

1. Choose which features to implement first
2. Set up file upload endpoint
3. Enhance chatbot UI with file upload
4. Add quick action buttons
5. Integrate product search
6. Test thoroughly
7. Deploy and monitor

---

**Ready to enhance your chatbot? Let's build these features step by step!**
