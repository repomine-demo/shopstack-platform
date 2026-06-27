package models

import "time"

type Category struct {
	ID          int       `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Slug        string    `json:"slug" db:"slug"`
	Description string    `json:"description" db:"description"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

type Product struct {
	ID          int       `json:"id" db:"id"`
	SKU         string    `json:"sku" db:"sku"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	Price       float64   `json:"price" db:"price"`
	Currency    string    `json:"currency" db:"currency"`
	CategoryID  int       `json:"category_id" db:"category_id"`
	TenantID    string    `json:"tenant_id" db:"tenant_id"`
	IsActive    bool      `json:"is_active" db:"is_active"`
	ImageURL    string    `json:"image_url" db:"image_url"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

type InventoryRecord struct {
	ProductID   int       `json:"product_id" db:"product_id"`
	TenantID    string    `json:"tenant_id" db:"tenant_id"`
	Quantity    int       `json:"quantity" db:"quantity"`
	Reserved    int       `json:"reserved" db:"reserved"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

func (i *InventoryRecord) Available() int {
	return i.Quantity - i.Reserved
}
