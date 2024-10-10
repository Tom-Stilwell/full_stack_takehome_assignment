import { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import Papa from "papaparse";

// Define the types for the records and errors
interface ValidationError {
    message: string;
    severity: "critical" | "warning";
}

interface Record {
    id: number;
    name: string;
    email: string;
    street?: string;
    city?: string;
    zipcode?: string;
    phone?: string;
    status: string;
    errors?: {
        email?: ValidationError;
        phone?: ValidationError;
        zipcode?: ValidationError;
        street?: ValidationError;
    };
}

export default function DataReviewTable() {
    const [records, setRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch data from API
        const fetchData = async () => {
            try {
                const response: AxiosResponse<{ records: Record[] }> = await axios.get("/api/data");
                setRecords(response.data.records);
                setError(null);  // Reset error in case of success
            } catch (err) {
                setError("Error fetching data. Please try again later.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Function to flatten the data for CSV export, including errors
    const flattenRecord = (record: Record) => {
        return {
            id: record.id,
            name: record.name,
            email: record.email,
            street: record.street || '',  // Handle missing fields
            city: record.city || '',
            zipcode: record.zipcode || '',
            phone: record.phone || '',
            status: record.status,

            // Include validation error messages and severity
            email_error: record.errors?.email?.message || '',
            email_severity: record.errors?.email?.severity || '',
            phone_error: record.errors?.phone?.message || '',
            phone_severity: record.errors?.phone?.severity || '',
            zipcode_error: record.errors?.zipcode?.message || '',
            zipcode_severity: record.errors?.zipcode?.severity || '',
            street_error: record.errors?.street?.message || '',
            street_severity: record.errors?.street?.severity || '',
        };
    };

    // Function to handle CSV export
    const exportToCSV = () => {
        const flattenedData = records.map(flattenRecord);
        const csv = Papa.unparse(flattenedData); // Convert the data to CSV

        // Trigger CSV download
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute("download", "data_export_with_errors.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Display loading message
    if (loading) {
        return <div>Loading...</div>;
    }

    // Display error message if fetching data failed
    if (error) {
        return <div style={{ color: "red" }}>{error}</div>;
    }

    return (
        <div style={{ margin: "20px" }}>
            <h1>Data Review</h1>
            <button onClick={exportToCSV} style={{ marginBottom: "20px" }}>Export CSV</button>
            {/* You will replace this placeholder with table, tooltips, and modals */}
        </div>
    );
}
