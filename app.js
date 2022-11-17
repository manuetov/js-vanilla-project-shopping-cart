// variables

const cartItems = document.querySelector(".cart-items"); // nav
// products-center
const productsCenterDOM = document.querySelector(".products-center");
// your cart overlay
const cartOverlayDOM = document.querySelector(".cart-overlay");
const cartSummaryDOM = document.querySelector(".cart-summary"); //cart
const closeCartBtn = document.querySelector(".close-cart");
const cartContent = document.querySelector(".cart-content");
const cartBtn = document.querySelector(".cart-btn");
const cartTotal = document.querySelector(".cart-total") 
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
    //  console.log(addButtons)
    // add all nodeslist of bottons in an empty array
    // buttonsDOM = buttons
    // find by id to show in cart or add to cart
    addButtons.forEach(button => {
      let id = button.dataset.id; // atribute of each id button
      // console.log(id)
      // check if matched item is in the cart array
      let inCart = cart.find(item => item.id === id);
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
        this.setCartValues(cart)
        // display cart-sumary item added
        this.addCartItem(cartItem)
        // show cart-summary
        this.showCart()
      });
    });
  }

  setCartValues(cart){
    let tempTotal = 0
    let itemsTotal = 0
    cart.map(item => {
      tempTotal += item.price * item.amount
      itemsTotal += item.amount
    })
    // writing data accessing DOM selectors
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
    cartItems.innerText = itemsTotal
    // console.log(cartTotal, cartItems)
  }

  // display add cart items in cart-summary
  addCartItem(cartItem) {
    const div = document.createElement('div')
    div.classList.add('cart-item')
      div.innerHTML = ` <img src=${cartItem.image} alt="product">
      <div>
        <h4>${cartItem.title}</h4>
        <h5>${cartItem.price} €</h5>
        <span class="remove-item" data-id=${cartItem.id}>Borrar</span>
      </div>
      <div>
        <i class="fa fa-chevron-up" data-id=${cartItem.id}></i>
        <p class="item-amount">${cartItem.amount}</p>
        <i class="fa fa-chevron-down"></i>
      </div>
      `
    cartContent.appendChild(div)
    console.log(cartContent)
  }

  // display cartOverlayDom with cartSummaryDom when some item is added to cart
  showCart() {
    // add classes from css
    cartOverlayDOM.classList.add('transparentBcg')
    cartSummaryDOM.classList.add('showCart')
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
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

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
    });
});
