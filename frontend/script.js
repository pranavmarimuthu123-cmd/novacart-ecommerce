const API_URL = "/api";

const demoProducts = [
    {
        id: 1,
        name: "Wireless Headphones",
        description: "Enjoy your favourite music with immersive sound.",
        price: 2499,
        category: "Electronics",
        stock: 12,
        image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        badge: "BESTSELLER"
    },
    {
        id: 2,
        name: "Classic Sneakers",
        description: "Everyday comfort with a clean modern look.",
        price: 1899,
        category: "Fashion",
        stock: 8,
        image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
        badge: "POPULAR"
    },
    {
        id: 3,
        name: "Smart Watch",
        description: "Stay connected and track your everyday activity.",
        price: 3299,
        category: "Accessories",
        stock: 10,
        image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
        badge: "TRENDING"
    },
    {
        id: 4,
        name: "Minimal Desk Lamp",
        description: "Add a warm glow to your workspace.",
        price: 1299,
        category: "Home",
        stock: 15,
        image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
        badge: "NEW"
    },
    {
        id: 5,
        name: "Premium Backpack",
        description: "Carry your daily essentials in style.",
        price: 1599,
        category: "Fashion",
        stock: 7,
        image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
        badge: "POPULAR"
    },
    {
        id: 6,
        name: "Wireless Earbuds",
        description: "Compact design with convenient wireless listening.",
        price: 1799,
        category: "Electronics",
        stock: 11,
        image_url: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=600&q=80",
        badge: "HOT PICK"
    },
    {
        id: 7,
        name: "Everyday Sunglasses",
        description: "A timeless accessory for sunny days.",
        price: 799,
        category: "Accessories",
        stock: 20,
        image_url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80",
        badge: "VALUE PICK"
    },
    {
        id: 8,
        name: "Ceramic Coffee Mug",
        description: "Make your coffee breaks a little better.",
        price: 399,
        category: "Home",
        stock: 25,
        image_url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=80",
        badge: "NEW"
    }
];

let products = [];
let selectedCategory = "All";

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const emptyState = document.getElementById("emptyState");
const cartCount = document.getElementById("cartCount");
const toast = document.getElementById("toast");

function formatPrice(price) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(Number(price) || 0);
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function getCart() {
    try {
        return JSON.parse(localStorage.getItem("novacart_cart")) || [];
    } catch {
        return [];
    }
}

function updateCartCount() {
    const cart = getCart();

    const total = cart.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
    );

    cartCount.textContent = total;
}

function getImageMarkup(product) {
    const image = product.image_url || "";

    if (!image) {
        return `<span class="product-emoji">🛍️</span>`;
    }

    return `
        <img
            src="${image}"
            alt="${escapeHTML(product.name)}"
            loading="lazy"
            onerror="this.style.display='none'; this.parentElement.querySelector('.product-emoji').style.display='block';"
        >
        <span class="product-emoji" style="display:none">🛍️</span>
    `;
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function renderProducts() {
    const searchTerm = searchInput.value.trim().toLowerCase();

    let filtered = products.filter(product => {
        const matchesSearch =
            String(product.name || "").toLowerCase().includes(searchTerm) ||
            String(product.description || "").toLowerCase().includes(searchTerm) ||
            String(product.category || "").toLowerCase().includes(searchTerm);

        const matchesCategory =
            selectedCategory === "All" ||
            String(product.category || "").toLowerCase() === selectedCategory.toLowerCase();

        return matchesSearch && matchesCategory;
    });

    switch (sortSelect.value) {
        case "low":
            filtered.sort((a, b) => Number(a.price) - Number(b.price));
            break;

        case "high":
            filtered.sort((a, b) => Number(b.price) - Number(a.price));
            break;

        case "name":
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }

    productGrid.innerHTML = "";

    if (filtered.length === 0) {
        emptyState.classList.remove("hidden");
        return;
    }

    emptyState.classList.add("hidden");

    filtered.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";

        const stock = Number(product.stock ?? 0);
        const outOfStock = stock <= 0;

        card.innerHTML = `
            <div class="product-image">
                ${getImageMarkup(product)}
                <span class="product-badge">
                    ${escapeHTML(product.badge || product.category || "FEATURED")}
                </span>
            </div>

            <div class="product-info">
                <span class="product-category">
                    ${escapeHTML(product.category || "General")}
                </span>

                <h3>${escapeHTML(product.name)}</h3>

                <p class="product-description">
                    ${escapeHTML(product.description || "Discover this product at NovaCart.")}
                </p>

                <div class="product-bottom">
                    <span class="product-price">
                        ${formatPrice(product.price)}
                    </span>

                    <button
                        class="add-cart-btn"
                        data-product-id="${Number(product.id)}"
                        ${outOfStock ? "disabled" : ""}
                    >
                        ${outOfStock ? "Sold Out" : "+ Add"}
                    </button>
                </div>
            </div>
        `;

        productGrid.appendChild(card);
    });
}

