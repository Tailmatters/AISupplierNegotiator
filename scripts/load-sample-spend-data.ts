import { db } from '../server/db';
import { spendUploads, spendData } from '../shared/schema';
import { sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm/expressions';

// Function to add sample data
async function addSampleSpendData() {
  console.log('Adding sample spend data...');
  
  try {
    // We'll use user ID 2 (Vithal_Cyient) for the sample data
    const userId = 2;
    console.log(`Using user ID: ${userId}`);
    
    // Check if we already have spend data
    const existingData = await db.execute(sql`SELECT COUNT(*) FROM spend_data`);
    const count = parseInt(existingData.rows[0].count);
    
    if (count > 0) {
      console.log(`Database already has ${count} spend data records. Skipping sample data creation.`);
      return;
    }
    
    // Create a sample upload record
    const [uploadRecord] = await db.insert(spendUploads).values({
      userId: userId,
      fileName: 'sample-data-2024.csv',
      fileSize: 15240,
      fileType: 'text/csv',
      recordCount: 50,
      status: 'completed',
      uploadedAt: new Date(),
      processingCompletedAt: new Date(),
      source: 'sample_data',
      metadata: { sampleData: true }
    }).returning();
    
    console.log(`Created sample upload record with ID: ${uploadRecord.id}`);
    
    // Get suppliers from the database
    const suppliers = await db.execute(sql`SELECT id, name FROM suppliers`);
    
    // If no suppliers, create sample suppliers first
    let suppliersList = suppliers.rows;
    if (!suppliersList || suppliersList.length === 0) {
      console.log('No suppliers found. Using generic supplier names.');
      suppliersList = [
        { id: null, name: 'Office Depot' },
        { id: null, name: 'Dell' },
        { id: null, name: 'Apple' },
        { id: null, name: 'Microsoft' },
        { id: null, name: 'HP' },
        { id: null, name: 'Lenovo' },
        { id: null, name: 'Amazon Business' },
        { id: null, name: 'Staples' },
        { id: null, name: 'CDW' },
        { id: null, name: 'Best Buy' }
      ];
    }
    
    // Sample categories
    const categories = [
      'IT Equipment',
      'Office Supplies',
      'Software',
      'Professional Services',
      'Marketing',
      'Facilities',
      'Travel',
      'Telecommunications'
    ];
    
    // Sample years (2021-2024)
    const years = [2021, 2022, 2023, 2024];
    
    // Create 50 sample spend records with various dates and amounts
    const spendDataRecords = [];
    
    for (let i = 0; i < 50; i++) {
      const supplier = suppliersList[Math.floor(Math.random() * suppliersList.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const year = years[Math.floor(Math.random() * years.length)];
      const month = Math.floor(Math.random() * 12);
      const day = Math.floor(Math.random() * 28) + 1;
      const amount = Math.floor(Math.random() * 100000) + 1000; // Random amount between 1000 and 101000
      
      spendDataRecords.push({
        userId: userId,
        supplierId: supplier.id, // This might be null for the generated names
        supplierName: supplier.name,
        category: category,
        subcategory: category === 'IT Equipment' ? ['Laptops', 'Desktops', 'Monitors', 'Accessories'][Math.floor(Math.random() * 4)] : null,
        spendAmount: amount,
        currency: 'USD',
        transactionDate: new Date(year, month, day),
        uploadId: uploadRecord.id,
        dataSource: 'sample_data'
      });
    }
    
    // Insert the spend data records
    await db.insert(spendData).values(spendDataRecords);
    
    console.log(`Added ${spendDataRecords.length} sample spend data records.`);
    console.log('Sample data loaded successfully.');
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
}

// Execute the function
addSampleSpendData().then(() => {
  console.log('Done!');
  process.exit(0);
}).catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});