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
- Renders the exact HTML returned by the generator contract with no parsing or transformation
- IPFS gateway resilience for projects with external assets (see below)
- Self-contained, no off-chain dependencies

### Metadata Viewer
- Displays comprehensive on-chain information for digital preservation
- Plain text output with project details, script code, and blockchain provenance  
- Works across different contract versions with automatic detection

## IPFS Gateway Shim

Some projects with external assets hardcode a specific IPFS gateway in the artist script. When that gateway is unreachable or refuses requests, the artwork fails to load its images even though the content remains available on the IPFS network.

Flex contracts publish a preferred gateway on-chain, and the generator includes it in every token's data as `tokenData.preferredIPFSGateway`. The generator provides no mechanism to apply it. This renderer completes that wrapper. A small script injected around the artwork serves any `/ipfs/[CID]` asset request through the chain-nominated preferred gateway instead of the hardcoded host.

Because IPFS is content-addressed, the CID resolves to identical bytes on any gateway. The substitution changes delivery only, never content.

Scope and guarantees:
- Artist script bytes are never modified. The shim intercepts asset requests at runtime.
- Only fires when the token's on-chain data includes a preferred gateway. All other tokens render untouched.
- Only `/ipfs/` paths are rewritten. `/ipns/` and non-IPFS URLs pass through.
- Covers p5.js loadImage. Projects using other load mechanisms are not intercepted.
- Every substitution is logged to the browser console for preservation telemetry.

To render the exact contract output with no shim, append `?shim=off` before the hash:
```
https://render.genartfoundation.org/?shim=off#/[contract-address]/[token-id]
```

## Project Data

JSON files in the repo root provide the project libraries for the explorer selector at genartfoundation.org:
- `artblocks-projects.json` covers the Art Blocks flagship and legacy contracts
- `brightmoments-projects.json` covers the Bright Moments contracts (CryptoCitizens, MOMENT, Flex, Finale)

Each entry contains the project name, artist name, contract address, and project ID. Token IDs follow the convention `projectId * 1000000 + output number`.

## Technical Details

### Artwork Renderer
- Retrieves complete HTML from the Art Blocks generator contract (`0x953D288708bB771F969FCfD9BA0819eF506Ac718`) via `getTokenHtml`
- Injects the returned document into an iframe via `srcdoc`, preserving same-origin behavior and exact byte content
- The document is never parsed or re-serialized, which keeps projects with nested script payloads intact
- Hash-based routing for static hosting compatibility

### Metadata Viewer
- Makes direct calls to smart contract functions using ethers.js
- Retrieves complete script content from Art Blocks renderer contract
- All data sourced directly from blockchain with no external APIs
- Single HTML file, no build process
