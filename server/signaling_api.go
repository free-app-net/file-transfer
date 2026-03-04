package server

import (
	"fmt"
	"io"
	"net/http"
	"time"
)

type SignalingApi struct {
	messaging *Messaging
}

func NewSignalingApi(messaging *Messaging) *SignalingApi {
	return &SignalingApi{
		messaging: messaging,
	}
}

func (s *SignalingApi) Register(mux *http.ServeMux) {
	mux.HandleFunc("/api/signaling/{roomId}/{peerId}", func(w http.ResponseWriter, r *http.Request) {
		roomId := r.PathValue("roomId")
		peerId := r.PathValue("peerId")

		switch r.Method {
		case http.MethodGet:
			s.sseHandler(w, r, roomId, peerId)
			return
		case http.MethodPost:
			s.postHandler(w, r, roomId, peerId)
			return
		default:
			s.writeResponse(w, http.StatusMethodNotAllowed, "expected GET or POST")
			return
		}
	})

}

func (s *SignalingApi) sseHandler(w http.ResponseWriter, r *http.Request, roomId, userId string) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Connection", "keep-alive")

	ch, err := s.messaging.Join(roomId, userId)
	if err != nil {
		s.writeResponse(w, http.StatusBadRequest, fmt.Sprintf("can't join: %s", err.Error()))
		return
	}
	defer s.messaging.Leave(roomId, userId)

	flusher, ok := w.(http.Flusher)
	if !ok {
		s.writeResponse(w, http.StatusInternalServerError, "no flusher")
		return
	}

	keepalive := time.NewTicker(30 * time.Second)
	defer keepalive.Stop()

	for {
		select {
		case msg, ok := <-ch:
			if !ok {
				// channel closed
				return
			}

			fmt.Fprintf(w, "data: %s\n\n", msg)
			flusher.Flush()

		case <-keepalive.C:
			// send keep-alive
			fmt.Fprintf(w, ": keep-alive\n\n")
			flusher.Flush()

		case <-r.Context().Done():
			// cleanup
			return
		}
	}
}

func (s *SignalingApi) postHandler(w http.ResponseWriter, r *http.Request, roomId, peerId string) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		s.writeResponse(w, http.StatusBadRequest, "malformed body")
		return
	}
	defer r.Body.Close()

	s.messaging.Send(roomId, peerId, string(body))

	s.writeResponse(w, http.StatusOK, "ok")
}

func (s *SignalingApi) writeResponse(w http.ResponseWriter, status int, v string) {
	w.WriteHeader(status)
	w.Write([]byte(v))
}
