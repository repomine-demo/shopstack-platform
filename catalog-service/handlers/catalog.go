package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/repomine-demo/catalog-service/models"
	"github.com/repomine-demo/catalog-service/services"
)

type CatalogHandler struct {
	DB      *sql.DB
	Search  *services.SearchService
}

func (h *CatalogHandler) ListProducts(w http.ResponseWriter, r *http.Request) {
	tenantID := r.Header.Get("X-Tenant-ID")
	query := r.URL.Query().Get("q")
	categoryID, _ := strconv.Atoi(r.URL.Query().Get("category_id"))

	var products []models.Product
	var err error

	if query != "" {
		products, err = h.Search.SearchProducts(tenantID, query, categoryID)
	} else {
		products, err = h.fetchProducts(tenantID, categoryID)
	}

	if err != nil {
		http.Error(w, `{"error":"failed to fetch products"}`, http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]interface{}{"products": products, "count": len(products)})
}

func (h *CatalogHandler) GetProduct(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	tenantID := r.Header.Get("X-Tenant-ID")

	row := h.DB.QueryRow(
		`SELECT id, sku, name, description, price, currency, category_id, tenant_id, is_active, image_url, created_at, updated_at
		 FROM products WHERE id=$1 AND tenant_id=$2`, id, tenantID)

	var p models.Product
	if err := row.Scan(&p.ID, &p.SKU, &p.Name, &p.Description, &p.Price, &p.Currency,
		&p.CategoryID, &p.TenantID, &p.IsActive, &p.ImageURL, &p.CreatedAt, &p.UpdatedAt); err != nil {
		http.Error(w, `{"error":"product not found"}`, http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(p)
}

func (h *CatalogHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	var p models.Product
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, `{"error":"invalid body"}`, http.StatusBadRequest)
		return
	}
	p.TenantID = r.Header.Get("X-Tenant-ID")

	err := h.DB.QueryRow(
		`INSERT INTO products (sku, name, description, price, currency, category_id, tenant_id, image_url)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
		p.SKU, p.Name, p.Description, p.Price, p.Currency, p.CategoryID, p.TenantID, p.ImageURL,
	).Scan(&p.ID)

	if err != nil {
		http.Error(w, `{"error":"failed to create product"}`, http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(p)
}

func (h *CatalogHandler) fetchProducts(tenantID string, categoryID int) ([]models.Product, error) {
	query := `SELECT id, sku, name, description, price, currency, category_id, tenant_id, is_active, image_url, created_at, updated_at
			  FROM products WHERE tenant_id=$1 AND is_active=true`
	args := []interface{}{tenantID}
	if categoryID > 0 {
		query += ` AND category_id=$2`
		args = append(args, categoryID)
	}
	rows, err := h.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var products []models.Product
	for rows.Next() {
		var p models.Product
		rows.Scan(&p.ID, &p.SKU, &p.Name, &p.Description, &p.Price, &p.Currency,
			&p.CategoryID, &p.TenantID, &p.IsActive, &p.ImageURL, &p.CreatedAt, &p.UpdatedAt)
		products = append(products, p)
	}
	return products, nil
}
