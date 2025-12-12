#!/bin/bash

# Leave Management Database Migration Script
# This script creates the leave_applications table in the gyan_school_db database

echo "========================================="
echo "Leave Management Database Migration"
echo "========================================="
echo ""

# Check if migration file exists
MIGRATION_FILE="./migrations/create_leave_applications_table.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "Error: Migration file not found at $MIGRATION_FILE"
    exit 1
fi

# Database credentials (update these if different)
DB_NAME="gyan_school_db"
DB_USER="root"
DB_HOST="localhost"

echo "This script will create the 'leave_applications' table in your database."
echo ""
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Host: $DB_HOST"
echo ""
read -p "Do you want to continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled."
    exit 0
fi

echo ""
echo "Running migration..."
echo ""

# Run the migration
# Option 1: If you have mysql command line tool
if command -v mysql &> /dev/null; then
    mysql -u $DB_USER -p $DB_NAME < $MIGRATION_FILE
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Migration completed successfully!"
        echo "The 'leave_applications' table has been created."
    else
        echo ""
        echo "❌ Migration failed!"
        echo "Please check your database credentials and try again."
        exit 1
    fi
else
    echo ""
    echo "⚠️ MySQL command line tool not found."
    echo ""
    echo "Please run the migration manually by:"
    echo "1. Opening phpMyAdmin or your MySQL client"
    echo "2. Selecting the '$DB_NAME' database"
    echo "3. Running the SQL file located at: $MIGRATION_FILE"
    echo ""
fi

echo ""
echo "========================================="
echo "Migration process complete!"
echo "========================================="
