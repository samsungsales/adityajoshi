const defaultProducts = [
  {
    id: 1,
    name: 'Kanjivaram Bridal Silk',
    category: 'Bridal',
    price: 24500,
    rating: 4.9,
    stock: 6,
    image: 'https://images.unsplash.com/photo-1594736797933-d0f1a3f6f070?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    name: 'Banarasi Zari Saree',
    category: 'Wedding',
    price: 18200,
    rating: 4.7,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1610189012811-b5ff3fc9d9b7?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    name: 'Soft Silk Festive Edition',
    category: 'Festive',
    price: 7800,
    rating: 4.6,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1610030469668-6f9315f1f4cf?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    name: 'Linen Silk Contemporary',
    category: 'Daily Luxe',
    price: 5600,
    rating: 4.4,
    stock: 16,
    image: 'https://images.unsplash.com/photo-1610030642632-2b5b2f8bba58?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 5,
    name: 'Mysore Silk Gold Border',
    category: 'Classic',
    price: 12800,
    rating: 4.8,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e4?auto=format&fit=crop&w=900&q=80',
  },
];

const storage = {
  getProducts: () => JSON.parse(localStorage.getItem('dhanvi_products') || 'null') || [...defaultProducts],
  setProducts: (products) => localStorage.setItem('dhanvi_products', JSON.stringify(products)),
  getCart: () => JSON.parse(localStorage.getItem('dhanvi_cart') || '[]'),
  setCart: (cart) => localStorage.setItem('dhanvi_cart', JSON.stringify(cart)),
  getWishlist: () => JSON.parse(localStorage.getItem('dhanvi_wishlist') || '[]'),
  setWishlist: (wishlist) => localStorage.setItem('dhanvi_wishlist', JSON.stringify(wishlist)),
  getOrders: () => JSON.parse(localStorage.getItem('dhanvi_orders') || '[]'),
  setOrders: (orders) => localStorage.setItem('dhanvi_orders', JSON.stringify(orders)),
};

let products = storage.getProducts();
let cart = storage.getCart();
let wishlist = storage.getWishlist();

const qs = (id) => document.getElementById(id);
const productGrid = qs('productGrid');
const wishlistItems = qs('wishlistItems');
const cartItems = qs('cartItems');

const formatINR = (num) => `₹${num.toLocaleString('en-IN')}`;

function syncCounters() {
  qs('cartCount').textContent = cart.reduce((sum, item) => sum + item.qty, 0);
  qs('wishlistCount').textContent = wishlist.length;
}

function populateCategories() {
  const select = qs('categoryFilter');
  const cats = [...new Set(products.map((p) => p.category))];
  for (const cat of cats) {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.append(option);
  }
}

function filteredProducts() {
  const term = qs('searchInput').value.toLowerCase().trim();
  const category = qs('categoryFilter').value;
  const maxPrice = Number(qs('priceFilter').value);
  const sort = qs('sortFilter').value;

  let result = products.filter((p) => {
    const byTerm = !term || `${p.name} ${p.category}`.toLowerCase().includes(term);
    const byCategory = category === 'all' || p.category === category;
    const byPrice = p.price <= maxPrice;
    return byTerm && byCategory && byPrice;
  });

  if (sort === 'low-high') result.sort((a, b) => a.price - b.price);
  if (sort === 'high-low') result.sort((a, b) => b.price - a.price);
  if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);

  return result;
}

function renderCatalog() {
  const list = filteredProducts();
  productGrid.innerHTML = list
    .map(
      (p) => `
      <article class="product">
        <img src="${p.image}" alt="${p.name}" />
        <div class="body">
          <span class="pill">${p.category}</span>
          <h4>${p.name}</h4>
          <p>⭐ ${p.rating} • Stock: ${p.stock}</p>
          <div class="price-row">
            <strong>${formatINR(p.price)}</strong>
            <small>${p.stock > 0 ? 'Ready to Ship' : 'Out of stock'}</small>
          </div>
          <div class="actions">
            <button onclick="toggleWishlist(${p.id})">${wishlist.includes(p.id) ? 'Wishlisted' : 'Wishlist'}</button>
            <button class="primary" onclick="addToCart(${p.id})" ${p.stock <= 0 ? 'disabled' : ''}>Add to Cart</button>
          </div>
        </div>
      </article>
    `,
    )
    .join('');
}

