const BACKEND_URL = "https://app-backend.momdaughts.com";
export const fetchCartItemsCount = async (authenticatedFetch) => {
  try {
    const res = await authenticatedFetch(`${BACKEND_URL}/cart-items-count`);
    if (res.ok) {
      const data = await res.json();
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

export const addToWishlist = async (authenticatedFetch, body) => {
  try {
    const res = await authenticatedFetch(`${BACKEND_URL}/add-to-wishlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });

    const data = await res.json();
    console.log("data:", data);

    if (res.ok) {
      return {
        success: true,
      };
    }
    return {
      success: false,
      error: data.error || "Failed to add to wishlist",
    };
  } catch (e) {
    console.log("Failed to add to wishlist:", e);
    return { success: false, error: "Failed to add to wishlist" };
  }
};

export const fetchProducts = async (authenticatedFetch, query) => {
  try {
    const response = await authenticatedFetch(
      `${BACKEND_URL}/products?${query}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    const data = await response.json();
    if (!data || !Array.isArray(data.products)) {
      throw new Error("Invalid response format");
    }
    return data.products || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const removeFromWishlist = async (authenticatedFetch, body) => {
  try {
    const res = await authenticatedFetch(
      `${BACKEND_URL}/remove-from-wishlist`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      }
    );

    const data = await res.json();

    if (res.ok) {
      return {
        success: true,
      };
    }
    return {
      success: false,
      error: data.error || "Failed to remove from wishlist",
    };
  } catch (e) {
    console.log("Failed to remove from wishlist:", e);
    return { success: false, error: "Failed to remove from wishlist" };
  }
};

export const removeAddress = async (authenticatedFetch, id) => {
  try {
    const res = await authenticatedFetch(`${BACKEND_URL}/address/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const data = await res.json();

    if (res.ok) {
      return {
        success: true,
      };
    }
    return {
      success: false,
      error: data.error || "Failed to remove address",
    };
  } catch (e) {
    console.log("Failed to remove address:", e);
    return { success: false, error: "Failed to remove address" };
  }
};

export const addToCart = async (authenticatedFetch, cartItem) => {
  try {
    const res = await authenticatedFetch(`${BACKEND_URL}/add-to-cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cartData: cartItem }),
    });

    const data = await res.json();

    if (res.ok) {
      return {
        success: true,
      };
    }
    return {
      success: false,
      error: data.error || "Failed to add to cart",
    };
  } catch (e) {
    console.log("Failed to add to cart:", e);
    return { success: false, error: "Failed to add to cart" };
  }
};

export const fetchWishlistItems = async (authenticatedFetch) => {
  try {
    const res = await authenticatedFetch(`${BACKEND_URL}/wishlist`, {});

    const data = await res.json();
    console.log("hqhqhq:\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", data);
    if (res.ok) {
      return {
        wishlist: data.wishlist,
        success: true,
      };
    }
    return {
      success: false,
      error: data.error || "Failed to fetch cart Items",
    };
  } catch (e) {
    console.log("Failed to fetch items from cart:", e);
    return { success: false, error: "Failed to fetch items from cart" };
  }
};

export const fetchArticles = async (
  authenticatedFetch,
  numberOfArticles = 3
) => {
  try {
    const response = await authenticatedFetch(
      `${BACKEND_URL}/articles?numberOfArticles=${numberOfArticles}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch blogs: ${response.status}`);
    }
    const data = await response.json();
    if (!data || !Array.isArray(data.articles)) {
      throw new Error("Invalid response format");
    }
    console.log("ARticles ====: ", data);
    return data.articles || [];
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
};

export const fetchArticle = async (authenticatedFetch, id) => {
  try {
    const response = await authenticatedFetch(
      `${BACKEND_URL}/article?articleId=${id}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching article:", error);
    return [];
  }
};

export const fetchDevices = async (authenticatedFetch) => {
  try {
    const response = await authenticatedFetch(`${BACKEND_URL}/ipl-devices`);
    if (response.ok) {
      const data = await response.json();
      return data.collections;
    }
  } catch (error) {
    console.error("Failed to fetch devices:", error);
    return [];
  }
};

export const fetchCollection = async (authenticatedFetch, id) => {
  try {
    const response = await authenticatedFetch(
      `${BACKEND_URL}/collections/${id}`
    );
    if (response.ok) {
      const data = await response.json();
      return data.collection;
    }
  } catch (error) {
    console.error("Failed to fetch collection:", error);
    return [];
  }
};

export const fetchCollections = async (authenticatedFetch, ids) => {
  try {
    const response = await authenticatedFetch(
      `${BACKEND_URL}/collections${ids ? `?collectionsIds=${ids}` : ""}`
    );
    if (response.ok) {
      const data = await response.json();
      return data.collections;
    }
  } catch (error) {
    console.error("Failed to fetch collections:", error);
    return [];
  }
};

export const createIPLProfile = async (authenticatedFetch, data) => {
  const { onboardingData } = data;
  try {
    const response = await authenticatedFetch(
      `${BACKEND_URL}/ipl/create-profile`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(onboardingData),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
      };
    }
  } catch (error) {
    console.error("Failed to create IPL profile:", error);
    return {
      success: false,
      error: "Failed to create IPL profile",
      details: error.message,
    };
  }
};

export const fetchIPLProfile = async (authenticatedFetch) => {
  try {
    const response = await authenticatedFetch(`${BACKEND_URL}/ipl/profile`);
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        iplProfile: data.iplProfile,
        monthCounts: data.monthCounts || [],
      };
    }
  } catch (error) {
    console.error("Failed to fetch IPL profile:", error);
    return {
      success: false,
      error: "Failed to fetch IPL profile",
      details: error.message,
    };
  }
};

export const fetchCompletedSessions = async (authenticatedFetch) => {
  try {
    const response = await authenticatedFetch(
      `${BACKEND_URL}/ipl/current-sessions-completed`
    );
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        completedSessions: data.completedSessions || 0,
        total: data.total || 6
      };
    }
  } catch (error) {
    console.error("Failed to fetch completed sessions:", error);
    return {
      success: false,
      error: "Failed to fetch completed sessions",
      details: error.message,
    };
  }
}

export const createIPLSession = async (authenticatedFetch, data) => {
  try {
    const response = await authenticatedFetch(
      `${BACKEND_URL}/ipl/create-session`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
      };
    }
  } catch (error) {
    console.error("Failed to create IPL session:", error);
    return {
      success: false,
      error: "Failed to create IPL session",
      details: error.message,
    };
  }
};

export const appendShippingAdresses = async (authenticatedFetch, email) => {
  // Post request to /append-shipping-addresses

  authenticatedFetch(`${BACKEND_URL}/append-shipping-addresses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  console.log("Shipping addresses appended");
};

export const addShippingAddress = async (authenticatedFetch, data) => {
  try {
    const response = await authenticatedFetch(
      `${BACKEND_URL}/add-shipping-address`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
      };
    }
  } catch (error) {
    console.error("Failed to add shipping address:", error);
    return {
      success: false,
      error: "Failed to add shipping address",
      details: error.message,
    };
  }
};

export const fetchTotalWishlistItemsCount = async (authenticatedFetch) => {
  try {
    const response = await authenticatedFetch(
      `${BACKEND_URL}/total-wishlist-items-count`
    );
    if (response.ok) {
      const data = await response.json();
      return data.count;
    }
  } catch (error) {
    // console.error("Failed to fetch total wishlist items count:", error);
    return 0;
  }
};

export const updateShippingAddress = async (authenticatedFetch, data) => {
  try {
    const response = await authenticatedFetch(
      `${BACKEND_URL}/address/${data.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
      };
    }
  } catch (error) {
    console.error("Failed to update shipping address:", error);
    return {
      success: false,
      error: "Failed to update shipping address",
      details: error.message,
    };
  }
};

// Send OTP for password reset
export const sendOTP = async (formattedData) => {
  console.log("formattedData", formattedData);
  try {
    const response = await fetch(`${BACKEND_URL}/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formattedData }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("data \n\n\n\n\n\n", data);
      return {
        success: true,
        message: data.message,
      };
    } else {
      const errorData = await response.json();
      console.log("errorData", errorData);
      return {
        success: false,
        error: errorData.error || "Failed to send OTP",
      };
    }
  } catch (error) {
    console.error("Failed to send OTP:", error);
    return {
      success: false,
      error: "Failed to send OTP",
      details: error.message,
    };
  }
};

// Verify OTP
export const verifyOTP = async (email, otp) => {
  try {
    const response = await fetch(`${BACKEND_URL}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEmail: email, otp }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: data.message,
      };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || "Failed to verify OTP",
      };
    }
  } catch (error) {
    console.error("Failed to verify OTP:", error);
    return {
      success: false,
      error: "Failed to verify OTP",
      details: error.message,
    };
  }
};

// Reset Password
export const resetPassword = async (data) => {
  try {
    const response = await fetch(`${BACKEND_URL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return {
        success: true,
        message: responseData?.message,
        requiresReLogin: responseData?.requiresReLogin,
      };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || "Failed to reset password",
      };
    }
  } catch (error) {
    console.error("Failed to reset password:", error);
    return {
      success: false,
      error: "Failed to reset password",
      details: error.message,
    };
  }
};

export const fetchRecentOrders = async (authenticatedFetch) => {
  try {
    const response = await authenticatedFetch(`${BACKEND_URL}/recent-orders`);
    if (response.ok) {
      const data = await response.json();
      return { success: true, orders: data.formattedOrders };
    }
    return {
      success: false,
    };
  } catch (error) {
    return {
      success: false,
    };
  }
};

export const fetchAllOrders = async (authenticatedFetch) => {
  try {
    const response = await authenticatedFetch(`${BACKEND_URL}/all-orders`);
    if (response.ok) {
      const data = await response.json();
      return { success: true, orders: data.orders };
    }
    return {
      success: false,
    };
  } catch (error) {
    return {
      success: false,
    };
  }
};

export const fetchOrder = async (authenticatedFetch, orderId) => {
  try {
    const response = await authenticatedFetch(
      `${BACKEND_URL}/order/${orderId}`
    );
    if (response.ok) {
      const data = await response.json();
      return { success: true, order: data.order };
    }
    return {
      success: false,
    };
  } catch (error) {
    return {
      success: false,
    };
  }
};

export const updateUserName = async (authenticatedFetch, data) => {
  try {
    const response = await authenticatedFetch(`${BACKEND_URL}/update-name`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return {
        success: true,
        data: responseData,
        user: responseData.user,
        message: responseData.message,
      };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || "Failed to update name",
      };
    }
  } catch (error) {
    console.error("Failed to update name:", error);
    return {
      success: false,
      error: "Failed to update name",
      details: error.message,
    };
  }
};

export const updateUserEmail = async (authenticatedFetch, data) => {
  try {
    const response = await authenticatedFetch(`${BACKEND_URL}/update-email`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newEmail: data.newEmail,
        otp: data.otp,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return {
        success: true,
        data: responseData,
        user: responseData.user,
        message: responseData.message,
      };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || "Failed to update email",
      };
    }
  } catch (error) {
    console.error("Failed to update email:", error);
    return {
      success: false,
      error: "Failed to update email",
      details: error.message,
    };
  }
};

