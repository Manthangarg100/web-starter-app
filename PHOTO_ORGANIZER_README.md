# Smart Personal Photo Organizer

A **privacy-first**, **fully offline** photo organizer that runs completely on-device using the RunAnywhere Web SDK. No cloud APIs, no external servers, no internet dependency after initial setup.

![Privacy First](https://img.shields.io/badge/Privacy-First-green)
![Offline Capable](https://img.shields.io/badge/Offline-Capable-blue)
![On Device AI](https://img.shields.io/badge/AI-On--Device-orange)

## Overview

This application uses on-device AI to automatically classify and organize your photos while keeping all data private and local. Built with React, TypeScript, and the RunAnywhere Web SDK for browser-based AI inference.

## Key Features

### 1. Offline Photo Classification
- **Automatic categorization** of images into:
  - 📄 Documents / Certificates
  - 🧾 Receipts / Bills
  - 📱 Screenshots
  - 📝 Notes / Text images
  - 📷 Personal photos
- Uses on-device Vision Language Model (VLM)
- No internet required after model download

### 2. Explainable AI
- Every classification includes a human-readable explanation
- Example: *"Classified as Receipt because printed text, numbers, and structured layout typical of store receipts were detected"*
- Transparency in AI decision-making

### 3. Privacy Risk Scoring
- Automatically detects sensitive information:
  - 🔴 **HIGH RISK**: ID cards, passports, credit cards, SSN
  - 🟡 **MEDIUM RISK**: Documents with personal info, screenshots with sensitive data
  - 🟢 **LOW RISK**: Safe to share photos
- Visual warnings for privacy-sensitive images
- Helps prevent accidental sharing of sensitive data

### 4. Contextual Search
- Natural language queries:
  - "receipts from last month"
  - "screenshots"
  - "high privacy risk documents"
- Category-based filtering
- Searches through filenames, classifications, and detected content

## Technical Architecture

### Core Technologies
- **React 19** - UI framework
- **TypeScript** - Type-safe code
- **RunAnywhere Web SDK** - On-device AI inference
  - `@runanywhere/web` - Core SDK
  - `@runanywhere/web-llamacpp` - LLM/VLM backend
- **IndexedDB** - Local storage for photo metadata
- **Vite** - Build tool and dev server

### AI Models Used
- **LFM2-VL 450M Q4_0** (~500MB)
  - Liquid AI's vision-language model
  - Runs entirely in browser via WebAssembly
  - Used for classification and privacy detection

### Data Flow
```
User selects images
       ↓
Images converted to RGB pixels
       ↓
VLM processes in Web Worker (off main thread)
       ↓
Classification + Privacy scan
       ↓
Metadata stored in IndexedDB
       ↓
Displayed in searchable grid
```

## Privacy & Security

### Privacy-First Design
- ✅ **100% local processing** - All AI inference runs in your browser
- ✅ **No server uploads** - Images never leave your device
- ✅ **No tracking** - No analytics or telemetry
- ✅ **Offline capable** - Works without internet after model download
- ✅ **Data control** - You can clear all data anytime

### Data Storage
- Images stored as base64 in IndexedDB (browser's local database)
- Metadata includes: filename, classification, privacy score, dimensions
- All data stays in your browser's sandboxed storage
- No cookies, no external requests

## Getting Started

### Prerequisites
- Modern browser (Chrome 96+, Edge 96+, or Firefox 119+)
- 4GB+ RAM recommended
- 2GB free disk space for model caching

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd web-starter-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to `http://localhost:5173`

### Building for Production
```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── FolderSelector.tsx      # Image upload interface
│   ├── PhotoGrid.tsx            # Grid view of photos
│   ├── PhotoDetailModal.tsx    # Detailed view with explanations
│   ├── SearchBar.tsx            # Search and filter interface
│   ├── ProgressIndicator.tsx   # Processing progress
│   └── PhotoOrganizer.tsx      # Main container component
├── utils/
│   ├── PhotoClassifier.ts      # VLM-based classification
│   ├── ExplainableAI.ts        # Explanation generation
│   ├── PrivacyScanner.ts       # Privacy risk detection
│   └── PhotoStorage.ts         # IndexedDB operations
├── types/
│   └── photo.ts                # TypeScript interfaces
├── workers/
│   └── vlm-worker.ts           # VLM Web Worker runtime
├── styles/
│   └── index.css               # Global styles
├── App.tsx                      # Main app component
├── main.tsx                     # Entry point
└── runanywhere.ts              # SDK initialization
```

## How It Works

### Image Classification
1. User selects images via file picker
2. Each image is:
   - Converted to RGB pixel array
   - Downscaled to 512px max dimension for performance
   - Sent to VLM with classification prompt
3. VLM analyzes visual features:
   - Text layout and structure
   - UI elements (for screenshots)
   - Photographic content
   - Document formatting
4. Returns category + confidence + explanation

### Privacy Scanning
1. Same image sent to VLM with privacy-focused prompt
2. Model looks for:
   - ID documents (passports, licenses)
   - Financial info (cards, bank statements)
   - Medical records
   - Personal identifiers (SSN, addresses)
3. Risk level assigned based on detected elements
4. Detailed breakdown provided to user

### Search & Discovery
- **Text search**: Matches filename, category, explanation
- **Category filter**: Quick access to document types
- **Privacy filter**: Find high-risk images
- **Date-based**: Sort by upload time

## Performance Considerations

### Model Loading
- First run: ~500MB download (one-time)
- Subsequent runs: Model cached in OPFS (Origin Private File System)
- Loading time: 10-30 seconds depending on connection

### Processing Speed
- Classification: ~2-5 seconds per image (CPU mode)
- WebGPU acceleration: ~1-2 seconds per image (if available)
- Batch processing: Sequential to maintain stability
- Web Worker: Keeps UI responsive during processing

### Browser Support
| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 96+ | ✅ Full | Best performance with WebGPU |
| Edge 96+ | ✅ Full | Best performance with WebGPU |
| Firefox 119+ | ⚠️ Limited | No WebGPU, CPU mode only |
| Safari 17+ | ⚠️ Limited | OPFS issues, use with caution |

## Known Limitations

1. **Model accuracy**: Small model optimized for speed, may misclassify complex images
2. **Privacy detection**: Not 100% reliable - manual verification recommended
3. **Browser storage**: IndexedDB has size limits (varies by browser)
4. **Memory usage**: Large batches may cause issues on low-memory devices
5. **Mobile browsers**: Limited support, desktop recommended

## Use Cases

### Personal
- Organize photo library by type
- Find receipts for expense reports
- Identify sensitive documents before sharing
- Quick screenshot management

### Professional
- Document classification for archival
- Privacy audits before public sharing
- Organize work-related screenshots
- Receipt tracking for accounting

### Educational
- Organize study notes and materials
- Manage academic documents
- Research paper classification

## Contributing

This is a hackathon demo project. Contributions welcome:
- Bug fixes
- Performance improvements
- Additional classification categories
- Enhanced privacy detection rules

## License

MIT License - See LICENSE file

## Acknowledgments

- **RunAnywhere** - On-device AI SDK
- **Liquid AI** - LFM2-VL model
- **llama.cpp** - WASM inference engine
- **React** - UI framework

## FAQ

**Q: Is my data really private?**
A: Yes. All processing happens in your browser. Images are stored in IndexedDB (local to your browser). Nothing is sent to any server.

**Q: Can I use this offline?**
A: Yes, after the initial model download. The app works completely offline.

**Q: What happens to my photos if I clear browser data?**
A: They will be deleted. This app stores everything locally.

**Q: How accurate is the classification?**
A: The model is optimized for speed and size (~500MB). Accuracy is good for common categories but may struggle with ambiguous images.

**Q: Can I export my organized photos?**
A: Not in the current version. This is a demo focused on classification and privacy scanning.

**Q: Does this work on mobile?**
A: Limited support. Desktop browsers recommended for best experience.

## Support

For issues or questions:
- Check existing [GitHub Issues](issues)
- Review [RunAnywhere Documentation](https://docs.runanywhere.ai)
- Contact: [Your contact info]

---

**Built with privacy in mind. Your photos, your device, your control.**
