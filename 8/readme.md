# JavaScript Validation Library

A simple, type-safe, and chainable validation library for JavaScript.

## Installation

To use this library, you need to have Node.js and npm installed.

1.  Clone the repository or download the source code.
2.  Navigate to the project directory: `cd 8`
3.  Install dependencies:
    ```bash
    npm install
    ```

## Usage

You can use the `Schema` class to define validation rules for your data.

### Basic Example

```javascript
const { Schema } = require('./index');

const userSchema = Schema.object({
  name: Schema.string().minLength(2),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number().optional(),
});

const userData = {
  name: "John Doe",
  email: "john@example.com",
};

const result = userSchema.validate(userData);

if (result.isValid) {
  console.log('Validation successful!');
} else {
  console.log('Validation failed:', result.errors);
}
```

### Complex Example

```javascript
const addressSchema = Schema.object({
    street: Schema.string(),
    city: Schema.string(),
    postalCode: Schema.string().pattern(/^\d{5}$/).withMessage('Postal code must be 5 digits'),
});

const userSchema = Schema.object({
    id: Schema.string(),
    name: Schema.string().minLength(2).maxLength(50),
    email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    isActive: Schema.boolean(),
    tags: Schema.array(Schema.string()),
    address: addressSchema.optional(),
});
```

## Running Tests

To run the tests and generate a coverage report, use the following command:

```bash
npm test
```

This will run all tests using Jest and create a `coverage` directory with the report. A summary will also be printed to the console. 