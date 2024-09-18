export default {
  // Products page   

  // Flag to check if we are in test mode
  isTestMode: false,

  // Function to fetch product details (Simulated function, can be replaced with actual API call)
  async getProductDetails() {
    // Simulate fetching product details
    return [
      {
        id: 1,
        name: "Product 1",
        category: "Category 1",
        description: "Description 1",
        location: "Location 1",
        price: 100,
        sku: "SKU1",
        total_stock: 10
      },
      // Add more product details as needed
    ];
  },

  // Function to convert ID to a formatted string with a 'P' prefix
  idConverter: (num) => {
    if (num === undefined || num === null) {
      console.error('idConverter: num is undefined or null');
      return '';
    }
    let str = num.toString();
    let leadingZeros = "00000".substring(0, 5 - str.length);
    return 'P' + leadingZeros + str;
  },

  // Function to fetch products
  getProducts: async function () {
    console.clear();

    try {
      // Ensure the user is authenticated before proceeding
      this.checkAuthAndRedirect();  // <-- Inserted the check here

      // Fetch products using the configured query (No longer using clientId)
      const products = await getProducts.run(); 

      // Return all products
      return products.map(p => {
        return {
          ID: this.idConverter(p.id),
          Name: p.name,
          SKU: p.sku,
          Category: p.category,
          UnitPrice: p.price.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' }),
          Stock: p.total_stock,
          ProductID: p.id,
        };
      });

    } catch (error) {
      console.error('Error in getProducts:', error);
      return [];
    }
  },

  // Add the authentication check here
  checkAuthAndRedirect: function () {
    if (storeValue('userID')) {
      // User is authenticated
      console.log('User is authenticated.');
    } else {
      // User is not authenticated, redirect to the login page
      navigateTo('LoginPage', {}, 'SAME_WINDOW');
    }
  }
};

// // ------------------------------------------------------------

// Products 

// // ------------------------------------------------------------
// // Daniel T. K. W. - github.com/danieltkw - danielkopolo95@gmail.com
// // ------------------------------------------------------------






