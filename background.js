chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchOrders") {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const authToken = userInfo.headers?.credentials?.refreshToken;
    const userId = userInfo.userId;

    if (!authToken || !userId) {
      sendResponse({ success: false, error: "Auth token or User ID missing" });
      return false;
    }

    fetch(
      `https://api.dominos.co.in/order-service/ve1/orders?userId=${userId}`,
      {
        headers: {
          authtoken: `Bearer ${authToken}`,
          userid: userId,
        },
      }
    )
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch orders");
        return response.json();
      })
      .then((data) => sendResponse({ success: true, data }))
      .catch((error) => sendResponse({ success: false, error: error.message }));

    return true;
  }
});
