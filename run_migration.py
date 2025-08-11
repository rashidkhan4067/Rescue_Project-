#!/usr/bin/env python3
"""
Run database migration for enhanced report functionality.
This script adds new fields to the Report model.
"""
import sys
import os

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from migrations.add_report_fields import migrate_database, verify_migration

def main():
    print("🚀 Starting Enhanced Report Migration")
    print("=" * 50)
    
    # Check if instance directory exists
    if not os.path.exists('instance'):
        print("Creating instance directory...")
        os.makedirs('instance', exist_ok=True)
    
    # Run migration
    print("Running database migration...")
    success = migrate_database()
    
    if success:
        print("\n✅ Migration completed successfully!")
        print("=" * 50)
        verify_migration()
        print("\n🎉 Your report page is now fully functional with enhanced features!")
        print("\nNew features available:")
        print("  • Enhanced form validation")
        print("  • Date and time fields for last seen")
        print("  • Improved file upload with image optimization")
        print("  • Status tracking for reports")
        print("  • Better error handling and user feedback")
    else:
        print("\n❌ Migration failed!")
        print("Please check the error messages above and try again.")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
