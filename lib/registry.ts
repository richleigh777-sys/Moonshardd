
import { RegistryField } from '../types';
import { 
    User, CreditCard, MapPin, Activity, Phone, Mail, Package, 
    Hash, Calendar, Shield, FileText, ShoppingBag, Clock, 
    Truck, Music, ListFilter, Landmark, Layers, AlertTriangle, RefreshCw, Briefcase
} from 'lucide-react';

export const GLOBAL_REGISTRY: RegistryField[] = [
    { key: 'date', label: 'Date', category: 'system', type: 'date', synonyms: ['time', 'timestamp', 'created_at', 'order date', 'date_added', 'purchased_at'], icon: Clock, width: '120px' },
    { key: 'agent', label: 'Agent', category: 'system', type: 'string', synonyms: ['rep', 'partner', 'user', 'sales_rep', 'agent_name', 'owner'], icon: Briefcase, width: '140px' },
    { key: 'customer', label: 'Customer Name', category: 'identity', type: 'string', required: true, synonyms: ['client', 'name', 'fullname', 'customer_name', 'buyer', 'billing_name'], icon: User, width: '200px' },
    { key: 'phone', label: 'Phone Number', category: 'identity', type: 'string', required: true, synonyms: ['tel', 'mobile', 'cell', 'contact', 'phone_number', 'phone_num', 'contact_number'], icon: Phone, width: '140px' },
    { key: 'age', label: 'Age', category: 'identity', type: 'number', synonyms: ['years', 'old', 'customer_age'], icon: Calendar, width: '60px' },
    { key: 'ageDob', label: 'Age / DOB', category: 'identity', type: 'string', synonyms: ['birth', 'birthday', 'dob', 'date_of_birth', 'years', 'old', 'customer_age'], icon: Calendar, width: '140px' },
    { key: 'height', label: 'Height', category: 'identity', type: 'string', synonyms: ['tall'], icon: User, width: '80px' },
    { key: 'weight', label: 'Weight', category: 'identity', type: 'string', synonyms: ['mass'], icon: User, width: '80px' },
    { key: 'heightWeight', label: 'Height / Weight', category: 'identity', type: 'string', synonyms: ['tall', 'mass', 'height', 'weight'], icon: User, width: '120px' },
    { key: 'billingAddress', label: 'Billing Address', category: 'finance', type: 'string', synonyms: ['billing', 'bill_to', 'bill_address'], icon: MapPin, width: '220px' },
    { key: 'billingCity', label: 'Billing City', category: 'finance', type: 'string', synonyms: ['bill_city'], icon: MapPin, width: '120px' },
    { key: 'billingState', label: 'Billing State', category: 'finance', type: 'string', synonyms: ['bill_state'], icon: MapPin, width: '100px' },
    { key: 'billingZip', label: 'Billing ZIP', category: 'finance', type: 'string', synonyms: ['bill_zip'], icon: MapPin, width: '100px' },
    { key: 'address', label: 'Shipping Address (Comb)', category: 'logistics', type: 'string', synonyms: ['shipping', 'delivery address', 'street', 'ship_to', 'ship_address', 'address_1'], icon: Truck, width: '220px' },
    { key: 'shippingAddress', label: 'Shipping Street', category: 'logistics', type: 'string', synonyms: ['ship_street'], icon: Truck, width: '200px' },
    { key: 'shippingCity', label: 'Shipping City', category: 'logistics', type: 'string', synonyms: ['ship_city'], icon: Truck, width: '120px' },
    { key: 'shippingState', label: 'Shipping State', category: 'logistics', type: 'string', synonyms: ['ship_state'], icon: Truck, width: '100px' },
    { key: 'shippingZip', label: 'Shipping ZIP', category: 'logistics', type: 'string', synonyms: ['ship_zip'], icon: Truck, width: '100px' },
    { key: 'city', label: 'City', category: 'logistics', type: 'string', synonyms: ['town'], icon: MapPin, width: '120px' },
    { key: 'state', label: 'State', category: 'logistics', type: 'string', synonyms: ['province'], icon: MapPin, width: '100px' },
    { key: 'zip', label: 'ZIP Code', category: 'logistics', type: 'string', synonyms: ['postal'], icon: MapPin, width: '100px' },
    { key: 'email', label: 'Email Address', category: 'identity', type: 'string', synonyms: ['mail', 'e-mail', 'email_address', 'contact_email'], icon: Mail, width: '180px' },
    { key: 'product', label: 'Product', category: 'logistics', type: 'string', synonyms: ['sku', 'item', 'product_name', 'item_name', 'description'], icon: Package, width: '160px' },
    { key: 'quantity', label: 'Quantity', category: 'logistics', type: 'string', synonyms: ['qty', 'count', 'amount', 'units', 'pieces'], icon: ShoppingBag, width: '100px' },
    { key: 'dosage', label: 'Dosage', category: 'logistics', type: 'string', synonyms: ['strength', 'mg', 'concentration', 'dose'], icon: ListFilter, width: '100px' },
    { key: 'bankNetwork', label: 'Bank+Network', category: 'finance', type: 'string', synonyms: ['bank', 'card_type', 'brand', 'card_network', 'issuer'], icon: Landmark, width: '160px' },
    { key: 'amount', label: 'Amount', category: 'finance', type: 'amount', required: true, synonyms: ['price', 'value', 'revenue', 'total', 'grand_total', 'order_total', 'cost', 'charge'], icon: CreditCard, width: '110px' },
    { key: 'cardNumber', label: 'Card Number (Raw)', category: 'finance', type: 'string', synonyms: ['cc', 'pan', 'card_num', 'cc_num', 'card_number'], icon: Shield, width: '160px' },
    { key: 'dob', label: 'Date of Birth', category: 'identity', type: 'date', synonyms: ['birth', 'birthday', 'dob', 'date_of_birth'], icon: Calendar, width: '110px' },
    { key: 'cardExpiry', label: 'Expiry', category: 'finance', type: 'string', synonyms: ['exp', 'expiration', 'exp_date', 'valid_thru'], icon: Calendar, width: '80px' },
    { key: 'cardCvv', label: 'CVV', category: 'finance', type: 'string', synonyms: ['cvv', 'cvc', 'security', 'code', 'security_code'], icon: Hash, width: '80px' },
    { key: 'medicalConditions', label: 'Medical Context', category: 'identity', type: 'array', synonyms: ['history', 'conditions', 'notes_medical', 'tags'], icon: Activity, width: '180px' },
    { key: 'callSummary', label: 'Interaction Notes', category: 'system', type: 'string', synonyms: ['notes', 'summary', 'comments', 'agent_notes', 'remarks'], icon: FileText, width: '200px' },
    { key: 'status', label: 'Status', category: 'system', type: 'string', synonyms: ['result', 'state', 'outcome', 'order_status', 'disposition'], icon: Activity, width: '100px' },
    { key: 'pipelineStatus', label: 'Pipeline Stage', category: 'system', type: 'string', synonyms: ['stage', 'funnel', 'deal_stage'], icon: Layers, width: '140px' },
    { key: 'declineReason', label: 'Decline Reason', category: 'system', type: 'string', synonyms: ['reason', 'rejection', 'fail_reason', 'error_msg'], icon: AlertTriangle, width: '160px' },
    { key: 'isReorder', label: 'Reorder', category: 'system', type: 'boolean', synonyms: ['recurring', 'repeat', 'renewal'], icon: RefreshCw, width: '80px' },
    { key: 'orderId', label: 'Order ID', category: 'system', type: 'string', synonyms: ['order', 'txn', 'ref', 'transaction_id', 'invoice_id'], icon: Hash, width: '140px' },
    { key: 'trackingId', label: 'Tracking Number', category: 'logistics', type: 'string', synonyms: ['tracking', 'shipment', 'tracking_num', 'waybill'], icon: Truck, width: '160px' },
    { key: 'deliveryStatus', label: 'Delivery Status', category: 'logistics', type: 'string', synonyms: ['delivery', 'ship_status', 'shipping_status'], icon: Activity, width: '120px' },
    { key: 'recording', label: 'Audio Recording', category: 'system', type: 'string', synonyms: ['audio', 'call', 'voice', 'recording_url'], icon: Music, width: '140px' },
    { key: 'cmd', label: 'CMD', category: 'system', type: 'string', synonyms: ['action', 'commands', 'cmd'], icon: Activity, width: '100px' }
];

export const DEFAULT_COLUMN_ORDER = [
    'agent', 'date', 'customer', 'phone', 'shippingAddress', 'billingAddress', 'email', 'product', 'quantity', 'dosage', 'bankNetwork', 'amount', 'cardNumber', 'cardExpiry', 'ageDob', 'heightWeight', 'cardCvv', 'callSummary', 'status', 'orderId', 'declineReason', 'deliveryStatus', 'trackingId', 'recording', 'cmd'
];

export const getFieldByKey = (key: string) => GLOBAL_REGISTRY.find(f => f.key === key);
