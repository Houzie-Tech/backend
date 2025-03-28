## Lead Retrieval Services

### FindAll Method

The `findAll` method retrieves leads for a specific broker with optional search functionality.

**Parameters:**

- `userId`: String - The broker's ID to filter leads by
- `searchParams`: Optional object containing a `query` string for searching

**Functionality:**

1. **Filter Construction**:
   - Creates a base filter that limits results to leads belonging to the specified broker
   - When a search query is provided, adds an `OR` condition to search across multiple fields:
     - Name (case-insensitive)
     - Phone number (case-insensitive)
     - Email (case-insensitive)

2. **Database Query**:
   - Uses Prisma to fetch leads matching the filters
   - Includes related listing data (specifically the title)
   - Orders results by creation date (newest first)

3. **Data Transformation**:
   - Processes the results to add a `propertyName` field derived from the listing title
   - Removes the original `listing` object from the response
   - Returns a clean, flattened lead object with property name information

4. **Error Handling**:
   - Catches and logs any errors during the retrieval process
   - Throws a generic error message for unexpected issues

### FindOne Method

The `findOne` method retrieves a single lead by its unique identifier.

**Parameters:**

- `id`: String - The unique identifier of the lead to retrieve

**Functionality:**

1. **Database Query**:
   - Uses Prisma's `findUnique` method to locate a specific lead by ID

2. **Not Found Handling**:
   - Checks if the lead exists
   - Throws a `NotFoundException` with a descriptive message if the lead is not found

3. **Error Handling**:
   - Catches and logs any errors during the retrieval process
   - Throws a generic error message for unexpected issues

Both methods implement proper error handling and ensure that brokers can only access leads that belong to them, maintaining data security and isolation between different brokers in the system.
