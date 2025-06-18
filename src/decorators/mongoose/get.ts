import { Request, Response, NextFunction } from 'express';
import { Model, Types } from 'mongoose';

export function MongoGet(model: Model<any>) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
            try {
                let rawId = req.params.id;

                // Clean input like "id=1" to just "1"
                if (typeof rawId === 'string' && rawId.startsWith('id=')) {
                    rawId = rawId.split('=')[1];
                }

                rawId = rawId.toString().trim();

                let document: any = null;

                if (Types.ObjectId.isValid(rawId)) {
                    // ✅ Use ObjectId lookup
                    document = await model.findById(rawId);
                } else if (!isNaN(Number(rawId))) {
                    console.log('Using  lookup query:', { id: Number(rawId) });
                    // ✅ Use numeric lookup (assumes _id is a number)
                    document = await model.findOne({ "id": rawId });
                } else {
                    return res.status(400).json({ error: 'Invalid ID format. Must be ObjectId or numeric.' });
                }

                if (!document) {
                    return res.status(404).json({ error: 'Document not found' });
                }

                req.mongoGet = document;
                return originalMethod.call(this, req, res, next);
            } catch (error) {
                console.error('MongoGet error:', error);
                return res.status(500).json({ error: 'Server error', details: error });
            }
        };

        return descriptor;
    };
}
