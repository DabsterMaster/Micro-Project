# Cloudinary Setup Guide (Free Alternative to Firebase Storage)

## 🆓 **Why Cloudinary?**

- **Free tier**: 25 GB storage, 25 GB bandwidth/month
- **No credit card required**
- **Perfect for exam proctoring**: Images, videos, screenshots
- **Global CDN**: Fast worldwide access
- **Easy integration**: Simple upload API

## 🚀 **Quick Setup (3 minutes)**

### Step 1: Create Cloudinary Account
1. Go to [Cloudinary Console](https://cloudinary.com/console)
2. Click **"Sign Up For Free"**
3. Fill in your details (no credit card required)
4. Verify your email

### Step 2: Get Your Configuration
1. **Dashboard** → Copy your **Cloud Name**
2. **Settings** → **Upload** → **Upload presets**
3. Click **"Add upload preset"**
4. Set **Signing Mode** to **"Unsigned"**
5. **Save** and copy the preset name

### Step 3: Update Extension Configuration
1. Open `firebase-config.js`
2. Update the Cloudinary config:

```javascript
const cloudinaryConfig = {
    cloudName: "your-cloud-name",        // From dashboard
    uploadPreset: "your-upload-preset",  // From upload presets
    apiKey: "your-api-key"              // From dashboard (optional for unsigned)
};
```

## 📁 **What Gets Stored**

### **Exam Proctoring Files**
- **Screenshots**: Tab change violations
- **Camera recordings**: Behavioral analysis clips
- **Documents**: Exam materials, reports
- **Videos**: Screen recordings, violations

### **File Organization**
```
exam-proctor/
├── images/          # Screenshots, violations
├── videos/          # Screen recordings, camera feeds
├── documents/       # Exam materials, reports
└── temp/            # Temporary files
```

## 🔧 **Usage Examples**

### **Upload Screenshot**
```javascript
// In your extension code
const screenshot = await captureScreenshot();
const result = await window.firebaseApp.storage.uploadImage(screenshot);

console.log('Uploaded:', result.url);
// Store result.url in Firestore for later access
```

### **Upload Video**
```javascript
// Upload camera recording
const videoBlob = await recordCamera();
const result = await window.firebaseApp.storage.uploadVideo(videoBlob);

console.log('Video uploaded:', result.url);
```

### **Upload Document**
```javascript
// Upload exam materials
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];
const result = await window.firebaseApp.storage.uploadDocument(file);

console.log('Document uploaded:', result.url);
```

## 💰 **Pricing Comparison**

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Firebase Storage** | 5 GB | $0.026/GB |
| **Cloudinary** | 25 GB | $0.04/GB |
| **Supabase Storage** | 1 GB | $0.021/GB |
| **AWS S3** | 5 GB | $0.023/GB |

**Cloudinary wins** for free tier and ease of use!

## 🔒 **Security Features**

### **Upload Preset Security**
- **Unsigned uploads**: No API key needed in frontend
- **File type restrictions**: Only allow images/videos
- **Size limits**: Prevent abuse
- **Folder structure**: Organized file management

### **Access Control**
- **Public URLs**: Easy sharing
- **Private folders**: Secure storage
- **Expiring URLs**: Temporary access
- **Watermarking**: Brand protection

## 🚨 **Common Issues & Solutions**

### **"Upload failed"**
- Check cloud name spelling
- Verify upload preset exists
- Ensure file size < 100 MB (free tier limit)
- Check file format (jpg, png, mp4, etc.)

### **"CORS error"**
- Cloudinary handles CORS automatically
- Check if you're using the correct upload URL
- Ensure upload preset allows unsigned uploads

### **"File too large"**
- Compress images before upload
- Use video compression for recordings
- Consider chunked uploads for large files

## 📱 **Mobile Optimization**

### **Image Compression**
```javascript
// Compress image before upload
function compressImage(file, quality = 0.8) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob(resolve, 'image/jpeg', quality);
        };
        
        img.src = URL.createObjectURL(file);
    });
}
```

### **Video Compression**
```javascript
// Basic video compression
function compressVideo(file) {
    // Use MediaRecorder API for basic compression
    const stream = file.stream();
    const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
    });
    
    // Implementation details...
}
```

## 🌍 **Global Performance**

### **CDN Benefits**
- **Automatic optimization**: Cloudinary optimizes files
- **Multiple formats**: Serve best format for each device
- **Responsive images**: Different sizes for different screens
- **Fast delivery**: Global edge locations

### **Performance Tips**
- **Use appropriate formats**: WebP for images, WebM for videos
- **Set quality levels**: Balance between size and quality
- **Enable lazy loading**: Load files only when needed
- **Cache strategies**: Leverage browser caching

## 🎯 **Next Steps**

1. **Create Cloudinary account** (free, no credit card)
2. **Get your configuration** (cloud name, upload preset)
3. **Update `firebase-config.js`** with Cloudinary details
4. **Test file uploads** with small images
5. **Monitor usage** in Cloudinary dashboard

## 📞 **Need Help?**

- **Cloudinary Docs**: [cloudinary.com/documentation](https://cloudinary.com/documentation)
- **Free Support**: Community forums
- **Paid Support**: Available for business users

---

**Pro Tip**: Cloudinary's free tier is perfect for exam proctoring. You can store thousands of screenshots and hours of video without hitting the limit!
