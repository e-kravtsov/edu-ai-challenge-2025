const { Schema } = require('./index');

describe('Validation Library', () => {

    describe('StringValidator', () => {
        it('should validate a simple string', () => {
            const schema = Schema.string();
            expect(schema.validate('hello').isValid).toBe(true);
            expect(schema.validate(123).isValid).toBe(false);
        });

        it('should handle minLength', () => {
            const schema = Schema.string().minLength(5);
            expect(schema.validate('hello').isValid).toBe(true);
            expect(schema.validate('hi').isValid).toBe(false);
        });

        it('should handle maxLength', () => {
            const schema = Schema.string().maxLength(5);
            expect(schema.validate('hello').isValid).toBe(true);
            expect(schema.validate('hello world').isValid).toBe(false);
        });

        it('should handle pattern', () => {
            const schema = Schema.string().pattern(/^[a-z]+$/);
            expect(schema.validate('hello').isValid).toBe(true);
            expect(schema.validate('Hello').isValid).toBe(false);
        });

        it('should handle optional strings', () => {
            const schema = Schema.string().optional();
            expect(schema.validate(null).isValid).toBe(true);
            expect(schema.validate(undefined).isValid).toBe(true);
        });

        it('should return custom error messages', () => {
            const schema = Schema.string().withMessage('Not a string!');
            expect(schema.validate(123).errors[0]).toBe('Not a string!');
        });
    });

    describe('NumberValidator', () => {
        it('should validate a simple number', () => {
            const schema = Schema.number();
            expect(schema.validate(123).isValid).toBe(true);
            expect(schema.validate('hello').isValid).toBe(false);
        });

        it('should handle min', () => {
            const schema = Schema.number().min(5);
            expect(schema.validate(10).isValid).toBe(true);
            expect(schema.validate(2).isValid).toBe(false);
        });

        it('should handle max', () => {
            const schema = Schema.number().max(10);
            expect(schema.validate(5).isValid).toBe(true);
            expect(schema.validate(20).isValid).toBe(false);
        });

        it('should handle integer', () => {
            const schema = Schema.number().integer();
            expect(schema.validate(5).isValid).toBe(true);
            expect(schema.validate(5.5).isValid).toBe(false);
        });
    });

    describe('BooleanValidator', () => {
        it('should validate a boolean', () => {
            const schema = Schema.boolean();
            expect(schema.validate(true).isValid).toBe(true);
            expect(schema.validate(false).isValid).toBe(true);
            expect(schema.validate('true').isValid).toBe(false);
        });
    });

    describe('DateValidator', () => {
        it('should validate a Date object', () => {
            const schema = Schema.date();
            expect(schema.validate(new Date()).isValid).toBe(true);
            expect(schema.validate('2024-01-01').isValid).toBe(false);
            expect(schema.validate(new Date('invalid-date')).isValid).toBe(false);
        });
    });
    
    describe('ArrayValidator', () => {
        it('should validate an array of strings', () => {
            const schema = Schema.array(Schema.string());
            expect(schema.validate(['a', 'b', 'c']).isValid).toBe(true);
            expect(schema.validate(['a', 1, 'c']).isValid).toBe(false);
        });
    });

    describe('ObjectValidator', () => {
        it('should validate a simple object', () => {
            const schema = Schema.object({
                name: Schema.string(),
                age: Schema.number()
            });
            const data = { name: 'John', age: 30 };
            expect(schema.validate(data).isValid).toBe(true);
        });
    });

    describe('Complex Schema', () => {
        const addressSchema = Schema.object({
            street: Schema.string(),
            city: Schema.string(),
            postalCode: Schema.string().pattern(/^\d{5}$/).withMessage('Postal code must be 5 digits'),
        });

        const userSchema = Schema.object({
            id: Schema.string().withMessage('ID must be a string'),
            name: Schema.string().minLength(2).maxLength(50),
            email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
            age: Schema.number().optional(),
            isActive: Schema.boolean(),
            tags: Schema.array(Schema.string()),
            address: addressSchema.optional(),
        });
        
        it('should validate a valid complex object', () => {
            const userData = {
                id: "12345",
                name: "John Doe",
                email: "john@example.com",
                isActive: true,
                tags: ["developer", "designer"],
                address: {
                    street: "123 Main St",
                    city: "Anytown",
                    postalCode: "12345",
                }
            };
            const result = userSchema.validate(userData);
            expect(result.isValid).toBe(true);
        });

        it('should find errors in a complex object', () => {
            const userData = {
                id: 12345, // Invalid type
                name: "J", // Too short
                email: "john", // Invalid pattern
                isActive: "yes", // Invalid type
                tags: ["developer", 123], // Invalid array item
                address: {
                    street: "123 Main St",
                    city: "Anytown",
                    postalCode: "abc", // Invalid pattern
                }
            };
            const result = userSchema.validate(userData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toEqual([
                "id: ID must be a string",
                "name: String must be at least 2 characters long",
                "email: String does not match pattern",
                "isActive: Must be a boolean",
                "tags: [1]: Must be a string",
                "address: postalCode: Postal code must be 5 digits"
            ]);
        });
    });
}); 