import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getDatabase, ref, push, set, onValue, get, update, remove 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

import { 
  getAuth, signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAgyKhldWwDwsVe7-v5Z7VqWWEmNgwm7Q0",
  authDomain: "canteen-2bbdf.firebaseapp.com",
  projectId: "canteen-2bbdf",
  storageBucket: "canteen-2bbdf.firebasestorage.app",
  messagingSenderId: "751369888730",
  appId: "1:751369888730:web:144df29864774d2a85d6e3",
  measurementId: "G-PXR49SEL4E"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

let cart = [];
let total = 0;

/* ===================== STUDENT SIDE ===================== */

const menuDiv = document.getElementById("menu");

if (menuDiv) {
  onValue(ref(db, "menu"), (snapshot) => {
    menuDiv.innerHTML = "";
    snapshot.forEach(child => {
      const item = child.val();
      menuDiv.innerHTML += `
        <div class="card">
          <h3>${item.name}</h3>
          <p>₹${item.price}</p>
          <button onclick="window.addToCart('${item.name}', ${item.price})">
            Add
          </button>
        </div>
      `;
    });
  });
}

window.addToCart = function(name, price) {
  cart.push({ name, price });
  total += price;
  updateCart();
};

function updateCart() {
  const cartDiv = document.getElementById("cart");
  if (!cartDiv) return;

  cartDiv.innerHTML = "";
  cart.forEach(item => {
    cartDiv.innerHTML += `<p>${item.name} - ₹${item.price}</p>`;
  });

  document.getElementById("total").innerText = "Total: ₹" + total;
}

async function generateToken() {
  const counterRef = ref(db, "tokenCounter");
  const snapshot = await get(counterRef);

  let newToken = 1;
  if (snapshot.exists()) {
    newToken = snapshot.val() + 1;
  }

  await set(counterRef, newToken);
  return newToken;
}

window.placeOrder = async function() {
  const name = document.getElementById("studentName").value;
  if (!name || cart.length === 0) return alert("Fill name & add items");

  const token = await generateToken();

  await set(ref(db, "orders/" + token), {
    name,
    items: cart,
    total,
    status: "Pending",
    time: new Date().toLocaleString()
  });

  document.getElementById("tokenDisplay").innerText =
    "Your Token Number: " + token;

  cart = [];
  total = 0;
  updateCart();
};

/* ===================== ADMIN LOGIN ===================== */

window.adminLogin = function() {
  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      document.getElementById("loginSection").style.display = "none";
      document.getElementById("adminDashboard").style.display = "block";
      loadAdminData();
    })
    .catch(() => alert("Invalid Login"));
};

/* ===================== ADMIN FUNCTIONS ===================== */

window.addMenuItem = async function() {
  const name = document.getElementById("itemName").value;
  const price = document.getElementById("itemPrice").value;

  if (!name || !price) return;

  await push(ref(db, "menu"), {
    name,
    price: Number(price)
  });

  alert("Item Added");
};

function loadAdminData() {

  const menuList = document.getElementById("menuList");
  const orderList = document.getElementById("orderList");
  const revenueDisplay = document.getElementById("revenueDisplay");

  let totalRevenue = 0;

  onValue(ref(db, "menu"), (snapshot) => {
    menuList.innerHTML = "";
    snapshot.forEach(child => {
      const item = child.val();
      menuList.innerHTML += `
        <div class="card">
          ${item.name} - ₹${item.price}
          <button onclick="window.deleteMenu('${child.key}')">
            Delete
          </button>
        </div>
      `;
    });
  });

  onValue(ref(db, "orders"), (snapshot) => {
    orderList.innerHTML = "";
    totalRevenue = 0;

    snapshot.forEach(child => {
      const order = child.val();
      totalRevenue += order.total;

      orderList.innerHTML += `
        <div class="card">
          <h3>Token: ${child.key}</h3>
          <p>${order.name}</p>
          <p>Total: ₹${order.total}</p>
          <p>Status: ${order.status}</p>
          <button onclick="window.markDone(${child.key})">
            Mark Done
          </button>
        </div>
      `;
    });

    revenueDisplay.innerText = "₹" + totalRevenue;
  });
}

window.deleteMenu = async function(id) {
  await remove(ref(db, "menu/" + id));
};

window.markDone = async function(token) {
  await update(ref(db, "orders/" + token), {
    status: "Completed"
  });
};
