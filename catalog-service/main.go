package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"github.com/repomine-demo/catalog-service/handlers"
	"github.com/repomine-demo/catalog-service/services"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgresql://shopstack:shopstack@localhost:5432/catalog"
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer db.Close()

	search := &services.SearchService{DB: db}
	catalogH := &handlers.CatalogHandler{DB: db, Search: search}
	inventoryH := &handlers.InventoryHandler{DB: db}

	r := mux.NewRouter()
	r.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.Write([]byte(`{"status":"healthy","service":"catalog-service"}`))
	}).Methods("GET")

	r.HandleFunc("/catalog/products", catalogH.ListProducts).Methods("GET")
	r.HandleFunc("/catalog/products", catalogH.CreateProduct).Methods("POST")
	r.HandleFunc("/catalog/products/{id}", catalogH.GetProduct).Methods("GET")
	r.HandleFunc("/catalog/products/{id}/stock", inventoryH.GetStock).Methods("GET")
	r.HandleFunc("/catalog/products/{id}/stock", inventoryH.UpdateStock).Methods("PUT")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8003"
	}
	log.Printf("catalog-service running on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
