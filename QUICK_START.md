# Quick Start Guide - Smart Photo Organizer

## First Time Setup (5 minutes)

### 1. Start the Application
```bash
npm run dev
```

### 2. Open in Browser
Navigate to: `http://localhost:5173`

You'll see a loading screen while the RunAnywhere SDK initializes.

### 3. Welcome Screen
You'll see the main landing page with four feature cards:
- 🏷️ Auto-Classification
- 💡 Explainable AI
- 🔒 Privacy Scanner
- 🔍 Smart Search

### 4. Select Images
Click the **"Select Images to Organize"** button and choose photos from your device.

**Tip**: Start with 5-10 images for your first test.

### 5. Model Download (First Time Only)
The app will download the AI model (~500MB). This happens once and takes 1-3 minutes depending on your connection.

You'll see: "Downloading and initializing on-device vision model"

### 6. Processing
Watch as each image is processed:
- Progress bar shows completion
- Current filename displayed
- Classification happens on your device

### 7. Explore Results
Once complete, you'll see:
- **Grid view** of all your photos
- **Category badges** on each image (Document, Receipt, Screenshot, etc.)
- **Privacy indicators** (🔴 🟡 🟢)

## Using the Features

### View Photo Details
**Click any photo** to see:
- Full-size preview
- Classification category with confidence score
- AI explanation of why it was classified
- Privacy risk assessment
- Detected sensitive elements

### Search Photos
Use the search bar for natural language queries:
- `"receipt"` - Find all receipts
- `"screenshot"` - Find screenshots
- `"document"` - Find documents

### Filter by Category
Click the category buttons to filter:
- 📂 All Photos
- 📄 Documents
- 🧾 Receipts
- 📱 Screenshots
- 📝 Notes
- 📷 Personal

### Add More Photos
Click **"➕ Add More Photos"** in the top right to add additional images.

### Clear Everything
Click **"🗑️ Clear All"** to delete all photos and start fresh.

## Understanding the Classifications

### 📄 Documents
- Official papers, forms, certificates
- Legal documents, contracts
- Formal letters

### 🧾 Receipts
- Store receipts, purchase confirmations
- Bills, invoices
- Payment records

### 📱 Screenshots
- Phone/computer screenshots
- App interfaces
- Social media captures

### 📝 Notes
- Handwritten notes
- Text-heavy images
- Study materials, diagrams

### 📷 Personal Photos
- Photographs of people, places
- Event photos, selfies
- Nature photography

## Privacy Risk Levels

### 🔴 HIGH RISK
Contains highly sensitive information:
- ID cards, passports, driver's licenses
- Credit/debit cards
- Social security numbers
- Medical records

**⚠️ Do not share these publicly!**

### 🟡 MEDIUM RISK
May contain personal information:
- Documents with your name/address
- Screenshots with account info
- Partially visible sensitive data

**⚠️ Review before sharing**

### 🟢 LOW RISK
Safe to share:
- Generic photos without personal info
- Nature/landscape photos
- Non-identifying content

**✅ Generally safe**

## Tips for Best Results

### Image Quality
- ✅ Clear, well-lit photos work best
- ✅ Text should be readable
- ⚠️ Blurry or dark images may misclassify

### File Types
- ✅ JPG, PNG, WebP supported
- ✅ Most common image formats work
- ⚠️ Very large images (>10MB) may be slow

### Performance
- ✅ Process 5-20 images at a time for best performance
- ✅ Close other tabs to free up memory
- ⚠️ Large batches (100+) may take time

### Browser Choice
- ✅ **Best**: Chrome/Edge 120+ (WebGPU acceleration)
- ⚠️ **Good**: Firefox 119+ (CPU only)
- ⚠️ **Limited**: Safari 17+ (OPFS issues)

## Troubleshooting

### Model Won't Download
- Check internet connection
- Clear browser cache and reload
- Try a different browser

### Processing Stuck
- Refresh the page
- Check browser console for errors
- Try with fewer images

### Photos Not Appearing
- Check browser storage isn't full
- Try clearing all photos and re-uploading
- Open browser dev tools (F12) and check for errors

### Privacy Scan Not Working
- Ensure model fully loaded
- Some images may skip privacy scan if VLM errors
- Check console for "WASM memory" errors

### Slow Performance
- Close other tabs/applications
- Use Chrome/Edge for WebGPU acceleration
- Process fewer images at once
- Check system RAM usage

## Privacy & Data

### What's Stored Locally
- Image data (base64 encoded)
- Classification results
- Privacy scan results
- Filename and metadata

### What's NOT Stored
- No usage analytics
- No tracking cookies
- No server-side data

### Clearing Your Data
**Option 1**: Use "Clear All" button in the app

**Option 2**: Clear browser data:
1. Open browser settings
2. Privacy & Security
3. Clear browsing data
4. Select "Indexed Database" or "Site data"
5. Clear for localhost:5173

## Next Steps

### Customize Categories
Edit `src/utils/PhotoClassifier.ts` to add your own categories.

### Improve Privacy Detection
Modify `src/utils/PrivacyScanner.ts` to detect specific types of sensitive info.

### Export Features
Add functionality to export organized photos to folders.

### Batch Operations
Add bulk delete, re-classify, or export operations.

## Keyboard Shortcuts

- `Esc` - Close photo detail modal
- `Ctrl/Cmd + K` - Focus search bar
- `Ctrl/Cmd + ,` - Open settings (if implemented)

## Demo Scenarios

### Scenario 1: Receipt Organization
1. Upload 10-15 receipts
2. Filter by "Receipts" category
3. Search for specific stores/dates
4. Review privacy risks before sharing with accountant

### Scenario 2: Screenshot Cleanup
1. Upload phone/computer screenshots
2. Filter by "Screenshots" category
3. Check for sensitive info (passwords, accounts)
4. Delete or organize appropriately

### Scenario 3: Document Archive
1. Upload scanned documents
2. Review classification accuracy
3. Check privacy risk scores
4. Identify documents needing secure storage

---

**Need Help?** Check the main README.md for detailed documentation.

**Found a Bug?** Open an issue on GitHub.

**Want to Contribute?** PRs welcome!
