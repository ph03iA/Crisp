// BroadcastChannel utilities for cross-tab communication

class BroadcastManager {
  constructor() {
    this.channel = null
    this.listeners = []

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('ai-interview-assistant')
      this.channel.addEventListener('message', this.handleMessage)
    }
  }

  handleMessage = (event) => {
    this.listeners.forEach(listener => listener(event.data))
  }

  subscribe(listener) {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  broadcast(type, payload) {
    if (this.channel) {
      const message = {
        type,
        payload,
        timestamp: Date.now()
      }
      this.channel.postMessage(message)
    }
  }

  close() {
    if (this.channel) {
      this.channel.removeEventListener('message', this.handleMessage)
      this.channel.close()
      this.channel = null
    }
    this.listeners = []
  }
}

// Singleton instance
export const broadcastManager = new BroadcastManager()

// React hook for convenient broadcast usage will be imported where needed
