# Database Fix Instructions

## Problem
The application was failing to start due to database schema conflicts between the existing database structure and the JPA entity mappings.

## Solution Applied
1. **Fixed entity mappings** to match the existing database schema:
   - Added `@Column(name = "id_categoria")` to Category entity
   - Added explicit `referencedColumnName` attributes to all foreign key relationships
   - Fixed the `fecha_creacion` field initialization

2. **Changed Hibernate DDL strategy** from `update` to `validate` to avoid schema modification conflicts.

## If the application still fails to start:

### Option 1: Recreate the database (Recommended)
1. Open MySQL Workbench or your MySQL client
2. Run the SQL script: `database_schema.sql`
3. This will drop and recreate the database with the correct schema
4. Start the application

### Option 2: Manual database fixes
If you want to keep existing data, run these SQL commands:

```sql
USE cityfixdb;

-- Fix the categorias table if it doesn't have the right structure
ALTER TABLE categorias CHANGE COLUMN id id_categoria BIGINT AUTO_INCREMENT;

-- Ensure all foreign key constraints are properly set up
-- (The exact commands depend on your current database structure)
```

## Verification
After applying the fix, the application should start successfully and you should see:
- No more DDL errors in the logs
- The application starts on port 8080
- Basic data (roles, categories, statuses) is initialized automatically

## Next Steps
Once the application starts successfully:
1. Test the endpoints using the Swagger UI at: http://localhost:8080/swagger-ui.html
2. Register a new user
3. Create some test claims