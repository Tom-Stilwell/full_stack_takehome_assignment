import { useEffect, useState, useMemo } from "react";
import axios, { AxiosResponse } from "axios";
import Papa from "papaparse";

// Alright, these are the types for validation errors and records—gotta keep things organized
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
    const [error, setError] = useState<string | null>(null); // for now, only showing errors for data fetching
    const [modalData, setModalData] = useState<Record | null>(null); // Handles modal appear when we need to show detailed error summaries
    const [searchQuery, setSearchQuery] = useState<string>(""); // Filtering the table by search
    const [hoveredError, setHoveredError] = useState<string | null>(null); // Used for tooltips on validation errors
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null); // Keeps track of mouse position for the tooltips

    // Fetch data from backend endpoint (/api/data)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response: AxiosResponse<{ records: Record[] }> = await axios.get("/api/data");
                setRecords(response.data.records);
                setError(null);  // No issues, reset any previous error messages
            } catch (err) {
                setError("Error fetching data. Please try again later."); // Keep the user informed if something breaks
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Function to flatten the data—so it's parseable and uniform as a CSV
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

            // Pulling error messages into the CSV output, gotta keep things transparent
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

    // Memoize the filtered data to prevent unnecessary recalculations when not needed
    const filteredRecords = useMemo(() => {
        return records.filter(record =>
            Object.values(record).some(value =>
                String(value).toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [records, searchQuery]); // We only want this to run when records or searchQuery change

    // CSV Export function—this needs to work only for the currently filtered records
    const exportToCSV = () => {
        const flattenedData = filteredRecords.map(flattenRecord); // Flatten filtered data
        const csv = Papa.unparse(flattenedData); // PapaParse to convert JSON to CSV format

        // Create a blob and trigger download—super common CSV download technique
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute("download", "data_export_with_errors.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Memoize this to avoid recalculating the status badge on each render
    const getStatusBadge = useMemo(() => (status: string) => {
        let badgeColor = "bg-gray-200 text-gray-700 hover:bg-gray-300"; // Default style
        if (status === "active") badgeColor = "bg-green-500/20 text-green-900 hover:bg-green-500/30";
        else if (status === "inactive") badgeColor = "bg-red-500/20 text-red-900 hover:bg-red-500/30";
        else if (status === "pending") badgeColor = "bg-yellow-500/20 text-yellow-900 hover:bg-yellow-500/30";

        return <span className={`px-2 py-1 rounded-md text-sm font-semibold ${badgeColor}`}>{status}</span>;
    }, []); // This is static, so no dependencies—no need to recalculate this on every render

    // Same logic for getting the right color based on severity—no need to rerun this unless severity changes
    const getFieldColor = useMemo(() => (severity?: "critical" | "warning") => {
        if (severity === "critical") return "bg-red-500/20 hover:bg-red-500/30 text-red-900";
        if (severity === "warning") return "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-900";
        return "bg-green-500/20 hover:bg-green-500/30 text-green-900";
    }, []); // No need to recalculate this unless the severity values change

    // Handle closing the Errors modal when clicking outside it
    const closeModal = (e: any) => {
        if (e.target.id === 'modal-background') {
            setModalData(null); // Close the modal
        }
    };

    // Tooltips for error messages, following the cursor around the screen
    const handleMouseMove = (e: any, errorMessage: string) => {
        setHoveredError(errorMessage); // Set the hovered error
        setTooltipPosition({ x: e.pageX, y: e.pageY }); // Track cursor for tooltip position
    };

    // Clear tooltip when the mouse leaves the field
    const handleMouseLeave = () => {
        setHoveredError(null);
        setTooltipPosition(null); // Reset the tooltip position
    };

    // Rendering the modal with validation errors for a specific record
    const renderModal = (record: Record) => {
        return (
            <div
                id="modal-background"
                className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
                onClick={closeModal}
            >
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
                    <h2 className="text-xl font-bold mb-4">Error Summary for {record.name}</h2>
                    <ul className="list-disc list-inside">
                        {Object.entries(record.errors || {}).map(([field, error]) => (
                            <li
                                key={field}
                                className={`mb-2 p-2 rounded ${getFieldColor(error?.severity)}`}
                            >
                                <strong className="capitalize">{field}:</strong> {error?.message}
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={() => setModalData(null)} // Close the modal on click
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    };

    // Loading state display
    if (loading) {
        return <div className="text-center mt-10">Loading...</div>;
    }

    // If there's an error fetching data, show this
    if (error) {
        return <div className="text-center text-red-500 mt-10">{error}</div>;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-white relative">
            <div className="p-6 overflow-scroll px-0 w-11/12 max-w-6xl cursor-[url('https://example.com/fun-cursor.png'), auto]">
                <h1 className="text-3xl font-bold mb-6">Data Review</h1>

                {/* Search input to filter through the records */}
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} // Live search
                    placeholder="Search records..."
                    className="mb-4 w-full max-w-md p-2 border border-gray-300 rounded-md"
                />

                {/* Table displaying the records */}
                <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-md shadow-md scroll-snap-y scroll-snap-stop-always">
                    <table className="w-full table-auto text-left">
                        <thead className="sticky top-0 bg-white z-10">
                            <tr>
                                <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">Name</th>
                                <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">Email</th>
                                <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">Street</th>
                                <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">Zipcode</th>
                                <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">Phone</th>
                                <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">Status</th>
                                <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">Error Summary</th>
                            </tr>
                        </thead>
                        <tbody className="scroll-snap-align-start">
                            {filteredRecords.map((record) => (
                                <tr key={record.id}>
                                    <td className="p-4 border-b border-blue-gray-50 hover:bg-opacity-75">
                                        {record.name}
                                    </td>
                                    <td
                                        className={`p-4 border-b border-blue-gray-50 hover:bg-opacity-75 ${getFieldColor(record.errors?.email?.severity)}`}
                                        onMouseMove={(e) => handleMouseMove(e, record.errors?.email?.message || "")}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {record.email}
                                    </td>
                                    <td
                                        className={`p-4 border-b border-blue-gray-50 hover:bg-opacity-75 ${getFieldColor(record.errors?.street?.severity)}`}
                                        onMouseMove={(e) => handleMouseMove(e, record.errors?.street?.message || "")}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {record.street || "N/A"}
                                    </td>
                                    <td
                                        className={`p-4 border-b border-blue-gray-50 hover:bg-opacity-75 ${getFieldColor(record.errors?.zipcode?.severity)}`}
                                        onMouseMove={(e) => handleMouseMove(e, record.errors?.zipcode?.message || "")}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {record.zipcode || "N/A"}
                                    </td>
                                    <td
                                        className={`p-4 border-b border-blue-gray-50 hover:bg-opacity-75 ${getFieldColor(record.errors?.phone?.severity)}`}
                                        onMouseMove={(e) => handleMouseMove(e, record.errors?.phone?.message || "")}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {record.phone || "N/A"}
                                    </td>
                                    <td className="p-4 border-b border-blue-gray-50 hover:bg-opacity-75">
                                        {getStatusBadge(record.status)}
                                    </td>
                                    <td className="p-4 border-b border-blue-gray-50 hover:bg-opacity-75">
                                        <button
                                            onClick={() => setModalData(record)} // Show modal with error details
                                            className="px-4 py-2 bg-gray-200 text-xs font-medium rounded-lg text-gray-900 hover:bg-gray-300 active:bg-gray-400"
                                        >
                                            View Errors
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Export CSV button */}
                <div className="mt-4">
                    <button
                        onClick={exportToCSV}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Tooltip that follows the mouse */}
            {hoveredError && tooltipPosition && (
                <div
                    className="absolute bg-gray-800 text-white rounded px-2 py-1 text-xs shadow-md"
                    style={{ top: tooltipPosition.y + 10, left: tooltipPosition.x + 10 }}
                >
                    {hoveredError}
                </div>
            )}

            {/* Modal for showing detailed errors */}
            {modalData && renderModal(modalData)}
        </div>
    );
}
