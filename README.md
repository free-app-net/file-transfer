# fpps - Free Peer-to-Peer file Sharing.

Hosted online at [fpps.free-app.net](https://fpps.free-app.net/). I have [published an article on my website](https://volovoy.com/article/building-peer-to-peer-file-sharing-application) that goes deeper into the internals of this project.

Note: this may not work on iOS devices due to privacy settings... I am currently investigating this.

## How to Use

Go to the application. Click on `Create Room`. The application generates a unique share link. Click on it to copy to the clipboard. Share it with anyone you want to exchange files with. When they join using the link, a direct WebRTC connection is established between your browsers.

Files are transferred directly between browsers. Your files never touch the server; the server only facilitates signaling to establish a WebRTC connection. Once connected, it's just you and your peer.

## How It Works

When you create a room, the application generates a unique code invisible to the server. To establish a direct peer-to-peer connection, the browsers communicate using encrypted messages via a database-less signaling server. After the connection is established, data transfer occurs directly between the browsers.

## Features
 - Browser-based: no installation required
 - Two-way uploads
 - Upload/Download many files
 - No limits
 - No databases
 - It just works

## Self Host

Run with Docker

```sh
docker run -e PORT=3000 -p 3000:3000 romanzy313/fpps:latest
```

Or use Docker Compose

```yaml
services:
  fpps:
    image: romanzy313/fpps:${TAGNAME:-latest}
    pull_policy: always
    restart: unless-stopped
    ports:
      - 3000
    environment:
      - PORT=3000
```

Additionally, GitHub releases contain `linux amd64` banaries. Default port is 3000. 

## Technologies

- WebRPC for peer-to-peer communication
- Preact frontend for a slim SPA experience
- Minimal server infrastructure: encrypted signaling via http/SSE to establish peer to peer connectivity
- Uploads folders with [client-zip](https://github.com/Touffy/client-zip), for single file download
- Uses [StreamSaver.js](https://github.com/jimmywarting/StreamSaver.js) to download files as a writable stream

## Development

This project uses node and go. Use `nvm` to activate the correct version of node.

Important dev commands are

- `pnpm dev` - Starts a dev web server at [localhost:5173](http://localhost:5173/)
- `pnpm server:dev` - Starts backend server at `localhost:6173`
- `pnpm preview` - Launches the server the same way as after docker build at [localhost:3000](http://localhost:3000/)
- `pnpm test` - Run unit tests
- `pnpm test:e2e` - Launches end-to-end tests. Works only in UI mode, cannot be CI automated at the moment

<!--## TODOS:
 - More UI information: dont close this window. Reload the browser on errors. You are directly connected to peers.-->
 <!--## Errors:
 - Unexpected error: Failed to addIceCandidate-->
