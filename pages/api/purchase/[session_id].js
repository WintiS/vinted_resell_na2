import admin from '../../../lib/firebase-admin';

const db = admin.firestore();

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { session_id } = req.query;

    if (!session_id) {
        return res.status(400).json({ error: 'Session ID is required' });
    }

    try {
        // Query purchases collection by sessionId
        const purchasesRef = db.collection('purchases');
        const snapshot = await purchasesRef.where('sessionId', '==', session_id).get();

        if (snapshot.empty) {
            return res.status(404).json({ error: 'Purchase not found' });
        }

        // Get the first purchase document (should be unique per session)
        const purchaseDoc = snapshot.docs[0];
        const purchaseData = purchaseDoc.data();

        // Format the response
        const purchase = {
            id: purchaseDoc.id,
            sessionId: purchaseData.sessionId,
            productIds: purchaseData.productIds ? purchaseData.productIds.split(',') : [],
            productNames: purchaseData.productNames ? purchaseData.productNames.split(' | ') : [],
            amount: purchaseData.amount,
            currency: purchaseData.currency || 'usd',
            customerEmail: purchaseData.customerEmail,
            createdAt: purchaseData.createdAt?.toDate?.() || purchaseData.createdAt,
        };

        res.status(200).json(purchase);
    } catch (error) {
        console.error('Error fetching purchase:', error);
        res.status(500).json({ error: 'Failed to fetch purchase data' });
    }
}
