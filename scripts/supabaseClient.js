// import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';
// import { createClient } from '../node_modules/@supabase/supabase-js'

export class SupabaseClient {
  /**
   * Constructor for the SupabaseClient class
   * @param {string} url - The URL of the Supabase instance
   * @param {string} key - The key for the Supabase instance
   */
  constructor(url, key) {
    this.url = url;
    this.key = key;
    // Create new Supabase client instance
    this.supabase = supabase.createClient(this.url, this.key);
  }
  
  /**
   * Create a new row in the specified table
   * @param {string} table - The name of the table to create the row in
   * @param {object} data - The data to create the row with
   * @returns {object} - The created row data
   */
  async create(table, data) {
    try {
      const { data: createdData, error } = await this.supabase
        .from(table)
        .insert(data);
      if (error) throw error;
      return createdData;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /**
   * Retrieve a single row from the specified table
   * @param {string} table - The name of the table to retrieve the row from
   * @param {number} id - The ID of the row to retrieve
   * @returns {object} - The retrieved row data
   */
  async read(table, id) {
    try {
      const { data: rowData, error } = await this.supabase
        .from(table)
        .select()
        .eq('id', id);
      if (error) throw error;
      return rowData;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /**
   * Retrieve all rows from the specified table
   * @param {string} table - The name of the table to retrieve the rows from
   * @returns {object[]} - An array of row data
   */
  async readAll(table) {
    try {
      const { data: rows, error } = await this.supabase
        .from(table)
        .select();
      if (error) throw error;
      return rows;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /**
   * Update a single row in the specified table
   * @param {string} table - The name of the table to update the row in
   * @param {number} id - The ID of the row to update
   * @param {object} data - The data to update the row with
   * @returns {object} - The updated row data
   */
  async update(table, columnName, value, data) {
    try {
      const { data: updatedData, error } = await this.supabase
        .from(table)
        .update(data)
        .eq(columnName, value);
      if (error) throw error;
      return updatedData;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /**
   * Delete a single row from the specified table
   * @param {string} table - The name of the table to delete the row from
   * @param {string} columnName - The name of the column that you will use to identify what to delete
   * @param {number} value - The value in the column that will dictate which rows are deleted
   * @returns {boolean} - A boolean indicating success
   */
  async delete(table, columnName, value) {
    try {
      const { error } = await this.supabase
        .from(table)
        .delete()
        .eq(columnName, value);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

/* Create Supabase Client */
// Database URL and KEY
const SUPABASE_URL = 'https://baftlzcqbxzejxbowuxf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZnRsemNxYnh6ZWp4Ym93dXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk4Mzg0NDUsImV4cCI6MjAzNTQxNDQ0NX0.sGS4vHQ697XzcHHHDwOBAi2N3CZYiVXoVAXo0lKek6A';
// Create and export client
export const client = new SupabaseClient(SUPABASE_URL, SUPABASE_KEY);