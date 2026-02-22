from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.warehouse import Product, Category, Warehouse, StockMovement, InventoryCheck
from app.schemas.schemas import ProductBase, ProductResponse, StockMovementBase, StockMovementResponse

router = APIRouter(prefix="/api/warehouse", tags=["Warehouse"])


def _prod_dict(p: Product) -> dict:
    return {
        "id": p.id, "sku": p.sku, "name": p.name, "category_id": p.category_id,
        "unit": p.unit.value if p.unit else "piece",
        "purchase_price": p.purchase_price, "selling_price": p.selling_price,
        "min_stock": p.min_stock, "description": p.description, "barcode": p.barcode,
        "is_active": p.is_active,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }


def _mov_dict(m: StockMovement) -> dict:
    return {
        "id": m.id, "product_id": m.product_id, "warehouse_id": m.warehouse_id,
        "type": m.type.value if m.type else "incoming",
        "quantity": m.quantity, "unit_price": m.unit_price, "total_price": m.total_price,
        "document_ref": m.document_ref, "notes": m.notes,
        "date": str(m.date) if m.date else None,
        "created_at": m.created_at.isoformat() if m.created_at else None,
    }


# ============ CATEGORIES ============
@router.get("/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category))
    return [{"id": c.id, "name": c.name, "parent_id": c.parent_id, "description": c.description} for c in result.scalars().all()]


# ============ PRODUCTS ============
@router.get("/products")
async def get_products(db: AsyncSession = Depends(get_db), skip: int = 0, limit: int = 100):
    result = await db.execute(select(Product).offset(skip).limit(limit))
    return [_prod_dict(p) for p in result.scalars().all()]


@router.post("/products", status_code=201)
async def create_product(data: ProductBase, db: AsyncSession = Depends(get_db)):
    product = Product(**data.model_dump(), is_active=True)
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return _prod_dict(product)


@router.patch("/products/{product_id}")
async def update_product(product_id: int, data: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    p = result.scalars().first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    allowed = {"sku", "name", "category_id", "unit", "purchase_price", "selling_price", "min_stock", "description", "barcode", "is_active"}
    for k, v in data.items():
        if k in allowed:
            setattr(p, k, v)
    await db.commit()
    await db.refresh(p)
    return _prod_dict(p)


@router.delete("/products/{product_id}")
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    p = result.scalars().first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    await db.delete(p)
    await db.commit()
    return {"detail": "Product deleted"}


@router.get("/products/{product_id}")
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    p = result.scalars().first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return _prod_dict(p)


# ============ WAREHOUSES ============
@router.get("/warehouses")
async def get_warehouses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Warehouse))
    return [{"id": w.id, "name": w.name, "code": w.code, "address": w.address, "manager_id": w.manager_id, "is_active": w.is_active} for w in result.scalars().all()]


# ============ MOVEMENTS ============
@router.get("/movements")
async def get_movements(db: AsyncSession = Depends(get_db), skip: int = 0, limit: int = 200):
    result = await db.execute(select(StockMovement).offset(skip).limit(limit))
    return [_mov_dict(m) for m in result.scalars().all()]


@router.post("/movements", status_code=201)
async def create_movement(data: StockMovementBase, db: AsyncSession = Depends(get_db)):
    movement = StockMovement(**data.model_dump())
    db.add(movement)
    await db.commit()
    await db.refresh(movement)
    return _mov_dict(movement)


@router.delete("/movements/{movement_id}")
async def delete_movement(movement_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(StockMovement).where(StockMovement.id == movement_id))
    m = result.scalars().first()
    if not m:
        raise HTTPException(status_code=404, detail="Movement not found")
    await db.delete(m)
    await db.commit()
    return {"detail": "Movement deleted"}


# ============ STOCK REPORT ============
@router.get("/stock/report")
async def get_stock_report(db: AsyncSession = Depends(get_db)):
    products = (await db.execute(select(Product))).scalars().all()
    warehouses = (await db.execute(select(Warehouse))).scalars().all()
    movements = (await db.execute(select(StockMovement))).scalars().all()

    stock = {}
    for m in movements:
        key = f"{m.product_id}_{m.warehouse_id}"
        if key not in stock:
            prod = next((p for p in products if p.id == m.product_id), None)
            stock[key] = {
                "product_id": m.product_id, "product_name": prod.name if prod else "",
                "sku": prod.sku if prod else "", "warehouse_id": m.warehouse_id,
                "quantity": 0, "total_value": 0,
            }
        mv = m.type.value if m.type else "incoming"
        if mv in ("incoming", "return"):
            stock[key]["quantity"] += m.quantity
            stock[key]["total_value"] += m.total_price or 0
        elif mv in ("outgoing", "write_off"):
            stock[key]["quantity"] -= m.quantity
            stock[key]["total_value"] -= m.total_price or 0

    return {
        "items": list(stock.values()),
        "total_products": len(products),
        "total_warehouses": len(warehouses),
        "total_movements": len(movements),
    }


# ============ INVENTORY ============
@router.get("/inventory")
async def get_inventories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(InventoryCheck))
    return [{"id": ic.id, "warehouse_id": ic.warehouse_id, "product_id": ic.product_id, "expected_qty": ic.expected_qty, "actual_qty": ic.actual_qty, "difference": ic.difference, "date": str(ic.date) if ic.date else None, "notes": ic.notes, "created_at": ic.created_at.isoformat() if ic.created_at else None} for ic in result.scalars().all()]


@router.post("/inventory", status_code=201)
async def create_inventory(data: dict, db: AsyncSession = Depends(get_db)):
    items = data.get("items", [])
    results = []
    for item in items:
        ic = InventoryCheck(
            warehouse_id=data.get("warehouse_id", 1),
            product_id=item.get("product_id"),
            expected_qty=item.get("book_qty", 0),
            actual_qty=item.get("actual_qty", 0),
            difference=item.get("actual_qty", 0) - item.get("book_qty", 0),
            date=datetime.strptime(data.get("date", datetime.now().strftime("%Y-%m-%d")), "%Y-%m-%d").date(),
            notes=item.get("comment", ""),
        )
        db.add(ic)
        results.append(ic)

        # Auto-create movement for discrepancies
        diff = ic.difference
        if diff != 0:
            prod = (await db.execute(select(Product).where(Product.id == ic.product_id))).scalars().first()
            mov = StockMovement(
                product_id=ic.product_id, warehouse_id=ic.warehouse_id,
                type="return" if diff > 0 else "write_off",
                quantity=abs(diff), unit_price=prod.purchase_price if prod else 0,
                total_price=abs(diff) * (prod.purchase_price if prod else 0),
                document_ref=f"INV-{datetime.now().strftime('%Y%m%d')}",
                notes=f"Inventory: {ic.notes}",
                date=ic.date,
            )
            db.add(mov)

    await db.commit()
    return {"status": "completed", "items_checked": len(results)}
