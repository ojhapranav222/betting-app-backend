import { db } from "../database.js";

export async function registerBank(bank){
    const {image, bankName, accountNumber, holderName, ifscCode, upiId} = bank;
    try{
        const bank = await db.query(`SELECT * FROM bank_details WHERE account_number = $1 OR upi_id = $2`, [accountNumber, upiId]);
        if (bank.rows.length > 0){
            throw new Error("Account number or Upi Id already exists");
        }
        const result = await db.query(`INSERT INTO bank_details (image, bank_name, account_number, account_holder_name, ifsc_code, upi_id, is_primary) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, [image, bankName, accountNumber, holderName, ifscCode, upiId, false]);

        return result.rows[0]
    } catch(err){
        console.error(err);
        throw err;
    }
}

export async function getBankDetails(accountNumber, upiId){
    try{
        const result = await db.query(`SELECT * FROM bank_details WHERE account_number = $1 OR upi_id = $2`, [accountNumber, upiId]);
        return result.rows[0];
    } catch(err){
        console.error(err)
    }
}

export async function getAllBanks() {
    try {
        const result = await db.query(`SELECT * FROM bank_details`);
        return result.rows;
    } catch (err) {
        console.error("Error fetching banks:", err);
        throw err; // Ensure the error is properly propagated
    }
}

export async function getPrimaryBank(){
    const result = await db.query(`SELECT * FROM bank_details WHERE is_primary = true`);
    return result.rows[0];
}

export async function deleteBankAccount(bank_id) {
    const query = `DELETE FROM bank_details WHERE id = $1 RETURNING *;`;
    const { rows } = await db.query(query, [bank_id]);
    return rows[0]; // Returns the deleted bank account details
}

// Edit a bank account (admin action)
export async function editBankAccount(bank_id, updates) {
    const { account_number, ifsc_code, bank_name, upiId, account_holder } = updates;
    
    const query = `
        UPDATE bank_details
        SET account_number = COALESCE($1, account_number),
            ifsc_code = COALESCE($2, ifsc_code),
            bank_name = COALESCE($3, bank_name),
            account_holder_name = COALESCE($4, account_holder_name),
            upi_id = COALESCE($5, upi_id)
        WHERE id = $6
        RETURNING *;
    `;
    
    const values = [account_number, ifsc_code, bank_name, account_holder, upiId, bank_id];
    const { rows } = await db.query(query, values);
    return rows[0]; // Returns the updated bank account details
}
