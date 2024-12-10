const fetchOrders = async (authtoken, userId) => {
  const apiUrl =
    "https://api.dominos.co.in/order-service/ve3/orders?pageNo=1&pageSize=10&deliveryType=&mobile=8765562301&userId=" +
    userId;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        authtoken: authtoken, // Use the received auth token
        userid: userId,
      },
      referrer: "https://pizzaonline.dominos.co.in/",
      referrerPolicy: "strict-origin-when-cross-origin",
      mode: "cors",
      credentials: "omit",
    });

    const rawData = await response.json();
    return { rawData };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { rawData: null };
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_ORDERS") {
    fetchOrders(message.authtoken, message.userId)
      .then((response) => {
        sendResponse(response);
      })
      .catch((error) => {
        console.error("Error in message handler:", error);
        sendResponse({ rawData: null });
      });
    return true;
  }
});
