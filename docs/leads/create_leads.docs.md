# Create Lead Service

The `create` method in the `LeadsService` class is responsible for creating a new lead in the system. This method takes two parameters: `createLeadDto` of type `CreateLeadDto` and `userId` of type `string`.

## Functionality

1. **Data Extraction**: The method extracts relevant information from the `createLeadDto` object, including:
   - Budget range (max and min)
   - Name
   - Phone number
   - Preferred locations
   - Property types
   - Email (optional)
   - Note (optional)

2. **Database Operation**: It uses Prisma ORM to create a new lead record in the database with the extracted data.

3. **Broker Association**: The lead is associated with a broker using the `userId` parameter, which is assigned to the `brokerId` field.

4. **Error Handling**:
   - Catches and logs any errors that occur during the creation process.
   - Specifically handles unique constraint violations (error code 'P2002'), which likely occurs when a lead with the same phone number already exists.
   - Throws a `BadRequestException` with a descriptive message for duplicate phone numbers.
   - For any other unexpected errors, it throws a generic error message.

### Data Transfer Object (DTO)

The `CreateLeadDto` class defines the structure of the data required to create a new lead:

- `name`: String (required)
- `email`: String (optional, must be a valid email)
- `phoneNumber`: String (required, must be a valid Indian phone number)
- `budgetMin`: Number (required)
- `budgetMax`: Number (required)
- `preferredLocations`: Array of strings (required)
- `propertyTypes`: Array of `PropertyType` enum values (required)
- `note`: String (optional)

### Validation

The DTO uses class-validator decorators to ensure data integrity:

- `@IsString()`: Ensures the field is a string
- `@IsOptional()`: Marks a field as optional
- `@IsEmail()`: Validates email format
- `@IsPhoneNumber('IN')`: Validates Indian phone number format
- `@IsNumber()`: Ensures the field is a number
- `@IsArray()`: Validates that the field is an array
- `@IsEnum(PropertyType, { each: true })`: Ensures each element in the array is a valid `PropertyType` enum value

### API Documentation

The `@ApiProperty()` decorator is used to provide Swagger documentation for each field in the DTO, enhancing API documentation and making it easier for frontend developers to understand the required data structure.