function renderWishlist() {
  const list = products.filter((p) => wishlist.includes(p.id));
  wishlistItems.innerHTML = list.length
    ? list
        .map(
          (p) => `<div class="list-item"><span>${p.name}</span><span>${formatINR(p.price)}</span><button onclick="toggleWishlist(${p.id})">Remove</button></div>`,
        )
        .join('')
    : '<p>No items in wishlist.</p>';
}

function renderCart() {
  cartItems.innerHTML = cart.length
    ? cart
        .map((item) => {
          const p = products.find((prod) => prod.id === item.id);
          if (!p) return '';
          return `<div class="list-item"><span>${p.name} × ${item.qty}</span><span>${formatINR(p.price * item.qty)}</span><button onclick="removeFromCart(${item.id})">Remove</button></div>`;
        })
        .join('')
    : '<p>Your cart is empty.</p>';
  const total = cart.reduce((sum, item) => {
    const p = products.find((prod) => prod.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
  qs('cartTotal').textContent = formatINR(total);
}

function addToCart(id) {
  const p = products.find((prod) => prod.id === id);
  if (!p || p.stock < 1) return;
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    if (existing.qty < p.stock) existing.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }
  storage.setCart(cart);
  syncCounters();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  storage.setCart(cart);
  syncCounters();
  renderCart();
}

function toggleWishlist(id) {
  if (wishlist.includes(id)) wishlist = wishlist.filter((item) => item !== id);
  else wishlist.push(id);
  storage.setWishlist(wishlist);
  syncCounters();
  renderCatalog();
  renderWishlist();
}

function showPanel(panel) {
  const sections = {
    catalog: [qs('catalogPanel'), productGrid],
    wishlist: [qs('wishlistPanel')],
    cart: [qs('cartPanel')],
  };

  Object.values(sections).flat().forEach((el) => el.classList.add('hidden'));
  sections[panel].forEach((el) => el.classList.remove('hidden'));

  ['viewCatalog', 'viewWishlist', 'viewCart'].forEach((id) => qs(id).classList.remove('active'));
  qs(`view${panel.charAt(0).toUpperCase()}${panel.slice(1)}`).classList.add('active');
}

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.toggleWishlist = toggleWishlist;

['searchInput', 'categoryFilter', 'priceFilter', 'sortFilter'].forEach((id) => {
  qs(id).addEventListener('input', () => {
    if (id === 'priceFilter') qs('priceValue').textContent = formatINR(Number(qs('priceFilter').value));
    renderCatalog();
  });
});

qs('viewCatalog').addEventListener('click', () => showPanel('catalog'));
qs('viewWishlist').addEventListener('click', () => {
  showPanel('wishlist');
  renderWishlist();
});
qs('viewCart').addEventListener('click', () => {
  showPanel('cart');
  renderCart();
});

qs('checkoutForm').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!cart.length) {
    qs('checkoutMessage').textContent = 'Add products to cart before checkout.';
    return;
  }

  const formData = new FormData(event.target);
  const order = {
    id: `ORD-${Date.now()}`,
    createdAt: new Date().toISOString(),
    customer: Object.fromEntries(formData.entries()),
    items: cart,
    total: cart.reduce((sum, item) => {
      const p = products.find((prod) => prod.id === item.id);
      return sum + (p ? p.price * item.qty : 0);
    }, 0),
    status: 'Placed',
  };

  const orders = storage.getOrders();
  orders.unshift(order);
  storage.setOrders(orders);

  products = products.map((p) => {
    const item = cart.find((cartItem) => cartItem.id === p.id);
    if (!item) return p;
    return { ...p, stock: Math.max(0, p.stock - item.qty) };
  });

  storage.setProducts(products);
  cart = [];
  storage.setCart(cart);
  event.target.reset();
  qs('checkoutMessage').textContent = `Order ${order.id} placed successfully!`;

  syncCounters();
  renderCatalog();
  renderCart();
});

populateCategories();
syncCounters();
renderCatalog();
renderWishlist();
renderCart();
showPanel('catalog');
