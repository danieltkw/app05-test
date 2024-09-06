export default {
    isTestMode: true, // Flag to check if we are in test mode

    // Function to fetch and set client ID from the database
    fetchAndSetClientId: async function() {
        try {
            // Since getClientIdFromDB is not defined, we'll use a default value
            // Replace this with actual database query when available
            const defaultClientId = 1;
            storeValue("clientId", defaultClientId);
            return defaultClientId;
        } catch (error) {
            console.error('Error fetching client ID:', error);
            const defaultClientId = 1;
            storeValue("clientId", defaultClientId);
            return defaultClientId;
        }
    },

    // Function to get or set default client ID
    getClientId: async function() {
        if (appsmith.store.clientId) {
            return appsmith.store.clientId;
        } else {
            return await this.fetchAndSetClientId();
        }
    },

    // ID Converter Function
    idConverter: (num) => {
        if (num === undefined || num === null) {
            console.error('idConverter: num is undefined or null');
            return '';
        }
        let str = num.toString();
        let leadingZeros = "00000".substring(0, 5 - str.length);
        return 'R' + leadingZeros + str;
    },

    // Function to get returns
    getReturns: async function() {
        const clientId = await this.getClientId();
        console.clear();

        if (this.isTestMode) {
            // Return mock data in test mode
            return [
                {
                    id: 1,
                    order_id: 101,
                    product_variant_id: 201,
                    quantity: 2,
                    product_id: 301,
                    price: 20.5,
                    name: 'Test Product',
                    type: 'Electronics',
                    label: 'Main Warehouse',
                    created: '2023-01-01T00:00:00Z',
                    returned_quantity: 2,
                    returned_date: '2023-01-05T00:00:00Z',
                    reason: 'Defective',
                    status: 'Return Initiated',
                    warehouse: 'Main Warehouse',
                    warehouse_id: 1
                },
                // More mock data if needed...
            ];
        }

        // Replace this with the actual query call to fetch returns
        return await getReturns.run({ clientId: clientId });
    },

    // Function to get warehouses
    getWarehouses: async function() {
        if (this.isTestMode) {
            // Return mock data in test mode
            return [
                { id: 1, name: 'Test Warehouse 1' },
                { id: 2, name: 'Test Warehouse 2' }
            ];
        }

        const returns = await this.getReturns();
        const warehouses = returns.map(p => {
            return {
                id: p.warehouse_id,
                name: p.warehouse
            };
        });
        const sanitisedWarehouses = warehouses.filter(warehouse => warehouse.name !== null && warehouse.name.trim() !== "");

        if (!returns || returns.length < 1) {
            return [
                { id: 1, name: 'Jamison Yard' },
                { id: 2, name: 'Brit Avenue' }
            ];
        }

        const uniqueWarehousesRaw = {};

        for (let i = 0; i < sanitisedWarehouses.length; i++) {
            uniqueWarehousesRaw[sanitisedWarehouses[i].name] = {
                id: sanitisedWarehouses[i].id
            };
        }

        const uniqueWarehouses = Object.keys(uniqueWarehousesRaw);

        return uniqueWarehouses.map((category) => {
            return {
                id: uniqueWarehousesRaw[category].id,
                name: category,
            };
        });
    },

    // Function to mark received
    markReceived: async function() {
        // Check if a return is selected
        const selectedRow = tbl_returns.selectedRow;
        if (!selectedRow) {
            console.error('No return selected. Please select a return.');
            showAlert('Please select a return to proceed.', 'warning');
            return;
        }

        // Check if the application is in test mode
        if (this.isTestMode) {
            console.log('Test mode: Mark as Received');
            showAlert('Test mode: Mark as Received', 'success');
            return;
        }

        try {
            // Execute the query to update the return status
            await markReceived.run({ id: selectedRow.Id });
            
            // Refresh the list of returns
            await this.getReturns();
            
            // Close the modal and show a success message
            closeModal('mdl_returnsDetail');
            showAlert('Return Order Marked as Received!', 'success');
        } catch (error) {
            console.error('Error marking return as received:', error);
            showAlert('Failed to mark the return as received. Please try again.', 'error');
        }
    },

    // Function to handle refund
    handleRefund: async function() {
        if (!sel_warehouse.selectedOptionValue || !sel_payment.selectedOptionValue) {
            return showAlert('Select warehouse and payment to continue', 'warning');
        }

        const selectedRow = tbl_returns.selectedRow;
        if (!selectedRow) {
            console.error('No return selected. Please select a return.');
            showAlert('Please select a return to proceed.', 'warning');
            return;
        }

        await handleRefund.run({ id: selectedRow.Id });
        await this.getReturns();
        closeModal('mdl_returnsDetail');
        showAlert('Refund Initiated!', 'success');
    },

    // Function to reset filters
    handleResetFilter: async function() {
        resetWidget('sel_status');
        resetWidget('dat_to');
        resetWidget('dat_from');
        await this.getReturns();
    },

    // Function to color status
    statusColor: (status) => {
        if (status === 'Return Initiated' || status === 'Received') {
            return 'RGB(255, 165, 0)';
        }
        if (status === 'Return Processed') {
            return 'RGB(0, 128, 0)';
        }
        return 'RGB(255, 165, 0)';
    },

    // Function to get orders
    getOrders: async function() {
        const clientId = await this.getClientId();
        if(!clientId) {
            console.error('clientId is not defined');
            return [];
        }
        // Make sure you have a query named 'getOrders' defined in Appsmith
        return await getOrders.run();
    },

    // Function to get products
    getProducts: async function() {
        const clientId = await this.getClientId();
        if(!clientId) {
            console.error('clientId is not defined');
            return [];
        }
        // Make sure you have a query named 'getProducts' defined in Appsmith
        return await getProducts.run();
    },

    // Function to get invoices
    getInvoices: async function() {
        const clientId = await this.getClientId();
        if(!clientId) {
            console.error('clientId is not defined');
            return [];
        }
        // Make sure you have a query named 'getInvoices' defined in Appsmith
        return await getInvoices.run();
    },

    // Function to handle page load
    onPageLoad: async function() {
        await this.getClientId();
        await this.getProducts();
        await this.getOrders();
        await this.getInvoices();
        await this.getReturns();
        await this.getWarehouses();
    }
};

// ------------------------------------------------------------

// Products Page 

// ------------------------------------------------------------
// Daniel T. K. W. - github.com/danieltkw - danielkopolo95@gmail.com
// ------------------------------------------------------------




