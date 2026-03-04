import axios from "axios";
import { toast } from "react-toastify";

/**
 * Reusable API request helper with token authentication
 * @param {string} url - The API endpoint URL
 * @param {string} method - HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param {Object|null} data - Request body data for POST/PUT/PATCH/DELETE
 * @param {Object} headers - Additional headers to merge with defaults
 * @param {Object} config - Additional axios configuration (like params)
 * @returns {Promise<Object>} - Returns { success: boolean, data?: any, error?: string, status?: number }
 */
const apiRequest = async (url, method = "GET", data = null, headers = {}) => {
    try {
        const token = localStorage.getItem("access_token");
        const branch = localStorage.getItem("selected_branch");

        const defaultHeaders = {
            "Content-Type": "application/json",
            Authorization: token, // Use 'Bearer' if backend expects it
            "Branch-Code": branch,
        };

        const config = {
            method,
            url,
            headers: { ...defaultHeaders, ...headers },
            validateStatus: () => true, // Don't throw errors for any status code
        };

        if (data && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
            config.data = data;
        }

        const response = await axios(config);

        // Success status codes (2xx range)
        if (response.status >= 200 && response.status < 300) {
            return {
                success: true,
                data: response.data,
                status: response.status,
            };
        }
        // Client errors (4xx range)
        else if (response.status >= 400 && response.status < 500) {
            // Extract error message from backend response
            const backendError = response.data?.error || response.data?.message;
            return {
                success: false,
                error: backendError || `Client error (${response.status})`,
                status: response.status,
                data: response.data,
            };
        }
        // Server errors (5xx range)
        else if (response.status >= 500) {
            const backendError = response.data?.error || response.data?.message;
            return {
                success: false,
                error: backendError || "Server error occurred.",
                status: response.status,
                data: response.data,
            };
        }
        // Other unexpected status codes
        else {
            return {
                success: false,
                error: "Unexpected response from server.",
                status: response.status,
                data: response.data,
            };
        }
    } catch (error) {
        console.error("Network or unexpected error:", error);
        return {
            success: false,
            error: "Network error or unexpected issue occurred.",
            networkError: true,
        };
    }
};
// (Empty string to remove the lines)

/**
 * Fetches the user-specific allowed pages from the backend table.
 * @param {string} employeeId 
 * @returns {Promise<Array>} List of allowed pages
 */
const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

export const fetchUserPermissions = async (employeeId) => {
    try {
        const response = await axios.get(`${Hmsbaseurl}user-permissions/?employeeId=${employeeId}`);
        // Return full data object (contains allowed_pages, roles, etc.)
        if (response.data) {
            return response.data;
        }
        return { allowed_pages: [], roles: [] };
    } catch (error) {
        console.error("Error fetching user permissions:", error);
        return { allowed_pages: [], roles: [] };
    }
};

/**
 * Updates the user-specific allowed pages in the backend.
 * @param {string} employeeId 
 * @param {Array} allowedPages List of allowed page strings
 * @returns {Promise<Object>} Response data
 */
export const updateUserPermissions = async (employeeId, allowedPages) => {
    try {
        const response = await apiRequest(`${Hmsbaseurl}update-user-permissions/`, "POST", {
            employeeId,
            allowed_pages: allowedPages
        });
        return response;
    } catch (error) {
        console.error("Error updating user permissions:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Fetches all employees from the backend.
 * @returns {Promise<Array>} List of employees
 */
export const fetchAllEmployees = async () => {
    try {
        const response = await axios.get(`${Hmsbaseurl}get-all-employees/`);
        if (response.data && Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    } catch (error) {
        console.error("Error fetching employees:", error);
        return [];
    }
}

/**
 * Fetches the dynamic sidebar mapping from the backend.
 * @returns {Promise<Array>} List of sidebar groups and pages
 */
export const fetchSidebarMapping = async () => {
    try {
        const response = await axios.get(`${Hmsbaseurl}get-sidebar-mapping/`);
        if (response.data && Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    } catch (error) {
        console.error("Error fetching sidebar mapping:", error);
        return [];
    }
}

/**
 * Updates the dynamic sidebar mapping in the backend.
 * @param {Array} mapping List of sidebar groups and pages
 * @returns {Promise<Object>} Response object indicating success or failure
 */
export const updateSidebarMapping = async (mapping) => {
    try {
        const response = await axios.post(`${Hmsbaseurl}update-sidebar-mapping/`, { mapping });
        return response.data;
    } catch (error) {
        console.error("Error updating sidebar mapping:", error);
        throw error;
    }
}

export default apiRequest;
