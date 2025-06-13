class Validator {
    constructor() {
        this.isOptional = false;
        this.customMessage = null;
    }

    optional() {
        this.isOptional = true;
        return this;
    }

    withMessage(message) {
        this.customMessage = message;
        return this;
    }

    validate(data) {
        if (this.isOptional && (data === null || data === undefined)) {
            return { isValid: true, errors: [] };
        }
        return this.performValidation(data);
    }

    performValidation(data) {
        throw new Error('performValidation must be implemented by subclasses');
    }
}

class StringValidator extends Validator {
    constructor() {
        super();
        this.validations = [];
    }

    minLength(n) {
        this.validations.push({
            fn: (val) => val.length >= n,
            message: `String must be at least ${n} characters long`
        });
        return this;
    }

    maxLength(n) {
        this.validations.push({
            fn: (val) => val.length <= n,
            message: `String must be at most ${n} characters long`
        });
        return this;
    }

    pattern(regex) {
        this.validations.push({
            fn: (val) => regex.test(val),
            message: 'String does not match pattern'
        });
        return this;
    }

    performValidation(data) {
        if (typeof data !== 'string') {
            return { isValid: false, errors: [this.customMessage || 'Must be a string'] };
        }

        const errors = [];
        this.validations.forEach(validation => {
            if (!validation.fn(data)) {
                errors.push(this.customMessage || validation.message);
            }
        });

        return { isValid: errors.length === 0, errors };
    }
}

class NumberValidator extends Validator {
    constructor() {
        super();
        this.validations = [];
    }

    min(n) {
        this.validations.push({
            fn: (val) => val >= n,
            message: `Number must be at least ${n}`
        });
        return this;
    }

    max(n) {
        this.validations.push({
            fn: (val) => val <= n,
            message: `Number must be at most ${n}`
        });
        return this;
    }
    
    integer() {
        this.validations.push({
            fn: (val) => Number.isInteger(val),
            message: 'Number must be an integer'
        });
        return this;
    }

    performValidation(data) {
        if (typeof data !== 'number') {
            return { isValid: false, errors: [this.customMessage || 'Must be a number'] };
        }

        const errors = [];
        this.validations.forEach(validation => {
            if (!validation.fn(data)) {
                errors.push(this.customMessage || validation.message);
            }
        });

        return { isValid: errors.length === 0, errors };
    }
}

class BooleanValidator extends Validator {
    performValidation(data) {
        if (typeof data !== 'boolean') {
            return { isValid: false, errors: [this.customMessage || 'Must be a boolean'] };
        }
        return { isValid: true, errors: [] };
    }
}

class DateValidator extends Validator {
    performValidation(data) {
        if (!(data instanceof Date) || isNaN(data)) {
            return { isValid: false, errors: [this.customMessage || 'Must be a valid Date object'] };
        }
        return { isValid: true, errors: [] };
    }
}

class ObjectValidator extends Validator {
    constructor(schema) {
        super();
        this.schema = schema;
    }

    performValidation(data) {
        if (typeof data !== 'object' || data === null) {
            return { isValid: false, errors: [this.customMessage || 'Must be an object'] };
        }

        const errors = [];
        for (const key in this.schema) {
            const validator = this.schema[key];
            const value = data[key];
            const result = validator.validate(value);

            if (!result.isValid) {
                result.errors.forEach(error => {
                    errors.push(`${key}: ${error}`);
                });
            }
        }
        
        for (const key in data) {
            if (!this.schema.hasOwnProperty(key)) {
                // errors.push(`Unexpected property: ${key}`);
            }
        }

        return { isValid: errors.length === 0, errors };
    }
}

class ArrayValidator extends Validator {
    constructor(itemValidator) {
        super();
        this.itemValidator = itemValidator;
    }

    performValidation(data) {
        if (!Array.isArray(data)) {
            return { isValid: false, errors: [this.customMessage || 'Must be an array'] };
        }

        const errors = [];
        data.forEach((item, index) => {
            const result = this.itemValidator.validate(item);
            if (!result.isValid) {
                result.errors.forEach(error => {
                    errors.push(`[${index}]: ${error}`);
                });
            }
        });

        return { isValid: errors.length === 0, errors };
    }
}

class Schema {
    static string() {
        return new StringValidator();
    }

    static number() {
        return new NumberValidator();
    }

    static boolean() {
        return new BooleanValidator();
    }

    static date() {
        return new DateValidator();
    }

    static object(schema) {
        return new ObjectValidator(schema);
    }

    static array(itemValidator) {
        return new ArrayValidator(itemValidator);
    }
}

module.exports = {
    Schema,
    Validator,
    StringValidator,
    NumberValidator,
    BooleanValidator,
    DateValidator,
    ObjectValidator,
    ArrayValidator,
}; 