# Reports Module Documentation

## Overview  

The Reports module handles user-generated reports about platform content, focusing on listing-related issues. It provides functionality for creating, managing, and analyzing reports with associated metadata.

---

## Core Functionality  

### Report Management  

- **Create Reports**: Submit reports with listing context and status tracking  
- **Retrieve Reports**: Fetch individual or bulk reports  
- **Update Reports**: Modify report details and resolution status  
- **Delete Reports**: Permanently remove reports  

### Analytical Features  

- **Date-Range Filtering**: Retrieve reports created within specified periods  
- **Basic Analytics**: Track total reports and recent submissions  

---

## API Endpoints  

| Method | Endpoint | Description | Authentication | Parameters |
|--------|----------|-------------|----------------|------------|
| **POST** | `/reports` | Create a new report | Required | `createReportDto`, `reportedById` |
| **GET** | `/reports` | Get all reports | Optional | None |
| **GET** | `/reports/analytics` | Get report statistics | Optional | None |
| **GET** | `/reports/sales` | Get reports by date range | Optional | `startDate`, `endDate` (YYYY-MM-DD) |
| **GET** | `/reports/:id` | Get a single report | Optional | `id` |
| **PATCH** | `/reports/:id` | Update a report | Optional | `updateReportDto`, `id` |
| **DELETE** | `/reports/:id` | Delete a report | Optional | `id` |

---

## Service Implementation  

### Report Creation  

```typescript
async create(createReportDto: CreateReportDto, reportedById: string) {
  return this.prisma.report.create({
    data: {
      reason: createReportDto.reason,
      listingId: createReportDto.listingId,
      reportedById,
      details: createReportDto.details,
      status: createReportDto.status,
    },
  });
}
```

**Key Fields**:  

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `reason` | string | Report classification (e.g., "MISLEADING_DESCRIPTION") | Yes |
| `listingId` | string | Associated property listing ID | Yes |
| `reportedById` | string | User ID submitting the report | Yes |
| `details` | string | Additional context | No |
| `status` | string | Initial status ("OPEN", "IN_PROGRESS", "RESOLVED") | Yes |

---

### Report Retrieval & Management  

```typescript
async findAll() { /* Returns all reports */ }
async findOne(id: string) { /* Gets single report */ }
async update(id: string, updateReportDto: UpdateReportDto) { /* Updates report */ }
async remove(id: string) { /* Deletes report */ }
```

---

### Analytical Methods  

#### `getSalesReport(startDate: Date, endDate: Date)`  

```typescript
async getSalesReport(startDate: Date, endDate: Date) {
  return { 
    totalReports: reports.length,
    reports: reports
  };
}
```

**Returns**:  

- `totalReports`: Count of reports created between dates  
- `reports`: Array of reports with full details  

#### `getAnalytics()`  

```typescript
async getAnalytics() {
  return { 
    totalReports: count,
    latestReports: recentReports
  };
}
```

**Returns**:  

- `totalReports`: Overall report count  
- `latestReports`: 5 most recent submissions  

---

## Data Transfer Objects (DTOs)  

### CreateReportDto  

```typescript
class CreateReportDto {
  reason: string;
  listingId: string;
  details?: string;
  status: string;
}
```

### UpdateReportDto  

```typescript
class UpdateReportDto {
  reason?: string;
  details?: string;
  status?: string;
}
```

---

## Error Handling  

- **NotFoundException**: Thrown for invalid report IDs  
- **Prisma Errors**: Handled internally (e.g., `P2025` for missing records)  

---

## Integration Points  

1. **Prisma Service**: Database operations  
2. **Listing Module**: Listing ID validation  
3. **User Module**: Reporter identification  
4. **Auth Module**: User context for report creation  

---

## Example Usage  

### Create a Listing Report  

```typescript
await reportsService.create({
  reason: 'INACCURATE_PRICING',
  listingId: 'ABC123',
  details: 'Price listed as 2CR, actual 1.5CR',
  status: 'OPEN'
}, 'user-uuid');
```

### Generate Weekly Report Summary  

```typescript
const { totalReports, reports } = await reportsService.getSalesReport(
  new Date('2024-03-25'),
  new Date('2024-03-31')
);
```

### Review Report Analytics  

```typescript
const { totalReports, latestReports } = await reportsService.getAnalytics();
```

---

## Swagger Documentation  

```typescript
@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  @UseGuards(AuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new report' })
  create(...) { ... }

  @Get('analytics')
  @ApiOperation({ summary: 'Get report statistics' })
  getAnalytics() { ... }

  @Get('sales')
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  getSalesReport(...) { ... }
}
```
