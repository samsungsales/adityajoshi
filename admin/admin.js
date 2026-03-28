const storage = {
  getProducts: () => JSON.parse(localStorage.getItem('dhanvi_products') || '[]'),
  setProducts: (products) => localStorage.setItem('dhanvi_products', JSON.stringify(products)),
  getOrders: () => JSON.parse(localStorage.getItem('dhanvi_orders') || '[]'),
};

const qs = (id) => document.getElementById(id);
const formatINR = (num) => `₹${Number(num).toLocaleString('en-IN')}`;
let products = storage.getProducts();
let orders = storage.getOrders();

function computeStats() {
  const totalStock = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  qs('statProducts').textContent = products.length;
  qs('statStock').textContent = totalStock;
  qs('statOrders').textContent = orders.length;
  qs('statRevenue').textContent = formatINR(revenue);
}

function renderProducts() {
  qs('productsBody').innerHTML = products
    .map(
      (p) => `<tr><td>${p.name}</td><td>${p.category}</td><td>${formatINR(p.price)}</td><td>${p.stock}</td><td><button onclick="deleteProduct(${p.id})">Delete</button></td></tr>`,
    )
    .join('');
}

function renderOrders() {
  qs('ordersBody').innerHTML = orders.length
    ? orders
        .slice(0, 10)
        .map(
          (o) => `<tr><td>${o.id}</td><td>${o.customer.name}</td><td>${formatINR(o.total)}</td><td>${o.status}</td></tr>`,
        )
        .join('')
    : '<tr><td colspan="4">No orders yet.</td></tr>';
}

function refresh() {
  products = storage.getProducts();
  orders = storage.getOrders();
  computeStats();
  renderProducts();
  renderOrders();
}

function deleteProduct(id) {
  products = products.filter((p) => p.id !== id);
  storage.setProducts(products);
  refresh();
}

window.deleteProduct = deleteProduct;

qs('loginForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const email = qs('adminEmail').value.trim();
  const password = qs('adminPassword').value.trim();
  if (email === 'admin@dhanvisilks.shop' && password === 'dhanvi@123') {
    qs('loginCard').classList.add('hidden');
    qs('dashboard').classList.remove('hidden');
    refresh();
  } else {
    qs('loginMsg').textContent = 'Invalid credentials.';
  }
});

qs('productForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());
  const product = {
    id: Date.now(),
    name: data.name,
    category: data.category,
    price: Number(data.price),
    stock: Number(data.stock),
    rating: 4.5,
    image: data.image,
  };

  products.unshift(product);
  storage.setProducts(products);
  event.target.reset();
  refresh();
});
