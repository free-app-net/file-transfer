package server

import (
	"sync"
)

type Pubsub struct {
	mu    sync.Mutex
	peers map[string]chan string

	publishBuffer int
}

func NewPubsub(publishBuffer int) *Pubsub {
	return &Pubsub{
		peers:         make(map[string]chan string),
		publishBuffer: publishBuffer,
	}
}

func (p *Pubsub) Publish(user string, data string) bool {
	p.mu.Lock()
	defer p.mu.Unlock()

	ch, exists := p.peers[user]
	if !exists {
		return false
	}

	select {
	case ch <- data:
		return true
	default:
		return false
	}
}

func (p *Pubsub) Subscribe(user string) (chan string, bool) {
	p.mu.Lock()
	defer p.mu.Unlock()

	if _, exists := p.peers[user]; exists {
		return nil, false
	}

	c := make(chan string, p.publishBuffer)
	p.peers[user] = c

	return c, true
}

func (p *Pubsub) Unsubscribe(user string) bool {
	p.mu.Lock()
	defer p.mu.Unlock()

	if ch, exists := p.peers[user]; exists {
		close(ch)
		delete(p.peers, user)

		return true
	}

	return false
}

func (p *Pubsub) Count() int {
	p.mu.Lock()
	defer p.mu.Unlock()

	return len(p.peers)
}
