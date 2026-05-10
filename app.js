const products = [
  {
    id: 1,
    name: "Trail Weekender Bag",
    category: "Travel",
    price: 128,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    description: "Weather-resistant carryall with padded straps and a separate shoe pocket.",
  },
  {
    id: 2,
    name: "Linen Desk Lamp",
    category: "Home",
    price: 84,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    description: "Warm dimmable light with a compact metal base for desks and side tables.",
  },
  {
    id: 3,
    name: "Everyday Overshirt",
    category: "Style",
    price: 96,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=900&q=80",
    description: "Midweight cotton layer with a relaxed cut and reinforced front pockets.",
  },
  {
    id: 4,
    name: "Wireless Charge Dock",
    category: "Tech",
    price: 72,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=900&q=80",
    description: "Low-profile charging station for phone, earbuds, and daily accessories.",
  },
  {
    id: 5,
    name: "Ceramic Pour Over Set",
    category: "Home",
    price: 58,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
    description: "Stackable brewer and cup set made for slow mornings and clean counters.",
  },
  {
    id: 6,
    name: "Compact Travel Wallet",
    category: "Travel",
    price: 46,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80",
    description: "Slim organizer with RFID lining, passport sleeve, and quick-access card slots.",
  },
  {
    id: 7,
    name: "Woven Runner Sneakers",
    category: "Style",
    price: 118,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    description: "Breathable daily sneakers with a cushioned sole and clean profile.",
  },
  {
    id: 8,
    name: "Noise Control Headphones",
    category: "Tech",
    price: 164,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    description: "Foldable wireless headphones with long battery life and soft ear pads.",
  },
];

const productGrid = document.querySelector("#productGrid");
const searchInput = document.querySelector("#searchInput");
const categoryFilter = document.querySelector("#categoryFilter");
const cartButton = document.querySelector("#cartButton");
const cartDrawer = document.querySelector("#cartDrawer");
const closeCart = document.querySelector("#closeCart");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const cartTotal = document.querySelector("#cartTotal");
const checkoutButton = document.querySelector("#checkoutButton");
const toast = document.querySelector("#toast");

let cart = JSON.parse(localStorage.getItem("northline-cart")) || [];
let toastTimer;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function saveCart() {
  localStorage.setItem("northline-cart", JSON.stringify(cart));
}

function renderProducts() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  if (filteredProducts.length === 0) {
    productGrid.innerHTML =
      '<div class="empty-state">No products match your current filters.</div>';
    return;
  }

  productGrid.innerHTML = filteredProducts
    .map(
      (product) => `
        <article class="product-card">
          <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy" />
          <div class="product-body">
            <div class="product-meta">
              <span class="product-category">${product.category}</span>
              <span class="product-rating">${product.rating} / 5</span>
            </div>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-action">
              <span class="price">${currency.format(product.price)}</span>
              <button type="button" data-product-id="${product.id}">Add</button>
            </div>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  cartCount.textContent = totalItems;
  cartTotal.textContent = currency.format(totalPrice);
  checkoutButton.disabled = cart.length === 0;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item) => `
        <article class="cart-item">
          <img src="${item.image}" alt="${item.name}" />
          <div>
            <h3>${item.name}</h3>
            <p>${currency.format(item.price)} each</p>
          </div>
          <div class="quantity-control" aria-label="Quantity for ${item.name}">
            <button type="button" data-cart-action="decrease" data-product-id="${item.id}" aria-label="Decrease quantity">-</button>
            <strong>${item.quantity}</strong>
            <button type="button" data-cart-action="increase" data-product-id="${item.id}" aria-label="Increase quantity">+</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2400);
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  renderCart();
  showToast(`${product.name} added to cart`);
}

function updateCartQuantity(productId, action) {
  const cartItem = cart.find((item) => item.id === productId);

  if (!cartItem) return;

  if (action === "increase") {
    cartItem.quantity += 1;
  }

  if (action === "decrease") {
    cartItem.quantity -= 1;
  }

  cart = cart.filter((item) => item.quantity > 0);
  saveCart();
  renderCart();
}

function openCart() {
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCartDrawer() {
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-product-id]");
  if (!addButton) return;

  addToCart(Number(addButton.dataset.productId));
});

cartItems.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-cart-action]");
  if (!quantityButton) return;

  updateCartQuantity(
    Number(quantityButton.dataset.productId),
    quantityButton.dataset.cartAction,
  );
});

searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);
cartButton.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartDrawer);

cartDrawer.addEventListener("click", (event) => {
  if (event.target === cartDrawer) closeCartDrawer();
});

checkoutButton.addEventListener("click", () => {
  if (cart.length === 0) return;

  cart = [];
  saveCart();
  renderCart();
  closeCartDrawer();
  showToast("Demo checkout complete");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeCartDrawer();
});

renderProducts();
renderCart();
