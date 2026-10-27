import { Client, Account, TablesDB, ID } from "appwrite";

// Initialize Appwrite
export const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

// Appwrite Services
export const account = new Account(client);
export const tablesDB = new TablesDB(client);

export { ID };