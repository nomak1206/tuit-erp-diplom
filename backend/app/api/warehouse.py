from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone

router = APIRouter(prefix="/api/warehouse", tags=["Warehouse"])

# ============ DEMO DATA ============
_categories = [
    {"id": 1, "name": "Электроника", "parent_id": None, "description": "Компьютеры, мониторы, комплектующие"},
    {"id": 2, "name": "Мебель", "parent_id": None, "description": "Офисная мебель"},
    {"id": 3, "name": "Канцтовары", "parent_id": None, "description": "Бумага, ручки, папки"},
    {"id": 4, "name": "Оргтехника", "parent_id": 1, "description": "Принтеры, сканеры"},
]

_products = [
    {"id": 1, "sku": "ELEC-001", "name": "Ноутбук HP ProBook 450", "category_id": 1, "unit": "piece", "purchase_price": 8500000, "selling_price": 11000000, "min_stock": 5, "description": "15.6\", Intel i5, 8GB RAM", "barcode": "4710001234001", "is_active": True, "created_at": "2025-06-01T10:00:00Z"},
    {"id": 2, "sku": "ELEC-002", "name": "Монитор Samsung 27\"", "category_id": 1, "unit": "piece", "purchase_price": 3200000, "selling_price": 4500000, "min_stock": 10, "description": "IPS, 4K", "barcode": "4710001234002", "is_active": True, "created_at": "2025-06-01T10:00:00Z"},
    {"id": 3, "sku": "FURN-001", "name": "Стол офисный", "category_id": 2, "unit": "piece", "purchase_price": 1500000, "selling_price": 2200000, "min_stock": 3, "description": "160x80 см, с тумбой", "barcode": "4710001234003", "is_active": True, "created_at": "2025-07-15T10:00:00Z"},
    {"id": 4, "sku": "FURN-002", "name": "Кресло офисное", "category_id": 2, "unit": "piece", "purchase_price": 2000000, "selling_price": 3000000, "min_stock": 5, "description": "Эргономичное, сетка", "barcode": "4710001234004", "is_active": True, "created_at": "2025-07-15T10:00:00Z"},
    {"id": 5, "sku": "STAT-001", "name": "Бумага A4 (пачка 500 л.)", "category_id": 3, "unit": "box", "purchase_price": 45000, "selling_price": 65000, "min_stock": 50, "description": "80 г/м²", "barcode": "4710001234005", "is_active": True, "created_at": "2025-08-01T10:00:00Z"},
    {"id": 6, "sku": "ELEC-003", "name": "Принтер Canon LBP-623", "category_id": 4, "unit": "piece", "purchase_price": 4500000, "selling_price": 5800000, "min_stock": 3, "description": "Лазерный, А4, Wi-Fi", "barcode": "4710001234006", "is_active": True, "created_at": "2025-09-01T10:00:00Z"},
]

_warehouses = [
    {"id": 1, "name": "Основной склад", "code": "WH-01", "address": "Ташкент, Чиланзар, ул. Бунёдкор 15", "manager_id": 9, "is_active": True},
    {"id": 2, "name": "Мелкооптовый склад", "code": "WH-02", "address": "Ташкент, Мирзо Улугбек, ул. Мустакиллик 45", "manager_id": None, "is_active": True},
]

