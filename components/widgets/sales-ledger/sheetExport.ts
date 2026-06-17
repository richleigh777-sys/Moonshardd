import { Sale } from '../../../types';

export const SHEET_COLUMNS = [
    "date",
    "Customer Name",
    "Phone Number",
    "Billing Address",
    "Shipping Address",
    "Email Address",
    "Name of Medication",
    "Quantity",
    "Dosage",
    "Debit/Credit",
    "Total Amount",
    "Credit card #",
    "Age/DOB",
    "Expiration date",
    "CVV",
    "Notes / medicalcondition / heigh and weight",
    "agent name",
    "ORDER ID",
    "Tracking ID",
    "Status",
    "Transaction",
    "Email Status",
    "SMS Status",
    "Package Status"
];

const combineAddy = (street?: string, city?: string, state?: string, zip?: string) => {
    return [street, city, state, zip].filter(Boolean).join(', ').trim();
};

export const generateSheetTsv = (sales: Sale[]): string => {
    const headerRow = SHEET_COLUMNS.join('\t');
    
    const formatCell = (val: any) => {
        if (!val && val !== 0) return '';
        return String(val).replace(/\t/g, ' ').replace(/\r?\n|\r/g, ' ').trim();
    };

    const dataRows = sales.map(s => {
        const dateObj = new Date(s.timestamp || Date.now());
        const dateStr = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`;
        
        const customer = s.customer;
        const phone = s.phone;
        
        const billingStr = combineAddy(s.billingAddress, s.billingCity, s.billingState, s.billingZip) || combineAddy(s.address, s.city, s.state, s.zip);
        const shippingStr = combineAddy(s.shippingAddress, s.shippingCity, s.shippingState, s.shippingZip) || billingStr;
        
        const email = s.email;
        const product = s.product;
        const quantity = s.quantity;
        const dosage = s.dosage;
        const amount = s.amount != null ? `$${s.amount}` : '';
        const cc = s.cardNumber;
        
        const ageDobParts = [s.age ? `${s.age}yo` : null, s.dob].filter(Boolean);
        const ageDob = ageDobParts.join(' / ');
        
        const expiry = s.cardExpiry;
        const cvv = s.cardCvv;
        
        const notesParts = [
            s.callSummary, 
            s.medicalConditions?.length ? `Med: ${s.medicalConditions.join(', ')}` : null,
            s.height && s.height !== '-' ? `H: ${s.height}` : null,
            s.weight && s.weight !== '-' ? `W: ${s.weight}` : null
        ].filter(Boolean);
        const notes = notesParts.join(' | ');

        const agent = s.agent;
        const orderId = s.orderId;
        const tracking = s.trackingId || '';
        const status = s.status;
        
        let transaction = '';
        if (status === 'Approved') transaction = s.orderId ? `INV-${s.orderId.substring(0, 8)}` : 'Invoice Generated';
        else if (status === 'Declined' || status === 'Cancelled') transaction = s.declineReason || '';

        const emailStatus = s.email ? 'Email Sent' : 'No Email';
        const smsStatus = s.phone ? 'SMS Updated' : 'No SMS';
        const packageStatus = s.deliveryStatus || '';
        const cardType = s.cardType || '';

        const row = [
            dateStr, customer, phone, billingStr, shippingStr, email, product, 
            quantity, dosage, cardType, amount, cc, ageDob, expiry, cvv, notes, agent, 
            orderId, tracking, status, transaction, emailStatus, smsStatus, packageStatus
        ];
        
        return row.map(formatCell).join('\t');
    });

    return [headerRow, ...dataRows].join('\n');
};
