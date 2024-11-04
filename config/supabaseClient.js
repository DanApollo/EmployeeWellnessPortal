const supabaseURL = "https://jyoijftfpfidhenhysdp.supabase.co"
const supabaseKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5b2lqZnRmcGZpZGhlbmh5c2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA0MjU3NDksImV4cCI6MjAzNjAwMTc0OX0.2vIyUoxmYfLxolMEV9NdehLN5_BrZFrXNQRpyzlZ42E"

class SupabaseClient {

    /**
     * Uses the Supabase url and key to create an instance of Supabase.
     * @constructor
     * @param {String} url - Database url.
     * @param {String} key - Database key.
     */
    constructor(url, key) {
        this.supabase = supabase.createClient(url, key)
    }

    /**
     * Signs the user into Supabase. On success, returns user object.
     * @param {String} email - User email.
     * @param {String} password - User password.
     * @returns {Promise<{ ok: Boolean, user?: any, error?: any }>} - A promise that resolves to an object indicating success (`ok: true`) with the inserted user (`user`), or failure (`ok: false`) with an error object (`error`).
     */
    async signIn(email, password) {
        try {
            // Sign in the user
            const response = await this.supabase.auth.signInWithPassword({
                email,
                password
            })
            if (!response.error) return { ok: true, user: response.data.user } // Successful login, return ok and user data
            else throw response.error // Re-throw the Supabase error
        } catch (error) {
            return { ok: false, error } // Return the error
        }
    }

    /**
     * Signs up the user into Supabase. On success, returns user object.
     * @param {String} email - User email.
     * @param {String} password - User password.
     * @returns {Promise<{ ok: Boolean, user?: any, error?: any }>} - A promise that resolves to an object indicating success (`ok: true`) with the inserted user (`user`), or failure (`ok: false`) with an error object (`error`).
     */
    async signUp(email, password) {
        try {
            // Sign up the user
            const response = await this.supabase.auth.signUp({
                email,
                password
            })
            if (!response.error) return { ok: true, user: response.data.user } // Successful sign up, return ok and user data
            else throw response.error // Re-throw the Supabase error
        } catch (error) {
            return { ok: false, error } // Return the error
        }
    }

    /**
     * Logs out the user.
     * @returns {Promise<{ ok: Boolean }}
     */
    async handleLogout() {
        try {
            const { error } = await supabaseClient.supabase.auth.signOut() // Successful log out, return ok and user data
            if (!error) return { ok: true }
            else throw error // Re-throw the Supabase error
        } catch (error) {
            return { ok: false, error } // Return the error
        }
    }


    /**
     * Create method to add data to the specified database table.
     * @param {String} table - The table name.
     * @param {Object} data - The data we want to add.
     * @returns {Promise<{ ok: Boolean, data?: any, error?: any }>} - A promise that resolves to an object indicating success (`ok: true`) with the inserted data (`data`), or failure (`ok: false`) with an error object (`error`).
     */
    async create(table, data) {
        try {
            const response = await this.supabase
                .from(table)
                .insert(data)
            if (!response.error) {
                return { ok: true, data: response.data } // Reurn response data
            } else throw response.error // Re-throw the Supabase error
        } catch (error) {
            return { ok: false, error } // Return the error
        }
    }

    /**
     * Read method to read data from the specified database table of the specified id.
     * @param {String} table - The table name.
     * @param {String} id - The id of the data to be read.
     * @returns {Promise<{ ok: Boolean, data?: any, error?: any }>} - A promise that resolves to an object indicating success (`ok: true`) with the inserted data (`data`), or failure (`ok: false`) with an error object (`error`).
     */
    async read(table, field, id) {
        try {
            const response = await this.supabase
                .from(table)
                .select()
                .eq(field, id)
                .single()
            if (!response.error) {
                return { ok: true, data: response.data } // Reurn response data
            } else throw response.error // Re-throw the Supabase error
        } catch (error) {
            return { ok: false, error } // Return the error
        }
    }

    /**
     * Read method to read all data from the specified database table.
     * @param {String} table - The table name.
     * @returns {Promise<{ ok: Boolean, data?: any, error?: any }>} - A promise that resolves to an object indicating success (`ok: true`) with the inserted data (`data`), or failure (`ok: false`) with an error object (`error`).
     */
    async readAll(table) {
        try {
            const response = await this.supabase
                .from(table)
                .select()
            if (!response.error) {
                return { ok: true, data: response.data } // Reurn response data
            } else throw response.error // Re-throw the Supabase error
        } catch (error) {
            return { ok: false, error } // Return the error
        }
    }

    /**
     * Update method to change data from the specified database table of the specified id.
     * @param {String} table - The table name.
     * @param {String} id - The id of the data to be updated.
     * @param {Object} data - The data we want to change/add.
     * @returns {Promise<{ ok: Boolean, data?: any, error?: any }>} - A promise that resolves to an object indicating success (`ok: true`) with the inserted data (`data`), or failure (`ok: false`) with an error object (`error`).
     */
    async update(table, id, data) {
        try {
            const response = await this.supabase
                .from(table)
                .update(data)
                .eq('id', id)
            if (!response.error) {
                return { ok: true, data: response.data } // Reurn response data
            } else throw response.error // Re-throw the Supabase error
        } catch (error) {
            return { ok: false, error } // Return the error
        }
    }

    /**
     * Delete method to delete data from the specified database table of the specified id.
     * @param {String} table - The table name.
     * @param {String} id - The id of the data to be deleted.
     * @returns {Promise<{ ok: Boolean, error?: any }>} - A promise that resolves to an object indicating success (`ok: true`), or failure (`ok: false`) with an error object (`error`).
     */
    async delete(table, id) {
        try {
            const response = await this.supabase
                .from(table)
                .delete()
                .eq('id', id)
            if (!response.error) {
                return { ok: true } // Return success status
            } else throw response.error // Re-throw the Supabase error
        } catch (error) {
            return { ok: false, error } // Return the error
        }
    }
}

// Create SupabaseClient before export to make sure the same instance is used app wide.
export const supabaseClient = new SupabaseClient(supabaseURL, supabaseKEY)
