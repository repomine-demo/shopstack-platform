package services

import (
	"database/sql"
	"strings"

	"github.com/repomine-demo/catalog-service/models"
)

type SearchService struct {
	DB *sql.DB
}

func (s *SearchService) SearchProducts(tenantID, query string, categoryID int) ([]models.Product, error) {
	q := "%" + strings.ToLower(query) + "%"
	args := []interface{}{tenantID, q, q}
	sql := `SELECT id, sku, name, description, price, currency, category_id, tenant_id, is_active, image_url, created_at, updated_at
			FROM products
			WHERE tenant_id=$1 AND is_active=true
			AND (LOWER(name) LIKE $2 OR LOWER(description) LIKE $3)`
	if categoryID > 0 {
		sql += ` AND category_id=$4`
		args = append(args, categoryID)
	}
	sql += ` ORDER BY name ASC LIMIT 50`

	rows, err := s.DB.Query(sql, args...)
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
