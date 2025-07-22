# On-Chain Renderer & Metadata Viewer

Renders generative artworks from Ethereum blockchain data and provides comprehensive metadata for digital preservation.

The on-chain generator assembles project scripts, dependency scripts, and token data stored on-chain into executable code for rendering NFTs in a web browser. No off-chain APIs required.

## Usage

### Artwork Rendering
```
https://render.genartfoundation.org/#/[contract-address]/[token-id]
```

Examples:
- `/#/0x059EDD72Cd353dF5106D2B9cC5ab83a52287aC3a/0`
- `/#/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270/13000000`

### Metadata Viewer
```
https://render.genartfoundation.org/metadata.html#/[contract-address]/[token-id]
```

Examples:
- `/metadata.html#/0x059EDD72Cd353dF5106D2B9cC5ab83a52287aC3a/0`
- `/metadata.html#/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270/13000000`

## Local Development

```bash
python3 -m http.server 8000
```

## Deployment

Push to GitHub and enable Pages. No configuration required.

## Features

### Artwork Renderer
- Direct on-chain rendering using smart contract data
- Supports p5.js and Processing.js libraries with appropriate handling
- Self-contained, no off-chain dependencies

### Metadata Viewer
- Displays comprehensive on-chain information for digital preservation
- Plain text output with project details, script code, and blockchain provenance  
- Works across different contract versions with automatic detection

## Technical Details

### Artwork Renderer
- Retrieves complete HTML from Art Blocks renderer contract(`0x953D288708bB771F969FCfD9BA0819eF506Ac718`)
- Handles Processing.js artworks with direct DOM injection
- Self-contained rendering with no external dependencies
- Hash-based routing for static hosting compatibility

### Metadata Viewer
- Makes direct calls to smart contract functions using ethers.js
- Retrieves complete script content from Art Blocks renderer contract
- All data sourced directly from blockchain with no external APIs
- Single HTML file, no build process