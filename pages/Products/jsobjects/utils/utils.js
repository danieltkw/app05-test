export default {
    // Flag to check if we are in test mode
    isTestMode: true,

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
};


// // ------------------------------------------------------------

// Products 

// // ------------------------------------------------------------
// // Daniel T. K. W. - github.com/danieltkw - danielkopolo95@gmail.com
// // ------------------------------------------------------------







