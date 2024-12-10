const baseUrl = "https://images.dominos.co.in/";

document.getElementById("fetchOrders").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "fetchOrders" }, (response) => {
    if (response.success) {
      const rawData = response.data;
      const orderHistoryDiv = document.getElementById("orderHistory");
      orderHistoryDiv.innerHTML = "";

      let totalNetPrice = 0;

      if (rawData && rawData.orders && Array.isArray(rawData.orders)) {
        rawData.orders.forEach((order) => {
          const {
            orderId,
            orderDeliveredTimestamp,
            netPrice,
            items,
            orderState,
          } = order;
          const deliveryDate = new Date(orderDeliveredTimestamp);
          const formattedDate = deliveryDate.toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          totalNetPrice += netPrice;

          const orderDiv = document.createElement("div");
          orderDiv.classList.add("order");

          orderDiv.innerHTML = `
            <h3>Order ID: ${orderId}</h3>
            <p><strong>Delivered On:</strong> ${formattedDate}</p>
            <p><strong>Total:</strong> ₹${netPrice}</p>
            <h4>Items</h4>
            <ul id="items-${orderId}">
            </ul>
          `;

          if (items && Array.isArray(items)) {
            const itemsList = orderDiv.querySelector(`#items-${orderId}`);
            items.forEach((item) => {
              const { itemId, product } = item;
              const { productName, imageUrl, description } = product;
              const fullImageUrl = baseUrl + imageUrl;

              const itemDiv = document.createElement("li");
              itemDiv.innerHTML = `
                <p><strong>Item ID:</strong> ${itemId}</p>
                <p><strong>Product:</strong> ${description}</p>
                <p><strong>Status:</strong> ${orderState}</p>
                <p><img src="${fullImageUrl}" alt="${productName}" width="100" /></p>
              `;
              itemsList.appendChild(itemDiv);
            });
          } else {
            const itemsList = orderDiv.querySelector(`#items-${orderId}`);
            itemsList.innerHTML = "<li>No items found for this order.</li>";
          }

          orderHistoryDiv.appendChild(orderDiv);
        });

        const totalDiv = document.createElement("div");
        totalDiv.classList.add("total-price");
        totalDiv.innerHTML = `
          <h3>Total Net Price: ₹${totalNetPrice}</h3>
        `;
        orderHistoryDiv.prepend(totalDiv);
      } else {
        orderHistoryDiv.innerHTML =
          "<p>No orders found or invalid data format.</p>";
      }
    } else {
      alert("Failed to fetch orders: " + response.error);
    }
  });
});
