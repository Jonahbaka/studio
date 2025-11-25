const { Client, Databases } = require('node-appwrite');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sfo.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6924d2650008d5581c14')
    .setKey(process.env.APPWRITE_API_KEY); // Requires API key with 'databases' scope

const databases = new Databases(client);

// Configuration
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6924d4010005c14d03b7';
const collectionId = 'zumacollection'; // USERS collection
const key = 'role'; // Attribute name
const size = 50; // Max string length
const isRequired = false; // Not required (optional field)
const defaultValue = null; // No default value

async function addRoleAttribute() {
    try {
        console.log('Adding "role" attribute to zumacollection...');
        console.log('Database ID:', databaseId);
        console.log('Collection ID:', collectionId);

        const response = await databases.createStringAttribute(
            databaseId,
            collectionId,
            key,
            size,
            isRequired,
            defaultValue
        );

        console.log('✅ Successfully created "role" attribute!');
        console.log('Response:', JSON.stringify(response, null, 2));
        console.log('\nYou can now sign up as provider and the role will be saved correctly.');
    } catch (error) {
        console.error('❌ Error creating attribute:', error.message);
        if (error.code === 409) {
            console.log('ℹ️  The "role" attribute already exists.');
        } else {
            console.error('Full error:', error);
        }
    }
}

addRoleAttribute();
