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
    showClientDetails() {
        const selectedCustomer = tbl_customers.selectedRow; // Get the selected row in the table
        if (selectedCustomer) {
            inp_customerName.text = selectedCustomer.Name; // Populate Name field
            inp_customerEmail.text = selectedCustomer.Email; // Populate Email field
            inp_customerPhone.text = selectedCustomer.Phone; // Populate Phone field
            inp_customerVAT.text = selectedCustomer.VAT; // Populate VAT field
        } else {
            showAlert('Please select a customer to view details.', 'info');
        }
    }
};



// ------------------------------------------------------------
// Daniel T. K. W. - github.com/danieltkw - danielkopolo95@gmail.com
// ------------------------------------------------------------

