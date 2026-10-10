from pydantic import BaseModel
from typing import List, Optional

class ImportResult(BaseModel):
    rows_received: int
    valid_rows: int
    invalid_rows: int
    new_records: int
    existing_matches: int
    duplicate_rows: int
    records_inserted: int
    records_updated: int
    records_unchanged: int
    duplicates_found: int
    rows_imported: int
    message: str
    errors: List[str]

class ExportRequest(BaseModel):
    filters: Optional[dict] = None
    sort_by: Optional[str] = None
    sort_order: Optional[str] = "desc"
