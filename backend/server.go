package main

import (
	"finance-tracker/backend/config"
	"finance-tracker/backend/graph"
	"finance-tracker/backend/logger"
	"finance-tracker/backend/postgres"
	"net/http"
	"os"
	"os/exec"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/vektah/gqlparser/v2/ast"
)

const defaultPort = "8080"

func main() {
	config.LoadEnv()

	if err := logger.Init(); err != nil {
		panic(err)
	}
	if err := postgres.Connect(); err != nil {
		logger.Error("Database connection failed: %v", err)
		return
	}

	logger.Info("Database connected successfully")
	loans, err := postgres.GetAllLoans()
	if err != nil {
		logger.Error("Failed to fetch loans: %v", err)
	} else {
		logger.Info("Loans found: %d", len(loans))
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	srv := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{}}))

	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})

	srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))

	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	http.Handle("/", playground.Handler("GraphQL playground", "/query"))
	http.Handle("/query", srv)

	logger.Info("connect to http://localhost:%s/ for GraphQL playground", port)

	go func() {
		time.Sleep(1 * time.Second)
		exec.Command("rundll32", "url.dll,FileProtocolHandler", "http://localhost:"+port).Start()
	}()

	logger.Fatal("server exited: %v", http.ListenAndServe(":"+port, nil))
}
