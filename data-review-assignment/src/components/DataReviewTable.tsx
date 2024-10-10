// components/DataReview.tsx

import { useEffect, useState } from "react";
import axios from "axios";

export default function DataReviewTable() {

    const [records, setRecords] = useState([]);

    useEffect(() => {
        axios.get("/api/data")
        .then(res => {
            setRecords(res.data.records);
        })
    }, []);

    console.log(records);

    return (
        <div style={{ margin: "20px" }}>
            <h1>Data Review</h1>
            {/* Candidates will replace this placeholder with table, tooltips, and modals */}
        </div>
    );
}