export const updateUserPhone = async (authenticatedFetch, data) => {
  try {
    const response = await authenticatedFetch(`${BACKEND_URL}/update-phone`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: data.phone.trim(),
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return {
        success: true,
        data: responseData,
        user: responseData.user,
        message: responseData.message,
      };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || "Failed to update phone",
      };
    }
  } catch (error) {
    console.error("Failed to update phone:", error);
    return {
      success: false,
      error: "Failed to update phone",
      details: error.message,
    };
  }
};

export const updateUserPassword = async (authenticatedFetch, data) => {
  try {
    const response = await authenticatedFetch(
      `${BACKEND_URL}/update-password`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword: data.newPassword,
        }),
      }
    );

    if (response.ok) {
      const responseData = await response.json();
      return {
        success: true,
        data: responseData,
        message: responseData.message,
      };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || "Failed to update password",
      };
    }
  } catch (error) {
    console.error("Failed to update password:", error);
    return {
      success: false,
      error: "Failed to update password",
      details: error.message,
    };
  }
};

export const isEmailAlreadyTaken = async (authenticatedFetch, email) => {
  try {
    const response = await authenticatedFetch(
      `${BACKEND_URL}/is-email-taken`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      }
    );
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        emailTaken: data.emailTaken,
      };
    }
    return {
      success: false,
    };
  } catch (error) {
    return {
      success: false,
    };
  }
};