function addToCart(productId) {
    const product = products.find(item => Number(item.id) === Number(productId));

    if (!product) {
        showToast("Product not found.");
        return;
    }

    if (Number(product.stock) <= 0) {
        showToast("This product is currently out of stock.");
        return;
    }

    const cart = getCart();
    const existing = cart.find(item => Number(item.id) === Number(productId));

    if (existing) {
        if (Number(existing.quantity) >= Number(product.stock)) {
            showToast("Maximum available stock reached.");
            return;
        }

        existing.quantity += 1;
    } else {
        cart.push({
            id: Number(product.id),
            name: product.name,
            price: Number(product.price),
            image_url: product.image_url || "",
            stock: Number(product.stock),
            quantity: 1
        });
    }

    localStorage.setItem("novacart_cart", JSON.stringify(cart));

    updateCartCount();
    showToast(`${product.name} added to cart!`);
}

async function loadProducts() {
    productGrid.innerHTML =
        '<div class="loading-message">Loading amazing products...</div>';

    try {
        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
            throw new Error("Products API is not ready.");
        }

        const data = await response.json();

        const apiProducts = Array.isArray(data)
            ? data
            : data.products;

        if (!Array.isArray(apiProducts)) {
            throw new Error("Invalid products API response.");
        }

        products = apiProducts.map(product => ({
            ...product,
            id: Number(product.id),
            price: Number(product.price),
            stock: Number(product.stock ?? 0)
        }));

        if (products.length === 0) {
            products = demoProducts;
        }
    } catch (error) {
        console.info("Using demo products:", error.message);
        products = demoProducts;
    }

    renderProducts();
}

searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);

document.querySelectorAll(".category-card").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".category-card").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");
        selectedCategory = button.dataset.category;

        renderProducts();
    });
});

productGrid.addEventListener("click", event => {
    const button = event.target.closest(".add-cart-btn");

    if (button && !button.disabled) {
        addToCart(Number(button.dataset.productId));
    }
});

document.getElementById("resetFilters").addEventListener("click", () => {
    searchInput.value = "";
    selectedCategory = "All";
    sortSelect.value = "default";

    document.querySelectorAll(".category-card").forEach(button => {
        button.classList.toggle("active", button.dataset.category === "All");
    });

    renderProducts();
});

async function updateAccountLink() {
    const accountLink = document.getElementById("accountLink");
    const token = localStorage.getItem("novacart_token");

    if (!token) {
        accountLink.textContent = "Sign In";
        accountLink.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            localStorage.removeItem("novacart_token");
            localStorage.removeItem("novacart_user");
            return;
        }

        const data = await response.json();
        const user = data.user || data;

        accountLink.textContent = user.name || "My Account";
        accountLink.href = user.role === "admin"
            ? "admin.html"
            : "orders.html";
    } catch {
        accountLink.textContent = "My Account";
        accountLink.href = "orders.html";
    }
}

updateCartCount();
updateAccountLink();
loadProducts();