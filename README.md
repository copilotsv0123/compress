# Secure File Hosting

A Next.js application for secure, 24-hour file hosting with password protection and encryption.

## Features

- 🔒 **Password Protection**: Files are encrypted using AES encryption with your custom password
- 📦 **Automatic Compression**: Files are compressed into ZIP archives before encryption
- ⏰ **24-Hour Expiration**: Download links automatically expire after 24 hours
- 🚀 **Modern UI**: Built with Next.js 16, React 19, and Tailwind CSS
- 🔐 **Secure**: Password verification required before download
- 📱 **Responsive**: Works on all devices

## How It Works

1. **Upload**: Select a file and set a password
2. **Encrypt**: File is compressed and encrypted with your password
3. **Share**: Get a unique download URL to share
4. **Download**: Recipients need the password to decrypt and download
5. **Expire**: Files automatically expire and are deleted after 24 hours

## Installation

```bash
# Clone the repository
git clone https://github.com/copilotsv0123/compress.git
cd compress

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## Usage

### Uploading a File

1. Open the application in your browser (http://localhost:3000)
2. Click "Choose File" and select your file
3. Enter a strong password
4. Click "Upload File"
5. Copy the generated download URL and share it with the password

### Downloading a File

1. Open the download URL in your browser
2. Enter the password provided by the sender
3. Click "Download File"
4. Extract the ZIP file to access your content

## Technical Details

### Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI**: React 19, Tailwind CSS
- **Encryption**: crypto-js (AES)
- **Compression**: archiver
- **TypeScript**: Full type safety

### Security Features

- AES encryption for file content
- Password-protected downloads
- Automatic file expiration
- No password storage (used only for encryption/decryption)
- Secure file handling with proper cleanup

### API Routes

- `POST /api/upload` - Upload and encrypt a file
- `GET /api/download/[id]` - Download and decrypt a file with password

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Environment Variables

No environment variables are required for basic functionality. Files are stored locally in:
- `uploads/` - Temporary storage during processing
- `public/downloads/` - Encrypted files and metadata

## Security Considerations

- Files are encrypted before storage
- Passwords are never stored, only used for encryption/decryption
- Expired files are automatically deleted
- All file operations are server-side only
- HTTPS recommended for production use

## License

ISC
