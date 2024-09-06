export default {
    // Utility function to fetch and store clientId
    async fetchAndSetClientId() {
        try {
            const result = await getClientIdFromDB.run(); // Fetch client ID from the database
            if (result && result.length > 0) {
                const clientId = result[0].client_id;
                storeValue("clientId", clientId);
                return clientId;
            } else {
                const defaultClientId = 1; // Use this as the default client ID if not found
                storeValue("clientId", defaultClientId);
                return defaultClientId;
            }
        } catch (error) {
            console.error('Error fetching client ID:', error);
            const defaultClientId = 1;
            storeValue("clientId", defaultClientId);
            return defaultClientId;
        }
    },

    // Function to get or set the client ID
    async getClientId() {
        if (appsmith.store.clientId) {
            return appsmith.store.clientId;
        } else {
            return await this.fetchAndSetClientId();
        }
    },

    // Function to check if the client is an admin
    async isAdmin() {
        const clientId = await this.getClientId();
        const adminVatNumbers = ['307277003']; // Add other admin VATs if needed
        return adminVatNumbers.includes(String(clientId));
    },

    // Function to fetch client details (only if authorized)
    async fetchClientDetails() {
        const clientId = await this.getClientId();
        const isAdmin = await this.isAdmin(); // Check if the user is an admin

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
            const result = await getRegisteredClients.run(); // Fetch all clients from the database
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
        let customerOrders;
        try {
            const selectedRow = tbl_customers.selectedRow;
            if (selectedRow && selectedRow.CustomerID) {
                const result = await getCustomerOrders.run({ customerId: selectedRow.CustomerID });
                customerOrders = result.map(o => {
                    return {
                        OrderId: o.order_id,
                        OrderDate: new Date(o.created).toDateString(),
                        Items: o.items_count,
                        Amount: o.total.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' }),
                        Status: o.delivery_status
                    };
                });
            } else {
                console.error('getCustomerOrders: tbl_customers.selectedRow.CustomerID is undefined');
                customerOrders = [];
            }
        } catch (error) {
            console.error('Error fetching customer orders from database:', error);
            customerOrders = [];
        }
        return customerOrders;
    },

    // Returns color based on order status
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

