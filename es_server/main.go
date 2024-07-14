package main

import (
	"context"
	"encoding/json"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/olivere/elastic/v7"
)

type Book struct {
	ID      string `json:"id,omitempty"`
	Title   string `json:"title"`
	Author  string `json:"author"`
	Summary string `json:"summary"`
}

var esClient *elastic.Client

func main() {
	app := fiber.New()

	var err error
	esClient, err = elastic.NewClient(elastic.SetURL("http://localhost:9200"))
	if err != nil {
		log.Fatalf("Error creating the client: %s", err)
	}

	app.Post("/api/books", createBook)
	app.Get("/api/books", getBooks)
	app.Get("/api/search", searchBooks)

	log.Fatal(app.Listen(":5000"))

}

func createBook(c *fiber.Ctx) error {
	book := new(Book)
	if err := c.BodyParser(book); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	book.ID = uuid.NewString()
	_, err := esClient.Index().Index("books").Id(book.ID).BodyJson(book).Do(context.Background())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusOK).JSON(book)
}

func getBooks(c *fiber.Ctx) error {

	searchResult, err := esClient.Search().Index("books").Do(context.Background())

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	var books []Book
	for _, hit := range searchResult.Hits.Hits {
		var book Book
		err := json.Unmarshal(hit.Source, &book)
		if err == nil {
			book.ID = hit.Id
			books = append(books, book)
		}
	}

	return c.Status(fiber.StatusOK).JSON(books)

}

func searchBooks(c *fiber.Ctx) error {

	query := c.Query("q")
	searchResult, err := esClient.Search().
		Index("books").
		Query(elastic.NewMultiMatchQuery(query, "title", "author", "summary")).
		Do(context.Background())

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	var books []Book
	for _, hit := range searchResult.Hits.Hits {
		var book Book
		err := json.Unmarshal(hit.Source, &book)
		if err == nil {
			book.ID = hit.Id
			books = append(books, book)
		}
	}

	return c.Status(fiber.StatusOK).JSON(books)

}
