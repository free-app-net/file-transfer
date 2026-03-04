package server

import (
	"testing"
	"time"
)

func assertCounts(t *testing.T, messaging *Messaging, rooms, pubsub int) {
	if messaging.rooms.Count() != rooms {
		t.Errorf("expected %d room, got %d", rooms, messaging.rooms.Count())
	}
	if messaging.pubsub.Count() != pubsub {
		t.Errorf("expected %d subscriber, got %d", pubsub, messaging.pubsub.Count())
	}
}

// A quick and comprehensive test for join, send, leave
func TestMessagingHappyPath(t *testing.T) {
	messaging := NewMessaging()

	aCh, err := messaging.Join("123", "a")
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
	if aCh == nil {
		t.Errorf("expected channel to be non-nil")
	}

	assertCounts(t, messaging, 1, 1)

	bCh, err := messaging.Join("123", "b")
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
	if bCh == nil {
		t.Errorf("expected channel to be non-nil")
	}

	assertCounts(t, messaging, 1, 2)

	if ok := messaging.Send("123", "b", "hello a"); !ok {
		t.Errorf("expected send to succeed")
	}

	select {
	case val := <-aCh:
		if val != "hello a" {
			t.Errorf("expected value to be 'hello a', got %v", val)
		}
	case <-time.After(time.Second):
		t.Errorf("nothing was sent")
	}

	if ok := messaging.Send("123", "a", "hello b"); !ok {
		t.Errorf("expected send to succeed")
	}

	select {
	case val := <-bCh:
		if val != "hello b" {
			t.Errorf("expected value to be 'hello b', got %v", val)
		}
	case <-time.After(time.Second):
		t.Errorf("nothing was sent")
	}

	if ok := messaging.Leave("123", "a"); !ok {
		t.Errorf("expected leave to succeed")
	}

	assertCounts(t, messaging, 1, 1)

	if ok := messaging.Leave("123", "b"); !ok {
		t.Errorf("expected leave to succeed")
	}

	assertCounts(t, messaging, 0, 0)
}

func TestSinglePeerMessaging(t *testing.T) {
	messaging := NewMessaging()

	_, err := messaging.Join("123", "a")
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}

	assertCounts(t, messaging, 1, 1)

	if ok := messaging.Send("123", "b", "hello a"); ok {
		t.Errorf("expected send to not succeed")
	}

	if ok := messaging.Leave("123", "a"); !ok {
		t.Errorf("expected leave to succeed")
	}

	assertCounts(t, messaging, 0, 0)
}

func TestRoomOvercrowding(t *testing.T) {
	messaging := NewMessaging()

	_, err := messaging.Join("123", "a")
	if err != nil {
		t.Errorf("unexpected a to join: %v", err)
	}

	_, err = messaging.Join("123", "b")
	if err != nil {
		t.Errorf("unexpected b to join: %v", err)
	}

	_, err = messaging.Join("123", "c")
	if err == nil {
		t.Errorf("unexpected c to fail joiningf: %v", err)
	}

	assertCounts(t, messaging, 1, 2)
}
