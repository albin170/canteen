let menu = JSON.parse(localStorage.getItem("menu")) || [
    { name: "Tea", price: 10 },
    { name: "Coffee", price: 15 },
    { name: "Veg Meals", price: 50 },
    { name: "Chicken Biriyani", price: 120 }
];

let cart = [];

function loadMenu() {
    const container = document.getElementById("menuContainer");
    container.innerHTML = "";

    menu.forEach((item, index) => {
        container.innerHTML += `
            <div class="menu-item">
                <h3>${item.name}</h3>
                <p>₹${item.price}</p>
                <button onclick="addToCart(${index})">Add to Cart</button>
            </div>
        `;
    });
}

function addToCart(index) {
    cart.push(menu[index]);
    updateCart();
}

function updateCart() {
    const cartDiv = document.getElementById("cartItems");
    cartDiv.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        cartDiv.innerHTML += `<p>${item.name} - ₹${item.price}</p>`;
        total += item.price;
    });

    document.getElementById("totalAmount").innerText = "Total: ₹" + total;
}

document.getElementById("orderForm").addEventListener("submit", function(e) {
    e.preventDefault();
    alert("Order placed successfully!");
    cart = [];
    updateCart();
});

loadMenu();
