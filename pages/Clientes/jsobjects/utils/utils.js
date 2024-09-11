export default {
    // Fetch and store clientId
    async fetchAndSetClientId() {
        try {
            const result = await getClientIdFromDB.run(); // Replace with the actual query to fetch client ID
            if (result && result.length > 0) {
                const clientId = result[0].client_id;
                storeValue("clientId", clientId);
                return clientId;
            } else {
                throw new Error("Client ID not found in the database."); // Explicit error if no client ID is found
            }
        } catch (error) {
            console.error('Error fetching client ID:', error);
            return null; // Return null in case of error
        }
    },

    // Get or set the client ID
    async getClientId() {
        if (appsmith.store.clientId) {
            return appsmith.store.clientId;
        } else {
            const clientId = await this.fetchAndSetClientId();
            if (!clientId) {
                showAlert('Failed to capture client ID. Please try again.', 'error');
                return null;
            }
            return clientId;
        }
    },

    // Check if the client is an admin
    async isAdmin() {
        const clientId = await this.getClientId();
        const adminVatNumbers = ['307277003']; // List of admin VAT numbers
        return adminVatNumbers.includes(String(clientId));
    },

    // Fetch client details (only if authorized)
    async fetchClientDetails() {
        const clientId = await this.getClientId();
        if (!clientId) {
            showAlert('Client ID is not available. Cannot fetch client details.', 'error');
            return [];
        }

        const isAdmin = await this.isAdmin();

        if (isAdmin) {
            const clientDetails = await getClientDetails.run({ clientId });
            return clientDetails;
        } else {
            showAlert('Unauthorized access', 'error');
            return [];
        }
    },

    // Converts numeric IDs to a string with leading zeros and 'C' prefix
    idConverter: (num) => {
        if (num === undefined || num === null) {
            console.error('idConverter: num is undefined or null');
            return '';
        }
        let str = num.toString();
        let leadingZeros = "00000".substring(0, 5 - str.length);
        return 'C' + leadingZeros + str;
    },

    // Fetch registered clients from the `db_users` table
    async getCustomers() {
        console.clear();
        let customers;
        try {
            // Fetch clients from `db_users`
            const result = await getRegisteredClients.run(); // Replace with actual query
            customers = result.map(c => {
                return {
                    ID: this.idConverter(c.user_id),
                    CustomerID: c.user_id,
                    Name: `${c.first_name} ${c.last_name}`,
                    Phone: c.phone,
                    Email: c.email,
                    BillingAddress: c.billing_address || '',  // Fallback to empty string if undefined
                    ShippingAddress: c.shipping_address || '', // Fallback to empty string if undefined
                    vat: Number(c.vat_number) // Ensure VAT is treated as a number
                };
            });
        } catch (error) {
            console.error('Error fetching customers from database:', error);
            customers = [];
        }
        return customers;
    },

    // Fetches customer orders based on selected customer
    async getCustomerOrders() {
        console.clear();
        let customerOrders;
        try {
            // Get the selected customer from the table (assuming 'tbl_customers' is the customer selection table)
            const selectedCustomer = tbl_customers.selectedRow;
            if (selectedCustomer && selectedCustomer.CustomerID) {
                // Fetch customer orders using the selected CustomerID
                const result = await getCustomerOrders.run({ customerId: selectedCustomer.CustomerID });
                customerOrders = result.map(o => {
                    return {
                        Codigo: o.order_id,
                        Data: new Date(o.created).toLocaleDateString('pt-PT'),
                        Items: o.items_count,
                        Amount: o.total.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' }),
                        Status: o.delivery_status
                    };
                });
            } else {
                console.error('getCustomerOrders: No customer selected or CustomerID is missing.');
                customerOrders = [];
            }
        } catch (error) {
            console.error('Error fetching customer orders from database:', error);
            customerOrders = [];
        }
        return customerOrders;
    },

    // Return status color based on order status
    statusColor: (status) => {
        switch (status) {
            case 'CANCELLED':
                return 'RGB(255, 0, 0)';
            case 'UNFULFILLED':
            case 'PACKED':
                return 'RGB(255, 165, 0)';
            case 'SHIPPED':
            case 'DELIVERED':
                return 'RGB(0, 128, 0)';
            default:
                return 'RGB(255, 165, 0)';
        }
    },

    // Formats customer data for use in the application
    formatCustomerData: function (customer) {
        if (!customer) {
            console.error('formatCustomerData: customer is undefined');
            return {};
        }
        return {
            ID: this.idConverter(customer.user_id),
            CustomerID: customer.user_id,
            Name: `${customer.first_name} ${customer.last_name}`,
            Phone: customer.phone,
            Email: customer.email,
            BillingAddress: customer.billing_address,
            ShippingAddress: customer.shipping_address,
            vat: Number(customer.vat_number) // Ensure VAT is treated as a number
        };
    },

    // Fetch and populate customer orders in tbl_customerOrders
    async populateCustomerOrders() {
        const customerOrders = await this.getCustomerOrders();  // Fetch the customer orders
        tbl_customerOrders.data = customerOrders;               // Bind the data to the table
    }
};


/*
MySQL Schema Alignment:

db_users table columns used:
- user_id: INT AUTO_INCREMENT PRIMARY KEY
- email: VARCHAR(255) NOT NULL UNIQUE
- password_hash: VARCHAR(255) NOT NULL
- first_name: VARCHAR(255) NOT NULL
- last_name: VARCHAR(255) NOT NULL
- phone: VARCHAR(20)
- vat_number: VARCHAR(9)
- role: ENUM('admin', 'client') DEFAULT 'client'
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

db_orders table columns used:
- order_id: INT AUTO_INCREMENT PRIMARY KEY
- user_id: INT NOT NULL
- created: DATETIME DEFAULT CURRENT_TIMESTAMP
- items_count: INT (Assumed to be the number of items in the order)
- total: DECIMAL(10, 2) NOT NULL
- delivery_status: VARCHAR(50)
*/




// ------------------------------------------------------------
// Daniel T. K. W. - github.com/danieltkw - danielkopolo95@gmail.com
// ------------------------------------------------------------

