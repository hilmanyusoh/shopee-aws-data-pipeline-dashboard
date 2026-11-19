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
