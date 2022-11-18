// variables
const iconCart = document.querySelector(".nav-icon-cart"); // nav icon
const cartItems = document.querySelector(".cart-items"); // nav items amount
// products-center
const productsCenterDOM = document.querySelector(".products-center");
// your cart overlay
const cartOverlayDOM = document.querySelector(".cart-overlay");
const cartSummaryDOM = document.querySelector(".cart-summary"); //cart
const closeCartBtn = document.querySelector(".close-cart");
const cartContent = document.querySelector(".cart-content"); // cart items
const cartBtn = document.querySelector(".cart-btn");
const cartTotal = document.querySelector(".cart-total");
const clearCartBtn = document.querySelector(".clear-cart");

// array cart items saved in localstore
let cart = [];
// buttons
let buttonsDOM = [];

// getting products from json
class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;
      //destructuring
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}
// display products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `
      <!-- single product -->
      <article class="product">
         <div class="img-container">
            <img 
               class="product-img" 
               src=${product.image} 
               alt="product">
            <button class="add-btn" data-id=${product.id}>
               <i class="fa fa-shopping-cart"></i>
               añadir al carrito
            </button>
         </div>
         <h3>${product.title}</h3>
         <h4>${product.price} €</h4>
      </article>
      `;
    });
    productsCenterDOM.innerHTML = result;
  }

  getAddButtons() {
    const addButtons = [...document.querySelectorAll(".add-btn")];
    // console.log(addButtons)
    // add all bottons from products-center in an empty array buttonsDOM
    buttonsDOM = addButtons;
    // find by id to show in cart or add to cart
    addButtons.forEach((button) => {
      let id = button.dataset.id; // atribute of each id button
      // console.log(id)
      // check if matched item is in the cart array
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "en el carrito";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerText = "en el carrito";
        event.target.disabled = true;
        // get product from products
        let cartItem = { ...Storage.getProducts(id), amount: 1 };
        // console.log(cartItem)
        // add product to the cart array
        cart = [...cart, cartItem];
        // console.log(cart)
        // save cart in local Storage
        Storage.saveCart(cart);
        // set cart-summary values
        this.setCartValues(cart);
        // display cart-sumary item added
        this.addCartItem(cartItem);
        // show cart-summary
        this.showCart();
      });
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    // writing data accessing DOM selectors
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
    // console.log(cartTotal, cartItems)
  }
  // display add cart items in cart-summary
  addCartItem(cartItem) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = ` <img src=${cartItem.image} alt="product">
      <div>
        <h4>${cartItem.title}</h4>
        <h5>${cartItem.price} €</h5>
        <span class="remove-item" data-id=${cartItem.id}>Borrar</span>
      </div>
      <div>
        <i class="fa fa-chevron-up" data-id=${cartItem.id}></i>
        <p class="item-amount">${cartItem.amount}</p>
        <i class="fa fa-chevron-down" data-id=${cartItem.id}></i>
      </div>
      `;
    cartContent.appendChild(div);
    console.log(cartContent);
  }
  // display cartOverlayDom with cartSummaryDom when some item is added to cart
  showCart() {
    // add classes from css into DOM
    cartOverlayDOM.classList.add("transparentBcg");
    cartSummaryDOM.classList.add("showCart");
  }
  // check the cart in the local storage when an user visit the page
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart); // pass cart to calculate values
    this.populate(cart); // populate add items into cart
    closeCartBtn.addEventListener("click", this.hideCart);
    cartItems.addEventListener("click", this.showCart);
    iconCart.addEventListener("click", this.showCart);
  }
  populate(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  hideCart() {
    // remove classes from css into DOM
    cartOverlayDOM.classList.remove("transparentBcg");
    cartSummaryDOM.classList.remove("showCart");
  }
  cartLogic() {
    // clear cart button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    // cart funtionality
    // clear on items
    cartContent.addEventListener("click", (event) => {
      // console.log(event.target);
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        this.removeItem(id); // remove item without DOM
        // remove child item with DOM included
        cartContent.removeChild(removeItem.parentElement.parentElement);
        // increment or decrement amount
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        // use static method to push de new amount/increase into localStorage
        Storage.saveCart(cart);
        // use setCartValues to calculate de price
        this.setCartValues(cart);
        // the property nexElementSibling return de next node/hijo
        // increase the node class item-amount from DOM
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        console.log(tempItem);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  // clear all items
  clearCart() {
    // new array with all the items ids into the cart
    let cartItems = cart.map((item) => item.id);
    // all items ids that want to remove from cart
    cartItems.forEach((id) => this.removeItem(id));
    // remove all items into contentCart from the DOM
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    // all items are remove, because there're not any diferent ids
    cart = cart.filter((item) => item.id !== id);
    // empty the cart with no items
    this.setCartValues(cart); // empty cart
    Storage.saveCart(cart); // empty array Local Storage
    let button = this.getSingleButton(id); // products-center buttons
    button.disabled = false;
    button.innerHTML = ` 
    <i class="fa fa-shopping-cart"></i>
    añadir al carrito
    `;
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}
//local storage
class Storage {
  // static method no need to be instance like a new object
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  // id from the bottom product.
  // return product from local storage array than id is matched
  static getProducts(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  // at the moment the app is loaded return the items saved in the
  // array on local storage if its exist or an emty array
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  // at the moment de app/content is loaded check cart in local Storage
  ui.setupAPP();
  products
    .getProducts()
    .then((products) => {
      // get all products in an array
      ui.displayProducts(products);
      // call static method from Storage class to save products in localstorage
      Storage.saveProducts(products);
    })
    .then(() => {
      // after products are display in 85, already can access to class add-btn in 50
      ui.getAddButtons();
      ui.cartLogic();
    });
});
