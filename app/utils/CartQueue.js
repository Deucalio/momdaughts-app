class CartQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.pendingItems = new Map(); // Track pending quantities per item
  }

  async addToQueue(cartData) {
    const key = `${cartData.userId}_${cartData.shopifyVariantId}`;

    // Update pending count immediately for UI
    const currentPending = this.pendingItems.get(key) || 0;
    this.pendingItems.set(key, currentPending + cartData.quantity);

    // Add to queue
    this.queue.push({
      ...cartData,
      id: Date.now() + Math.random(), // Unique ID
      timestamp: Date.now(),
    });

    // Start processing if not already
    if (!this.processing) {
      this.processQueue();
    }

    return key; // Return key for tracking
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      const key = `${item.userId}_${item.shopifyVariantId}`;

      try {
        // Make API call
        await this.addToCartAPI(item);

        // Update pending count
        const currentPending = this.pendingItems.get(key) || 0;
        const newPending = Math.max(0, currentPending - item.quantity);

        if (newPending === 0) {
          this.pendingItems.delete(key);
        } else {
          this.pendingItems.set(key, newPending);
        }

        // Emit success event
        this.emit("itemProcessed", { key, success: true, item });
      } catch (error) {
        console.error("Queue processing error:", error);

        // Handle failure - could retry or remove from pending
        const currentPending = this.pendingItems.get(key) || 0;
        const newPending = Math.max(0, currentPending - item.quantity);
        this.pendingItems.set(key, newPending);

        // Emit error event
        this.emit("itemProcessed", { key, success: false, item, error });
      }

      // Small delay to prevent overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.processing = false;
  }

  addToCartAPI(cartData) {
    return fetch("/api/add-to-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartData }),
    });
  }

  getPendingCount(userId, shopifyVariantId) {
    const key = `${userId}_${shopifyVariantId}`;
    return this.pendingItems.get(key) || 0;
  }

  // Simple event emitter
  listeners = {};

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
}

// Create singleton instance
export const cartQueue = new CartQueue();

// React Hook for using the queue
import { useState, useEffect } from "react";

export const useCartQueue = (userId, shopifyVariantId) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const updatePending = () => {
      const pending = cartQueue.getPendingCount(userId, shopifyVariantId);
      setPendingCount(pending);
      setIsProcessing(pending > 0);
    };

    const handleItemProcessed = ({ key, success }) => {
      const itemKey = `${userId}_${shopifyVariantId}`;
      if (key === itemKey) {
        updatePending();
      }
    };

    cartQueue.on("itemProcessed", handleItemProcessed);
    updatePending(); // Initial check

    return () => {
      // Cleanup listener
      const listeners = cartQueue.listeners["itemProcessed"];
      if (listeners) {
        const index = listeners.indexOf(handleItemProcessed);
        if (index > -1) listeners.splice(index, 1);
      }
    };
  }, [userId, shopifyVariantId]);

  const addToCart = async (quantity = 1) => {
    await cartQueue.addToQueue({
      userId,
      shopifyVariantId,
      quantity,
    });
  };

  return {
    addToCart,
    pendingCount,
    isProcessing,
  };
};
