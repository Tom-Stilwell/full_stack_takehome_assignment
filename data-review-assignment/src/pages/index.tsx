// pages/index.tsx

import DataReviewTable from "../components/DataReviewTable";
import Head from 'next/head';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Tom's Data Review</title>
      </Head>
      <DataReviewTable />
    </div>
  );
}
