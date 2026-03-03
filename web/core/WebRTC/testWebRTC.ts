// disabled response
// 'v=0\r\no=- 7356606715119323003 2 IN IP4 127.0.0.1\r\ns…:0\r\na=sctp-port:5000\r\na=max-message-size:262144\r\n'
// enabled response
// "v=0\r\no=mozilla...THIS_IS_SDPARTA-99.0 948883955461562520 0 IN IP4 0.0.0.0\r\ns=-\r\nt=0 0\r\na=sendrecv\r\na=fingerprint:sha-256 86:E7:0A:22:7A:FE:00:5E:13:89:66:B9:74:93:CD:FF:FF:4A:3F:BF:5A:5C:DA:B4:70:56:42:E5:C6:1F:39:D0\r\na=group:BUNDLE 0\r\na=ice-options:trickle\r\na=msid-semantic:WMS *\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\nc=IN IP4 0.0.0.0\r\na=candidate:0 1 UDP 2122252543 4b8fb0ea-15a6-41d6-b63f-b12eb6fefa51.local 44776 typ host\r\na=candidate:1 1 TCP 2105524479 4b8fb0ea-15a6-41d6-b63f-b12eb6fefa51.local 9 typ host tcptype active\r\na=sendrecv\r\na=end-of-candidates\r\na=extmap-allow-mixed\r\na=ice-pwd:5d86c46dc46b66d7957e722b016693a4\r\na=ice-ufrag:fb5d33c5\r\na=mid:0\r\na=setup:actpass\r\na=sctp-port:5000\r\na=max-message-size:1073741823\r\n"

export function isWebRTCEnabled() {
  if (typeof RTCPeerConnection === "undefined") {
    return false;
  }

  return true;
}

// returns true if Proxyless (direct) peer connectivity is enabled in the browser.
// Returns false if TURN server is required
export function canWebRTCUseDirectConnection(): Promise<boolean> {
  if (!isWebRTCEnabled) {
    return Promise.resolve(false);
  }

  const pc = new RTCPeerConnection({
    iceServers: [], // no ice servers... is this okay?
  });

  return new Promise<boolean>((resolve) => {
    const timeout = setTimeout(() => {
      pc.close();

      console.info("does not work due to timeout");
      resolve(false);
    }, 3000); // smaller timeout is okay when going without ice servers

    pc.onicecandidate = (event) => {
      if (!event.candidate) {
        const sdp = pc.localDescription?.sdp;

        console.log("SDP", { desc: sdp });

        pc.close();
        clearTimeout(timeout);

        if (!sdp) {
          resolve(false);
          return;
        }

        const candidates = sdp
          .split("\r\n")
          .filter((line) => line.startsWith("a=candidate:"));

        const localCandidates = candidates.filter((candidate) =>
          candidate.includes("typ host"),
        );

        console.log("Candidate parsing", {
          totalCount: candidates.length,
          localCount: localCandidates.length,
          candidates: candidates,
        });

        if (candidates.length === 0) {
          // No candidates at all — WebRTC is effectively disabled or
          // all candidate generation was suppressed (e.g. Brave strict mode).
          resolve(false);
          return;
        }

        // TODO: are more checks needed? need iOS testing

        resolve(true);
      }
    };

    pc.createDataChannel("test");
    // depricated but forever supported
    pc.createOffer(
      (offer) => pc.setLocalDescription(offer),
      (err) => {
        // failed
        console.error("does not work due to error", { err });

        pc.close();
        clearTimeout(timeout);

        resolve(false);
      },
      { offerToReceiveAudio: false, offerToReceiveVideo: false },
    );
  });
}
