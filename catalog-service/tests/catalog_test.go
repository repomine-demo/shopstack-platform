package tests

import (
	"testing"

	"github.com/repomine-demo/catalog-service/models"
)

func TestInventoryAvailable(t *testing.T) {
	inv := models.InventoryRecord{Quantity: 100, Reserved: 15}
	if inv.Available() != 85 {
		t.Errorf("expected 85, got %d", inv.Available())
	}
}

func TestInventoryAvailableZeroReserved(t *testing.T) {
	inv := models.InventoryRecord{Quantity: 50, Reserved: 0}
	if inv.Available() != 50 {
		t.Errorf("expected 50, got %d", inv.Available())
	}
}

func TestProductFields(t *testing.T) {
	p := models.Product{
		SKU:      "SHIRT-RED-L",
		Name:     "Red T-Shirt",
		Price:    29.99,
		Currency: "USD",
		TenantID: "acme",
		IsActive: true,
	}
	if p.SKU != "SHIRT-RED-L" {
		t.Errorf("unexpected SKU: %s", p.SKU)
	}
}
