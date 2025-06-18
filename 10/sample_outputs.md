# Sample Application Outputs

This file contains examples of the application's output from two different simulated runs.

---

### Sample Run 1: Searching for affordable clothing

**Command:**
```bash
npm start
```

**Interaction:**
```
Hi! How can I help you find a product today?
> I need a t-shirt for under 30 dollars

🤖 Asking AI to analyze your request...

🔍 AI requested a search with the following filters:
{ category: 'Clothing', max_price: 30, keywords: 't-shirt' }

✅ Here are your filtered products:
1. T-Shirt - $19.99, Rating: 4.2, In Stock
```

---

### Sample Run 2: Searching for high-rated, in-stock electronics

**Command:**
```bash
npm start
```

**Interaction:**
```
Hi! How can I help you find a product today?
> show me in-stock electronics with a rating of 4.6 or more

🤖 Asking AI to analyze your request...

🔍 AI requested a search with the following filters:
{ category: 'Electronics', min_rating: 4.6, in_stock: true }

✅ Here are your filtered products:
1. Laptop - $999.99, Rating: 4.7, In Stock
2. Smart Watch - $199.99, Rating: 4.6, In Stock
3. Gaming Console - $399.99, Rating: 4.8, In Stock
``` 