import { Permission, Query, Role } from "appwrite";
import type { Models } from "appwrite";
import { tablesDB } from "./client";
import { getCurrentUser } from "./session";

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

// Get Current Authenticated User
export const getCurrentUserId = async (): Promise<string> => {
  const user = await getCurrentUser();
  return user.$id;
};

// Generate Permissions For a User
export const getUserPermissions = (userId: string) => [
  Permission.read(Role.user(userId)),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
];

// Retrieve All Rows With Pagination
export const getAllRows = async <T extends Models.Row>(
  tableId: string,
  queries: string[]
): Promise<T[]> => {
  const rows: T[] = [];
  const limit = 100;
  let offset = 0;

  while (true) {
    const response = await tablesDB.listRows<T>({
      databaseId: DATABASE_ID,
      tableId,
      queries: [
        ...queries,
        Query.limit(limit),
        Query.offset(offset),
      ],
    });

    rows.push(...response.rows);

    if (response.rows.length < limit) break;

    offset += limit;
  }

  return rows;
};

// Finds the first row that matches the queries (or null)
export const findRow = async <T extends Models.Row>(
  tableId: string,
  queries: string[]
): Promise<T | null> => {
  const response = await tablesDB.listRows<T>({
    databaseId: DATABASE_ID,
    tableId,
    queries: [...queries, Query.limit(1)],
  });

  return response.rows[0] ?? null;
};
