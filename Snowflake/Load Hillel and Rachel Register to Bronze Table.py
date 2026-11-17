import os
from snowflake.snowpark.context import get_active_session
from snowflake.snowpark.functions import current_timestamp, lit
from snowflake.snowpark.types import StringType, StructField, StructType

# 1. Grab the active Snowflake Workspace session
session = get_active_session()
session.use_role("ACCOUNTADMIN")
session.use_warehouse("COMPUTE_WH")
session.use_database("FINANCIAL")
session.use_schema("BRONZE")

# 2. Define Schema (25 columns through REVIEW + 32 trailing columns so CSV parsing stays aligned)
keep_columns = [
    "ACCOUNT",
    "DATE_RAW",
    "PAYEE",
    "CHECK_NUM",
    "DEBIT",
    "CREDIT",
    "RECEIPT",
    "MEMO",
    "CATEGORY1",
    "AMOUNT1",
    "CATEGORY2",
    "AMOUNT2",
    "CATEGORY3",
    "AMOUNT3",
    "CATEGORY4",
    "AMOUNT4",
    "CATEGORY5",
    "AMOUNT5",
    "CATEGORY6",
    "AMOUNT6",
    "TOTAL_CATEGORIES",
    "STATEMENT_DATES",
    "CLEARED_TYPE",
    "RECONCILIATION_TIMESTAMP",
    "REVIEW",
]
drop_columns = [f"UNNAMED_{i}" for i in range(25, 57)]
full_csv_schema = StructType(
    [StructField(c, StringType(), True) for c in (keep_columns + drop_columns)]
)

# 3. Read CSV Directly from the Stage and Load into Bronze Table
stage_path = "@BRONZE.RAW_ACCOUNTS_STAGE/Combined_Accounts_2026-11-16_183112.csv"
file_name = os.path.basename(stage_path)
target_table = "BRONZE.COMBINED_ACCOUNTS_RAW"

df_bronze = (
    session.read.schema(full_csv_schema)
    .option("FIELD_DELIMITER", ",")
    .option("SKIP_HEADER", 1)
    .option("FIELD_OPTIONALLY_ENCLOSED_BY", '"')
    .option("NULL_IF", ["", "NULL", "null", "NaN"])
    .option("ERROR_ON_COLUMN_COUNT_MISMATCH", False)
    .csv(stage_path)
    .select(keep_columns)
    .with_columns(
        ["_SOURCE_FILE", "_INGESTED_AT"],
        [lit(file_name), current_timestamp()],
    )
)

df_bronze.write.mode("overwrite").save_as_table(target_table)

print(f"Loaded {session.table(target_table).count()} rows into {target_table}.")