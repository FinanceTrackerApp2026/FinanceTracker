package main

import (
	"context"
	"errors"
	"finance-tracker/backend/auth"
	"finance-tracker/backend/config"
	"finance-tracker/backend/graph"
	"finance-tracker/backend/logger"
	"finance-tracker/backend/postgres"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/rs/cors"
	"github.com/vektah/gqlparser/v2/ast"
)

const defaultPort = "8080"

func main() {
	config.LoadEnv()

	if err := logger.Init(); err != nil {
		panic(err)
	}
	if err := auth.Ready(); err != nil {
		logger.Error("%v", err)
		return
	}
	if err := postgres.Connect(); err != nil {
		logger.Error("Database connection failed: %v", err)
		return
	}

	defer postgres.Close()
	logger.Info("Database connected successfully")
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	graphqlHandler := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{}}))

	graphqlHandler.AddTransport(transport.Options{})
	graphqlHandler.AddTransport(transport.GET{})
	graphqlHandler.AddTransport(transport.POST{})

	graphqlHandler.SetQueryCache(lru.New[*ast.QueryDocument](1000))

	graphqlHandler.Use(extension.Introspection{})
	graphqlHandler.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	mux := http.NewServeMux()

	playgroundEnabled := strings.EqualFold(strings.TrimSpace(os.Getenv("GRAPHQL_PLAYGROUND_ENABLED")), "true")
	if !playgroundEnabled && config.IsProduction() {
		playgroundEnabled = false
	} else if !playgroundEnabled {
		playgroundEnabled = true
	}

	if playgroundEnabled {
		mux.Handle("/", playground.Handler("GraphQL playground", "/query"))
	} else {
		mux.Handle("/", http.NotFoundHandler())
	}
	mux.Handle("/query", graphqlHandler)

	c := cors.New(cors.Options{
		AllowedOrigins: config.AllowedOrigins(),
		AllowedMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodOptions,
		},
		AllowedHeaders:   []string{"Authorization", "Content-Type", "Origin"},
		AllowCredentials: true,
		MaxAge:           int((12 * time.Hour) / time.Second),
	})

	handler := c.Handler(auth.Middleware(mux))

	logger.Info("connect to http://localhost:%s/ for GraphQL playground", port)

	srv := &http.Server{
		Addr:              ":" + port,
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := srv.Shutdown(shutdownCtx); err != nil {
			logger.Error("graceful shutdown failed: %v", err)
		}
	}()

	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		logger.Fatal("server exited: %v", err)
	}
	logger.Info("server shutdown complete")
}
