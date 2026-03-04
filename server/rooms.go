package server

import (
	"sync"
)

type Rooms struct {
	mu        sync.Mutex
	roomPeers map[string][2]string
}

func NewRooms() *Rooms {
	return &Rooms{
		roomPeers: make(map[string][2]string),
	}
}

func (r *Rooms) AddPeer(roomId, peerId string) bool {
	r.mu.Lock()
	defer r.mu.Unlock()

	peers, exists := r.roomPeers[roomId]
	if !exists {
		r.roomPeers[roomId] = [2]string{peerId, ""}
		return true
	}

	if peers[1] == "" {
		r.roomPeers[roomId] = [2]string{peers[0], peerId}
		return true
	}

	return false
}

func (r *Rooms) RemovePeer(roomId, peerId string) bool {
	r.mu.Lock()
	defer r.mu.Unlock()

	peers, exists := r.roomPeers[roomId]
	if !exists {
		return false
	}

	cleanup := true
	if peers[0] != "" && peers[1] != "" {
		cleanup = false
	}

	if peers[0] == peerId {
		r.roomPeers[roomId] = [2]string{peers[1], ""}
	} else if peers[1] == peerId {
		r.roomPeers[roomId] = [2]string{peers[0], ""}
	} else {
		return false
	}

	if cleanup {
		delete(r.roomPeers, roomId)
	}

	return true
}

func (r *Rooms) GetOtherPeer(roomId, forPeerId string) (string, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()

	peers, exists := r.roomPeers[roomId]
	if !exists {
		return "", false
	}

	if peers[0] == forPeerId {
		return peers[1], true
	}
	if peers[1] == forPeerId {
		return peers[0], true
	}
	return "", false
}

func (r *Rooms) Count() int {
	r.mu.Lock()
	defer r.mu.Unlock()

	return len(r.roomPeers)
}
