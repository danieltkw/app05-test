export default {
    // Function to fetch and store VAT (clientId)
    async fetchAndSetClientId() {
        try {
            const userID = appsmith.store.userID;  // Get stored VAT (userID) from login
            if (userID) {
                console.log("Fetched userID from store:", userID);
                storeValue("clientId", userID);  // Store the VAT in Appsmith store as clientId
                return userID;
            } else {
                console.log('No userID in store. Fetching from DB');
                const result = await getClientIdFromDB.run(); // Fallback query to fetch the VAT (vat_number)
                
                if (result && result.length > 0) {
                    const clientId = result[0].client_id; // 'vat_number' as 'client_id'
                    console.log("Fetched clientId from DB:", clientId);
                    storeValue("clientId", clientId); // Store the VAT in Appsmith store
                    return clientId;
                } else {
                    console.log("No result from getClientIdFromDB");
                    const defaultClientId = '1'; // Use '1' as default for testing
                    storeValue("clientId", defaultClientId);
                    return defaultClientId;
                }
            }
        } catch (error) {
            console.error('Error fetching VAT number (client ID):', error);
            const defaultClientId = '1'; // Use '1' as default for testing
            storeValue("clientId", defaultClientId);
            return defaultClientId;
        }
    },

    // Function to get the stored VAT (client ID)
    async getClientId() {
        if (appsmith.store.clientId) {
            console.log('Using stored clientId:', appsmith.store.clientId);
            return appsmith.store.clientId;
        } else {
            return await this.fetchAndSetClientId();  // Fetch and store clientId if not already stored
        }
    },

    // Function to fetch and calculate dashboard metrics
    async dashboardMetrics() {
        const clientId = await this.getClientId(); // Ensures clientId (vat_number) is set correctly
        console.log('Fetching orders for clientId (vat_number):', clientId);
        
        const orders = await getOrders.run({ clientId }); // Fetch orders based on VAT (clientId)
        console.log('Fetched orders:', orders);

        // Calculate various metrics from the fetched orders
        const allOrders = orders.length;  // Total orders
        const fulfilledOrders = orders.filter(o => o.delivery_status === 'Delivered').length;  // Delivered orders
        const cancelledOrders = orders.filter(o => o.delivery_status === 'Cancelled').length;  // Cancelled orders
        const shippedOrders = orders.filter(o => o.delivery_status === 'Shipped').length;  // Shipped orders
        const packedOrders = orders.filter(o => o.delivery_status === 'Packed').length;  // Packed orders
        const totalOrderValue = orders.reduce((a, b) => a + b.total, 0);  // Sum of total order values
        const formattedOrderValueAmount = totalOrderValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }).slice(0, -3);

        return {
            clientId,
            allOrders,
            fulfilledOrders,
            cancelledOrders,
            shippedOrders,
            packedOrders,
            totalOrderValue: formattedOrderValueAmount,
        };
    },

    // Function to fetch top ordered products
    async topOrderedProductsChart() {
        const clientId = await this.getClientId(); // Ensure VAT (clientId) is fetched
        console.log('Fetching top products for clientId:', clientId);
        
        const orderedProductsCount = await getOrderProductCount.run({ clientId });
        console.log('Fetched ordered products:', orderedProductsCount);

        return orderedProductsCount.map(p => {
            return {
                x: String(p.name), // Ensure the name is a string
                y: p.variant_count, // Ensure this is a number or appropriate value
            };
        });
    },

    // Function to fetch revenue by month
    async revenueChart() {
        try {
            const clientId = await this.getClientId(); // Ensure VAT (clientId) is fetched
            console.log('Fetching revenue data for clientId:', clientId);
            
            const revenueByMonth = await getRevenueByMonth.run({ clientId });
            console.log('Fetched revenue by month:', revenueByMonth);

            const months = [
                'January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'
            ];

            return revenueByMonth.map(r => {
                return {
                    x: months[parseInt(r.month.substring(5)) - 1] + ' ' + r.month.substring(2, 4),
                    y: r.total,
                };
            });
        } catch (error) {
            console.error('Error in revenueChart:', error);
            return [];
        }
    },

    // Function to initialize the dashboard with user-specific data
    async initializeDashboard() {
        const clientId = await this.getClientId();  // Retrieve the stored VAT (client ID)

        if (clientId) {
            console.log('Client ID (NIF):', clientId);  // Log the retrieved clientId for debugging
            await this.dashboardMetrics();  // Fetch and display dashboard metrics
            await this.topOrderedProductsChart();  // Fetch and display top products
            await this.revenueChart();  // Fetch and display revenue data
        } else {
            showAlert('No client ID found. Please log in again.', 'error');  // Show error if clientId not found
            navigateTo('Login', {}, 'SAME_WINDOW');  // Redirect to login if no clientId
        }
    }
};


// ------------------------------------------------------------

// Dashboard page 

// ------------------------------------------------------------
// // Daniel T. K. W. - github.com/danieltkw - danielkopolo95@gmail.com
// ------------------------------------------------------------



