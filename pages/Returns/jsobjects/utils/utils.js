export default {
    // Convert order IDs (optional)
    idConverter: (num) => {
        if (!num) {
            return '';
        }
        let str = num.toString();
        let leadingZeros = "00000".substring(0, 5 - str.length);
        return 'O' + leadingZeros + str; // Example formatting for order ID
    },

    // Fetch client orders and filter by date range
    getClientOrders: async function() {
        try {
            const clientId = await this.getClientId();  // Ensure client ID is fetched
            const orders = await getOrders.run({ clientId }); // Fetch actual orders from the DB using clientId

            console.log("Fetched Orders: ", orders);

            if (!orders || orders.length === 0) {
                console.error('No orders found for client ID:', clientId);
                return [];
            }

            const fromDate = dat_from.selectedDate || null;
            const toDate = dat_to.selectedDate || null;

            let filteredOrders = orders;

            // Filter by date if range provided
            if (fromDate && toDate) {
                const from = new Date(fromDate).setHours(0, 0, 0, 0);
                const to = new Date(toDate).setHours(23, 59, 59, 999);
                filteredOrders = orders.filter(order => {
                    const orderDate = new Date(order.created).getTime();
                    return orderDate >= from && orderDate <= to;
                });
            }

            // Filter by status if selected
            if (appsmith.store.sel_status) {  // Fix for undefined sel_status
                filteredOrders = filteredOrders.filter(order => order.delivery_status === appsmith.store.sel_status);
            }

            // Map the filtered orders to display them in the table
            return filteredOrders.map(order => ({
                OrderID: this.idConverter(order.order_id), // Use idConverter for formatting
                ShippingAddress: order.shipping_address,
                Status: order.delivery_status,
                TotalAmount: order.total.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' }),  // Format as EUR currency
                OrderedDate: new Date(order.created).toLocaleDateString('pt-PT'), // Format the date in Portuguese locale
            })).sort((a, b) => a.OrderID - b.OrderID);

        } catch (error) {
            console.error('Error fetching client orders:', error);
            return [];
        }
    },

    // Get the client ID (vat_number)
    async getClientId() {
        if (appsmith.store.clientId) {
            return appsmith.store.clientId;
        } else {
            const result = await getClientIdFromDB.run(); // Ensure getClientIdFromDB is your actual query name
            if (!result || result.length === 0) {
                console.error('No client ID found in DB');
                return 'defaultClientId';
            }
            const clientId = result[0]?.client_id || 'defaultClientId';
            await storeValue('clientId', clientId);  // Use storeValue to modify the store
            return clientId;
        }
    },

    // Reset Filters
    handleResetFilter: async function() {
        resetWidget('sel_status');  // Reset status filter
        resetWidget('dat_to');      // Reset date "to"
        resetWidget('dat_from');    // Reset date "from"
        await this.getClientOrders(); // Re-fetch orders with no filters
    },

    // Function to set status filter (this is to fix the undefined sel_status error)
    setStatusFilter: function(status) {
        storeValue('sel_status', status);  // Store the selected status in appsmith store
        this.getClientOrders();  // Re-fetch orders based on the new status
    },

    // Fetch products (ensure sel_status is properly referenced)
    getProducts: async function() {
        try {
            const clientId = await this.getClientId();  // Ensure client ID is fetched
            const products = await getProducts.run({ clientId }); // Fetch actual products from the DB using clientId

            if (!products || products.length === 0) {
                console.error('No products found for client ID:', clientId);
                return [];
            }

            // Assuming you want to filter products by the same `sel_status`
            const selectedStatus = appsmith.store.sel_status || 'default_status'; // Fetch status from Appsmith store

            let filteredProducts = products.filter(product => product.status === selectedStatus);

            // Map the filtered products for UI display
            return filteredProducts.map(product => ({
                ProductID: product.product_id,
                Name: product.name,
                Category: product.category,
                Price: product.price.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' }),  // Format as EUR currency
                Status: product.status
            }));

        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }
};





// ------------------------------------------------------------
// Orders
// ------------------------------------------------------------
// Daniel T. K. W. - github.com/danieltkw - danielkopolo95@gmail.com
// ------------------------------------------------------------


