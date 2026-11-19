# End-to-End AWS Serverless Data Pipeline



An end-to-end serverless data engineering pipeline and real-time analytics dashboard built on **AWS (S3, Glue Data Catalog, Athena, Lambda)** and **Next.js**. This project ingests, transforms, and analyzes **2,622 Shopee Health & Wellness products across 30 categories** to uncover market pricing trends and category distributions.



🔗 **Live Dashboard:** [https://shopee-aws-data-pipeline-dashboard.vercel.app](https://shopee-aws-data-pipeline-dashboard.vercel.app)



---



## 🏗️ System Architecture



```mermaid

flowchart LR

subgraph AWS ["☁️ AWS Serverless Data Pipeline"]

Raw[("🪣 Amazon S3<br/>(Raw CSV)")] --> ETL["🐍 Python ETL<br/>(Pandas -> Parquet)"]

ETL --> Curated[("🪣 Amazon S3<br/>(Curated Parquet)")]

Curated -.-> Glue["🗂️ AWS Glue<br/>Data Catalog"]

Glue --> Athena["🔍 Amazon Athena<br/>(SQL Query Engine)"]

Athena <--> Lambda["⚡ AWS Lambda<br/>(Python Boto3 API)"]

end



subgraph Frontend ["💻 Visualization Layer"]

Lambda <-->|"HTTPS JSON (Function URL)"| NextJS["⚛️ Next.js Dashboard<br/>(Tailwind CSS + Recharts)"]

end





```

## 🚀 Key Features & Engineering Highlights

* **Data Lake & Columnar Storage:** Stored raw CSV data in Amazon S3 and transformed it via Python ETL into **Apache Parquet** format to reduce scan volume and query costs.
* **Serverless SQL Analytics:** Cataloged curated data in **AWS Glue Data Catalog** and queried aggregations (`COUNT`, `AVG`, `MIN`, `MAX` by category) using **Amazon Athena**.
* **Serverless REST API:** Built a Python (`boto3`) **AWS Lambda** function exposed via **Lambda Function URL** with CORS enabled to return structured JSON to the frontend.
* **Interactive Analytics Dashboard:** Built with **Next.js (App Router)**, **Tailwind CSS**, and **Recharts** to display KPI summary cards, Top 10 category charts, and searchable product listings.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| --- | --- |
| **Storage & ETL** | Amazon S3, Python, Pandas, Apache Parquet |
| **Catalog & Query** | AWS Glue Data Catalog, Amazon Athena (SQL) |
| **Backend API** | AWS Lambda (Python, `boto3`), Lambda Function URL |
| **Frontend & Hosting** | Next.js, TypeScript, Tailwind CSS, Recharts, Vercel |

---

## 💻 Local Development

1. Clone the repository:
```bash
git clone [https://github.com/hilmanyusoh/shopee-aws-data-pipeline-dashboard.git](https://github.com/hilmanyusoh/shopee-aws-data-pipeline-dashboard.git)
cd shopee-aws-data-pipeline-dashboard

```


2. Install dependencies:
```bash
npm install

```


3. Configure your Lambda Function URL in `src/app/page.tsx`, then start the development server:
```bash
npm run dev

```


4. Open [http://localhost:3000](http://localhost:3000) in your browser.

```
