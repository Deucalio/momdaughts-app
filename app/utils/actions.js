const BACKEND_URL = "http://192.168.18.5:3000";
export const fetchCartItemsCount = async (authenticatedFetch) => {
  try {
    const res = await authenticatedFetch(`${BACKEND_URL}/cart-items-count`);
    console.log("res:", res);
    if (res.ok) {
      const data = await res.json();
      console.log("Cart Items Count:", data.count);
      return { success: true, count: data.count };
    }
  } catch (e) {
    console.log("Failed to fetch cart items count:", e);
    return { success: false, error: "Failed to fetch cart items count" };
  }
};

export const createOrder = async (authenticatedFetch, orderData) => {
  try {
    console.log("Creating order with data:", {
      itemCount: orderData.items?.length,
      total: orderData.total,
    });

    const res = await authenticatedFetch(`${BACKEND_URL}/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderData }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      console.log(
        "Order created successfully:",
        data.order?.name || data.order?.id
      );
      return {
        success: true,
        order: data.order,
        processingTime: data.processingTime,
      };
    }

    // Handle different error scenarios
    console.error("Order creation failed:", {
      status: res.status,
      error: data.error,
      details: data.details,
    });

    return {
      success: false,
      error: data.error || "Failed to create order",
      details: data.details,
      statusCode: res.status,
    };
  } catch (error) {
    console.error("Network/parsing error during order creation:", error);

    // Handle network errors
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return {
        success: false,
        error: "Network error - please check your connection",
        isNetworkError: true,
      };
    }

    return {
      success: false,
      error: "Something went wrong. Please try again.",
      originalError: error.message,
    };
  }
};
