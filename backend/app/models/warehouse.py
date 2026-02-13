import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text, ForeignKey, Date, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class MovementType(str, enum.Enum):
    INCOMING = "incoming"
    OUTGOING = "outgoing"
    TRANSFER = "transfer"
    WRITE_OFF = "write_off"
    RETURN = "return"


class UnitOfMeasure(str, enum.Enum):
    PIECE = "piece"
    KG = "kg"
    LITER = "liter"
    METER = "meter"
    BOX = "box"
    SET = "set"


class Category(Base):
    __tablename__ = "product_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    parent_id = Column(Integer, ForeignKey("product_categories.id", ondelete="SET NULL"), nullable=True)
    description = Column(Text, nullable=True)

    # Relationships
    parent = relationship("Category", remote_side=[id], backref="children", lazy="selectin")
    products = relationship("Product", back_populates="category", lazy="selectin")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    category_id = Column(Integer, ForeignKey("product_categories.id", ondelete="SET NULL"), nullable=True)
    unit = Column(Enum(UnitOfMeasure), default=UnitOfMeasure.PIECE)
    purchase_price = Column(Float, default=0.0)
    selling_price = Column(Float, default=0.0)
    min_stock = Column(Integer, default=0)
    description = Column(Text, nullable=True)
    barcode = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    category = relationship("Category", back_populates="products", lazy="selectin")
    stock_movements = relationship("StockMovement", back_populates="product", lazy="selectin")
    inventory_checks = relationship("InventoryCheck", back_populates="product", lazy="selectin")


class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    address = Column(Text, nullable=True)
    manager_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True)

    # Relationships
    manager = relationship("User", foreign_keys=[manager_id], lazy="selectin")
    stock_movements = relationship("StockMovement", back_populates="warehouse", lazy="selectin")
    inventory_checks = relationship("InventoryCheck", back_populates="warehouse", lazy="selectin")


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="RESTRICT"), nullable=False)
    type = Column(Enum(MovementType), nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, default=0.0)
    total_price = Column(Float, default=0.0)
    document_ref = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    product = relationship("Product", back_populates="stock_movements", lazy="selectin")
    warehouse = relationship("Warehouse", back_populates="stock_movements", lazy="selectin")
    author = relationship("User", foreign_keys=[created_by], lazy="selectin")


class InventoryCheck(Base):
    __tablename__ = "inventory_checks"

    id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="RESTRICT"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    expected_qty = Column(Float, default=0.0)
    actual_qty = Column(Float, default=0.0)
    difference = Column(Float, default=0.0)
    date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    warehouse = relationship("Warehouse", back_populates="inventory_checks", lazy="selectin")
    product = relationship("Product", back_populates="inventory_checks", lazy="selectin")