_stock_movements = [
    {"id": 1, "product_id": 1, "warehouse_id": 1, "type": "incoming", "quantity": 20, "unit_price": 8500000, "total_price": 170000000, "document_ref": "ПН-001", "notes": "Закупка у поставщика", "date": "2026-01-10", "created_at": "2026-01-10T10:00:00Z"},
    {"id": 2, "product_id": 2, "warehouse_id": 1, "type": "incoming", "quantity": 30, "unit_price": 3200000, "total_price": 96000000, "document_ref": "ПН-002", "notes": "", "date": "2026-01-10", "created_at": "2026-01-10T10:00:00Z"},
    {"id": 3, "product_id": 1, "warehouse_id": 1, "type": "outgoing", "quantity": 5, "unit_price": 11000000, "total_price": 55000000, "document_ref": "РН-001", "notes": "Продажа TechCorp", "date": "2026-01-25", "created_at": "2026-01-25T14:00:00Z"},
    {"id": 4, "product_id": 5, "warehouse_id": 1, "type": "incoming", "quantity": 100, "unit_price": 45000, "total_price": 4500000, "document_ref": "ПН-003", "notes": "Закупка канцтоваров", "date": "2026-02-01", "created_at": "2026-02-01T11:00:00Z"},
    {"id": 5, "product_id": 3, "warehouse_id": 2, "type": "incoming", "quantity": 10, "unit_price": 1500000, "total_price": 15000000, "document_ref": "ПН-004", "notes": "", "date": "2026-02-05", "created_at": "2026-02-05T09:00:00Z"},
]


@router.get("/categories")
async def get_categories():
    return _categories


@router.get("/products")
async def get_products():
    return _products


@router.post("/products")
async def create_product(data: dict):
    new_id = max(p["id"] for p in _products) + 1 if _products else 1
    product = {"id": new_id, **data, "is_active": True, "created_at": datetime.now(timezone.utc).isoformat()}
    _products.append(product)
    return product


@router.patch("/products/{product_id}")
async def update_product(product_id: int, data: dict):
    for p in _products:
        if p["id"] == product_id:
            p.update(data)
            return p
    raise HTTPException(status_code=404, detail="Product not found")


@router.delete("/products/{product_id}")
async def delete_product(product_id: int):
    global _products
    before = len(_products)
    _products = [p for p in _products if p["id"] != product_id]
    if len(_products) == before:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"detail": "Product deleted"}


@router.get("/products/{product_id}")
async def get_product(product_id: int):
    for p in _products:
        if p["id"] == product_id:
            return p
    raise HTTPException(status_code=404, detail="Product not found")


@router.get("/warehouses")
async def get_warehouses():
    return _warehouses


@router.get("/movements")
async def get_movements():
    return _stock_movements


@router.post("/movements")
async def create_movement(data: dict):
    new_id = max(m["id"] for m in _stock_movements) + 1 if _stock_movements else 1
    movement = {"id": new_id, **data, "created_at": datetime.now(timezone.utc).isoformat()}
    _stock_movements.append(movement)
    return movement


@router.delete("/movements/{movement_id}")
async def delete_movement(movement_id: int):
    global _stock_movements
    before = len(_stock_movements)
    _stock_movements = [m for m in _stock_movements if m["id"] != movement_id]
    if len(_stock_movements) == before:
        raise HTTPException(status_code=404, detail="Movement not found")
    return {"detail": "Movement deleted"}


@router.get("/stock/report")
async def get_stock_report():
    """Calculate current stock per product per warehouse"""
    stock = {}
    for m in _stock_movements:
        key = f"{m['product_id']}_{m['warehouse_id']}"
        if key not in stock:
            prod = next((p for p in _products if p["id"] == m["product_id"]), {})
            stock[key] = {
                "product_id": m["product_id"],
                "product_name": prod.get("name", ""),
                "sku": prod.get("sku", ""),
                "warehouse_id": m["warehouse_id"],
                "quantity": 0,
                "total_value": 0,
            }
        if m["type"] in ("incoming", "return"):
            stock[key]["quantity"] += m["quantity"]
            stock[key]["total_value"] += m["total_price"]
        elif m["type"] in ("outgoing", "write_off"):
            stock[key]["quantity"] -= m["quantity"]
            stock[key]["total_value"] -= m["total_price"]

    return {
        "items": list(stock.values()),
        "total_products": len(_products),
        "total_warehouses": len(_warehouses),
        "total_movements": len(_stock_movements),
    }
