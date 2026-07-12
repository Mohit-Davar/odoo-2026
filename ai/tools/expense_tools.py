from internal_client import fetch_api

async def get_expense_summary(trip_id: int = None, expense_type: str = None) -> dict:
    """
    Fetch expense records and return aggregated breakdown stats and matching logs.
    
    Args:
        trip_id: Optional trip ID to filter expenses for a specific trip.
        expense_type: Optional expense type to filter by. Must be one of: TOLL, MAINTENANCE, OTHER
    """
    expenses = await fetch_api("/api/expenses")
    
    # Filter by trip ID if provided
    if trip_id is not None:
        try:
            t_id = int(trip_id)
            expenses = [e for e in expenses if e.get("tripId") is not None and int(e.get("tripId")) == t_id]
        except Exception:
            pass
            
    # Filter by type if provided
    if expense_type is not None:
        exp_type_upper = expense_type.strip().upper()
        expenses = [e for e in expenses if e.get("expenseType") == exp_type_upper]
        
    total_amount = sum(float(e.get("amount") or 0) for e in expenses)
    breakdown = {}
    for e in expenses:
        etype = e.get("expenseType", "OTHER")
        breakdown[etype] = breakdown.get(etype, 0.0) + float(e.get("amount") or 0)
        
    return {
        "totalAmount": total_amount,
        "breakdown": breakdown,
        "recordCount": len(expenses),
        "expenses": expenses
    }
