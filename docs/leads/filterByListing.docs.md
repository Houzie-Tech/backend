## Lead Filtering Service

The `filterByListing` method provides advanced filtering capabilities for leads associated with specific property listings.

### Functionality

1. **Parameter Handling**:
   - `userId`: String - The broker's ID to ensure data security
   - `filterDto`: FilterLeadsByListingDto - Contains filtering criteria:
     - `listingId`: Required - Filters leads by their association with a specific property listing
     - `status`: Optional - Filters by lead status
     - `priority`: Optional - Filters by lead priority level
     - `isActive`: Optional - Filters by whether the lead is active

2. **Dynamic Filter Construction**:
   - Creates a base filter that ensures brokers can only access their own leads
   - Adds the required `listingId` filter
   - Conditionally adds optional filters using spread operator and short-circuit evaluation
   - Only includes optional filters when they are explicitly defined in the request

3. **Database Query**:
   - Uses Prisma to fetch leads matching all filter conditions
   - Includes complete listing data for each lead
   - Orders results by creation date (newest first)

4. **Pagination Support**:
   - Calculates the total count of matching leads
   - Returns both the filtered data and metadata for pagination

5. **Response Structure**:
   - Returns a structured response with:
     - `data`: Array of lead objects with their associated listing information
     - `meta`: Object containing:
       - `total`: Total number of leads matching the filter criteria
       - `filtered`: Number of leads returned in the current response

This method enables efficient filtering of leads by property listing and additional criteria, making it easier for brokers to manage leads for specific properties. The structured response with metadata supports pagination implementation on the client side.
