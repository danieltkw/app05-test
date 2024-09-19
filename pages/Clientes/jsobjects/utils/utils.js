export default {
    // Fetch customers from the database and populate the table
    async getCustomers() {
        let customers = [];
        try {
            const result = await getCustomers.run(); // Fetch clients using the query defined above
            customers = result.map(c => {
                return {
                    ID: c.user_id,
                    Name: `${c.first_name} ${c.last_name}`,
                    Email: c.email,
                    Phone: c.phone,
                    VAT: c.vat_number
                };
            });
            tbl_customers.data = customers; // Bind customers data to the table widget
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    },

    // This function is triggered when a client row is clicked
    async showClientDetails() {
        const selectedCustomer = tbl_customers.selectedRow; // Get the selected row in the table
        if (selectedCustomer) {
            inp_customerName.text = selectedCustomer.Name; // Populate Name field
            inp_customerEmail.text = selectedCustomer.Email; // Populate Email field
            inp_customerPhone.text = selectedCustomer.Phone; // Populate Phone field
            inp_customerVAT.text = selectedCustomer.VAT; // Populate VAT field
            
            // Fetch customer orders and populate the orders table
            await this.getCustomerOrders(selectedCustomer.ID);  // Use selected customer ID to fetch orders
        } else {
            showAlert('Please select a customer to view details.', 'info');
        }
    },

    // Fetches customer orders based on selected customer
    async getCustomerOrders(customerId) {
        let customerOrders = [];
        try {
            if (customerId) {
                // Fetch customer orders using the selected CustomerID
                const result = await getCustomerOrdersQuery.run({ userId: customerId });  // Assuming you have a query for this
                customerOrders = result.map(o => {
                    return {
                        Codigo: o.order_id,
                        Data: new Date(o.created).toLocaleDateString('pt-PT'),
                        Items: o.items_count,
                        Custo: o.total.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })
                    };
                });
                tbl_customerOrders.data = customerOrders; // Bind orders data to the orders table widget
            } else {
                console.error('No customer selected or customerId is missing.');
                customerOrders = [];
            }
        } catch (error) {
            console.error('Error fetching customer orders from database:', error);
            customerOrders = [];
        }
        return customerOrders;
    }
};


// ------------------------------------------------------------
// Daniel T. K. W. - github.com/danieltkw - danielkopolo95@gmail.com
// ------------------------------------------------------------

