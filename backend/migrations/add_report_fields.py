"""
Database migration script to add new fields to Report model.
Run this script to update the database schema for enhanced report functionality.
"""
import sqlite3
import os
from datetime import datetime

def migrate_database(db_path='instance/rescue.db'):
    """Add new fields to the Report table."""
    
    # Check if database exists
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check current table structure
        cursor.execute("PRAGMA table_info(report)")
        columns = [column[1] for column in cursor.fetchall()]
        print(f"Current columns: {columns}")
        
        # Add new columns if they don't exist
        new_columns = [
            ('last_seen_date', 'DATE'),
            ('last_seen_time', 'TIME'),
            ('updated_at', 'DATETIME'),
            ('status', 'VARCHAR(20) DEFAULT "active"')
        ]
        
        for column_name, column_type in new_columns:
            if column_name not in columns:
                try:
                    if column_name == 'updated_at':
                        # Add updated_at with current timestamp as default
                        cursor.execute(f'ALTER TABLE report ADD COLUMN {column_name} {column_type} DEFAULT CURRENT_TIMESTAMP')
                    else:
                        cursor.execute(f'ALTER TABLE report ADD COLUMN {column_name} {column_type}')
                    print(f"Added column: {column_name}")
                except sqlite3.Error as e:
                    print(f"Error adding column {column_name}: {e}")
            else:
                print(f"Column {column_name} already exists")
        
        # Update area column to allow longer text
        try:
            cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='report'")
            table_sql = cursor.fetchone()[0]
            
            if 'area VARCHAR(100)' in table_sql:
                print("Updating area column length...")
                # SQLite doesn't support ALTER COLUMN, so we need to recreate the table
                # For now, we'll just note this and handle it in the application
                print("Note: Area column length will be handled by the application")
        except sqlite3.Error as e:
            print(f"Error checking area column: {e}")
        
        # Set default status for existing records
        cursor.execute("UPDATE report SET status = 'active' WHERE status IS NULL")
        
        conn.commit()
        print("Database migration completed successfully!")
        return True
        
    except sqlite3.Error as e:
        print(f"Database migration failed: {e}")
        return False
    finally:
        if conn:
            conn.close()

def verify_migration(db_path='instance/rescue.db'):
    """Verify that the migration was successful."""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("PRAGMA table_info(report)")
        columns = cursor.fetchall()
        
        print("\nFinal table structure:")
        for column in columns:
            print(f"  {column[1]} ({column[2]})")
        
        # Check if we have any reports
        cursor.execute("SELECT COUNT(*) FROM report")
        count = cursor.fetchone()[0]
        print(f"\nTotal reports in database: {count}")
        
        conn.close()
        return True
        
    except sqlite3.Error as e:
        print(f"Verification failed: {e}")
        return False

if __name__ == "__main__":
    print("Starting database migration...")
    print("=" * 50)
    
    # Run migration
    success = migrate_database()
    
    if success:
        print("\n" + "=" * 50)
        verify_migration()
        print("\nMigration completed! You can now use the enhanced report features.")
    else:
        print("\nMigration failed! Please check the error messages above.")
