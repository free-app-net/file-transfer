package server

import (
	"fmt"
)

type Messaging struct {
	rooms  *Rooms
	pubsub *Pubsub
}

func NewMessaging() *Messaging {
	return &Messaging{
		rooms:  NewRooms(),
		pubsub: NewPubsub(5), // TODO: publish buffer of 5 messages, drop the rest?
	}
}

func (m *Messaging) Join(roomId, peerId string) (chan string, error) {
	if ok := m.rooms.AddPeer(roomId, peerId); !ok {
		return nil, fmt.Errorf("room is full")
	}

	ch, ok := m.pubsub.Subscribe(peerId)
	if !ok {
		return nil, fmt.Errorf("already subscribed")
	}

	return ch, nil
}

func (m *Messaging) Leave(roomId, peerId string) bool {
	ok1 := m.rooms.RemovePeer(roomId, peerId)
	ok2 := m.pubsub.Unsubscribe(peerId)

	return ok1 && ok2
}

func (m *Messaging) Send(roomId, peerId, msg string) bool {
	otherPeerId, ok := m.rooms.GetOtherPeer(roomId, peerId)
	if !ok {
		// not an error, as other peer haven't joined yet
		return false
	}

	return m.pubsub.Publish(otherPeerId, msg)
}
