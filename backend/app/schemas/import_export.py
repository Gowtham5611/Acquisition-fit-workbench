from pydantic import BaseModel
from typing import List, Optional

class ImportResult(BaseModel):
    rows_received: int
    valid_rows: int
    invalid_rows: int
    duplicates_found: int
    rows_imported: int
    errors: List[str]

class ExportRequest(BaseModel):
    filters: Optional[dict] = None
    sort_by: Optional[str] = None
    sort_order: Optional[str] = "desc"
