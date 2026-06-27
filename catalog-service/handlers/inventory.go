package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/repomine-demo/catalog-service/models"
)

type InventoryHandler struct {
	DB *sql.DB
}

func (h *InventoryHandler) GetStock(w http.ResponseWriter, r *http.Request) {
	productID, _ := strconv.Atoi(mux.Vars(r)["id"])
	tenantID := r.Header.Get("X-Tenant-ID")

	var inv models.InventoryRecord
	err := h.DB.QueryRow(
		`SELECT product_id, tenant_id, quantity, reserved, updated_at FROM inventory WHERE product_id=$1 AND tenant_id=$2`,
		productID, tenantID,
	).Scan(&inv.ProductID, &inv.TenantID, &inv.Quantity, &inv.Reserved, &inv.UpdatedAt)

	if err == sql.ErrNoRows {
		http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(map[string]interface{}{
		"product_id": inv.ProductID,
		"quantity":   inv.Quantity,
		"reserved":   inv.Reserved,
		"available":  inv.Available(),
	})
}

func (h *InventoryHandler) UpdateStock(w http.ResponseWriter, r *http.Request) {
	productID, _ := strconv.Atoi(mux.Vars(r)["id"])
	tenantID := r.Header.Get("X-Tenant-ID")

	var body struct {
		Quantity int `json:"quantity"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	_, err := h.DB.Exec(
		`INSERT INTO inventory (product_id, tenant_id, quantity) VALUES ($1,$2,$3)
		 ON CONFLICT (product_id, tenant_id) DO UPDATE SET quantity=$3, updated_at=NOW()`,
		productID, tenantID, body.Quantity,
	)
	if err != nil {
		http.Error(w, `{"error":"update failed"}`, http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
