# On-Chain Renderer

Renders generative artworks from Ethereum blockchain data.

The on-chain generator assembles project scripts, dependency scripts, and token data stored on-chain into executable code for rendering NFTs in a web browser. No off-chain APIs required.

## Usage

```
https://example.com/#/[contract-address]/[token-id]
```

Examples:
- `/#/0x059EDD72Cd353dF5106D2B9cC5ab83a52287aC3a/0`
- `/#/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270/13000000`

## Local Development

```bash
python3 -m http.server 8000
```

## Deployment

Push to GitHub and enable Pages. No configuration required.

## Technical Details

- Retrieves data URI from single contract call to Art Blocks On-Chain Generator
- Injects HTML as iframe source for token rendering
- Supports p5.js and Processing.js libraries with appropriate handling
- Uses hash-based routing for static hosting compatibility
- Self-contained, no off-chain dependencies
- Single HTML file, no build process