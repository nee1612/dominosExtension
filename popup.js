document.getElementById("fetch-orders").addEventListener("click", () => {
  // Get the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];

    // Inject a script to retrieve refreshToken and userId from localStorage
    chrome.scripting.executeScript(
      {
        target: { tabId: activeTab.id },
        func: () => {
          try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const refreshToken =
              userInfo?.headers?.credentials?.accessKeyId ||
              "refreshToken not found.";
            const userId = userInfo?.headers?.userId || "userId not found.";
            console.log("Retrieved refreshToken:", refreshToken);
            return { refreshToken, userId };
          } catch (error) {
            return { error: error.message };
          }
        },
      },
      (results) => {
        if (results && results[0] && results[0].result) {
          const { refreshToken, userId, error } = results[0].result;

          if (error) {
            alert(`Error: ${error}`);
            return;
          }

          if (!refreshToken || !userId) {
            alert("Auth token or User ID is missing.");
            return;
          }

          // Log the refreshToken and userId before sending the message
          console.log("Sending request with refreshToken:", refreshToken);
          console.log("Sending request with userId:", userId);

          // Send the message to background.js to fetch orders
          chrome.runtime.sendMessage(
            {
              type: "GET_ORDERS",
              authtoken: refreshToken,
              userId,
              mobile: localStorage.getItem("mobileNo"), // Assuming this is set in localStorage
            },
            (response) => {
              if (!response || !response.rawData) {
                return displayError(
                  "Failed to fetch orders. Please try again."
                );
              }
              displayRawData(response.rawData);
            }
          );
        } else {
          alert("Failed to retrieve data from localStorage.");
        }
      }
    );
  });
});

function displayRawData(rawData) {
  const resultContainer = document.getElementById("orderHistory");
  resultContainer.innerHTML = ""; // Clear previous content

  let totalPrice = 0; // Initialize total price variable

  if (rawData && rawData.orders && Array.isArray(rawData.orders)) {
    const orders = rawData.orders;
    let ordersHtml = "";

    orders.forEach((order) => {
      const orderId = order.orderId;
      const dispatchedTimeStamp = order.dispatchedTimeStamp;
      const status = order.orderStatus;
      const netPrices = order.netPrice || 0; // Get the net price of the order
      totalPrice += netPrices;
      // Add the net price of the order to the total price
      // totalPrice += netPrice;

      // Format the dispatchedTimeStamp to a readable date
      const dispatchedDate = new Date(dispatchedTimeStamp);
      const formattedDispatchedDate = dispatchedDate.toLocaleString();

      let orderDetailsHtml = `<div class="order">
        <h3>Order ID: ${orderId}</h3>
         <p>Status: <strong>${status}</strong></p>
         <p>Total Price: ₹${netPrices}</p>
         <p>Dispatched Time: ${formattedDispatchedDate}</p>
        <div class="items">`;

      // Loop through items in the order and calculate total price of items
      order.items.forEach((item) => {
        const itemId = item.itemId;
        const product = item.product;
        const productName = product.name;
        const productDescription =
          product.description || "No description available";
        const productImageUrl = product.imageUrl
          ? `https://images.dominos.co.in/${product.imageUrl}`
          : "No image available";
        const productPrice = item.pricePerQty || 0; // Get the price of the item

        orderDetailsHtml += `
          <div class="item">
            <h4>Item ID: ${itemId}</h4>
            <p><strong>Product Name:</strong> ${productName}</p>
            <p><strong>Description:</strong> ${productDescription}</p>
            <img src="${productImageUrl}" alt="${productName}" style="max-width: 100px;">
            <p><strong>Price:</strong> ₹${productPrice}</p>
          </div>`;

        // Add the item price to the total price
      });

      orderDetailsHtml += "</div></div>";
      ordersHtml += orderDetailsHtml;
    });

    // Display the total price at the top of the container
    const totalPriceHtml = `<div class="total-price">
    <h3>Dominos Spens Calculator</h3>
      <h4>Total Price: ₹${totalPrice}</h4>
    </div>`;

    resultContainer.innerHTML = totalPriceHtml + ordersHtml; // Add total price above the orders
  } else {
    resultContainer.innerHTML = "<p>No orders found.</p>";
  }
}

function displayError(message) {
  console.error(message); // Debugging: Log the error message
  const resultContainer = document.getElementById("result-container");
  resultContainer.innerHTML = `<p style="color: red;">${message}</p>`;
}
