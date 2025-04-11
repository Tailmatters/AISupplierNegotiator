import { db, pool } from "../server/db";
import { sql } from "drizzle-orm";

async function migrateSpendDataSchema() {
  console.log("Adding new category columns to spendData table...");
  
  try {
    // Add subcategory_level3 column if it doesn't exist
    await db.execute(sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'spend_data' AND column_name = 'subcategory_level3'
        ) THEN 
          ALTER TABLE spend_data ADD COLUMN subcategory_level3 text;
        END IF;
      END $$;
    `);
    
    // Add is_auto_categorized column if it doesn't exist
    await db.execute(sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'spend_data' AND column_name = 'is_auto_categorized'
        ) THEN 
          ALTER TABLE spend_data ADD COLUMN is_auto_categorized boolean DEFAULT false;
        END IF;
      END $$;
    `);
    
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the migration
migrateSpendDataSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });