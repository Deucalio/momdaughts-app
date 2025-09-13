import { Alert } from "react-native";

const BACKEND_URL = "https://d4bcaa3b5f1b.ngrok-free.app";

// Utility function for debouncing
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Rate limiting for spam clicks
const RATE_LIMIT_MS = 100; // Minimum time between updates for same item

// Cart operations class to manage state and operations
export class CartOperations {
  constructor(authenticatedFetch) {
    this.authenticatedFetch = authenticatedFetch;
    this.pendingUpdates = new Map(); // Track pending updates
    this.activeRequests = new Map(); // Track active API requests
    this.updateQueue = new Map(); // Queue updates during active requests
    this.lastUpdateTime = new Map(); // Rate limiting

    // Bind the debounced function to maintain proper 'this' context
    this.debouncedUpdateToServer = debounce(
      this.updateToServer.bind(this),
      500
    );
  }

  // Fetch cart items from server
  async fetchCartItems(setCartItems, setLoading, isRefresh = false) {
    try {
      if (!isRefresh) setLoading(true);
      const response = await this.authenticatedFetch(`${BACKEND_URL}/cart`);
      if (!response.ok) {
        throw new Error("Failed to fetch cart items");
      }
      const data = await response.json();
      setCartItems(data.cart || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      Alert.alert("Error", "Failed to load cart items");
    } finally {
      if (!isRefresh) setLoading(false);
    }
  }

  // Server update function (not debounced itself, but called by debounced function)
  async updateToServer(itemId, setCartItems) {
    // Get the latest quantity for this item
    const quantity = this.pendingUpdates.get(itemId);
    if (quantity === undefined) return;

    // Check if there's already an active request for this item
    if (this.activeRequests.has(itemId)) {
      // Queue this update to be processed after current request completes
      this.updateQueue.set(itemId, quantity);
      return;
    }

    try {
      // Mark request as active
      this.activeRequests.set(itemId, true);

      const response = await this.authenticatedFetch(
        `${BACKEND_URL}/cart/${itemId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Clear the pending update since it was successful
      this.pendingUpdates.delete(itemId);

      // Update the UI to reflect server state (remove the temporary flag)
      setCartItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            const updatedItem = { ...item };
            // Only clear quantityUserInput if quantity doesn't exceed available inventory
            if (
              item.variantInventoryQuantity === undefined ||
              quantity <= item.variantInventoryQuantity
            ) {
              updatedItem.quantityUserInput = undefined;
            } else {
              updatedItem.quantityUserInput = quantity;
            }
            return updatedItem;
          }
          return item;
        })
      );
    } catch (error) {
      console.error("Error updating quantity:", error);

      // Show user-friendly error message
      const errorMessage = error.message.includes("Failed to fetch")
        ? "Network error. Please check your connection and try again."
        : "Failed to update quantity on server";

      Alert.alert("Error", errorMessage);

      // Rollback UI on failure - restore original quantity
      setCartItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            // Restore to the server's last known quantity
            // Remove the user input and pending flags
            return {
              ...item,
              quantityUserInput: undefined,
            };
          }
          return item;
        })
      );

      // Remove the failed update from pending
      this.pendingUpdates.delete(itemId);
    } finally {
      // Mark request as complete
      this.activeRequests.delete(itemId);

      // Process any queued updates
      if (this.updateQueue.has(itemId)) {
        const queuedQuantity = this.updateQueue.get(itemId);
        this.updateQueue.delete(itemId);
        this.pendingUpdates.set(itemId, queuedQuantity);

        // Trigger another debounced update for queued changes
        this.debouncedUpdateToServer(itemId, setCartItems);
      }
    }
  }

  // Update quantity with rate limiting and optimistic UI
  updateQuantity(itemId, newQuantity, setCartItems, removeItemCallback) {
    // Rate limiting check
    const now = Date.now();
    const lastTime = this.lastUpdateTime.get(itemId) || 0;

    if (now - lastTime < RATE_LIMIT_MS) {
      console.log(`Rate limiting update for item ${itemId}`);
      return; // Ignore rapid successive clicks
    }

    this.lastUpdateTime.set(itemId, now);

    // Handle removal case
    if (newQuantity < 1) {
      if (removeItemCallback) {
        removeItemCallback(itemId);
      }
      return;
    }

    // Instant local update with optimistic UI
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: newQuantity,
            quantityUserInput:
              item.variantInventoryQuantity !== undefined &&
              newQuantity > item.variantInventoryQuantity
                ? newQuantity
                : undefined,
          };
        }
        return item;
      })
    );

    // Track the latest update for this item
    this.pendingUpdates.set(itemId, newQuantity);

    // Debounce the server request
    this.debouncedUpdateToServer(itemId, setCartItems);
  }

  // Remove item from cart
  async removeItem(itemId, setCartItems) {
    try {
      // Optimistically remove from UI first
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));

      const response = await this.authenticatedFetch(
        `${BACKEND_URL}/cart/${itemId}`,

        {
          method: "DELETE",
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      // Clear any pending updates for this item
      this.pendingUpdates.delete(itemId);
      this.updateQueue.delete(itemId);
      this.activeRequests.delete(itemId);
      this.lastUpdateTime.delete(itemId);
    } catch (error) {
      console.error("Error removing item:", error);
      Alert.alert("Error", "Failed to remove item");

      // Restore the item to the cart on failure
      // You might want to refetch the cart here instead
      this.fetchCartItems(setCartItems, () => {}, false);
    }
  }

  // Handle refresh
  async handleRefresh(setCartItems, setLoading, setRefreshing) {
    setRefreshing(true);
    try {
      await this.fetchCartItems(setCartItems, setLoading, true);
    } finally {
      setRefreshing(false);
    }
  }
}

// Factory function to create cart operations instance
export const createCartOperations = (authenticatedFetch) => {
  return new CartOperations(authenticatedFetch);
};
